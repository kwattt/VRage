# VRage
VRage is a framework for the multiplayer mod of GTA V [Rage MultiPlayer (RAGE:MP)](https://rage.mp/). This framework aims to help developers to create gamemodes in a simple, fast, organized way with the goal of making the development process more enjoyable and efficient.

## License
VRage is licensed under the MIT License. For more information, see the [LICENSE](LICENSE) file.

### Dependencies
1. This project uses [ragemp-types](https://github.com/ragempcommunity/ragemp-types) for the types of the RageMP API. This package is installed automatically when you install VRage as a dependency.

### Installation (From github or npm)
1. Install the package using npm: `npm install @kwattt/vrage` or `npm install github:kwattt/vrage` for the latest version.

### Notes
1. TypeORM 0.3.17 is used since is the latest version which has support for Node 14, once RageMP supports a newer version of Node, the package will be updated to the latest version of TypeORM.

## Database Configuration 
### Development Mode
    By default, the database connection uses TypeORM's synchronize: true option for development convenience. This automatically updates your database schema as you add or modify entities.

### ⚠️ IMPORTANT: For production environments, you should:

1. Disable synchronization by setting synchronize: false in your database configuration
2. Use proper database migrations to manage schema changes
3. Never use auto-synchronization on a production database

Example production configuration:
```typescript
// Configure for production
process.env.NODE_ENV === 'production' && VRage.Server.init('postgres', {
  synchronize: false,
  migrationsRun: true
});
```