const fs = require('fs').promises;
const path = require('path');

const LOG_WEBHOOK_JSON = process.env.LOG_WEBHOOK_JSON === 'true';

const logWebhookMiddleware = async (req, _res, next) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) return next();

    console.log('[Webhook] Incoming payload keys:', Object.keys(req.body));

    if (LOG_WEBHOOK_JSON) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `webhook_${timestamp}.json`;
      const logsDir = path.resolve(__dirname, '../logs');
      const filePath = path.join(logsDir, fileName);

      await fs.mkdir(logsDir, { recursive: true });
      await fs.writeFile(filePath, JSON.stringify(req.body, null, 2), 'utf-8');
      console.log(`[Webhook] Payload written to ${filePath}`);
    }

    next();
  } catch (err) {
    console.error('[Webhook] Error logging payload:', err);
    next();
  }
};

module.exports = logWebhookMiddleware;
