/*
Deploying to server: 
index: require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
curl -fsSL https://rpm.nodesource.com/setup_16.x | sudo bash -
cd to local dir
sudo yum install -y nodejs
npm install discord.js
sudo npm install --global pm2
npm i cjs@latest
npm i dotenv
*/

const path = require('node:path');
const dotenv = require('dotenv');

// Determine and load the appropriate env file
const envFile = process.env.NODE_ENV === 'production'
  ? '.env.production'
  : '.env.local';

dotenv.config({
  path: path.resolve(__dirname, `../${envFile}`),
});

const { Client, IntentsBitField, EmbedBuilder, ActivityType, Collection, Events, GatewayIntentBits, MessageFlags } = require('discord.js');
const fs = require('node:fs');
const config = require('./config');
const server = require('./services/express');
// const mongoose = require('mongoose');

	// Manage our Discord Intents
const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
		IntentsBitField.Flags.GuildPresences,
		IntentsBitField.Flags.GuildMessagePolls,
    ]
})

client.setMaxListeners(20); // Set to the desired limit

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

client.on(Events.InteractionCreate, async interaction => {
	if (interaction.isChatInputCommand()) {
	  const command = interaction.client.commands.get(interaction.commandName);
  
	  if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	  }
  
	  // Check for admin-only command
	  if (command.admin) {
		const isAdmin = interaction.member.roles.cache.has(config.adminID);
	  
		if (!isAdmin) {
		  console.log(`[DENIED] ${interaction.user.tag} (${interaction.user.id}) tried to use admin command: /${command.data.name}`);
		  await interaction.reply({ content: '❌ You do not have permission to use this command.', flags: MessageFlags.Ephemeral });
		  return;
		}
	  }	  
  
	  try {
		await command.execute(interaction);
	  } catch (error) {
		console.error(`Error executing ${interaction.commandName}`);
		console.error(error);
	  }
	} else if (interaction.isAutocomplete()) {
	  const command = interaction.client.commands.get(interaction.commandName);
  
	  if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	  }
  
	  try {
		await command.autocomplete(interaction);
	  } catch (error) {
		console.error(error);
	  }
	}
  });


// Here we have a modified code to read subfolders for better nested structures
const eventsPath = path.join(__dirname, 'events');
const eventFiles = getAllEventFiles(eventsPath);

for (const filePath of eventFiles) {
 
    const event = require(filePath)

    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
		//console.log("Executed once")
    } else {
        client.on(event.name, (...args) => event.execute(...args));
		//console.log("Executed")
    }
}

function getAllEventFiles(dir) {
    let files = [];

    const readFiles = (directory) => {
        const items = fs.readdirSync(directory);

        for (const item of items) {
            const itemPath = path.join(directory, item);
            const isFile = fs.statSync(itemPath).isFile();

            if (isFile && item.endsWith('.js')) {
                files.push(itemPath);
            } else if (!isFile) {
                readFiles(itemPath); // Recursively read files in subfolders
            }
        }
    };

    readFiles(dir);
    return files;
}


( async () => {

	try {
		// Ensure all files are initialized before proceeding

		// Login to Discord
		await client.login(process.env.TOKEN);

		console.log(`[Discord] Logged in as ${client.user.tag}`);

		server.createWebhookServer(client); // ✅ Only called once here

		console.log(client.listenerCount('messageCreate')); // or any other event

		// client.user.setPresence({
		// 	activities: [{ name: `Top AB Videos`, type: ActivityType.Streaming }]
		//   });
	
	} catch (error) {
		console.log("/////////////// Connection Error");
		console.error("Discord Client Login error: ", error);
	}	
	
})(); 

setInterval(() => {
  const { rss, heapUsed } = process.memoryUsage();
  console.log(`[Memory] RSS: ${rss}, HeapUsed: ${heapUsed}`);
}, 5000);


process.on('exit', (code) => {
	console.log('Application shutdown with code:', code);
});




