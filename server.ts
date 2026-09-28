import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import app from './server/app';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

async function startServer() {
  console.log('[Server] Starting CloudSpend backend...');
  const isProd = process.env.NODE_ENV === 'production';
  console.log('[Server] Mode:', isProd ? 'production' : 'development');

  if (!isProd) {
    console.log('[Server] Initializing Vite middleware...');
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    console.log('[Server] Vite middleware created.');
    app.use(vite.middlewares);
  } else {
    // Serve production build
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`CloudSpend full-stack application running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
