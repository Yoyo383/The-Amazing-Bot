import {
  CommandInteraction,
  MessageEmbed,
  VoiceBasedChannel,
  VoiceChannel,
  Permissions,
  GuildMember,
  TextChannel,
} from 'discord.js';
import { createEmbed } from '.';

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

  await guild.channels.create(`${user.username}'s Jail`, {
    type: 'GUILD_VOICE',
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

export async function godmode(command: CommandInteraction) {
  const guild = command.guild;

  const member = command.member as GuildMember;
  await member.roles.add(
    guild.roles.cache.find((role) => role.name === 'GODMODE!!!!!')
  );
  await command.reply(`OMG ${member} IS NOW A GOD!!!!!`);
}

export async function ungodmode(command: CommandInteraction) {
  const guild = command.guild;

  const user = command.options.getUser('user');
  const member = guild.members.cache.get(user.id);
  if (!member.roles.cache.find((role) => role.name === 'GODMODE!!!!!')) {
    await command.reply({
      content: `haha ${member} is not a god lol`,
      ephemeral: true,
    });
    return;
  }
  await member.roles.remove(
    guild.roles.cache.find((role) => role.name === 'GODMODE!!!!!')
  );
  await command.reply(`nooo ${member} is no longer a god :(`);
}

export async function sudo(command: CommandInteraction) {
  const user = command.options.getUser('user');
  const channel = command.channel as TextChannel;

  await channel
    .createWebhook(user.username, {
      avatar: user.displayAvatarURL(),
    })
    .then(async (webhook) => {
      await webhook.send({
        content: command.options.getString('message'),
      });
      await webhook.delete();
    })
    .finally(
      async () =>
        await command.reply({
          content: `${user} has been sudoed!`,
          ephemeral: true,
        })
    );
}
