
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('users').del()
    .then(function () {
      // Inserts seed entries
      return knex('users').insert([
        {id: 1, username: 'Username1', password: "TestPassword1"},
        {id: 2, username: 'Username2', password: "TestPassword2"},
        {id: 3, username: 'Username3', password: "TestPassword3"}
      ]);
    });
};
