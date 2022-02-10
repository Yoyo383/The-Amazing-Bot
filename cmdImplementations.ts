import {
  CommandInteraction,
  MessageEmbed,
  VoiceBasedChannel,
} from 'discord.js';
import { createJailRole, createEmbed } from '.';

export async function hello(command: CommandInteraction) {
  await command.reply(`Hello ${command.options.getString('suffix')}`);
}

export async function jail(command: CommandInteraction) {
  const user = command.options.getUser('user');

  const guild = command.guild;
  const member = guild.members.cache.get(user.id);

  if (
    member.roles.cache.find((role) => role.name === `${user.username}'s Jail`)
  ) {
    await command.reply({
      content: `You can't jail ${user} as they are already jailed!`,
      ephemeral: true,
    });
    return;
  }

  createJailRole(guild, user);

  await guild.channels.create(`${user.username}'s Jail`, {
    type: 'GUILD_VOICE',
    topic: 'Jails',
  });

  const channel = guild.channels.cache.find(
    (channel) => channel.name === `${user.username}'s Jail`
  ) as VoiceBasedChannel;

  if (member.voice.channel) member.voice.setChannel(channel);
  member.roles.add(
    guild.roles.cache.find((role) => role.name === `${user.username}'s Jail`)
  );

  let embed: MessageEmbed = createEmbed(true, user, command);

  await command.reply({ embeds: [embed] });
}

export async function unjail(command: CommandInteraction) {
  const user = command.options.getUser('user');

  const guild = command.guild;
  const member = guild.members.cache.get(user.id);

  if (
    !member.roles.cache.find((role) => role.name === `${user.username}'s Jail`)
  ) {
    await command.reply({
      content: `You can't unjail ${user} as they are not jailed!`,
      ephemeral: true,
    });
    return;
  }

  await member.roles.remove(
    guild.roles.cache.find((role) => role.name === `${user.username}'s Jail`).id
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

  if (
    guild.roles.cache.find((role) => role.name === `${user.username}'s Jail`)
  ) {
    await guild.roles.cache
      .find((role) => role.name === `${user.username}'s Jail`)
      .delete();
  }

  const embed = createEmbed(false, user, command);

  await command.reply({ embeds: [embed] });
}
