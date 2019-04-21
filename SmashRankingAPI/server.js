//Setting Up Express
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var expressValidator = require('express-validator');
var port = process.env.PORT || 1337;

//Setting Up Token Authorization with Firebase Auth
var token = require('express-bearer-token');
var auth = require('./auth/firebaseAuth');
var admin = require('firebase-admin');
var serviceAccount = require('./auth/secret.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://elo-rankings-531a9.firebaseio.com'
});
app.use(token());
app.use(auth.restAuth);

//Various Other Middlewares
var bodyParser = require('body-parser');

//Still need to figure out what this does
var cors = require('cors');

//Adding Middleware to App Server
app.use(cors());
app.use(bodyParser.json());
app.use(expressValidator());


//Adding Routes
var events = require('./Resources/Events/Routes');
app.use('/api/events', events);
var regions = require('./Resources/Regions/Routes');
app.use('/api/regions', regions);
var users = require('./Resources/Users/Routes');
app.use('/api/users', users);

io.use(auth.socketAuth);

require('./Resources/Sets/socketEvents')(io);

app.listen(port, function () {
    console.log('Running on PORT: ' + port);
});



