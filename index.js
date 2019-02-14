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
    if(creds.username.length && creds.password.length)  {
        db('users').insert(creds)
            .then(id    =>  {
                const token = "XXXXXXXXXX";
                res.status(201).json({ id: id[0], token: token });
            })
            .catch(err  =>  {
                res.status.json({ error: "Please provide a username or password" });
            })
    }   else {
        res.status(500).json({ error: "Please provide a username and a password" })
    }
})

server.post('/api/reviews',  (req, res)  =>  {
    const review = req.body.book.review;
    const book = req.body.book;
    let book_id = null;

    db('users').where('username', review.username)
        .then(users =>  {
            if(users.length === 0)  {
                res.status(404).json({ error: "Could not find user" });
            }
            db('books').where('title', book.title)
                .then(books    =>  {
                    if(books.length === 0) {
                        db('books').insert({ title: book.title, author: book.author, publisher: book.publisher, image: book.image })
                            .then(ids   =>  {
                                book_id = ids[0];
                            })
                            .then(()    =>  {
                                db('reviews').insert({ content: review.content, book_id: book_id, user_id: users[0].id, rating: review.rating })
                                    .then(ids   =>  {
                                        res.status(201).json({ id: ids[0] });
                                    })
                                    .catch(err  =>  {
                                        res.status(500).json({ error: "Please provide all necessary information for the review" });
                                    });
                            })
                            .catch(err  =>  {
                                res.status(500).json({ error: "Please provide all necessary information for the book" });
                            })
                    }   else {
                        book_id = books[0].id;
                        db('reviews').insert({ content: review.content, book_id: book_id, user_id: users[0].id, rating: review.rating })
                            .then(ids   =>  {
                                res.status(201).json({ id: ids[0] });
                            })
                            .catch(err  =>  {
                                res.status(500).json({ error: "Please provide all necessary information for the review" });
                            });
                    }
                })
                .catch(err  =>  {
                    res.status(502).json({ error: err });
                });
        })
        .catch(err  =>  {
            res.status(400).json({ error: "Could not locate the user" });
        });
});

server.get('/api/reviews',  (req, res)  =>  {
    db('users').where('username', req.body.username)
        .then(users =>  {
            if(users.length)    {
                db('reviews').join('books', 'reviews.book_id', '=', 'books.id')
                .select('books.title', 'books.author', 'books.publisher', 'books.image', 'reviews.content', 'reviews.rating')
                .where('reviews.user_id', users[0].id)
                    .then(data  =>  {
                        res.status(200).json({ books: data });
                    })
                    .catch(err  =>  {
                        res.status(500).json({ error: "Please provide all necessary data" });
                    })
            }   else {
                res.status(404).json({ error: "Could not find the user" })
            }
        })
        .catch(err  =>  {
            res.status(502).json({ error: err })
        });
})

server.put('/api/reviews',  (req, res)  =>  {
    db('users').where('username', req.body.username)
        .then(users =>  {
            if(users.length)    {
                db('reviews')
                .where('id', req.body.review_id)
                .update({
                    content: req.body.content,
                    rating: req.body.rating,
                    user_id: req.body.user_id,
                    book_id: req.body.book_id,
                })
                .then(ids   =>  {
                    res.status(202).json({ message: "Success" });
                })
                .catch(err  =>  {
                    res.status(500).json({ error: "Please make sure you provided all of the correct data" })
                })
            }   else {
                res.status(404).json({ error: "Could not find the user" });
            }
        })
        .catch(err  =>  {
            res.status(500).json({ error: err });
        });
});

server.delete('/api/reviews',   (req, res)  =>  {
    db('users').where('username',   req.body.username)
        .then(users =>  {
            if(users.length)    {
                db('reviews')
                .where('id', req.body.review_id)
                .del()
                .then(data  =>  {
                    res.status(203).json({ message: "Review deleted succesfully" });
                })
                .catch(err  =>  {
                    res.status(400).json({ error: "Could not find the review to delete" });
                })
            }   else {
                res.status(404).json({ error: "Could not find the user" });
            }
        })
        .catch(err  =>  {
            res.status(500).json({ error: err })
        })
})
