import {
  Client,
  CommandInteraction,
  Intents,
  MessageEmbed,
  User,
  Permissions,
} from 'discord.js';

import commandList from './commands';

import { config } from 'dotenv';
import {
  godmode,
  hello,
  jail,
  joke,
  sudo,
  ungodmode,
  unjail,
} from './cmdImplementations';
config();

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

const guildId = process.env.GUILD_ID;

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);
  const guild = client.guilds.cache.get(guildId);

  console.log('Started refreshing application (/) commands.');

  await guild.commands
    .set(commandList)
    .then(() => {
      const commandNames = ['hello', 'jail', 'unjail', 'ungodmode', 'sudo'];
      commandNames.forEach(async (commandName) => {
        const command = await guild.commands.fetch(
          guild.commands.cache.find((cmd) => cmd.name === commandName).id
        );
        command.permissions.add({
          permissions: [
            {
              id: guild.roles.everyone.id,
              type: 'ROLE',
              permission: false,
            },
            {
              id: guild.ownerId,
              type: 'USER',
              permission: true,
            },
          ],
        });
      });
    })
    .then(() => console.log('Successfully reloaded application (/) commands.'));

  if (!guild.roles.cache.find((role) => role.name === 'GODMODE!!!!!')) {
    await guild.roles.create({
      name: 'GODMODE!!!!!',
      color: 'GOLD',
      permissions: [Permissions.DEFAULT],
    });
  }

  guild.channels.cache.forEach((channel) => {
    if (channel.type === 'GUILD_VOICE') {
      channel.permissionOverwrites.create(
        guild.roles.cache.find((role) => role.name === 'GODMODE!!!!!'),
        { CONNECT: false }
      );
    } else if (channel.type === 'GUILD_TEXT') {
      channel.permissionOverwrites.create(
        guild.roles.cache.find((role) => role.name === 'GODMODE!!!!!'),
        { SEND_MESSAGES: false }
      );
    }
  });
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand) return;

  const command = interaction as CommandInteraction;

  if (command.commandName === 'hello') await hello(command);
  else if (command.commandName === 'jail') await jail(command);
  else if (command.commandName === 'unjail') await unjail(command);
  else if (command.commandName === 'godmode') await godmode(command);
  else if (command.commandName === 'ungodmode') await ungodmode(command);
  else if (command.commandName === 'sudo') await sudo(command);
  else if (command.commandName === 'joke') await joke(command);
});

client.on('channelCreate', (channel) => {
  const guild = channel.guild;

  if (channel.type === 'GUILD_VOICE') {
    if (!channel.name.includes('Jail')) {
      channel.permissionOverwrites.create(
        guild.roles.cache.find((role) => role.name === 'JAILED'),
        { CONNECT: false }
      );
    }
  }
});

export function createEmbed(
  jailed: boolean,
  user: User,
  command: CommandInteraction
): MessageEmbed {
  const author = command.member.user as User;

  const embed = new MessageEmbed()
    .setColor('AQUA')
    .setAuthor({
      name: author.username,
      iconURL: author.displayAvatarURL(),
    })
    .setTitle(jailed ? 'Jailed!' : 'Unjailed!')
    .setDescription(
      `${user} just got ${jailed ? 'jailed' : 'unjailed'} by ${command.member}!`
    )
    .setThumbnail(user.displayAvatarURL());
  if (command.options.getString('reason'))
    embed.addFields({
      name: 'Reason',
      value: command.options.getString('reason'),
    });
  return embed;
}

client.login(process.env.BOT_TOKEN);
