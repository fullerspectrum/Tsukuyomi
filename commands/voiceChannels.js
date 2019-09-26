require('dotenv').config();
var bot = require('../index.js');
const { Pool } = require('pg');
const pool = new Pool();

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
  });

function watchChannel(guild){
    pool.connect().then(client => {
        return client
        .query(`SELECT "lobbyCategory" from servers WHERE id = ${guild.id}`)
        .then(res => {
            watchChannel2(guild,res.rows[0].lobbyCategory)
        })
    })
}

function watchChannel2(guild, id){
    var channel = guild.channels.get(id).children.first();
    var fullTimer = setInterval(() => checkFull(channel, fullTimer),1000);
}

function checkFull(channel, fullTimer){
    if(channel.full){
        var username = channel.members.first().user.username;
        if(username == "Generator")
            username = "New channel";
        channel.guild.createChannel(username,{type:'voice'})
        .then(v => {
            v.setParent(channel.parent);
            v.setUserLimit(4);
            channel.members.first().setVoiceChannel(v);
            var emptyTimer = setInterval(() => checkEmpty(v, emptyTimer),1000);
        });
    }
}

function checkEmpty(channel, emptyTimer){
    if(channel.members.array().length == 0){
        channel.delete();
        clearInterval(emptyTimer);
    }
}

function setChannel(name, guild){
    guild.createChannel(name, {
        type: 'category'
    }).then(channel => {
        guild.createChannel('Generator', {type:'voice'})
        .then(v => {
            v.setParent(channel);
            v.setUserLimit(1);
            watchChannel(guild, channel.id);
        })
        pool.connect().then(client => {
            return client
            .query(`UPDATE servers SET "lobbyCategory" = ${channel.id} WHERE id = ${guild.id}`)
            .then(res => {
                client.release();
            });
        });
    }).catch(console.error)
}

module.exports = {
    setChannel,
    watchChannel
}