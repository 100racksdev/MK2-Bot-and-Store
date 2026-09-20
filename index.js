require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection, MessageFlags } = require('discord.js');
const { connectDB } = require('./db');
const config = require('./config.json');
const { createTicket, TicketLimitError } = require('./utils/createTicket');
const startStore = require('./store/server');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
for (const file of fs.readdirSync(commandsPath).filter((f) => f.endsWith('.js'))) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.data.name, command);
  console.log(`[COMMAND] Loaded ${command.data.name}`);
}

client.once('clientReady', () => {
  console.log(`[READY] Logged in as ${client.user.tag}`);
  startStore(client); // website + Discord login + checkout -> tickets
});

client.on('interactionCreate', async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      return command.execute(interaction);
    }

    if (interaction.isButton() && interaction.customId.startsWith('create_ticket_')) {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      const categoryId = interaction.customId.replace('create_ticket_', '');
      const category = config.categories.find((c) => c.id === categoryId);
      if (!category) {
        return interaction.editReply('This ticket category no longer exists. Contact an admin.');
      }

      try {
        const channel = await createTicket({
          guild: interaction.guild,
          userId: interaction.user.id,
          username: interaction.user.username,
          category,
        });
        return interaction.editReply(`Ticket created: <#${channel.id}>`);
      } catch (err) {
        if (err instanceof TicketLimitError) return interaction.editReply(err.message);
        throw err;
      }
    }
  } catch (err) {
    console.error('[INTERACTION ERROR]', err);
    const payload = { content: 'Something went wrong handling that.', flags: MessageFlags.Ephemeral };
    if (interaction.deferred || interaction.replied) {
      interaction.editReply(payload).catch(() => {});
    } else {
      interaction.reply(payload).catch(() => {});
    }
  }
});

(async () => {
  await connectDB();
  await client.login(process.env.DISCORD_TOKEN);
})();
