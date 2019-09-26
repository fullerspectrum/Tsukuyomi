require('dotenv').config();
var Music = require('./commands/music.js');
var Discord = require('discord.js');
var client = new Discord.Client();
var anilist = require('./commands/anilist.js');
var vc = require('./commands/voiceChannels.js');
const { Pool } = require('pg');
const pool = new Pool();

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
});

client.on('message', msg => {
  if(msg.content.startsWith("!music")){
    console.log("PLAY");
    var com = msg.content.substring(7);
    if(com.startsWith("play"))
      if(com.includes("youtube.com/watch?v=") || msg.content.includes("youtu.be"))
        Music.main(msg, com.substring(5));
      else
        Music.resume();
    if(com.startsWith("skip"))
      Music.end();
    if(com.startsWith("pause"))
      Music.pause();
    if(com.startsWith("stop"))
      Music.stop();
    if(com.startsWith("des"))
      msg.channel.send(Music.isDestroyed());
  }
  if(msg.content.startsWith("!anime")){
    console.log("ANIME");
    if(msg.content.substring(7).startsWith("title")){
      console.log("TITLE");
      var com = msg.content.substring(14);
      anilist.searchTitle(com, 1, msg, "ANIME").then(function(res){
        anilist.search(res);
      })
    }
    if(msg.content.substring(7).startsWith("id")){
      console.log("ID");
      var com = msg.content.substring(10);
      var dataProm = anilist.searchId(Number(com));
      dataProm.then(function(res) {
        msg.channel.send(anilist.aniEmbed(res.data.Media));
      })
    }
  }
    if(msg.content.startsWith("!manga")){
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
    if(msg.content.startsWith("!vc")){
      console.log("VC");
      var com = msg.content.substring(4);
      if(com.startsWith("set")){
        vc.setChannel(com.substring(4), msg.guild);
      }
    }
});

client.login(process.env.DISCORD_TOKEN);