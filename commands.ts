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

const godmode = new SlashCommandBuilder()
  .setName('godmode')
  .setDescription('TURNS YOU INTO A GOD 10000% LEGIT!!!!')
  .addUserOption((option) =>
    option
      .setName('user')
      .setDescription("The user to turn into a god (only if you're an admin.")
      .setRequired(false)
  );

const ungodmode = new SlashCommandBuilder()
  .setName('ungodmode')
  .setDescription('no longer god :(')
  .addUserOption((option) =>
    option
      .setName('user')
      .setDescription('not god anymore :(')
      .setRequired(true)
  );

const sudo = new SlashCommandBuilder()
  .setName('sudo')
  .setDescription('Makes a member send something.')
  .addUserOption((option) =>
    option.setName('user').setDescription('The user to sudo.').setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName('message')
      .setDescription('The message to send.')
      .setRequired(true)
  );

const joke = new SlashCommandBuilder()
  .setName('joke')
  .setDescription('Sends a random joke!');

commandList.push(hello.toJSON());
commandList.push(jail.toJSON());
commandList.push(unjail.toJSON());
commandList.push(godmode.toJSON());
commandList.push(ungodmode.toJSON());
commandList.push(sudo.toJSON());
commandList.push(joke.toJSON());

export default commandList;
