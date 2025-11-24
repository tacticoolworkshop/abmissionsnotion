/**
 * Tests for handleStatusChange.js
 */

jest.mock('../../../src/utils/notionHelpers', () => ({
  fetchPageData: jest.fn(),
}));

jest.mock('../../../src/services/statusCache', () => ({
  getLastStatus: jest.fn(),
  setLastStatus: jest.fn(),
}));

jest.mock('../../../src/utils/statusActions', () => ({
  STATUS_ACTIONS: {
    Done: jest.fn(),
    'In Progress': jest.fn(),
  },
}));

const { fetchPageData } = require('../../../src/utils/notionHelpers');
const { getLastStatus, setLastStatus } = require('../../../src/services/statusCache');
const { STATUS_ACTIONS } = require('../../../src/utils/statusActions');
const { handleStatusChange } = require('../../../src/services/notion/hook_handlers/statusChangeHandler');

describe('handleStatusChange', () => {
  const EXPECTED_DB_ID = '23266069-c74b-8138-a852-cd2e9810eab1';
  const STATUS_PROPERTY_KEY = 'notion%3A%2F%2Ftasks%2Fstatus_property';

  const fakeClient = {}; // not needed, but passed through

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const baseEvent = {
    type: 'page.properties_updated',
    entity: { id: 'page123' },
    data: {
      parent: { id: EXPECTED_DB_ID },
      updated_properties: [STATUS_PROPERTY_KEY],
    },
  };

  it('ignores events that are not page.properties_updated', async () => {
    await handleStatusChange({ type: 'something_else' }, fakeClient);
    expect(fetchPageData).not.toHaveBeenCalled();
  });

  it('ignores events not coming from the expected DB', async () => {
    const event = {
      ...baseEvent,
      data: { parent: { id: 'wrong-db' }, updated_properties: [STATUS_PROPERTY_KEY] },
    };

    await handleStatusChange(event, fakeClient);
    expect(fetchPageData).not.toHaveBeenCalled();
  });

  it('ignores events that do not include the status property key', async () => {
    const event = {
      ...baseEvent,
      data: { parent: { id: EXPECTED_DB_ID }, updated_properties: [] },
    };

    await handleStatusChange(event, fakeClient);
    expect(fetchPageData).not.toHaveBeenCalled();
  });

  it('calls fetchPageData and triggers the correct status action when status changes', async () => {
    fetchPageData.mockResolvedValue({
      title: 'Test Task',
      status: 'Done',
      url: 'http://example.com',
      content: 'Some text',
      postImage: 'http://image.com/pic.png',
    });

    getLastStatus.mockResolvedValue('In Progress');

    await handleStatusChange(baseEvent, fakeClient);

    expect(fetchPageData).toHaveBeenCalledWith('page123');
    expect(getLastStatus).toHaveBeenCalledWith('page123');
    expect(setLastStatus).toHaveBeenCalledWith('page123', 'Done');

    expect(STATUS_ACTIONS.Done).toHaveBeenCalledWith({
      title: 'Test Task',
      url: 'http://example.com',
      client: fakeClient,
      content: 'Some text',
      postImage: 'http://image.com/pic.png',
    });
  });

  it('does NOT call status action if status has not changed', async () => {
    fetchPageData.mockResolvedValue({
      title: 'Test Task',
      status: 'Done',
      url: 'http://example.com',
      content: 'Some text',
      postImage: 'http://image.com/pic.png',
    });

    getLastStatus.mockResolvedValue('Done');

    await handleStatusChange(baseEvent, fakeClient);

    expect(setLastStatus).not.toHaveBeenCalled();
    expect(STATUS_ACTIONS.Done).not.toHaveBeenCalled();
  });

  it('skips when fetchPageData returns null', async () => {
    fetchPageData.mockResolvedValue(null);

    await handleStatusChange(baseEvent, fakeClient);

    expect(getLastStatus).not.toHaveBeenCalled();
    expect(STATUS_ACTIONS.Done).not.toHaveBeenCalled();
  });
});
