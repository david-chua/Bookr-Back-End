const express = require("express");
const helmet = require("helmet");
const knex = require("knex");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors=require("cors");
require("dotenv").config();

const server = express();
const dbEngine = process.env.DB || "development";
const dbConfig = require("./knexfile.js")[dbEngine];
const db = knex(dbConfig);
server.use(express.json());
server.use(helmet());
server.use(cors());

const PORT = process.env.PORT || 3300;

const { authenticate } = require("./customMiddleware/authenticate.js");

const generateToken = (username, user_id) => {
  const payload = {
    username,
    user_id
  };

  const options = {
    expiresIn: "1h",
    jwtid: "BookrToken"
  };

  const secret = process.env.JWT_SECRET;
  const token = jwt.sign(payload, secret, options);
  return token;
};

server.listen(PORT, function() {
  console.log(`\n=== Web API Listening on http://localhost:${PORT} ===\n`);
});
server.get("/", (req, res) => {
  res.status(200).json("Hello world");
});

server.post('/api/signup',  (req, res)  =>  {
    const creds = req.body;
    creds.password = bcrypt.hashSync(creds.password);
    if(creds.username.length && creds.password.length)  {
            db('users').insert(creds)
            .then(ids    =>  {
                const token = generateToken(creds.username, ids[0]);
                res.status(201).json({ id: ids[0], token: token });
            })
            .catch(err  =>  {
                res.status(500).json({ error: "Please provide a username or password" });
            })
    }   else {
        res.status(500).json({ error: "Please provide a username and a password" })
    }
})

server.post('/api/login',   (req, res)  =>  {
    const creds = req.body
    db('users').where('username', creds.username)
        .then(users =>  {
            if(users.length && bcrypt.compareSync(creds.password, users[0].password))   {
                const token = generateToken(users[0].username, users[0].id)
                res.status(200).json({ token });
            }   else {
                res.status(500).json({ error: "Incorrect username or password" });
            }
        })
        .catch(err  =>  {
            res.status(500).json({ error: "Incorrect username or password" });
        })
})

server.post("/api/reviews", authenticate, (req, res) => {
  const review = req.body.book.review;
  const book = req.body.book;
  const user_id = req.decoded.user_id;
  let book_id = null;
  db("books")
    .where("title", book.title)
    .then(books => {
      if (books.length === 0) {
        db("books")
          .insert({
            title: book.title,
            author: book.author,
            publisher: book.publisher,
            image: book.image
          })
          .then(ids => {
            book_id = ids[0];
          })
          .then(() => {
            db("reviews")
              .insert({
                content: review.content,
                book_id: book_id,
                user_id: user_id,
                rating: review.rating
              })
              .then(ids => {
                res.status(201).json({ id: ids[0] });
              })
              .catch(err => {
                res.status(500).json({
                  error:
                    "Please provide all necessary information for the review"
                });
              });
          })
          .catch(err => {
            res.status(500).json({
              error: "Please provide all necessary information for the book"
            });
          });
      } else {
        book_id = books[0].id;
        db("reviews")
          .insert({
            content: review.content,
            book_id: book_id,
            user_id: user_id,
            rating: review.rating
          })
          .then(ids => {
            res.status(201).json({ id: ids[0] });
          })
          .catch(err => {
            res.status(500).json({
              error: "Please provide all necessary information for the review"
            });
          });
      }
    })
    .catch(err => {
      res.status(502).json({ error: err });
    });
});

server.get('/api/reviews/:book_id',  authenticate, (req, res)  =>  {
    db('reviews').join('books', 'reviews.book_id', '=', 'books.id').join('users', 'reviews.user_id', '=', 'users.id')
        .select('books.title', 'books.author', 'books.publisher', 'books.image', 'reviews.content', 'reviews.rating', 'users.username')
        .where('reviews.book_id', req.params.book_id)
        .then(data  =>  {
            console.log(data)
            const reviews = data.map(review  => {
                return {
                    reviewer: review.username,
                    content: review.content,
                    rating: review.rating
                }
            })
            const book  =   {
                title: data[0].title,
                author: data[0].author,
                publisher: data[0].publisher,
                image: data[0].image,
                reviews: reviews
            }
            res.status(200).json({ book });
        })
        .catch(err  =>  {
            res.status(500).json({ error: "Please provide all necessary data" });
        })
})

server.get('/api/books/all',  authenticate,   (req, res)  =>  {
    db('books')
        .then(data  =>  {
            res.status(200).json({ books: data });
        })
        .catch(err  =>  {
            res.status(500).json({ error: "Please provide all necessary data" });
        })
})

server.get('/api/books/',  authenticate,   (req, res)  =>  {
    db('reviews').join('books', 'reviews.book_id', '=', 'books.id')
        .where('user_id', req.decoded.user_id)
        .then(data  =>  {
            res.status(200).json({ books: data });
        })
        .catch(err  =>  {
            res.status(500).json({ error: "Please provide all necessary data" });
        })
})

server.put("/api/reviews", authenticate, (req, res) => {
  db("reviews")
    .where("id", req.body.review_id)
    .update({
      content: req.body.content,
      rating: req.body.rating,
      user_id: req.decoded.user_id,
      book_id: req.body.book_id
    })
    .then(ids => {
      res.status(202).json({ message: "Success" });
    })
    .catch(err => {
      res.status(500).json({
        error: "Please make sure you provided all of the correct data"
      });
    });
});

server.delete("/api/reviews", authenticate, (req, res) => {
  db("reviews")
    .where("id", req.body.review_id)
    .del()
    .then(data => {
      res.status(203).json({ message: "Review deleted succesfully" });
    })
    .catch(err => {
      res.status(400).json({ error: "Could not find the review to delete" });
    });
});
