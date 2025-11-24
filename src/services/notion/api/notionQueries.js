// src/services/notion/api/notionQueries.js
const notion = require('./client'); // your Notion SDK client

const getPageDetails = async (pageId) => {
  try {
    const page = await notion.pages.retrieve({ page_id: pageId });
    return page;
  } catch (err) {
    console.error('[NotionQueries] Error fetching page details:', err.message);
    throw err;
  }
};

const getPageBlocks = async (pageId, { pageSize = 30 } = {}) => {
  try {
    const blocks = [];
    let cursor;
    let fetched = 0;

    do {
      const resp = await notion.blocks.children.list({
        block_id: pageId,
        start_cursor: cursor,
        page_size: Math.min(50, pageSize - fetched),
      });

      blocks.push(...resp.results);
      fetched += resp.results.length;
      cursor = resp.has_more ? resp.next_cursor : null;
    } while (cursor && fetched < pageSize);

    return blocks;
  } catch (err) {
    console.error('[NotionQueries] Error fetching page blocks:', err.message);
    throw err;
  }
};

module.exports = { getPageDetails, getPageBlocks };
