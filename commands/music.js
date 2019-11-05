const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const streamOptions = { seek: 0, volume: 1 };
const Text = require('./text');
var dispatcher = [];
var videos = [];
const { Pool } = require('pg');
const pool = new Pool();

/**
 * TODO:
 * + Support for YT playlists
 * + Control by website/app
 * + Maybe support other sources
 */

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

function main(msg, url){
  console.log("music.js reached")
  var info;
  ytdl.getInfo(url, (err, i) => {
    var details = i.player_response.videoDetails;
    videos.push(details);
    info = details;
    console.log(details.title);
    if(videos[0].videoId == details.videoId){
      play(msg, info);
    } else {
      msg.channel.send("Queued: " + details.title, {code: true});
    }
  })
}

function play(msg, details){
  var voiceChannel = msg.member.voiceChannel;
  var textChannel = msg.channel;
  voiceChannel.join()
  .then(connection => {
      const stream = ytdl(videos[0].videoId, { filter : 'audioonly' });
      //textChannel.send("Playing: " + details.title, {code: true});
      textChannel.send(playingEmbed(details));
      dispatcher[msg.guild.id] = connection.playStream(stream, streamOptions);
      console.log("array length: "+videos.length)
      dispatcher[msg.guild.id].on('end', function(){
        console.log("Dispatcher: end")
        if(videos.length > 0){
          videos.shift();
          if(videos.length < 1){
            textChannel.send("End of queue", {code:true});
          }else
            play(msg, videos[0]);
        }
        if(videos.length == 0)
          textChannel.send("Queue cleared, stopped", {code:true});
      })
  })
  .catch(console.error);
}

function end(msg){dispatcher[msg.guild.id].end();}
function pause(msg){dispatcher[msg.guild.id].pause();}
function resume(msg){dispatcher[msg.guild.id].resume();}
function isDestroyed(msg){return dispatcher[msg.guild.id].destroyed}
function stop(msg){
  videos = [];
  dispatcher[msg.guild.id].end();
}

function playingEmbed(info){
  const embed = new Discord.RichEmbed()
  .setTitle(info.title)
  .setDescription(info.author +  " | " + Text.secFormat(parseInt(info.lengthSeconds)))
  .setImage(info.thumbnail.thumbnails[3].url);
  return embed;
}

module.exports = {
  main,
  end,
  pause,
  resume,
  isDestroyed,
  stop
}