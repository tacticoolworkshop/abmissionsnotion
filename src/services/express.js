const express = require('express');
const bodyParser = require('body-parser');
const { handleNotionWebhook } = require('./webhook');
const logWebhookMiddleware = require('./webhookLogging');

const PORT = process.env.PORT || 3000;
const WEBHOOK_PATH = process.env.WEBHOOK_PATH || '/notion-webhook';

const createWebhookServer = (client) => {
  const app = express();

  app.use(bodyParser.json({ limit: '100kb' })); // small limit to prevent huge payloads
  app.use((req, res, next) => { console.log(`[DEBUG] ${req.method} ${req.originalUrl}`); next(); });
  app.use(WEBHOOK_PATH, logWebhookMiddleware);

  app.post(WEBHOOK_PATH, (req, res) => handleNotionWebhook(req, res, client));
  app.get(WEBHOOK_PATH, (_req, res) => res.send(`Webhook endpoint ${WEBHOOK_PATH} is live`));

  app.listen(PORT, () => console.log(`[Express] Webhook server listening on http://localhost:${PORT}${WEBHOOK_PATH}`));

  return app;
};

module.exports = { createWebhookServer };
