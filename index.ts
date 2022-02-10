import {
  Client,
  CommandInteraction,
  Intents,
  MessageEmbed,
  Permissions,
  User,
  VoiceBasedChannel,
  VoiceChannel,
} from 'discord.js';

import commandList from './commands';

import { config } from 'dotenv';
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
        guild.commands.cache.find((c) => c.name === commandName).id
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

  if (!guild.roles.cache.find((role) => role.name === 'JAILED')) {
    await guild.roles.create({
      name: 'JAILED',
      color: 'RED',
      permissions: [Permissions.DEFAULT],
    });
  }
  guild.channels.cache.forEach((channel) => {
    if (channel instanceof VoiceChannel) {
      if (!channel.name.includes('Jail')) {
        channel.permissionOverwrites.create(
          guild.roles.cache.find((role) => role.name === 'JAILED'),
          { CONNECT: false }
        );
      }
    }
  });
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand) return;

  const command = interaction as CommandInteraction;

  if (command.commandName === 'hello') {
    await command.reply(`Hello ${command.options.getString('suffix')}`);
  } else if (command.commandName === 'jail') {
    const user = command.options.getUser('user');

    const guild = command.guild;
    const member = guild.members.cache.get(user.id);

    if (member.roles.cache.find((role) => role.name === 'JAILED')) {
      await command.reply({
        content: `You can't jail ${user} as they are already jailed!`,
        ephemeral: true,
      });
      return;
    }

    await guild.channels.create(`${user.username}'s Jail`, {
      type: 'GUILD_VOICE',
    });

    const channel = guild.channels.cache.find(
      (channel) => channel.name === `${user.username}'s Jail`
    ) as VoiceBasedChannel;

    if (member.voice.channel) member.voice.setChannel(channel);
    member.roles.add(guild.roles.cache.find((role) => role.name === 'JAILED'));

    let embed: MessageEmbed = createEmbed(true, user, command);

    await command.reply({ embeds: [embed] });
  } else if (command.commandName === 'unjail') {
    const user = command.options.getUser('user');

    const guild = command.guild;
    const member = guild.members.cache.get(user.id);

    if (!member.roles.cache.find((role) => role.name === 'JAILED')) {
      await command.reply({
        content: `You can't unjail ${user} as they are not jailed!`,
        ephemeral: true,
      });
      return;
    }

    await member.roles.remove(
      guild.roles.cache.find((role) => role.name === 'JAILED').id
    );

    if (
      guild.channels.cache.find(
        (channel) => channel.name === `${user.username}'s Jail`
      )
    ) {
      await guild.channels.cache
        .find((channel) => channel.name === `${user.username}'s Jail`)
        .delete();
    }

    const embed = createEmbed(false, user, command);

    await command.reply({ embeds: [embed] });
  }
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

function createEmbed(
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
