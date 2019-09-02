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
function searchTitle(title, page, m, t){
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
        media (search: $search, type: `+t+`) {
            id
            title {
                romaji
            }
            type
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
        Media (id: $id) {
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
        staff {
            nodes {
                name{
                    first
                    last
                    native
                }
            }
        }
        format
        season
        episodes
        chapters
        volumes
        source
        averageScore
        duration
        description
        status
        type
        genres
        nextAiringEpisode {
            airingAt
            episode
        }
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
    var season = "";
    var studio = "None listed";
    var format = "";
    var score = "Unknown";
    var genres = "None listed";
    var duration = "Unknown";
    if(res.averageScore) score = res.averageScore + "/100";
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
            format = " | " + res.format.substring(0,1) + res.format.substring(1).toLowerCase();
            episodes = "";
            season = "";
        } else
            format = res.format;
    }
    if(res.studios.nodes.length > 0)
        studio = res.studios.nodes[0].name
    if(res.season)
        season = res.season.substring(0,1) + res.season.substring(1).toLowerCase() + " ";
    if(res.genres){
        genres = "";
        res.genres.forEach(i => {
            genres += i + ", ";
        })
        genres = genres.substr(0,genres.length - 2);
    }
    if(res.duration)
        duration = res.duration + " minutes";
    var embed = new Discord.RichEmbed()
    .setTitle(res.title.romaji)
    .setDescription(episodes + season + res.startDate.year + format)
    .addField("Description",description)
    .addField("Score",score,true)
    .addField("Source",source,true)
    .addField("Studio",studio,true)
    .addField("Duration",duration,true)
    .addField("Genres",genres)
    .setThumbnail(res.coverImage.medium)
    .setURL("https://anilist.co/anime/"+res.id)
    .setFooter("AniList.co Search")
    .setColor('#02A9FF')
    .setTimestamp();
    if(res.status == "RELEASING"){
        var d = new Date(res.nextAiringEpisode.airingAt * 1000).toLocaleString("en-US", {timeZone: "Asia/Tokyo"});
        d = new Date(d);
        var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        var month = months[d.getMonth()];
        var minutes = d.getMinutes();
        if(minutes < 10)
            minutes = "0" + minutes;
        embed.addField("Next episode", "Episode " + res.nextAiringEpisode.episode, true);
        embed.addField("Date", month + " " + d.getUTCDate() + ", " + d.getHours() + ":" + minutes + " JST", true);
    }
    return embed;
}
function manEmbed(res){
    var description = "No description given.";
    var chapters = "Unknown";
    var author = "";
    var volumes = "Unknown";
    var format = "Unknown";
    var score = "Unknown";
    var genres = "None listed";
    if(res.description) description = textFilter(res.description);
    if(res.chapters) chapters = res.chapters;
    if(description.length > 175) description = description.substring(0,175) + "...";
    if(res.volumes) volumes = res.volumes;
    if(res.format) format = res.format.substring(0,1) + res.format.substring(1).toLowerCase();
    if(res.staff.nodes.length > 0){
        res.staff.nodes.forEach(i => {
            author += i.name.first + " " + i.name.last + ", ";
        })
        author = author.substring(0,author.length-2);
    }
    else
        author = "Unknown";
    if(res.averageScore) score = res.averageScore + "/100";
    if(res.genres){
        genres = "";
        res.genres.forEach(i => {
            genres += i + ", ";
        })
        genres = genres.substr(0,genres.length - 2);
    }
    var embed = new Discord.RichEmbed()
    .setTitle(res.title.romaji)
    .setDescription(res.startDate.year + " by " + author )
    .addField("Description",description)
    .addField("Score",score,true)
    .addField("Format",formatFilter(format),true)
    .addField("Chapters",chapters,true)
    .addField("Volumes",volumes,true)
    .addField("Genres",genres)
    .setThumbnail(res.coverImage.medium)
    .setURL("https://anilist.co/manga/"+res.id)
    .setFooter("AniList.co Search")
    .setColor('#FF3900')
    .setTimestamp();
    return embed;
}

function search(res){
  x = "";
  if(res.data.Page.media.length == 1 && res.data.Page.pageInfo.currentPage == 1){
    searchId(res.data.Page.media[0].id).then(function(r){
        if(r.data.Media.type == "MANGA")
            msg.channel.send(manEmbed(r.data.Media));
        else
            msg.channel.send(aniEmbed(r.data.Media));
    })
  }
  else{
    res.data.Page.media.forEach(i => {
        x += i.title.romaji + " \nFormat: " + formatFilter(i.format) + " | " + "https://anilist.co/" + i.type.toLowerCase() + "/" + i.id + " \n\n\u200B";
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
                if(r.data.Media.type == "MANGA")
                    msg.channel.send(manEmbed(r.data.Media));
                else
                    msg.channel.send(aniEmbed(r.data.Media));
                result.delete();
            })
        })
        result.awaitReactions(fil2, {max: 1}).then(function(){
            searchId(res.data.Page.media[1].id).then(function(r){
                if(r.data.Media.type == "MANGA")
                    msg.channel.send(manEmbed(r.data.Media));
                else
                    msg.channel.send(aniEmbed(r.data.Media));
                result.delete();
            })
        })
        result.awaitReactions(fil3, {max: 1}).then(function(){
            searchId(res.data.Page.media[2].id).then(function(r){
                if(r.data.Media.type == "MANGA")
                    msg.channel.send(manEmbed(r.data.Media));
                else
                    msg.channel.send(aniEmbed(r.data.Media));
                result.delete();
            })
        })
        result.awaitReactions(fil4, {max: 1}).then(function(){
            result.delete();
            searchTitle(msg.content.substring(14), res.data.Page.pageInfo.currentPage - 1, msg, res.data.Page.media[0].type).then(function(res2){
                search(res2);
            });
        })
        result.awaitReactions(fil5, {max: 1}).then(function(){
            result.delete();
            searchTitle(msg.content.substring(14), res.data.Page.pageInfo.currentPage + 1, msg, res.data.Page.media[0].type).then(function(res2){
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
}

// I'll probably have to add more to this
function textFilter(text){
    text = text.replace(/<br>/g,"\n");
    return text;
}

function formatFilter(text){
    text = text.replace("_"," ");
    var textA = text.split(" ");
    if(textA.length > 1){
        text = "";
        textA.forEach(i => {
            text += i.substring(0,1).toUpperCase() + i.substring(1).toLowerCase();
        })
    }
    return text;
}

module.exports = {
    searchTitle,
    searchId,
    aniEmbed,
    manEmbed,
    search
  }