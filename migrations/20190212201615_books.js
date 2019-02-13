
exports.up = function(knex, Promise) {
    return knex.schema.createTable('books',  table   =>  {
        table.increments();
        table.string('title').notNullable();
        table.unique('title');
        table.string('author').notNullable();
        table.string('publisher').notNullable();
        table.string('image').notNullable();
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('books');
};
