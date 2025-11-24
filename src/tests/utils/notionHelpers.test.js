// tests/utils/notionHelpers.test.js
const { extractPageProperties } = require('../../utils/notionHelpers');

describe('extractPageProperties', () => {
  it('extracts title, status, url and postImage from a Notion page', () => {
    const fakePage = {
      url: 'https://notion.so/fake',
      properties: {
        'Task name': {
          title: [
            { plain_text: 'My Task' },
          ],
        },
        Status: {
          status: { name: 'Done' },
        },
        post_image: {
          files: [
            {
              type: 'file',
              file: { url: 'https://example.com/image.png' },
            },
          ],
        },
      },
    };

    const result = extractPageProperties(fakePage);

    expect(result).toEqual({
      title: 'My Task',
      status: 'Done',
      url: 'https://notion.so/fake',
      postImage: 'https://example.com/image.png',
    });
  });

  it('falls back to defaults when properties are missing', () => {
    const result = extractPageProperties({ properties: {} });

    expect(result.title).toBe('Untitled');
    expect(result.status).toBe('Unknown');
    expect(result.url).toBe('');
    expect(result.postImage).toBeNull();
  });
});
