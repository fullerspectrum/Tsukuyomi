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
    if(com.startsWith("play") || msg.content.startsWith("play"))
      if(com.includes("youtube.com/watch?v=") || com.includes("youtu.be"))
        Music.main(msg, com.substring(5));
      else
        Music.resume();
    if(com.startsWith("skip") || msg.content.startsWith("stop"))
      Music.end();
    if(com.startsWith("pause") || msg.content.startsWith("pause"))
      Music.pause();
    if(com.startsWith("stop") || msg.content.startsWith("stop"))
      Music.stop();
  }
  if(msg.content.startsWith("!anime")){
    console.log("ANIME");
    if(msg.content.substring(7).startsWith("title")){
      console.log("TITLE");
      var com = msg.content.substring(14);
      var dataProm = anilist.searchTitle(com, 1);
// Well this went downhill fast... Learned how to make promises though lol
      dataProm.then(function(res) {
        x = "";
        res.data.Page.media.forEach(i => {
          x += i.title.romaji + " \nFormat: " + i.format + " | " + "https://anilist.co/anime/" + i.id + " \n\n\u200B";
        });
        var result;
        msg.channel.send(x)
        .then(async function(r) {
          result = r;
          await result.react('1⃣');
          await result.react('2⃣');
          await result.react('3⃣');
          //await res.react('⬅');
          await result.react('➡');
          var fil1 = (rc, u) => rc.emoji.name === '1⃣' && u.id === msg.author.id;
          var fil2 = (rc, u) => rc.emoji.name === '2⃣' && u.id === msg.author.id;
          var fil3 = (rc, u) => rc.emoji.name === '3⃣' && u.id === msg.author.id;
          result.awaitReactions(fil1, {max: 1}).then(function(){
            anilist.searchId(res.data.Page.media[0].id).then(function(r){
              msg.channel.send(aniEmbed(r.data.Media));
              result.delete();
            })
          })
          result.awaitReactions(fil2, {max: 1}).then(function(){
            anilist.searchId(res.data.Page.media[1].id).then(function(r){
              msg.channel.send(aniEmbed(r.data.Media));
              result.delete();
            })
          })
          result.awaitReactions(fil3, {max: 1}).then(function(){
            anilist.searchId(res.data.Page.media[2].id).then(function(r){
              msg.channel.send(aniEmbed(r.data.Media));
              result.delete();
            })
          })
        });
      })
    }
    if(msg.content.substring(7).startsWith("id")){
      console.log("ID");
      var com = msg.content.substring(10);
      var dataProm = anilist.searchId(Number(com));
      dataProm.then(function(res) {
        console.log(res)
        msg.channel.send(aniEmbed(res.data.Media));
      })
    }
  }
  if(msg.content.startsWith("!play"))
    if(msg.content.includes("youtube.com/watch?v=") || msg.content.includes("youtu.be"))
      Music.main(msg, msg.content.substring(5));
    else
      Music.resume();
  if(msg.content.startsWith("!skip"))
    Music.end();
  if(msg.content.startsWith("!stop"))
    Music.stop();
  if(msg.content.startsWith("!pause"))
    Music.pause();
  if(msg.content.startsWith("!des"))
    msg.channel.send(Music.isDestroyed());
});

// I will have to clean this up, but I need it working first
function aniEmbed(res){
  if(description)
    var description = textFilter(res.description);
  else
    var description = "No description given."
  if(res.episodes)
    var episodes = res.episodes + " Episode";
  else
    var episodes = "N/A Episodes"
  if(res.episodes > 1) episodes += "s";
  episodes += " | ";
  if(description.length > 175){
    description = description.substring(0,175) + "...";
  }
  var season = res.season.substring(0,1) + res.season.substring(1).toLowerCase() + " ";
  if(res.source)
    var source = res.source.substring(0,1) + res.source.substring(1).toLowerCase() + " ";
  else
    var source = "N/A"
  if(res.format == "MOVIE"){
    var format = res.format.substring(0,1) + res.format.substring(1).toLowerCase();
    episodes = "";
    season = "";
  }
  else
    var format = res.format;
  var embed = new Discord.RichEmbed()
  .setTitle(res.title.romaji)
  .setDescription(episodes + season + res.startDate.year + " | " + format)
  .addField("Description",description)
  .addField("Score",res.averageScore+"/100",true)
  .addField("Source",source,true)
  .addField("Studio",res.studios.nodes[0].name,true)
  .addField("Duration",res.duration+" minutes",true)
  .setThumbnail(res.coverImage.medium)
  .setURL("https://anilist.co/anime/"+res.id)
  .setFooter("AniList.co Search")
  .setTimestamp();
  return embed;
}

// I'll probably have to add more to this
function textFilter(text){
  text = text.replace(/<br>/g,"\n");
  return text;
}

client.login(process.env.DISCORD_TOKEN);