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
 * + Use prefix from server
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
    if(command.startsWith("ani")){
      console.log("ANIME");
      command = command.replace('ani','').trim();
      if(command.startsWith("-id")){
        console.log("ID");
        command = command.replace('-id','').trim();
        var dataProm = anilist.searchId(Number(command));
        dataProm.then(function(res) {
          msg.channel.send(anilist.aniEmbed(res.data.Media));
        })
      } else{
        command = command.replace('ani','').trim();
        anilist.searchTitle(command, 1, msg, "ANIME").then(function(res){
          anilist.search(res);
        });
      }
    }
      if(msg.content.startsWith("manga")){
        console.log("MANGA");
        if(msg.content.substring(7).startsWith("title")){
          console.log("TITLE");
          var com = msg.content.substring(14);
          anilist.searchTitle(com, 1, msg, "MANGA").then(function(res){
            anilist.search(res);
          })
        }
        if(msg.content.substring(7).startsWith("id")){
          console.log("ID");
          var com = msg.content.substring(10);
          var dataProm = anilist.searchId(Number(com));
          dataProm.then(function(res) {
            msg.channel.send(anilist.manEmbed(res.data.Media));
          })
        }
      }
      if(msg.content.startsWith("vc")){
        console.log("VC");
        var com = msg.content.substring(4);
        if(com.startsWith("set")){
          vc.setChannel(com.substring(4), msg.guild);
        }
      }
  }
});

client.login(process.env.DISCORD_TOKEN);