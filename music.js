/**
 * Yeah, this doesn't work. I wish I had my older code, had playlists and a database and everything...
 */
const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const streamOptions = { seek: 0, volume: 1 };
var url = "https://www.youtube.com/watch?v=XAWgeLF9EVQ";
var dispatcher;
var queue = [];

function main(msg, url){
  play(msg, url);
}

function play(msg, url){
  var voiceChannel = msg.member.voiceChannel;
  var textChannel = msg.channel;
  voiceChannel.join()
  .then(connection => {
    ytdl.getInfo(url, (err, info) => {
      const stream = ytdl(url, { filter : 'audioonly' });
      var details = info.player_response.videoDetails;
      // Title not found... Definitely used to work.
      // YT updated, my old problems were ytdl-core. Amazin'
      console.log(details.title);
      textChannel.send(details.title, {code: true});
      dispatcher = connection.playStream(stream, streamOptions);
      dispatcher.on('end', function(){
        console.log("Dispatcher: end")
      })
    });
  })
  .catch(console.error);
}

function end(){dispatcher.end();}
function pause(){dispatcher.pause();}
function resume(){dispatcher.resume();}

function buildEmbed(info){
  const embed = new Discord.RichEmbed();
  return embed;
}

module.exports = {
  main,
  end,
  pause,
  resume
}