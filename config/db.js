/**
 * Created by Home on 16/10/2016.
 */
var dbConfig = {
    client: 'mysql',
    connection: {
        host: 'localhost',
        user: 'root',
        password: 'Passw0rd',
        database: 'todo_db',
        charset: 'utf8'
    }
};
var knex = require('knex')(dbConfig);
var bookshelf = require('bookshelf')(knex);

module.exports.bookshelf = bookshelf;