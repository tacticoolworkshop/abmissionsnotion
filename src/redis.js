const { createClient } = require('redis');

const redisClient = createClient({
  username: process.env.REDIS_USERNAME || 'default',
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10),
    tls: process.env.REDIS_TLS === 'true', // toggle TLS via env variable
  }
});

// Handle client errors
redisClient.on('error', (err) => {
  console.error('[Redis] Client Error:', err);

  // Optional: retry logic or alerting
});

// Handle connect/disconnect events
redisClient.on('connect', () => console.log('[Redis] Connecting...'));
redisClient.on('ready', () => console.log('[Redis] Ready'));
redisClient.on('end', () => console.warn('[Redis] Connection closed'));

(async () => {
  try {
    await redisClient.connect();
    console.log('[Redis] Connected successfully');
  } catch (err) {
    console.error('[Redis] Failed to connect:', err);
    // Optional: implement retry logic here
  }
})();

module.exports = redisClient;
