// tests/utils/discordHelpers.test.js
const { announceMission } = require('../../utils/discordHelpers');
const { EmbedBuilder } = require('discord.js');

describe('announceMission', () => {
  it('sends an embed with content and postImage when provided', async () => {
    // Arrange: mock Discord channel and client
    const sendMock = jest.fn().mockResolvedValue(null);

    const fakeChannel = { send: sendMock };
    const fetchMock = jest.fn().mockResolvedValue(fakeChannel);

    const fakeClient = {
      channels: {
        fetch: fetchMock,
      },
    };

    // fake env
    process.env.LOGS_CHANNEL = '1234567890';

    const title = 'Completed Task';
    const url = 'https://notion.so/fake';
    const content = 'Some summary text';
    const postImage = 'https://example.com/image.png';

    // Act
    await announceMission(fakeClient, title, url, content, postImage);

    // Assert: fetch called with correct channel id
    expect(fetchMock).toHaveBeenCalledWith('1234567890');

    // Assert: we sent exactly one embed
    expect(sendMock).toHaveBeenCalledTimes(1);
    const callArg = sendMock.mock.calls[0][0];

    expect(callArg.embeds).toHaveLength(1);

    const embed = callArg.embeds[0];
    // embed is a real EmbedBuilder, we can inspect its data:
    const data = embed.toJSON();

    expect(data.title).toBe(title);
    expect(data.url).toBe(url);
    expect(data.description).toContain('Task completed');
    expect(data.image.url).toBe(postImage);
  });
});
