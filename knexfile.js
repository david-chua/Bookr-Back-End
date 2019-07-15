// Update with your config settings.

require("dotenv").config();
const dbConnection = process.env.DATABASE_URL; //database url for heroku
module.exports = {
  development: {
    client: "sqlite3",
    connection: {
      filename: "./dev.sqlite3"
    },
    migrations: {
      directory: "./migrations"
    },
    useNullAsDefault: true
  },
  production: {
    client: "pg",
    connection: dbConnection,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: "./migrations"
    }
  }
};
