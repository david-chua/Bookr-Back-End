const express = require('express');
const helmet = require('helmet');
const knex = require('knex');

const dbConfig = require('./knexfile');

const server = express();
const db = knex(dbConfig.development);
server.use(express.json());
server.use(helmet());

const PORT = 3300;

server.listen(PORT, function() {
  console.log(`\n=== Web API Listening on http://localhost:${PORT} ===\n`);
});

server.post('/signup',  (req, res)  =>  {
    const creds = req.body;
    db('users').insert(creds)
        .then(id    =>  {
            const token = "XXXXXXXXXX";
            res.status(201).json({ id: id[0], token: token });
        })
        .catch(err  =>  {
            res.status.json({ error: "Please provide a username or password" });
        })
})
