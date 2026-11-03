import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { initStorage } from './server/storage.js';
import { apiRouter } from './server/routes/api.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '5000', 10);
const frontendPath = path.resolve(__dirname, '../frontend');
const isProd = process.env.NODE_ENV === 'production';

async function bootstrap() {
  const app = express();

  // Core middlewares
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Initialize storage layer (MongoDB connection or resilient local storage with demo seed)
  await initStorage();

  // Mount API router
  app.use('/api', apiRouter);

  // Vite development middleware or production static serving
  if (!isProd) {
    const vite = await createViteServer({
      root: frontendPath,
      configFile: path.resolve(__dirname, '../vite.config.ts'),
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(frontendPath, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Money Management System] Running on http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('[Money Management System] Fatal startup error:', err);
  process.exit(1);
});
