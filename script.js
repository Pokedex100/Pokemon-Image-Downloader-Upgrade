let pokedexjson = {};
let imageNormaljson = {};
let imageShinyjson = {};
let text = document.getElementById("text-name");
let image1 = document.getElementById("image-1");
let image2 = document.getElementById("image-2");
let image1a = document.getElementById("image-1a");
let image2a = document.getElementById("image-2a");
let container = document.getElementById("fixed-height");
let itemlist = document.getElementById("list");
let supplement = document.getElementById("supplementary");
let searchHits;

const getPokedexDatabaseFromPokedb = async () => {
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

const getNormalImageDatabaseFromLocal = async () => {
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

const getShinyImageDatabaseFromLocal = async () => {
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
    if (isNumeric(text.value.toLowerCase().trim()))
      changeImage(String(text.value.toLowerCase().trim()).padStart(4, "0"));
    else changeImage(text.value.toLowerCase().trim());

    searchSuggestions(text.value.toLowerCase().trim());
  });
}
showPokemons();

// Function to cache images in service worker
function cacheCurrentImages(normalImages, shinyImages) {
  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: "CACHE_POKEMON_IMAGES",
      normalImages: normalImages,
      shinyImages: shinyImages,
    });
  }
}

function changeImage(name) {
  while (container.firstChild) container.removeChild(container.firstChild);
  if (isNumeric(pokedexjson[name]) == false)
    supplement.textContent = pokedexjson[name];
  else supplement.textContent = "#" + pokedexjson[name];
  let imageName = findImage(`${pokedexjson[name]}`, imageNormaljson);

  // Collect image URLs for caching
  let normalImageUrls = [];
  let shinyImageUrls = [];

  for (let imagehref of imageName.split("#"))
    loadImage(imagehref)
      .then((img) => {
        normalImageUrls.push("./" + imagehref);
        let elem = document.createElement("img");
        elem.setAttribute("src", "./" + imagehref);
        elem.setAttribute("height", "256");
        elem.setAttribute("width", "256");
        elem.setAttribute(
          "alt",
          pokedexjson[imagehref.split("/")[2].slice(13, 17)]
        );
        elem.setAttribute("data-shiny", "false");
        elem.setAttribute("data-form", imagehref.split("/")[2].slice(18, 21));
        let attr = document.createElement("a");
        attr.setAttribute("title", "Normal");
        attr.setAttribute("href", "./" + imagehref);
        attr.setAttribute(
          "download",
          pokedexjson[imagehref.split("/")[2].slice(13, 17)]
        );
        attr.setAttribute("target", "_blank");

        attr.appendChild(elem);
        container.appendChild(attr);
      })
      .catch((err) => console.error(err));

  let imageShinyName = findImage(`${pokedexjson[name]}`, imageShinyjson);
  for (let imagehref of imageShinyName.split("#"))
    loadImage(imagehref)
      .then((img) => {
        shinyImageUrls.push("./" + imagehref);
        let elem = document.createElement("img");
        elem.setAttribute("src", "./" + imagehref);
        elem.setAttribute("height", "256");
        elem.setAttribute("width", "256");
        elem.setAttribute(
          "alt",
          pokedexjson[imagehref.split("/")[2].slice(13, 17)]
        );
        elem.setAttribute("data-shiny", "true");
        elem.setAttribute("data-form", imagehref.split("/")[2].slice(18, 21));
        let attr = document.createElement("a");
        attr.setAttribute("title", "Shiny");
        attr.setAttribute("href", "./" + imagehref);
        attr.setAttribute(
          "download",
          pokedexjson[imagehref.split("/")[2].slice(13, 17)] + "-shiny"
        );
        attr.setAttribute("target", "_blank");

        attr.appendChild(elem);
        container.appendChild(attr);
      })
      .catch((err) => console.error(err));

  // Cache the current Pokemon images in service worker after a short delay
  setTimeout(() => {
    if (normalImageUrls.length > 0 || shinyImageUrls.length > 0) {
      cacheCurrentImages(normalImageUrls, shinyImageUrls);
    }
  }, 1000);
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

function findImage(pokemon, list) {
  let str = "";
  if (isNumeric(pokemon) == false) {
    pokemon = pokedexjson[pokemon];
  }
  for (let key in list) {
    if (list[key] === pokemon) str = str + "#" + key;
  }
  return str.substring(1);
}

function isNumeric(value) {
  return /^-?\d+$/.test(value);
}

function searchSuggestions(typed) {
  while (itemlist.firstChild) itemlist.removeChild(itemlist.firstChild);
  if (isNumeric(typed)) return;
  if (typed.length >= 3) {
    for (let key in pokedexjson) {
      if (
        typed.length !== pokedexjson[key].length &&
        pokedexjson[key].includes(typed)
      ) {
        let list = document.createElement("p");
        list.classList.add(pokedexjson[key]);
        list.textContent = pokedexjson[key];
        itemlist.appendChild(list);
      }
    }
  }
}

itemlist.addEventListener(
  "click",
  (e) => {
    e = e || Event;
    let target = e.target || Event.target,
      hit = target.textContent;
    text.value = hit;
    while (itemlist.firstChild) itemlist.removeChild(itemlist.firstChild);
    if (isNumeric(text.value.toLowerCase().trim()))
      changeImage(String(text.value.toLowerCase().trim()).padStart(4, "0"));
    else changeImage(text.value.toLowerCase().trim());
  },
  false
);

const changePokemon = (code, content) => {
  switch (code) {
    case "ArrowUp": {
      text.value = Number(content) + 1;
      changeImage(String(text.value.toLowerCase().trim()).padStart(4, "0"));
      break;
    }
    case "ArrowDown": {
      text.value = Math.max(Number(content) - 1, 1);
      changeImage(String(text.value.toLowerCase().trim()).padStart(4, "0"));
      break;
    }
  }
};

document.addEventListener("keydown", (e) => {
  if (
    (e.code !== "ArrowUp" && e.code !== "ArrowDown") ||
    !isNumeric(text.value)
  )
    return;
  e.preventDefault();
  changePokemon(e.code, text.value);
});

supplement.addEventListener("click", () => {
  const content = supplement.textContent.replace("#", "");
  changeImage(content);
  text.value = content;
});

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const pokemonId = urlParams.get("id");
  if (!pokemonId) return;
  setTimeout(() => {
    changeImage(String(pokemonId).padStart(4, "0"));
  }, 100);
  text.value = pokemonId;
  window.history.replaceState({}, "", `${window.location.pathname}`);
});
