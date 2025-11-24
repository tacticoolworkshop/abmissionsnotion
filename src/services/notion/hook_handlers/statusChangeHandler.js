// statusChangeHandler.js
const { fetchPageData } = require('../../../utils/notionHelpers');
const { getLastStatus, setLastStatus } = require('../../statusCache');
const { STATUS_ACTIONS } = require('../../../utils/statusActions');

const EXPECTED_DB_ID = '23266069-c74b-8138-a852-cd2e9810eab1';
const STATUS_PROPERTY_KEY = 'notion%3A%2F%2Ftasks%2Fstatus_property';

const handleStatusChange = async (event, client) => {
  if (event.type !== 'page.properties_updated') return;

  const { updated_properties = [], parent } = event.data || {};
  const pageId = event.entity?.id;
  const parentDbId = parent?.id;

  if (!pageId || !parentDbId) return;
  if (parentDbId !== EXPECTED_DB_ID) return;
  if (!updated_properties.includes(STATUS_PROPERTY_KEY)) return;

  try {
    const pageData = await fetchPageData(pageId);
    console.log('[StatusHandler] pageData:', pageData);
    if (!pageData) return;

    // 👇 include postImage
    const { title, status, url, content, postImage } = pageData;

    const lastStatus = await getLastStatus(pageId);
    if (lastStatus === status) return;
    await setLastStatus(pageId, status);

    const action = STATUS_ACTIONS[status];
    if (action) {
      // 👇 pass postImage through to the action
      await action({ title, url, client, content, postImage });
      console.log(
        `[StatusHandler] Executed action for "${status}" on "${title}"`
      );
    } else {
      console.debug(
        `[StatusHandler] No action defined for status "${status}" on "${title}"`
      );
    }
  } catch (err) {
    console.error('[StatusHandler] Error handling status change:', err);
  }
};

module.exports = { handleStatusChange };
