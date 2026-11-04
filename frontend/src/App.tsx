import { lazy, Suspense, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { AuthModal } from './components/modals/AuthModal';

import { FloatingChatWidget } from './components/chat/FloatingChatWidget';

const DashboardPage = lazy(() => import('./pages/DashboardPage').then(({ DashboardPage }) => ({ default: DashboardPage })));
const TransactionsPage = lazy(() => import('./pages/TransactionsPage').then(({ TransactionsPage }) => ({ default: TransactionsPage })));
const AddExpensePage = lazy(() => import('./pages/AddExpensePage').then(({ AddExpensePage }) => ({ default: AddExpensePage })));
const AddIncomePage = lazy(() => import('./pages/AddIncomePage').then(({ AddIncomePage }) => ({ default: AddIncomePage })));
const BudgetsPage = lazy(() => import('./pages/BudgetsPage').then(({ BudgetsPage }) => ({ default: BudgetsPage })));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage').then(({ CategoriesPage }) => ({ default: CategoriesPage })));
const SavingsGoalsPage = lazy(() => import('./pages/SavingsGoalsPage').then(({ SavingsGoalsPage }) => ({ default: SavingsGoalsPage })));
const BillsPage = lazy(() => import('./pages/BillsPage').then(({ BillsPage }) => ({ default: BillsPage })));
const SubscriptionsPage = lazy(() => import('./pages/SubscriptionsPage').then(({ SubscriptionsPage }) => ({ default: SubscriptionsPage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then(({ ReportsPage }) => ({ default: ReportsPage })));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage').then(({ AnalyticsPage }) => ({ default: AnalyticsPage })));
const CalendarPage = lazy(() => import('./pages/CalendarPage').then(({ CalendarPage }) => ({ default: CalendarPage })));
const EducationalExpensesPage = lazy(() => import('./pages/EducationalExpensesPage').then(({ EducationalExpensesPage }) => ({ default: EducationalExpensesPage })));
const WishlistPage = lazy(() => import('./pages/WishlistPage').then(({ WishlistPage }) => ({ default: WishlistPage })));
const FinancialHealthPage = lazy(() => import('./pages/FinancialHealthPage').then(({ FinancialHealthPage }) => ({ default: FinancialHealthPage })));
const AiAdvisorPage = lazy(() => import('./pages/AiAdvisorPage').then(({ AiAdvisorPage }) => ({ default: AiAdvisorPage })));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage').then(({ NotificationsPage }) => ({ default: NotificationsPage })));
const HelpSupportPage = lazy(() => import('./pages/HelpSupportPage').then(({ HelpSupportPage }) => ({ default: HelpSupportPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(({ SettingsPage }) => ({ default: SettingsPage })));

function MainLayout() {
  const { activePage, loading, user } = useApp();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'transactions':
        return <TransactionsPage />;
      case 'add-expense':
        return <AddExpensePage />;
      case 'add-income':
        return <AddIncomePage />;
      case 'budgets':
        return <BudgetsPage />;
      case 'categories':
        return <CategoriesPage />;
      case 'savings-goals':
        return <SavingsGoalsPage />;
      case 'bills':
        return <BillsPage />;
      case 'subscriptions':
        return <SubscriptionsPage />;
      case 'reports':
        return <ReportsPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'calendar':
        return <CalendarPage />;
      case 'education':
        return <EducationalExpensesPage />;
      case 'wishlist':
        return <WishlistPage />;
      case 'financial-health':
        return <FinancialHealthPage />;
      case 'ai-advisor':
        return <AiAdvisorPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'help':
        return <HelpSupportPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md animate-pulse">
          M
        </div>
        <p className="mt-3 text-xs font-semibold text-slate-600 dark:text-slate-400">
          Loading your money overview...
        </p>
      </div>
    );
  }

  if (!user) {
    return <AuthModal isOpen onClose={() => undefined} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex">
      {/* Sidebar Navigation */}
      <Sidebar mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Header */}
        <Header
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenAuthModal={() => setAuthModalOpen(true)}
        />

        {/* Viewport Content */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          <Suspense
            fallback={
              <div className="flex min-h-40 items-center justify-center text-sm font-medium text-slate-500 dark:text-slate-400" role="status">
                Loading page...
              </div>
            }
          >
            {renderActivePage()}
          </Suspense>
        </main>
      </div>

      {/* Floating AI Chat Assistant Widget */}
      <FloatingChatWidget />

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
