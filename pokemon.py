# one can update to the latest dex by running this python script
import requests
import json


from bs4 import BeautifulSoup

URL = "https://pokemondb.net/pokedex/national"
page = requests.get(URL)

soup = BeautifulSoup(page.content, "html.parser")
pokemonData = {}

results = soup.findAll(class_="infocard")

for result in results:
    dexNumber = result.find("small")
    pokemonName = result.find("a", class_="ent-name")
    pokemonData[dexNumber.text[1:]] = pokemonName.text
    pokemonData[pokemonName.text] = dexNumber.text[1:]

jsonData = json.dumps(pokemonData)

with open('./pokedexdata.json', 'w') as f:
    f.write(jsonData)
