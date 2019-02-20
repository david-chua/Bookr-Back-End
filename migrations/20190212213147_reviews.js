
exports.up = function(knex, Promise) {
    return knex.schema.createTable('reviews',   table   =>  {
        table.increments('id');
        table.string('content').notNullable();
        table.integer('rating').notNullable();
        table.integer('user_id').notNullable().unsigned();
        table.foreign('user_id').references('id').on('users');
        table.integer('book_id').notNullable().unsigned();
        table.foreign('book_id').references('id').on('books');
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('reviews');
};
