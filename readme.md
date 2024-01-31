# Pokémon assets downloader Upgrade

<p style="text-align:center">
<img src="./assets/favicon.png" height="80px" alt="pokmon logo"/>
</p>

## To update the assets

- Change the [HOME] Pokémon Renders files to update the database.
- Open the python file and run `python3 pokemon.py`
- This will update the pokedexdata.json according to the new **pokedb.net** pokémon database, and also it will update the Images/normal.json and Images/shiny.json accroding to the newly uploaded images in [HOME] Pokémon Renders.
- Pokedex json has reverse pairing too i.e. `pokemonName : pokedexNumber` and `pokedexNumber : pokemonName`

## Features

- One can search by Pokémon name or 4 digit pokedex number.
- After typing four characters of the Pokémon, search suggestions will show up.
- Different forms of the Pokémon are categorised into the same name. For example - typing Charizard will list Charizard, X, Y, gigantamax etc forms and its shinies.
- Clicking on the images is the simplest way to download it.
- Search suggestions are clickable and show-up your pokémon.
- Use query string by adding ?id=`number` and get results.
