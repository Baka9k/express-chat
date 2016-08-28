var express = require('express');
var exphbs  = require('express-handlebars');
var path = require('path');
var mongoose = require('mongoose');
var sqlite3 = require('sqlite3');

var app = express();
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

var bodyParser = require('body-parser');
var multer = require('multer'); // v1.0.5
var upload = multer(); // for parsing multipart/form-data

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

pp.use(express.static(__dirname + '/')); 



//===========================SQLITE============================

function SQLiteStorage(pathToDB) {
	this.db = new sqlite3.Database(pathToDB);
	return this;
};

SQLiteStorage.prototype.getPosts = function(from, to, callback) {
	var db = this.db;
	db.serialize(function() {
		db.all('SELECT * FROM Posts LIMIT ' + to + ' OFFSET ' + from, function(err, rows) {
			if (err) console.log('SQLite Error:', err);
			if (typeof callback == "function") {
				callback(rows);
			}
		});
	});
};

SQLiteStorage.prototype.addPost = function(content, callback) {
	var db = this.db;
	var date = getDateString();
	var time = getTimeString();
	db.serialize(function() {
	    var query = "INSERT INTO Posts (date, time, content) VALUES (?, ?, ?)";
		db.run(query, date, time, content, function (err) {
			if (err) console.log('SQLite Error:', err);
			if (typeof callback == "function") {
				callback();
			}
		});
	});
};

SQLiteStorage.prototype.countPosts = function(callback) {
	var query = "SELECT COUNT(*) FROM Posts;";
	db.run(query, function (err, rows) {
		callback && callback (rows['COUNT ']); 
		if (err) console.log('SQLite Error:', err);
	});
};



//===========================MONGODB============================

// Create a schema
var bChatSchema = new mongoose.Schema({
	message: String,
	date: String,
	time: String,
});

function MongoStorage(dbName, schema) {
	// Connect to MongoDB and create/use database called <dbName>
	mongoose.connect('mongodb://localhost/' + dbName);
	// Create a model based on the schema
	this.model = mongoose.model(dbName, schema);
	return this;
};

MongoStorage.prototype.addPost = function(content, callback) {
	var model = this.model;
	var date = getDateString();
	var time = getTimeString();
	model.create({message: content, date: date, time: time}, function(err) {
		if(err) console.log("MongoDB error:", err);
	});
});

MongoStorage.prototype.getPosts = function(from, to, callback) {
	var model = this.model;
	var nPosts = to - from;
	model
		.find({})
		.skip(from)
		.limit(nPosts)
		.exec(function(err, posts) {
			if (err) console.log("MongoDB error:", err);
			callback(posts);
		});
};

MongoStorage.prototype.countPosts = function(callback) {
	var model = this.model;
	model.count({}, function(err, count) {
        if (err) console.log("MongoDB error:", err);
		callback(count);
     });
};



//====================================================================

var getDateString = function() {
	var dateString = "";
	var newDate = new Date();
	dateString += (newDate.getMonth() + 1) + "/";
	dateString += newDate.getDate() + "/";
	dateString += newDate.getFullYear();
	return dateString;
};

var getTimeString = function() {
	var timeString = "";
	var newDate = new Date();
	timeString += newDate.getHours() + ":";
	timeString += newDate.getMinutes() + ":";
	timeString += newDate.getSeconds();
	return timeString;
};



//===================================================================

var storage = new SQLiteStorage("db/posts.db");
//var storage = new MongoStorage("posts", bChatSchema);

var getPosts = function(callback) {
	storage.getPosts(0, 100, function(posts) {
		callback('home', {
		    posts: posts  
		});
	});
};



//==============================HTTP==================================

app.get('/', function(req, res) {
	getPosts(function(template, content) {
		res.render(template, content);
	});
});


app.post('/postnya', upload.array(), function(req, res) {
	var content = req.body.content;
	storage.addPost(content, function () { 
		res.redirect("/"); 
	});
});


app.listen(3000, function () {
	console.log('Example app listening on port 3000!');
});









