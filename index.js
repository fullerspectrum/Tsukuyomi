// https://discordapp.com/oauth2/authorize?&client_id=364092836771135491&scope=bot&permissions=8
require('dotenv').config();
var Music = require('./music.js');
var Discord = require('discord.js');
var client = new Discord.Client();
var anilist = require('./anilist.js');

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  if (msg.content === '!@#$%^^&*STOCKTESTEMBED') { // A perfectly normal command.
    const embed = testEmbed(msg.author.tag, msg.author.avatarURL);
    msg.channel.send(embed);
    console.log("Test Embed from " + msg.author.tag)
  }
// I'll come back to this eventually, maybe.
  if(msg.content.startsWith("!play")){
    console.log("PLAY");
    Music.play(msg);
  }
  if(msg.content.startsWith("!search")){
    console.log("SEARCH");
    if(msg.content.substring(8).startsWith("anime")){
      var com = msg.content.substring(14);
      var dataProm = anilist.searchTitle(com);
      console.log(dataProm)
// Well this went downhill fast... Learned how to make promises though lol
      dataProm.then(function(result) {
        console.log(result.data.Page.media)
        x = "";
        result.data.Page.media.forEach(i => {
          x += i.title.romaji + " \nFormat: " + i.format + " | " + "https://anilist.co/anime/" + i.id + " \n\n\u200B";
        });
        msg.channel.send(x);
      })
      console.log(dataProm)
    }
  }
});

function testEmbed(auth, url){
  const embed = new Discord.RichEmbed()
  .setTitle('A slick little embed')
  .setColor('0xFF0000')
  .setDescription('Hello, this is a slick embed')
  .setFooter('This is a footer.')
  .setAuthor(auth)
  .setThumbnail('https://i.imgur.com/8rJwG6y.jpg')
  .setImage(url)
  .setURL('https://twitter.com/fullerspectrum')
  .setTimestamp();
  return embed
}

client.login(process.env.DISCORD_TOKEN);