require('dotenv').config();
var Music = require('./commands/music.js');
var Discord = require('discord.js');
var client = new Discord.Client();
var anilist = require('./commands/anilist.js');
var vc = require('./commands/voiceChannels.js');
const { Pool } = require('pg');
const pool = new Pool();
var cmdPrefixes = [];

/**
 * TODO:
 * + Restrict commands by role/server owner
 */

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

client.on('guildCreate', guild => {
  pool.connect().then(client => {
    return client
      .query(`SELECT (SELECT id FROM servers WHERE id = ${guild.id}) AS id`)
      .then(res => {
        if(res.rows[0].id == null)
          client.query(`INSERT INTO servers(id) VALUES(${guild.id})`)
          .then(res => {
            client.release();
          });
      });
  });
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.guilds.forEach(i => {
    vc.watchChannel(i);
  });
  pool.connect().then(client => {
    return client
    .query(`SELECT "commandPrefix","id" from servers`)
    .then(res => {
      cmdPrefixes = res.rows;
    })
  })
});

client.on('message', msg => {
  var prefix = cmdPrefixes.filter(function(item) {
    return item.id == msg.guild.id;
  })
  if(msg.content.startsWith(prefix[0].commandPrefix)){
    var command = msg.content.replace(prefix[0].commandPrefix,'').trim();
    console.log(command)
    if(command.startsWith("mus")){
      console.log("PLAY");
      command = command.replace('mus','').trim();
      if(command.startsWith("play"))
        if(command.includes("youtube.com/watch?v=") || command.includes("youtu.be"))
          Music.main(msg, command.replace('play','').trim());
        else
          Music.resume();
      if(command.startsWith("skip"))
        Music.end();
      if(command.startsWith("pause"))
        Music.pause();
      if(command.startsWith("stop"))
        Music.stop();
      if(command.startsWith("des"))
        msg.channel.send(Music.isDestroyed());
    }
    if(command.startsWith("ani") || command.startsWith("man")){
      var animan = '';
      console.log("ANILIST");
      if(command.startsWith("ani")){
        command = command.replace('ani','').trim();
        animan = "ANIME";
      }
      if(command.startsWith("man")){
        command = command.replace('man','').trim();
        animan = "MANGA";
      }
      if(command.includes("-id")){
        var fullout = false;
        console.log("ID");
        command = command.replace('-id','').trim();
        var dataProm = anilist.searchId(Number(command));
        dataProm.then(function(res) {
          if(res.data.Media.isAdult == true && !msg.channel.nsfw)
            msg.reply('no')
          else
            msg.channel.send(anilist.aniEmbed(res.data.Media));
          if(fullout = true)
            console.log(res.data.Media);
        })
      } else{
        anilist.searchTitle(command, 1, msg, animan, msg.channel.nsfw).then(function(res){
          anilist.search(res);
        });
      }
    }
      if(command.startsWith("vc")){
        console.log("VC");
        if(msg.member.permissions.has("MANAGE_CHANNELS")){
          command = command.replace('vc','').trim();
          if(command.startsWith("set")){
            vc.setChannel(command.replace('set','').trim(), msg.guild);
          }
        } else {
          msg.reply("you do not have permission to use this command");
        }
      }
      if(command.startsWith("screenshare")){
        console.log("SCREENSHARE");
        if(msg.member.voiceChannel){
          msg.channel.send(`https://www.discordapp.com/channels/${msg.guild.id}/${msg.member.voiceChannelID}`)
        } else {
          msg.channel.send('Not in a voice channel');
        }
      }
  }
});

client.on('channelDelete', channel => {
  pool.connect().then(client => {
    return client
    .query(`SELECT (SELECT "lobbyCategory" FROM servers WHERE "lobbyCategory" = ${channel.id}) AS lobbyCategory`)
    .then(res => {
      if(res.rows[0].lobbycategory != null)
        client.query(`UPDATE servers SET "lobbyCategory" = NULL WHERE "lobbyCategory" = ${channel.id}`);
    }).catch(err => {
      console.error(err.hint);
    })
  })
});

client.login(process.env.DISCORD_TOKEN);