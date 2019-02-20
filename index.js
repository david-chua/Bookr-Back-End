const express = require("express");
const helmet = require("helmet");
const knex = require("knex");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors=require("cors");
require("dotenv").config();

const server = require("./server.js");
const dbEngine = process.env.DB || "development";
const dbConfig = require("./knexfile.js")[dbEngine];
const db = knex(dbConfig);
server.use(express.json());
server.use(helmet());
server.use(cors());

const PORT = process.env.PORT || 3300;

server.listen(PORT, function() {
  console.log(`\n=== Web API Listening on http://localhost:${PORT} ===\n`);
});
