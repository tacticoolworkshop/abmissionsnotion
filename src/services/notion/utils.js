/**
 * Extracts title, status, and URL from a Notion page object.
 * Assumes title is under 'Task name' and status is under 'Status'.
 */
const extractPageProperties = (page) => {
  if (!page || !page.properties) {
    console.warn('[Utils] Invalid page object');
    return { title: 'Untitled', status: 'Unknown', url: '' };
  }

  const titleProp = page.properties['Task name']?.title || [];
  const statusProp = page.properties.Status?.status;

  const title = titleProp.length > 0 ? titleProp[0].plain_text : 'Untitled';
  const status = statusProp?.name || 'No Status';
  const url = page.url || '';

  return { title, status, url };
};

module.exports = {
  extractPageProperties,
};
