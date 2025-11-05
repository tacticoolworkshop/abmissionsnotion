const { announceStatusChange } = require('../utils/discordHelpers');

const STATUS_ACTIONS = {
  'Not Started': async ({ title, url, client }) => 
    announceStatusChange(client, title, 'Not Started', url),
    
  'In Progress': async ({ title, url, client }) => 
    announceStatusChange(client, title, 'In Progress', url),
    
  'Done': async ({ title, url, client }) => 
    announceStatusChange(client, title, 'Done', url),
    
  'Archived': async ({ title, url, client }) => 
    announceStatusChange(client, title, 'Archived', url),
};

module.exports = { STATUS_ACTIONS };
