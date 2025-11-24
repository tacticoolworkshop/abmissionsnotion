// src/utils/notionHelpers.js
const {
  getPageDetails,
  getPageBlocks,
} = require('../services/notion/api/notionQueries');

// Helper to flatten Notion rich_text arrays
const extractRichText = (richTextArray = []) =>
  richTextArray.map((rt) => rt.plain_text).join('');

/**
 * Extract title, status, URL, and post_image from a Notion page
 */
const extractPageProperties = (page) => {
  console.log(
    '[NotionHelpers] Raw page properties:',
    JSON.stringify(page.properties, null, 2)
  );

  const title =
    page.properties?.['Task name']?.title?.[0]?.plain_text || 'Untitled';

  // Status is a "status" property in your DB
  const status = page.properties?.Status?.status?.name || 'Unknown';

  const url = page.url || '';

  // 🔥 post_image: Files property (can be file or external)
  let postImage = null;
  const filesProp = page.properties?.post_image?.files;

  if (Array.isArray(filesProp) && filesProp.length > 0) {
    const first = filesProp[0];

    if (first.type === 'file' && first.file?.url) {
      postImage = first.file.url;
    } else if (first.type === 'external' && first.external?.url) {
      postImage = first.external.url;
    }
  }

  console.log('[NotionHelpers] Extracted page data:', {
    title,
    status,
    url,
    postImage,
  });

  return { title, status, url, postImage };
};

const fetchPageData = async (pageId) => {
  try {
    const page = await getPageDetails(pageId);
    const { title, status, url, postImage } = extractPageProperties(page);

    let content = null;

    // ⚡ Only fetch blocks when the task is Done
    if (status === 'Done') {
      try {
        const blocks = await getPageBlocks(pageId, { pageSize: 30 });

        const lines = blocks
          .map((block) => {
            const { type } = block;
            const data = block[type];
            if (!data) return null;

            switch (type) {
              case 'paragraph':
              case 'heading_1':
              case 'heading_2':
              case 'heading_3':
              case 'bulleted_list_item':
              case 'numbered_list_item':
              case 'to_do':
                return extractRichText(data.rich_text);
              default:
                return null; // ignore other block types in preview
            }
          })
          .filter(Boolean);

        content = lines.join('\n').trim() || null;
      } catch (err) {
        console.error(
          '[NotionHelpers] Failed to fetch page content for Done page:',
          err.message
        );
      }
    }

    return { title, status, url, content, postImage };
  } catch (err) {
    console.error('[NotionHelpers] Failed to fetch page data:', err.message);
    return null;
  }
};

module.exports = { fetchPageData, extractPageProperties };
