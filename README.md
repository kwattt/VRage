# VRage
VRage is a framework for the multiplayer mod of GTA V [Rage MultiPlayer (RAGE:MP)](https://rage.mp/). This framework aims to help developers to create gamemodes in a simple, fast, organized way with the goal of making the development process more enjoyable and efficient.

###  WARNING
The project is still in development and is not ready for production use. The API is not stable and can change at any time. There is not documentation available yet, it will be available once the project is stable.

## License
VRage is licensed under the MIT License. For more information, see the [LICENSE](LICENSE) file.

### Dependencies
1. This project uses [ragemp-types](https://github.com/ragempcommunity/ragemp-types) for the types of the RageMP API. This is crucial to be installed in your project to use VRage if you are using typescript.

### Installation (From github or npm)
1. ~~Install the package using npm: `npm install @kwattt/vrage` or `npm install github:kwattt/vrage` for the latest version.~~
2. Install from github using npm: `npm install github:kwattt/vrage` for the latest version.

### Notes
1. The project do not have any ORM but instead uses kysely for the database queries. Currently base entities are tested used mysql and postgresql. The project is not limited to these databases, you can use any database supported by kysely if the query builder supports it. 
2. For a more ready to work project, you can use [vrage-base](https://github.com/kwattt/vrage-base) as a base for your project. This project is a simple gamemode that uses VRage as a dependency and has configured a plugin distributed client/server/cef for easy management of the gamemode, seen as other frameworks like ESX, QBcore for FiveM.