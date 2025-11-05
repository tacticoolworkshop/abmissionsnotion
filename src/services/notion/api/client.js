const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_API_TOKEN });

if (notion) {
    console.log("[NOTION CLIENT] Initialised")
} else {
    console.log("[NOTION CLIENT] Failed to connect...")
}

module.exports = notion;
