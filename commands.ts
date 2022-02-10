import { SlashCommandBuilder } from '@discordjs/builders';
import { RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types';

const commandList: RESTPostAPIApplicationCommandsJSONBody[] = [];

const hello = new SlashCommandBuilder()
  .setName('hello')
  .setDescription('Sends "Hello" + suffix')
  .addStringOption((option) =>
    option
      .setName('suffix')
      .setDescription('The suffix to add to the "Hello".')
      .setRequired(true)
  );

const jail = new SlashCommandBuilder()
  .setName('jail')
  .setDescription('Move someone into a jail!')
  .addUserOption((option) =>
    option.setName('user').setDescription('The user to jail.').setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName('reason')
      .setDescription('The reason for the jail.')
      .setRequired(false)
  );

const unjail = new SlashCommandBuilder()
  .setName('unjail')
  .setDescription('Unjails someone!')
  .addUserOption((option) =>
    option
      .setName('user')
      .setDescription('The user to unjail.')
      .setRequired(true)
  );

commandList.push(hello.toJSON());
commandList.push(jail.toJSON());
commandList.push(unjail.toJSON());

export default commandList;
