const { getPageDetails } = require('../services/notion/api/notionQueries'); 

const extractPageProperties = (page) => {
  console.log('[NotionHelpers] Raw page properties:', JSON.stringify(page.properties, null, 2));

  const title = page.properties?.["Task name"]?.title?.[0]?.plain_text || 'Untitled';
  const status = page.properties?.Status?.status?.name || 'Unknown';
  const url = page.url || '';

  console.log('[NotionHelpers] Extracted page data:', { title, status, url });

  return { title, status, url };
};


const fetchPageData = async (pageId) => {
  try {
    const page = await getPageDetails(pageId);
    return extractPageProperties(page);
  } catch (err) {
    console.error('[NotionHelpers] Failed to fetch page data:', err);
    return null;
  }
};

module.exports = { fetchPageData, extractPageProperties };
