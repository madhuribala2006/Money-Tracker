import express, { Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js';
import * as storage from '../storage.js';

dotenv.config();

export const aiRouter = express.Router();

const currencySymbols: Record<string, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'C$',
  AUD: 'A$',
  JPY: '¥',
};

const apiKey = process.env.GEMINI_API_KEY?.trim();
const ai = apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.length > 10
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

aiRouter.post('/chat', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { messages, modelPreference } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Retrieve the signed-in account's financial context to ground the chatbot.
    let financialContext = '';
    let currencySymbol = '₹';
    let dailyLimit = 400;
    try {
      const summary = await storage.getAnalyticsSummary(req.user!.id);
      const user = await storage.getUserById(req.user!.id);
      currencySymbol = currencySymbols[user?.currency || 'INR'] || '₹';
      dailyLimit = user?.dailySpendingLimit ?? 400;
      financialContext = `
Account Profile:
- Name: ${user?.name || 'Account holder'}
- Currency: ${user?.currency || 'INR'}
- Expected Monthly Income: ${currencySymbol}${user?.monthlyAllowance ?? 0}
- Daily Spending Limit: ${currencySymbol}${dailyLimit}
- Today's Total Spending: ${currencySymbol}${summary.todayExpense} (${summary.isDailyLimitExceeded ? 'EXCEEDED' : 'Within limit'})
- Available Balance: ${currencySymbol}${summary.totalBalance}
- This Month's Income: ${currencySymbol}${summary.thisMonthIncome}
- This Month's Expenses: ${currencySymbol}${summary.thisMonthExpense}
- Total Active Savings: ${currencySymbol}${summary.totalSaved}
- Top Expense Categories: ${summary.categoryPercentages.slice(0, 4).map((c: any) => `${c.name} (${currencySymbol}${c.amount}, ${c.percentage}%)`).join(', ')}
`;
    } catch (error) {
      console.warn('[Money Coach] Could not load the account financial context:', error);
      financialContext = 'Current account totals are unavailable. Do not assume the account holder’s income, currency, or spending limits.';
    }

    const systemInstruction = `You are a helpful money coach in the Money Management System.
Your role:
- Provide friendly, practical advice tailored to the signed-in account holder's financial context.
- Help the account holder plan spending, manage bills, and make progress toward their goals.
- Use the account's selected currency and configured daily limit. Do not assume a location, occupation, or lifestyle.
- Format responses cleanly with bold highlights and concise bullet points.
- Avoid personalized investment recommendations; focus on budgeting, saving, and spending decisions.

${financialContext}`;

    // Select valid model based on instruction:
    // "Use gemini-3.8-flash for general tasks, and gemini-3.1-flash-lite for tasks that should happen fast."
    const selectedModel =
      modelPreference === 'fast' ? 'gemini-3.1-flash-lite' : 'gemini-3.8-flash';

    // Format conversation history for Gemini API
    const formattedContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    // If API key is present and real, generate response via @google/genai SDK with timeout protection
    if (ai) {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('AI generation timed out')), 8000)
        );

        const generatePromise = ai.models.generateContent({
          model: selectedModel,
          contents: formattedContents,
          config: {
            systemInstruction,
          },
        });

        const response: any = await Promise.race([generatePromise, timeoutPromise]);
        const replyText = response.text || 'I could not produce a response just now. What else can I help you with?';
        return res.json({ reply: replyText, model: selectedModel });
      } catch (geminiError: any) {
        console.warn('[Money Coach] Gemini request failed or timed out; using the built-in response:', geminiError.message);
        // Fall through to the built-in response when the AI service is unavailable.
      }
    }

    // Smart contextual fallback when API key is not configured or fails
    const lastUserMsg = messages[messages.length - 1].content.toLowerCase();
    let fallbackReply = `Hello! I'm your personal money coach. `;

      if (lastUserMsg.includes('400') || lastUserMsg.includes('daily') || lastUserMsg.includes('limit')) {
        fallbackReply += `Your daily spending limit is **${currencySymbol}${dailyLimit}**. Here are a few simple ways to stay within it:
- Review today's planned purchases before spending.
- Record small expenses; they can add up over time.
- If you are over the limit, look for a flexible expense to postpone.`;
      } else if (lastUserMsg.includes('save') || lastUserMsg.includes('goal') || lastUserMsg.includes('laptop')) {
        fallbackReply += `Try these steps to reach your savings goal:
1. **Save regularly**: Move some money to your goal whenever you receive income.
2. **Choose a target**: Decide how much you want to save and by when.
3. **Pause before buying**: Add something you want to your wishlist and wait 48 hours before deciding.`;
      } else {
        fallbackReply += `I can help you think through your spending and savings. Try asking:
- *"How can I save ${currencySymbol}2,000 this month?"*
- *"How much of today's limit have I used?"*
- *"Which subscriptions could I cancel?"*`;
      }

      return res.json({ reply: fallbackReply, model: 'finora-money-coach' });
  } catch (error: any) {
    console.error('[AI Chat Error]', error);
    res.status(500).json({
      error: error.message || 'Error communicating with AI Advisor',
      reply: 'I encountered a temporary issue processing your request. Please try asking again in a moment.',
    });
  }
});
