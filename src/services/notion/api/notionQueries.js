const notion = require('./client'); // adjust path to your Notion client

const getPageDetails = async (pageId) => {
  try {
    const page = await notion.pages.retrieve({ page_id: pageId });
    return page;
  } catch (err) {
    console.error('[NotionQueries] Error fetching page details:', err);
    throw err;
  }
};

const fetchPageData = async (pageId) => {
  try {
    const page = await getPageDetails(pageId);
    const title = page.properties.Name?.title?.[0]?.plain_text || 'Untitled';
    const status = page.properties.Status?.select?.name || 'Unknown';
    const url = page.url;

    return { title, status, url };
  } catch (err) {
    console.error('[StatusHandler] Failed to fetch page data:', err);
    return null;
  }
};

module.exports = { getPageDetails, fetchPageData };
