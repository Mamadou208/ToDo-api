/**
 * Created by Home on 06/11/2016.
 */
// When the app starts
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var Promise = require('bluebird');

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

app.set('bookshelf', bookshelf);

var router = express.Router();

var allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    next();
};

// for forms
app.use(allowCrossDomain);
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}))

// parse application/json
app.use(bodyParser.json())

// parse application/vnd.api+json as json
app.use(bodyParser.json({type: 'application/vnd.api+json'}))


// elsewhere, to use the bookshelf client:
var bookshelf = app.get('bookshelf');

//model setup
// relationships and login methods
var Task = bookshelf.Model.extend({
    tableName: 'items'
});

app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.send(500, 'Something broke!');
});
// CONTACTS API ROUTES BELOW

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
    console.log("ERROR: " + reason);
    res.status(code || 500).json({"error": message});
}

//routes
app.get('/', function (req, res) {
    res.send("blog-api up and running");
});
/**
 Next we need to define our API end points - we need to be able to perform basic CRUD operations on the following resources: `tasks`.
 ### Users
 - `GET    /api/items`    - fetch all Tasks
 - `POST   /api/item`     - create a new task
 - `GET    /api/item/:item_id` - fetch a single task
 - `PUT    /api/item/:item_id` - update task
 - `DELETE /api/item/:item_id` - delete task
 **/
/* GET /api/items */
router.route('/api/items')
// fetch all users
.get(function (req, res) {
    new Task().fetchAll()
        .then(function (items) {
            res.send(items.toJSON());
        }).catch(function (error) {
        handleError(res, error.message, "Failed to get items.");
    });
});

/* POST /api/items */
app.post('/api/items', function (req, res) {
    var item = new Task({
        task: req.body.task,
        deadline: req.body.deadline,
        done: req.body.done
    });
    item.save().then(function (saved_item) {
        res.send(saved_item.toJSON());
    }).catch(function (error) {
        handleError(res, error.message, 'Error saving item');
    });
});

/* GET /api/item/:item_id */
app.get('/api/item/:item_id', function (req, res) {
    Task.forge({id: req.params.item_id})
        .fetch()
        .then(function (item) {
            res.send(item.toJSON());
        }).catch(function (error) {
        console.log(error);
        res.send('Error retrieving item');
    });
});

/* UPDATE /api/item/:item_id */
app.put('/api/item/:item_id', function (req, res) {
    Task.forge({id: req.params.item_id})
        .fetch({require: true})
        .then(function (item) {
            item.save({
                task: req.body.task || item.get('task'),
                deadline: req.body.deadline || item.get('deadline'),
                done: req.body.done || item.get('done')
            })
                .then(function () {
                    res.json({error: false, data: {message: 'task details updated'}});
                })
                .catch(function (err) {
                    res.status(500).json({error: true, data: {message: err.message}});
                });
        })
        .catch(function (err) {
            res.status(500).json({error: true, data: {message: err.message}});
        });
});

/* DELETE /api/item/:item_id */
app.delete('/api/item/:item_id', function (req, res) {
    Task.forge({id: req.params.item_id})
        .fetch({require: true})
        .then(function (task) {
            task.destroy()
                .then(function () {
                    res.json({error: true, data: {message: 'User successfully deleted'}});
                })
                .catch(function (err) {
                    res.status(500).json({error: true, data: {message: err.message}});
                });
        })
        .catch(function (err) {
            res.status(500).json({error: true, data: {message: err.message}});
        });
});

app.listen(3000, function () {
    console.log("Express started at port 3000");
});