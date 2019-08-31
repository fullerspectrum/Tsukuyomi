const fetch = require("node-fetch");
const Discord = require("discord.js");
var msg = '';
var standalone = false;

function handleResponse(response) {
    return response.json().then(function (json) {
        return response.ok ? json : Promise.reject(json);
    });
}

function handleData(data) {
    if(standalone)
        console.log(data);
    return data;
}

function handleError(error) {
    console.error(error);
}

const params = process.argv;

/* The anime section. Don't want to mix anime and manga. */
function searchTitle(title, page, m){
    msg = m;
    var searchQuery = `
    query ($page: Int, $perPage: Int, $search: String) {
    Page (page: $page, perPage: $perPage) {
        pageInfo {
            total
            currentPage
            lastPage
            hasNextPage
            perPage
        }
        media (search: $search, type: ANIME) {
            id
            title {
                romaji
            }
            format
        }
    }
    }
    `;
    var variables = {
        search: title,
        page: page,
        perPage: 3
    };
    var url = 'https://graphql.anilist.co',
        options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            query: searchQuery,
            variables: variables
        })
    };
// I always figured this would be harder to do.
    return new Promise(function(resolve, reject){
        resolve(fetch(url, options).then(handleResponse)
        .then(handleData)
        .catch(handleError));
    })
}

function searchId(id){
    var searchQuery = `
    query ($id: Int) {
        Media (id: $id, type: ANIME) {
        id
        title {
            romaji
        }
        startDate {
            year
        }
        coverImage {
            medium
        }
        studios(isMain: true) {
            nodes {
                name
            }
        }
        format
        season
        episodes
        source
        averageScore
        duration
        description
        }
    }
    `;
    var variables = {
        id: id
    };
    var url = 'https://graphql.anilist.co',
        options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            query: searchQuery,
            variables: variables
        })
    };
// I always figured this would be harder to do.
    return new Promise(function(resolve, reject){
        resolve(fetch(url, options).then(handleResponse)
        .then(handleData)
        .catch(handleError));
    })
}
//Used it standalone for testing. That testing went a lot smoother than the bot.
if(params.length < 3){}
else{
    standalone = true;
    if(params[2] == "search")
        searchTitle(params[3])
    if(params[2] == "id")
        searchId(params[3])
}


function aniEmbed(res){
    var description = "No description given.";
    var episodes = "Unknown";
    var source = "Unknown";
    var season = "Unknown";
    var studio = "Unknown";
    var format = "Unknown";
    if(res.description)
      description = textFilter(res.description);
    if(res.episodes) episodes = res.episodes + " Episode";
    if(res.episodes > 1) episodes += "s";
    episodes += " | ";
    if(description.length > 175) description = description.substring(0,175) + "...";
    if(res.source)
      var source = res.source.substring(0,1) + res.source.substring(1).toLowerCase() + " ";
    if(res.format){
          if(res.format == "MOVIE"){
            format = res.format.substring(0,1) + res.format.substring(1).toLowerCase();
            episodes = "";
            season = "";
        } else
            format = res.format;
    }
    if(res.studios.nodes.length > 0)
        studio = res.studios.nodes[0].name
    if(res.season)
        season = res.season.substring(0,1) + res.season.substring(1).toLowerCase() + " ";
    var embed = new Discord.RichEmbed()
    .setTitle(res.title.romaji)
    .setDescription(episodes + season + res.startDate.year + " | " + format)
    .addField("Description",description)
    .addField("Score",res.averageScore+"/100",true)
    .addField("Source",source,true)
    .addField("Studio",studio,true)
    .addField("Duration",res.duration+" minutes",true)
    .setThumbnail(res.coverImage.medium)
    .setURL("https://anilist.co/anime/"+res.id)
    .setFooter("AniList.co Search")
    .setTimestamp();
    return embed;
  }

function search(res){
  x = "";
  console.log(res.data)
  res.data.Page.media.forEach(i => {
    x += i.title.romaji + " \nFormat: " + i.format + " | " + "https://anilist.co/anime/" + i.id + " \n\n\u200B";
  });
  var result;
  msg.channel.send(x)
  .then(async function(rep) {
    result = rep;
    var fil1 = (rc, u) => rc.emoji.name === '1⃣' && u.id === msg.author.id;
    var fil2 = (rc, u) => rc.emoji.name === '2⃣' && u.id === msg.author.id;
    var fil3 = (rc, u) => rc.emoji.name === '3⃣' && u.id === msg.author.id;
    var fil4 = (rc, u) => rc.emoji.name === '⬅' && u.id === msg.author.id;
    var fil5 = (rc, u) => rc.emoji.name === '➡' && u.id === msg.author.id;
    result.awaitReactions(fil1, {max: 1}).then(function(){
        searchId(res.data.Page.media[0].id).then(function(r){
            console.log(r)
            msg.channel.send(aniEmbed(r.data.Media));
            result.delete();
        })
    })
    result.awaitReactions(fil2, {max: 1}).then(function(){
        searchId(res.data.Page.media[1].id).then(function(r){
            console.log(r)
            msg.channel.send(aniEmbed(r.data.Media));
            result.delete();
        })
    })
    result.awaitReactions(fil3, {max: 1}).then(function(){
        searchId(res.data.Page.media[2].id).then(function(r){
            console.log(r)
            msg.channel.send(aniEmbed(r.data.Media));
            result.delete();
        })
      })
    result.awaitReactions(fil4, {max: 1}).then(function(){
        result.delete();
        searchTitle(msg.content.substring(14), res.data.Page.pageInfo.currentPage - 1, msg).then(function(res2){
            search(res2);
        });
    })
    result.awaitReactions(fil5, {max: 1}).then(function(){
        result.delete();
        searchTitle(msg.content.substring(14), res.data.Page.pageInfo.currentPage + 1, msg).then(function(res2){
            search(res2);
        });
    })
    if(res.data.Page.media.length > 0)
        await result.react('1⃣');
    if(res.data.Page.media.length > 1)
        await result.react('2⃣');
    if(res.data.Page.media.length > 2)
        await result.react('3⃣');
    if(res.data.Page.pageInfo.currentPage > 1)
        await result.react('⬅');
    if(res.data.Page.pageInfo.hasNextPage)
        await result.react('➡');
  }); 
}

// I'll probably have to add more to this
function textFilter(text){
    text = text.replace(/<br>/g,"\n");
    return text;
}

module.exports = {
    searchTitle,
    searchId,
    aniEmbed,
    search
  }