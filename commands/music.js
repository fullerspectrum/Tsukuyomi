const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const streamOptions = { seek: 0, volume: 1 };
var dispatcher;
var videos = [];

function main(msg, url){
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
      console.log(details.title);
      textChannel.send("Playing: " + details.title, {code: true});
      dispatcher = connection.playStream(stream, streamOptions);
      console.log("array length: "+videos.length)
      dispatcher.on('end', function(){
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

function end(){dispatcher.end();}
function pause(){dispatcher.pause();}
function resume(){dispatcher.resume();}
function isDestroyed(){return dispatcher.destroyed}
function stop(){
  videos = [];
  dispatcher.end();
}

function buildEmbed(info){
  const embed = new Discord.RichEmbed();
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