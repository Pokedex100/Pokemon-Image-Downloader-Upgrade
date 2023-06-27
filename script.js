let pokedexjson = {};

// Replace ./data.json with your JSON feed
fetch("./pokedexdata.json")
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    // Work with JSON data here
    pokedexjson = data;
  })
  .catch((err) => {
    // Do something for an error here
  });
