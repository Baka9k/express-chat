# Anonymous chat on Node.js

Uses Express framework.

Chat can use sqlite3 or MongoDB as storage (sqlite3 by default).
To use MongoDB, comment this line:
```javascript
var storage = new SQLiteStorage("db/posts.db");
```
and uncomment this line:
```javascript
//var storage = new MongoStorage("posts", bChatSchema);
```
(You need a working MongoDB installation)

##Screenshots:
![Screenshot 1](https://github.com/baka9k/express-chat/raw/master/screenshots/1.png)
![Screenshot 2](https://github.com/baka9k/express-chat/raw/master/screenshots/2.png)
