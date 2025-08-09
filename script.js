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

let touchStartX = 0;
let touchEndX = 0;
let touchStartY = 0;
let touchEndY = 0;
const minSwipeDistance = 50;

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
      text.value = Math.min(Number(content) + 1, 1025);
      changeImage(String(text.value.toLowerCase().trim()).padStart(4, "0"));
      break;
    }
    case "ArrowDown": {
      text.value = Math.max(Number(content) - 1, 1);
      changeImage(String(text.value.toLowerCase().trim()).padStart(4, "0"));
      break;
    }
    case "ArrowRight": {
      text.value = Math.min(Number(content) + 1, 1025);
      changeImage(String(text.value.toLowerCase().trim()).padStart(4, "0"));
      break;
    }
    case "ArrowLeft": {
      text.value = Math.max(Number(content) - 1, 1);
      changeImage(String(text.value.toLowerCase().trim()).padStart(4, "0"));
      break;
    }
  }
};

document.addEventListener("keydown", (e) => {
  if (
    e.code !== "ArrowUp" &&
    e.code !== "ArrowDown" &&
    e.code !== "ArrowLeft" &&
    e.code !== "ArrowRight"
  )
    return;

  e.preventDefault();

  let currentNumber;
  if (isNumeric(text.value)) {
    currentNumber = Number(text.value);
  } else {
    // Find the Pokemon number from the name
    currentNumber = Number(pokedexjson[text.value.toLowerCase().trim()]);
    if (!currentNumber) return; // Invalid Pokemon name
  }

  changePokemon(e.code, currentNumber.toString());
});

supplement.addEventListener("click", () => {
  const content = supplement.textContent.replace("#", "");
  changeImage(content);
  text.value = content;
});

// Handle swipe gestures
const handleTouchStart = (e) => {
  touchStartX = e.changedTouches[0].screenX;
  touchStartY = e.changedTouches[0].screenY;
};

const handleTouchEnd = (e) => {
  touchEndX = e.changedTouches[0].screenX;
  touchEndY = e.changedTouches[0].screenY;
  handleSwipe();
};

const handleSwipe = () => {
  const swipeDistanceX = touchEndX - touchStartX;
  const swipeDistanceY = touchEndY - touchStartY;

  // Check if horizontal swipe is longer than vertical (to avoid conflicts with scrolling)
  if (
    Math.abs(swipeDistanceX) > Math.abs(swipeDistanceY) &&
    Math.abs(swipeDistanceX) > minSwipeDistance
  ) {
    let currentNumber;
    if (isNumeric(text.value)) {
      currentNumber = Number(text.value);
    } else {
      // Find the Pokemon number from the name
      currentNumber = Number(pokedexjson[text.value.toLowerCase().trim()]);
      if (!currentNumber) return; // Invalid Pokemon name
    }

    if (swipeDistanceX > 0) {
      // Swipe right - go to previous Pokemon (decrease)
      changePokemon("ArrowDown", currentNumber.toString());
    } else {
      // Swipe left - go to next Pokemon (increase)
      changePokemon("ArrowUp", currentNumber.toString());
    }
  }
};

// Add touch event listeners to the main container
container.addEventListener("touchstart", handleTouchStart, { passive: true });
container.addEventListener("touchend", handleTouchEnd, { passive: true });

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

// Draggable search button functionality
let isDragging = false;
let dragOffset = { x: 0, y: 0 };

const searchLabel = document.querySelector('label[for="text-name"]');

// Track click vs drag to distinguish between click and drag intentions
let clickStartTime = 0;
let dragThreshold = 5; // pixels
let clickStartPosition = { x: 0, y: 0 };

// Mouse events for desktop
searchLabel.addEventListener("mousedown", (e) => {
  if (e.button !== 0) return; // Only left mouse button

  clickStartTime = Date.now();
  clickStartPosition.x = e.clientX;
  clickStartPosition.y = e.clientY;

  isDragging = true;
  searchLabel.classList.add("dragging");

  const rect = searchLabel.getBoundingClientRect();
  dragOffset.x = e.clientX - rect.left;
  dragOffset.y = e.clientY - rect.top;

  e.preventDefault();
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;

  const x = e.clientX - dragOffset.x;
  const y = e.clientY - dragOffset.y;

  // Keep button within viewport bounds
  const maxX = window.innerWidth - searchLabel.offsetWidth;
  const maxY = window.innerHeight - searchLabel.offsetHeight;

  const boundedX = Math.max(0, Math.min(x, maxX));
  const boundedY = Math.max(0, Math.min(y, maxY));

  searchLabel.style.left = boundedX + "px";
  searchLabel.style.top = boundedY + "px";
  searchLabel.style.right = "auto";
  searchLabel.style.bottom = "auto";

  e.preventDefault();
});

document.addEventListener("mouseup", (e) => {
  if (isDragging) {
    isDragging = false;
    searchLabel.classList.remove("dragging");

    // Check if this was a click rather than a drag
    const clickDuration = Date.now() - clickStartTime;
    const dragDistance = Math.sqrt(
      Math.pow(e.clientX - clickStartPosition.x, 2) +
        Math.pow(e.clientY - clickStartPosition.y, 2)
    );

    // If it was a short duration and minimal movement, treat as click
    if (clickDuration < 300 && dragDistance < dragThreshold) {
      text.focus();
      text.select();
    } else {
      text.blur();
    }
  }
});

// Touch events for mobile
searchLabel.addEventListener(
  "touchstart",
  (e) => {
    clickStartTime = Date.now();
    const touch = e.touches[0];
    clickStartPosition.x = touch.clientX;
    clickStartPosition.y = touch.clientY;

    isDragging = true;
    searchLabel.classList.add("dragging");

    const rect = searchLabel.getBoundingClientRect();
    dragOffset.x = touch.clientX - rect.left;
    dragOffset.y = touch.clientY - rect.top;

    e.preventDefault();
  },
  { passive: false }
);

document.addEventListener(
  "touchmove",
  (e) => {
    if (!isDragging) return;

    const touch = e.touches[0];
    const x = touch.clientX - dragOffset.x;
    const y = touch.clientY - dragOffset.y;

    // Keep button within viewport bounds
    const maxX = window.innerWidth - searchLabel.offsetWidth;
    const maxY = window.innerHeight - searchLabel.offsetHeight;

    const boundedX = Math.max(0, Math.min(x, maxX));
    const boundedY = Math.max(0, Math.min(y, maxY));

    searchLabel.style.left = boundedX + "px";
    searchLabel.style.top = boundedY + "px";
    searchLabel.style.right = "auto";
    searchLabel.style.bottom = "auto";

    e.preventDefault();
  },
  { passive: false }
);

document.addEventListener("touchend", (e) => {
  if (isDragging) {
    isDragging = false;
    searchLabel.classList.remove("dragging");

    // Check if this was a tap rather than a drag
    const touch = e.changedTouches[0];
    const clickDuration = Date.now() - clickStartTime;
    const dragDistance = Math.sqrt(
      Math.pow(touch.clientX - clickStartPosition.x, 2) +
        Math.pow(touch.clientY - clickStartPosition.y, 2)
    );

    // If it was a short duration and minimal movement, treat as tap
    if (clickDuration < 300 && dragDistance < dragThreshold) {
      text.focus();
      text.select();
    } else {
      text.blur();
    }
  }
});
