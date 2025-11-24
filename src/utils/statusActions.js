// utils/statusActions.js
const {
  announceStatusChange,
  announceMission,
} = require('../utils/discordHelpers');

const STATUS_ACTIONS = {
  'Not Started': async ({ title, url, client }) =>
    announceStatusChange(client, title, 'Not Started', url),

  'In Progress': async ({ title, url, client }) =>
    announceStatusChange(client, title, 'In Progress', url),

  'Done': async ({ title, url, client, content, postImage }) => {
    await announceStatusChange(client, title, 'Done', url);
    await announceMission(client, title, url, content, postImage);
  },

  'Archived': async ({ title, url, client }) =>
    announceStatusChange(client, title, 'Archived', url),
};

module.exports = { STATUS_ACTIONS };
