


var admin = require('firebase-admin');
var db = admin.firestore();
var eventsRef = db.collection('Events');
var regionsRef = db.collection('Regions');

var eventController = {};

eventController.eventList = function(req, res) {
    var events = []; 
    //Handle request params
    console.log("ifdk");
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
            res.status(httpVerbs.NOT_FOUND).send('Event does not exist');
        });
}

eventController.updateEvent = function(req, res) {
    if (!req.user.admin) {
        res.status(403).send("User does not have sufficient priviledges");
    }
    console.log("Updating event");
    eventRef = eventsRef.doc(req.params.eventId);
    if (req.body.timeRanges) {
        timeRanges = req.body.timeRanges;
        req.body.timeFrame = {start: timeRanges[0].start, end: timeRanges[timeRanges.length-1].end};
    }
    if (req.body.regionId) {
        regionRef = regionsRef.doc(req.body.regionId);
        regionRef.get()
            .then(doc => {
                if (!doc.exists) {
                    res.status(404).send("Region does not exist");
                }
                eventRef.update(req.body)
                    .then(res.status(204).end())
                    .catch(err => {
                        console.log(err);
                        res.status(404).send("Event does not exist");
                    });
            })
            .catch(err => {
                console.log(err);
                res.status(404).send("Region does not exist");
            });
    }
}

eventController.deleteEvent = function(req, res) {
    if (!req.user.admin) {
        res.status(403).send("User does not have sufficient priviledges");
    }
    console.log("Delete event");
    var eventRef = eventsRef.doc(req.params.eventId);
    var setsRef = eventRef.collection("Sets");
    setsRef.get()
        .then(snapshot => {
            var batch = db.batch();
            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            batch.commit()
                .then(() => {
                    eventRef.delete()
                        .then(() => res.status(204).end())
                        .catch((err) => {
                            console.log(err);
                            res.status(404).send("Event does not exist");
                        });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).send("Error deleting sets");
                });
        })
        .catch(err => {
            console.log(err);
            res.status(404).send("Sets do not exist");
        });
}

eventController.createEvent = function(req, res) {
    if (!req.user.admin) {
        res.status(403).send("User does not have sufficient priviledges");
    }
    console.log("Creating new event");
    var regionRef = regionsRef.doc(req.body.regionId);
    timeRanges = req.body.timeRanges;
    req.body.admins = [req.user.id];
    req.body.timeFrame = {start: timeRanges[0].start, end: timeRanges[timeRanges.length-1].end};

    regionRef.get()
        .then((doc) => {
            if (!doc.exists) {
                res.status(404).send("Region does not exist");
            }
            eventsRef.add(req.body)
                .then((doc) => {
                    res.status(201).send(doc.id);
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).send("Error adding document");
                });
        })
        .catch((err) => {
            console.log(err);
            res.status(404).send("Region does not exist");
        });  
}

eventController.signIn = (req, res) => {
    // console.log("Signing into event");
    eventRef = eventsRef.doc(req.params.eventId);
    eventRef.update({
        participants: admin.firestore.FieldValue.arrayUnion(req.user.id)
    }).then((data) => {
        res.send("Signed In");
    })
    .catch((err) => {
        console.log(err);
        res.status(404).send('Event does not exist');
    });
}

module.exports = eventController;