var express = require('express');
var token = require('express-bearer-token');
var app = express();
var firebaseAuth = require('./auth/firebaseAuth');
var admin = require('firebase-admin');
var serviceAccount = require('./auth/secret.json');

app.use(token());
app.use(firebaseAuth);

app.use (function (req, res) {
    res.send ("Token: " +  req.token);
});

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://elo-rankings-531a9.firebaseio.com'
});

var port = process.env.PORT || 1337;

app.get('/', function (req, res) {
    res.send('welcome to the Smash Rankings API!');
});

app.listen(port, function () {
    console.log('Running on PORT: ' + port);
});


