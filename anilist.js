const fetch = require("node-fetch");

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
function searchTitle(title){
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
        media (id: $id, search: $search, type: ANIME) {
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
        page: 1,
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

module.exports = {
    searchTitle,
    searchId
  }