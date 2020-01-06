var Discord = require('discord.js');
var client = new Discord.Client();
const { Pool } = require('pg');
const ytdl = require('ytdl-core');
const pool = new Pool();

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

function checkDupe(id){
    console.log("link check");
    pool.connect().then(client => {
        return client
        .query(`SELECT youtube FROM servers WHERE youtube = ${id}`)
        .then(res => {
            if(res.rows[0].youtube == null)
                client.query(`INSERT INTO servers(youtube) VALUES(${id})`)
        })
    })
    if(id)
        return true;
    else
        return false;
}
async function getInfo(url, msg){
    ytdl.getInfo(url, (err, i) => {
        var details = i.player_response.videoDetails;
        console.log("YT Video: " + details.title);
        //console.log(msg.embeds)
        //msg.channel.send("Video \"" + details.title + "\" was already posted");
        return details
      })
}

module.exports = {
    checkDupe,
    getInfo
}