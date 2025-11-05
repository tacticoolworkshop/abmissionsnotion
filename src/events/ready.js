const fs = require('fs');
const { getDatabase, getDatabaseRecords } = require('../services/notion/api/notionQueries');
const { extractPageProperties } = require('../services/notion/utils');

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {

  
  },
};
