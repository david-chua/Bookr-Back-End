const request   =   require('supertest');
const server    =   require('./server.js')
const knex = require("knex");
const dbEngine = process.env.DB || "development";
const dbConfig = require("./knexfile.js")[dbEngine];
const db = knex(dbConfig);

describe('the route handlers',  ()  =>  {
    afterEach(async () => {
           await db('users').truncate();
           await db('books').truncate();
           await db('reviews').truncate();
       });
    describe('get /api/books', ()  =>  {
        it('responds with 200', async ()    =>  {
            const body = { username: "Username11", password: "TestPassword11" }
            const post = await request(server).post('/api/signup').send(body);
            const response = await request(server).get('/api/books').set({ Authorization: post.body.token });
            expect(response.status).toBe(200);
        })
        it('responds with an array', async ()    =>  {
            const body = { username: "Username11", password: "TestPassword11" }
            const post = await request(server).post('/api/signup').send(body);
            const response = await request(server).get('/api/books').set({ Authorization: post.body.token });
            const arrayConstructor = [].constructor;
            expect(response.body.books.constructor).toBe(arrayConstructor);
        })
        it('responds with 401 when not logged in', async ()  =>  {
            const response = await request(server).get('/api/books');
            expect(response.status).toBe(401);
        })
    })

    describe('get /api/books/all',  ()  =>  {
        it('responds with 200', async ()    =>  {
            const body = { username: "Username11", password: "TestPassword11" }
            const post = await request(server).post('/api/signup').send(body);
            const response = await request(server).get('/api/books/all').set({ Authorization: post.body.token });
            expect(response.status).toBe(200);
        })
        it('responds with an array', async ()    =>  {
            const body = { username: "Username11", password: "TestPassword11" }
            const post = await request(server).post('/api/signup').send(body);
            const response = await request(server).get('/api/books/all').set({ Authorization: post.body.token });
            const arrayConstructor = [].constructor;
            expect(response.body.books.constructor).toBe(arrayConstructor);
        })
        it('responds with 401 when not logged in', async ()  =>  {
            const response = await request(server).get('/api/books/all');
            expect(response.status).toBe(401);
        })
    })

    describe('post /api/signup',    ()  =>  {
        it('responds with 201', async   ()  =>  {
            const body = { username: "Username", password: "Password" };
            const response = await request(server).post('/api/signup').send(body);
            expect(response.status).toBe(201);
        })

        it('responds with 500', async   ()  =>  {
            const body = {};
            const response = await request(server).post('/api/signup').send(body);
            expect(response.status).toBe(500)
        })
        it('responds with a token', async   ()  =>  {
            const body = { username: "Username", password: "Password" };
            const response = await request(server).post('/api/signup').send(body);
            expect(response.body.token ? true : false).toBe(true);
        })
    })

    describe('post /api/login', ()  =>  {
        it('responds with 200', async ()  =>  {
            const body  =   {username: "Username", password: "Password"};
            const signup = await request(server).post('/api/signup').send(body);
            const response = await request(server).post('/api/login').send(body);
            expect(response.status).toBe(200)
        })

        it('responds with 500', async ()  =>  {
            const body  =   {username: "Username", password: "Password"};
            const response = await request(server).post('/api/login').send(body);
            expect(response.status).toBe(500)
        })

        it('responds with a token', async ()  =>  {
            const body  =   {username: "Username", password: "Password"};
            const signup = await request(server).post('/api/signup').send(body);
            const response = await request(server).post('/api/login').send(body);
            expect(response.body.token ? true : false).toBe(true)
        })
    })

    describe('post /api/reviews',  async ()  =>  {
        it('responds with 201', async   ()  =>  {
            const body  =   { username: "Username", password: "Password" };
            const signup = await request(server).post('/api/signup').send(body);
            const bookReview = {
                book:   {
                    title: "Title",
                    author: "Author",
                    publisher: "Publisher",
                    image: "Image",
                    review: {
                        content: "Content",
                        rating: 2
                    }
                }
            }
            const response = await request(server).post('/api/reviews').send(bookReview).set({ Authorization: signup.body.token});
            expect(response.status).toBe(201);
        })

        it('responds with 500', async   ()  =>  {
            const body  =   { username: "Username", password: "Password" };
            const signup = await request(server).post('/api/signup').send(body);
            const bookReview = {}
            const response = await request(server).post('/api/reviews').send(bookReview).set({ Authorization: signup.body.token});
            expect(response.status).toBe(500);
        })

        it('responds with the id',  async   ()  =>  {
            const body  =   { username: "Username", password: "Password" };
            const signup = await request(server).post('/api/signup').send(body);
            const bookReview = {
                book:   {
                    title: "Title",
                    author: "Author",
                    publisher: "Publisher",
                    image: "Image",
                    review: {
                        content: "Content",
                        rating: 2
                    }
                }
            }
            const response = await request(server).post('/api/reviews').send(bookReview).set({ Authorization: signup.body.token});
            expect(response.body.id).toBe(1);
        })
    })
})
