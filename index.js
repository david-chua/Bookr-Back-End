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

server.post('/api/signup',  (req, res)  =>  {
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

server.post('/api/reviews',  (req, res)  =>  {
    const review = req.body.book.review;
    const book = req.body.book;
    const book_id;

    db('books').where('title', book.title)
        .then(id    =>  {
            if(id.length === 0) {
                db('books').insert({ title: book.title, author: book.author, publisher: book.publisher, image: book.image })
                    .then(ids   =>  {
                        book_id = ids[0];
                        res.status(201).json(id: book_id);
                    })
            }   else {
                book_id = ids[0];
            }
            db('users').where('username', review.username)
                .then(users =>  {
                    db('reviews').insert({ content: review.content, user_id: users[0].id, rating: review.rating })
                        .then(ids   =>  {
                            res.status(201).json({ id: ids[0] });
                        })
                        .catch(err  =>  {
                            res.status(500).json({ error: "Please provide all necessary information for the review" });
                        });
                })
                .catch(err  =>  {
                    res.status(400).json({ error: "Could not locate the user" });
                });
        })
        .catch(err  =>  {
            res.status(502).json({ error: err });
        });
});
