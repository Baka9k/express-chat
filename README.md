# Anonymous chat web-application built with Node.js
This is a simple self-hosted chat application.

## How to host it on your own server
To install express-chat you need node and npm on your server, then just do the following:
```
git clone https://github.com/Baka9k/express-chat
cd express-chat
npm install
node app.js &
```
The app can use either sqlite3 or MongoDB as storage engine.
Default storage engine is sqlite3. 
To change storage engine update the `config.json` file: 
There are two `"storage:"` options: `"mongo"` and `"sqlite"` 
Note that you need a working MongoDB instance on your machine if you use `"mongo"` storage engine.

## Screenshots:
### Desktop:
![Screenshot 1](
https://github.com/baka9k/express-chat/raw/master/screenshots/1.png)
### Mobile:
![Screenshot 2](
https://github.com/baka9k/express-chat/raw/master/screenshots/2.png)