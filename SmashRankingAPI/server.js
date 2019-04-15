//Setting Up Express
var express = require('express');
var app = express();
var port = process.env.PORT || 1337;

//Setting Up Token Authorization with Firebase Auth
var token = require('express-bearer-token');
var firebaseAuth = require('./auth/firebaseAuth');
var admin = require('firebase-admin');
var serviceAccount = require('./auth/secret.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://elo-rankings-531a9.firebaseio.com'
});
app.use(token());
app.use(firebaseAuth);

//Various Other Middlewares
var cors = require('cors');
var bodyParser = require('body-parser');
var httpVerbs = require('http-status-codes');

//Adding Middleware to App Server
app.use(cors());
app.use(bodyParser.json());

//Adding Firestore Methods to the App Server 
//and creating common collection references
var firestore = require('./dataAccess/firestore');
var db = admin.firestore();
var eventsRef = db.collection('Events');


/***********************************************
 * Just gonna split up routes with comments for now...
 * My OCD is going to make me refactor this later
 **********************************************/

/*
 * Welcome Home Route (probs gonna get rid of this eventually)
*/
app.get('/', function (req, res) {
    res.send('welcome to the Smash Rankings API!');
});

/*
* Event Routes Controller
*/

app.get('/api/events', function (req, res) {
    res.set("Content-Type", 'application/json');
    var events = []; 
    //Handle request params
    console.log(req.query);
    if (req.query.regionId) {
        eventsRef = eventsRef.where('region.id', '==', req.query.regionId);
    }
    else if (req.query.regionName) {
        eventsRef = eventsRef.where('region.name', '==', req.query.regionName);
    }
    if (req.query.userId) {
        eventsRef = eventsRef.where('participants', 'array-contains', req.query.userId);
    }
    eventsRef.get(eventsRef)
        .then((snapshot) => {
            snapshot.docs.map(doc => {
                event = doc.data()
                //Map id to doc object
                event['id'] = doc.id;
                events.push(event);
           });
           res.json(events);
        })
        .catch((err) => {
            res.status(httpVerbs.NOT_FOUND).send('Error getting documents', err);
        });
});

app.get('/api/events/:eventId', function (req, res) {
    res.set("Content-Type", 'application/json');
    console.log(req.params.eventId);
    eventRef = eventsRef.doc(req.params.eventId);
    eventRef.get()
        .then((snapshot) => {
            var event = snapshot.data();
            event['id'] = req.params.eventId;
            res.json(event);
        })
        .catch((err) => {
            res.status(httpVerbs.NOT_FOUND).send('Event doesn\'t exist');
        })
});

app.post('/api/events', function (req, res) {
    console.log("Creating new event");
    console.log(req.body);
    db.collection("Events").add(req.body)
        .then((doc) => {
            console.log("Document written with ID: ", doc.id);
            res.send(doc.id);
        })
        .catch((err) => {
            res.status(httpVerbs.INTERNAL_SERVER_ERROR).send("Error adding document: ", err);
        });
});

app.listen(port, function () {
    console.log('Running on PORT: ' + port);
});


