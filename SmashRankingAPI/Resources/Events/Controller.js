


var admin = require('firebase-admin');
var db = admin.firestore();
var eventsRef = db.collection('Events');
var regionsRef = db.collection('Regions');

var eventController = {};

eventController.eventList = function(req, res) {
    var events = []; 
    //Handle request params
    console.log(req.query);
    if (req.query.regionId) {
        eventsRef = eventsRef.where('region.id', '==', req.query.regionId);
    }
    else if (req.query.regionName) {
        eventsRef = eventsRef.where('region.name', '==', req.query.regionName);
    }
    if (req.query.myEvents) {
        eventsRef = eventsRef.where('participants', 'array-contains', req.user.id);
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
            res.status(404).send('Error getting documents', err);
        });
}

eventController.eventDetail = function(req, res) {
    eventRef = eventsRef.doc(req.params.eventId);
    eventRef.get()
        .then((snapshot) => {
            var event = snapshot.data();
            event.id = req.params.eventId;
            res.json(event);
        })
        .catch((err) => {
            res.status(httpVerbs.NOT_FOUND).send('Event doesn\'t exist');
        });
}

eventController.updateEvent = function(req, res) {
    res.send('NOT IMPLIMENTED: Update Event');
}

eventController.deleteEvent = function(req, res) {
    res.send('NOT IMPLIMENTED: Delete Event');
}

eventController.createEvent = function(req, res) {
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
            if (regionSplit[1]) { 
                console.log("This shouldn't happen");
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
            console.log(err);
            res.status(404).send("Region does not exist");
        });  
}

eventController.createSet = (req, res) => {
    
    setsRef = eventsRef.doc(req.params.eventId).collection("Sets");
    setsRef.add(req.body)
        .then((doc) => {
            res.send(doc.id);
        })
        .catch((err) => {
            console.log(err);
            res.status(404).send('Event does not exist');
        });
}


module.exports = eventController;