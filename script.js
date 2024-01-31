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
    if (isNumeric(text.textContent.toLowerCase().trim()))
      changeImage(
        String(text.textContent.toLowerCase().trim()).padStart(4, "0")
      );
    else changeImage(text.textContent.toLowerCase().trim());

    searchSuggestions(text.textContent.toLowerCase().trim());
  });
}
showPokemons();

function changeImage(name) {
  while (container.firstChild) container.removeChild(container.firstChild);
  if (isNumeric(pokedexjson[name]) == false)
    supplement.textContent = pokedexjson[name];
  else supplement.textContent = "#" + pokedexjson[name];
  let imageName = findImage(`${pokedexjson[name]}`, imageNormaljson);

  for (let imagehref of imageName.split("#"))
    loadImage(imagehref)
      .then((img) => {
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
    text.textContent = hit;
    while (itemlist.firstChild) itemlist.removeChild(itemlist.firstChild);
    if (isNumeric(text.textContent.toLowerCase().trim()))
      changeImage(
        String(text.textContent.toLowerCase().trim()).padStart(4, "0")
      );
    else changeImage(text.textContent.toLowerCase().trim());
  },
  false
);

const changePokemon = (code, content) => {
  switch (code) {
    case "ArrowUp": {
      text.textContent = Math.max(Number(content) - 1, 1);
      changeImage(
        String(text.textContent.toLowerCase().trim()).padStart(4, "0")
      );
      break;
    }
    case "ArrowDown": {
      text.textContent = Number(content) + 1;
      changeImage(
        String(text.textContent.toLowerCase().trim()).padStart(4, "0")
      );
      break;
    }
  }
};

document.addEventListener("keydown", (e) => {
  if (
    (e.code !== "ArrowUp" && e.code !== "ArrowDown") ||
    !isNumeric(text.textContent)
  )
    return;
  e.preventDefault();
  changePokemon(e.code, text.textContent);
});

supplement.addEventListener("click", () => {
  const content = supplement.textContent.replace("#", "");
  changeImage(content);
  text.textContent = content;
});

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const pokemonId = urlParams.get("id");
  if (!pokemonId) return;
  setTimeout(() => {
    changeImage(String(pokemonId).padStart(4, "0"));
  }, 100);
  text.textContent = pokemonId;
  window.history.replaceState({}, "", `${window.location.pathname}`);
});
