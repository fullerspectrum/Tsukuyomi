require('dotenv').config();
var Music = require('./music.js');
var Discord = require('discord.js');
var client = new Discord.Client();
var anilist = require('./anilist.js');

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
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
      anilist.searchTitle(com, 1, msg).then(function(res){
        anilist.search(res);
      })
    }
    if(msg.content.substring(7).startsWith("id")){
      console.log("ID");
      var com = msg.content.substring(10);
      var dataProm = anilist.searchId(Number(com));
      dataProm.then(function(res) {
        console.log(res)
        msg.channel.send(anilist.aniEmbed(res.data.Media));
      })
    }
  }
});

client.login(process.env.DISCORD_TOKEN);