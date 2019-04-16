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

var user = admin

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
var eventController = require('./Controllers/eventController');
var db = admin.firestore();
var eventsRef = db.collection('Events');
var regionsRef = db.collection('Regions');


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
* Event Routes
*/
app.get('/api/events', eventController.eventList);
app.get('/api/events/:eventId', eventController.eventDetail);
app.post('/api/events', eventController.createEvent);
app.delete('/api/events/:eventId', eventController.deleteEvent);
app.patch('/api/events/:eventId', eventController.updateEvent);



app.get('/api/events', function (req, res) {
    //res.set("Content-Type", 'application/json');
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
    //res.set("Content-Type", 'application/json');
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
    if (!(req.user.admin || req.user.deity)) {
        res.status(httpVerbs.FORBIDDEN).send("User does not have sufficient priviledges");
    }
    console.log("Creating new event");
    var regionId = req.body.regionId;
    delete req.body.regionId;
    var regionSplit = regionId.split("-");
    req.body.eventAdmins = [req.user.id];
    var regionRef = regionsRef.doc(regionSplit[0])

    regionRef.get()
        .then((snapshot) => {
            var region = snapshot.data();
            req.body.region = {id: regionSplit[0], name: region.name};
            if (region.subregions) { 
                req.body.region.subregion = region.subregions[regionSplit[1]];
            }
            eventsRef.add(req.body)
                .then((doc) => {
                    res.send(doc.id);
                })
                .catch((err) => {
                    res.status(500).send("Error adding document: ", err);
                });
        })
        .catch((err) => {
            res.status(404).send('Region cannot be found: ', err);
        });  
});

/*
* Region Routes
*/

app.get('/api/regions', function (req, res) {
    regions = [];
    console.log("Getting all regions");
    regionsRef.get()
        .then((snapshot) => {
            snapshot.docs.map((doc) => {
                region = doc.data();
                region.id = doc.id;

                subregions = [];
                for(i = 0; i < region.subregions.length; i++) {
                    subregion = {id: region.id + '-' + i, name: region.subregions[i]};
                    subregions.push(subregion);
                }
                region.subregions = subregions;

                regions.push(region);
            })
            res.send(regions);
        })
        .catch((err) => {
            res.status(404).send("No regions to be found");
        });
});

app.get('/api/regions/:regionId', function (req, res) {
    regionsRef.doc(req.params.regionId).get()
        .then((doc) => {
            region = doc.data();
            region.id = doc.id;
            subregions = [];
            for(i = 0; i < region.subregions.length; i++) {
                subregion = {id: region.id + '-' + i, name: region.subregions[i]};
                subregions.push(subregion);
            }
            region.subregions = subregions;

            res.json(region);
        })
        .catch((err) => {
            res.status(404).send('Cannot find region. ', err);
        });
});

app.post('/api/regions', function (req, res) {
    if (!(req.user.admin || req.user.deity)) {
        res.status(httpVerbs.FORBIDDEN).send("User does not have sufficient priviledges");
    }

    console.log("Creating new region");
    req.body.createdBy = req.user.id;
    regionsRef.add(req.body)
        .then((doc) => {
            res.send(doc.id);
        })
        .catch((err) => {
            res.status(httpVerbs.INTERNAL_SERVER_ERROR).send("Error creating region: ", err);
        })
})

/**
 * User Routes
 */

app.listen(port, function () {
    console.log('Running on PORT: ' + port);
});


