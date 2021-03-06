var express = require('express');
var exphbs  = require('express-handlebars');
var path = require('path');
var mongoose = require('mongoose');
var sqlite3 = require('sqlite3');
var WebSocket = require('ws');
var bodyParser = require('body-parser');
var multer = require('multer'); // v1.0.5
var fs  = require('fs');

var webSocketServer = new WebSocket.Server({port: 3333});

var app = express();

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

var upload = multer(); // for parsing multipart/form-data

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(express.static(__dirname + '/'));

var config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

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
	content: String,
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
	model.create({content: content, date: date, time: time}, function(err) {
		if(err) console.log("MongoDB error:", err);
		callback();
	});
};

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




if (config.storage == "sqlite") {
	var storage = new SQLiteStorage("db/posts.db");
} else if (config.storage == "mongo") {
	var storage = new MongoStorage("posts", bChatSchema);
} else if ( (config.storage == "") || (!config.storage) ) {
	console.log("Storage type is not specified, check config.json");
} else {
	console.log("Unsupported storage type, check config.json");
}

var getPostsForRendering = function(callback) {
	storage.getPosts(0, 100, function(posts) {
		callback('home', {
		    posts: posts  
		});
	});
};

var getPostsForAjax = function(callback) {
	storage.getPosts(0, 100, function(posts) {
		callback(posts);
	});
};



//==============================HTTP==================================

app.get('/', function(req, res) {
	getPostsForRendering(function(template, content) {
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



//=============================== AJAX ==============================

app.get('/ajax/getall', function(req, res) {
	getPostsForAjax(function(content) {
	    res.json(content)
	});
});

app.post('/ajax/post', upload.array(), function(req, res) {
	var content = req.body.content;
	storage.addPost(content, function () { 
		getPostsForAjax((content) => { res.json(content) });
		notifyUsers({date: getDateString(), time: getTimeString(), content: content});
	});
});



//============================== WebSocket =============================

webSocketServer.on('connection', function (socket) {
    console.log('New WebSocket connection');  
});

var notifyUsers = function(message) {
    var JSONMessage = JSON.stringify(message);
    webSocketServer.clients.forEach(function (client) {
        client.send(JSONMessage);
    });
};











