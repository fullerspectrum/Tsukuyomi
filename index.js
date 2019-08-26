require('dotenv').config();
var Music = require('./music.js');
var Discord = require('discord.js');
var client = new Discord.Client();
var anilist = require('./anilist.js');

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
// I'll come back to this eventually, maybe.
  if(msg.content.startsWith("!play")){
    console.log("PLAY");
    Music.play(msg);
  }
  if(msg.content.startsWith("!anime")){
    console.log("ANIME");
    if(msg.content.substring(7).startsWith("title")){
      console.log("TITLE");
      var com = msg.content.substring(14);
      var dataProm = anilist.searchTitle(com);
// Well this went downhill fast... Learned how to make promises though lol
      dataProm.then(function(res) {
        x = "";
        res.data.Page.media.forEach(i => {
          x += i.title.romaji + " \nFormat: " + i.format + " | " + "https://anilist.co/anime/" + i.id + " \n\n\u200B";
        });
        msg.channel.send(x);
      })
    }
    if(msg.content.substring(7).startsWith("id")){
      console.log("ID");
      var com = msg.content.substring(10);
      var dataProm = anilist.searchId(Number(com));
      dataProm.then(function(res) {
        msg.channel.send(aniEmbed(res.data.Media));
      })
    }
  }
});

// I will have to clean this up, but I need it working first
function aniEmbed(res){
  var description = textFilter(res.description);
  var episodes = res.episodes + " Episode";
  if(res.episodes > 1) episodes += "s";
  episodes += " | ";
  if(description.length > 175){
    description = description.substring(0,175) + "...";
  }
  var season = res.season.substring(0,1) + res.season.substring(1).toLowerCase() + " ";
  var source = res.source.substring(0,1) + res.source.substring(1).toLowerCase() + " ";
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