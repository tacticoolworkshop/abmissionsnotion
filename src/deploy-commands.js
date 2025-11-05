const { REST, Routes } = require('discord.js');
const dotenv = require('dotenv');
const fs = require('node:fs');
const path = require('node:path');

// ---- Determine env manually via CLI argument ----
const envArg = process.argv[2];
const validEnvs = {
  production: '.env.production',
  local: '.env.local',
};

if (!validEnvs[envArg]) {
  console.error(`❌ Invalid or missing environment argument.
Usage: node deploy-commands.js [production|local]`);
  process.exit(1);
}

// Load the selected env file
dotenv.config({
  path: path.resolve(__dirname, `../${validEnvs[envArg]}`),
});

if (!process.env.TOKEN || !process.env.CLIENT_ID) {
  console.error('❌ Missing TOKEN or CLIENT_ID in selected env file.');
  process.exit(1);
}

// ---- Collect Commands ----
const commands = [];
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if ('data' in command && 'execute' in command) {
      commands.push(command.data.toJSON());
    } else {
      console.warn(`[WARNING] Skipped ${filePath} – missing 'data' or 'execute'.`);
    }
  }
}

// ---- Deploy ----
const rest = new REST().setToken(process.env.TOKEN);

(async () => {
  try {
    console.log(`🔄 Deploying ${commands.length} commands to ${envArg} environment...`);

    const route = Routes.applicationCommands(process.env.CLIENT_ID);
    const data = await rest.put(route, { body: commands });

    console.log(`✅ Successfully deployed ${data.length} global commands to ${envArg}.`);
  } catch (error) {
    console.error('❌ Deployment failed:', error);
  }
})();
