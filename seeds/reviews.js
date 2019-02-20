
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('reviews').del()
    .then(function () {
      // Inserts seed entries
      return knex('reviews').insert([
        {id: 1, content: 'conten1', rating: 1, user_id: 1, book_id: 1},
        {id: 2, content: 'content2', rating: 2, user_id: 2, book_id: 2},
        {id: 3, content: 'content3', rating: 3, user_id: 3, book_id: 3}
      ]);
    });
};
