const redisClient = require('../redis');

const getLastStatus = async (pageId) => {
  try {
    const status = await redisClient.get(`status:${pageId}`);
    return status;
  } catch (err) {
    console.error('[StatusCache] Error getting status:', err);
    return null;
  }
};

const setLastStatus = async (pageId, status) => {
  try {
    // Optional expiration: 24 hours
    await redisClient.set(`status:${pageId}`, status, 'EX', 60 * 60 * 24);
  } catch (err) {
    console.error('[StatusCache] Error setting status:', err);
  }
};

module.exports = { getLastStatus, setLastStatus };
