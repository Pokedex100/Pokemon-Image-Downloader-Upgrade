let pokedexjson = {};
let imageNormaljson = {};
let imageShinyjson = {};
let text = document.getElementById("text-name");
let image1 = document.getElementById("image-1");
let image2 = document.getElementById("image-2");
let image1a = document.getElementById("image-1a");
let image2a = document.getElementById("image-2a");

let getPokedexDatabaseFromPokedb = async () => {
  // Replace ./data.json with your JSON feed
  await fetch("./pokedexdata.json")
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
};

let getNormalImageDatabaseFromLocal = async () => {
  // Replace ./data.json with your JSON feed
  await fetch("./Images/normal.json")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      // Work with JSON data here
      imageNormaljson = data;
    })
    .catch((err) => {
      // Do something for an error here
    });
};

let getShinyImageDatabaseFromLocal = async () => {
  // Replace ./data.json with your JSON feed
  await fetch("./Images/shiny.json")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      // Work with JSON data here
      imageShinyjson = data;
    })
    .catch((err) => {
      // Do something for an error here
    });
};

async function showPokemons() {
  await getPokedexDatabaseFromPokedb();
  await getNormalImageDatabaseFromLocal();
  await getShinyImageDatabaseFromLocal();
  text.addEventListener("input", function () {
    changeImage(text.textContent.toLowerCase().trim());
  });
}
showPokemons();

function changeImage(name) {
  let imageName = findImage(`${pokedexjson[name]}`);
  for (let imagehref of imageName.split("#"))
    loadImage(imagehref)
      .then((img) => {
        image2.src = img.src;
        image2a.href = imagehref;
      })
      .catch((err) => console.error(err));

  let imageShinyName = findImage(`${pokedexjson[name]}`);
  for (let imagehref of imageShinyName.split("#"))
    loadImage(imageShinyName)
      .then((img) => {
        image1.src = img.src;
        image1a.href = imagehref;
      })
      .catch((err) => console.error(err));
}

const loadImage = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => {
      resolve(img);
    });
    img.addEventListener("error", (err) => reject(err));
    img.src = url;
  });

function findImage(pokemon) {
  let str = "";
  if (isNumeric(pokemon) === false) {
    pokemon = pokedexjson[pokemon];
  }
  for (let key in imageNormaljson) {
    if (imageNormaljson[key] == pokemon) str = str + "#" + key;
  }
  return str.substring(1);
}

function findImageShiny(pokemon) {
  let str = "";
  if (isNumeric(pokemon) === false) {
    pokemon = pokedexjson[pokemon];
  }
  for (let key in imageShinyjson) {
    if (imageShinyjson[key] == pokemon) str = str + "#" + key;
  }
  return str.substring(1);
}

function isNumeric(value) {
  return /^-?\d+$/.test(value);
}
