
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('books').del()
    .then(function () {
      // Inserts seed entries
      return knex('books').insert([
        {id: 1, title: 'book1', author: "author1", publisher: "publisher1", image: "image1"},
        {id: 2, title: 'book2', author: "author2", publisher: "publisher2", image: "image2"},
        {id: 3, title: 'book3', author: "author3", publisher: "publisher3", image: "image3"}
      ]);
    });
};
