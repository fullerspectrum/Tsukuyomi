/**
 * The sample code turned into a function. Might not need more than this for now but idk
 */
const fetch = require("node-fetch");
var searchQuery = `
query ($id: Int, $page: Int, $perPage: Int, $search: String) {
  Page (page: $page, perPage: $perPage) {
    pageInfo {
      total
      currentPage
      lastPage
      hasNextPage
      perPage
    }
    media (id: $id, search: $search) {
      id
      title {
        romaji
      }
      format
    }
  }
}
`;

function handleResponse(response) {
    return response.json().then(function (json) {
        return response.ok ? json : Promise.reject(json);
    });
}

function handleData(data) {
    return data;
}

function handleError(error) {
    alert('Error, check console');
    console.error(error);
}

const params = process.argv;

function searchTitle(title){
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

//Used it standalone for testing. That testing went a lot smoother than the bot.
if(params.length < 3){}
else{    
    searchTitle(params[2])
}

module.exports = {
    searchTitle
  }