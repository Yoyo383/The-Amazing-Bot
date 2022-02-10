import {
  Client,
  CommandInteraction,
  Guild,
  Intents,
  MessageEmbed,
  Permissions,
  User,
  VoiceBasedChannel,
  VoiceChannel,
} from 'discord.js';

import commandList from './commands';

import { config } from 'dotenv';
import { hello, jail, unjail } from './cmdImplementations';
config();

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

const guildId = process.env.GUILD_ID;

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);
  const guild = client.guilds.cache.get(guildId);

  console.log('Started refreshing application (/) commands.');

  guild.commands.set(commandList).then(() => {
    const commandNames = ['hello', 'jail', 'unjail'];
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
            id: guild.roles.cache.find(
              (role) => role.name === 'The Amazing Bot Manager'
            ).id,
            type: 'ROLE',
            permission: true,
          },
        ],
      });
    });
  });

  console.log('Successfully reloaded application (/) commands.');
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand) return;

  const command = interaction as CommandInteraction;

  if (command.commandName === 'hello') await hello(command);
  else if (command.commandName === 'jail') await jail(command);
  else if (command.commandName === 'unjail') await unjail(command);
});

client.on('channelCreate', (channel) => {
  const guild = channel.guild;

  if (channel instanceof VoiceChannel) {
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

export async function createJailRole(guild: Guild, user: User) {
  // create the role
  if (
    !guild.roles.cache.find((role) => role.name === `${user.username}'s Jail`)
  ) {
    await guild.roles.create({
      name: `${user.username}'s Jail`,
      color: 'RED',
      permissions: [Permissions.DEFAULT],
    });
  }

  // changing channel permissions
  guild.channels.cache.forEach((channel) => {
    if (channel instanceof VoiceChannel) {
      if (channel.name === `${user.username}'s Jail`) {
        channel.permissionOverwrites.create(
          guild.roles.cache.find(
            (role) => role.name === `${user.username}'s Jail`
          ),
          { CONNECT: false }
        );
      }
    }
  });
}

client.login(process.env.BOT_TOKEN);
