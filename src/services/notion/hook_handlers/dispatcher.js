const { handleStatusChange } = require('./statusChangeHandler');

let queue;

(async () => {
  try {
    const { default: PQueue } = await import('p-queue');
    queue = new PQueue({ concurrency: 5 });
    console.log('[Dispatcher] PQueue initialized');
  } catch (err) {
    console.error('[Dispatcher] Failed to import PQueue:', err);
  }
})();

const dispatchEvent = async (event, client) => {
  if (!queue) {
    console.warn('[Dispatcher] Queue not initialized yet. Skipping event.');
    return;
  }

  console.log(`[Dispatcher] Queueing event type: ${event.type}`);

  queue.add(async () => {
    try {
      switch (event.type) {
        case 'page.properties_updated':
          await handleStatusChange(event, client);
          break;
        default:
          console.log('[Dispatcher] Unrecognized event type:', event.type);
      }
    } catch (err) {
      console.error('[Dispatcher] Error while processing event:', err);
    }
  });
};

module.exports = { dispatchEvent };
