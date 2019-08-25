/**
 * Yeah, this doesn't work. I wish I had my older code, had playlists and a database and everything...
 */
const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const streamOptions = { seek: 0, volume: 1 };
var url = "https://www.youtube.com/watch?v=XAWgeLF9EVQ";

function play(msg){
  var voiceChannel = msg.member.voiceChannel;
  var textChannel = msg.channel;
  voiceChannel.join()
  .then(connection => {
    ytdl.getInfo(url, (err, info) => {
      const stream = ytdl(url, { filter : 'audioonly' });
// Title not found... Definitely used to work.
// Yeah, not just me. https://github.com/fent/node-ytdl-core/issues/477
      //console.log(info.title)
      //textChannel.send(info.title, {code: true});
      const dispatcher = connection.playStream(stream, streamOptions);
    });
  })
  .catch(console.error);
}

function buildEmbed(info){
  const embed = new Discord.RichEmbed();
  return embed;
}

module.exports = {
  play
}