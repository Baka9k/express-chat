var express = require('express');
var exphbs  = require('express-handlebars');
var path = require('path');
var sqlite3 = require('sqlite3');

var app = express();
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

var bodyParser = require('body-parser');
var multer = require('multer'); // v1.0.5
var upload = multer(); // for parsing multipart/form-data

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(express.static(__dirname + '/')); 


//===========================SQLITE============================

function SQLiteStorage(pathToDB) {
	this.db = new sqlite3.Database(pathToDB);
	return this;
};

SQLiteStorage.prototype.getPosts = function(from, to, callback) {
	var db = this.db;
	db.serialize(function() {
		db.all('SELECT * FROM Posts LIMIT ' + to + ' OFFSET ' + from, function(err, rows) {
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
		db.run("INSERT INTO Posts (date, time, content) VALUES ('" + date + "','" + time + "','" + content + "');");
	});
	if (typeof callback == "function") {
		callback();
	}
};

SQLiteStorage.prototype.countPosts = function() {
	return this.posts.length;
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









