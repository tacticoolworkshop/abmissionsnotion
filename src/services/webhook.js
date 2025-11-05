const { dispatchEvent } = require('./notion/hook_handlers/dispatcher');

const handleNotionWebhook = async (req, res, client) => {
  try {
    const payload = req.body;

    if (!payload || !payload.type || !payload.data) {
      console.warn('[Webhook] Invalid payload structure');
      return res.status(400).send('Invalid webhook payload');
    }

    await dispatchEvent(payload, client);

    res.sendStatus(200);
  } catch (err) {
    console.error('[Webhook] Error handling webhook:', err);
    res.sendStatus(500);
  }
};

module.exports = {
  handleNotionWebhook,
};
