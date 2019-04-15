var admin = require('firebase-admin');
var firestoreExport = require('node-firestore-import-export');


var db = admin.firestore();

var regions = () => {
    
   
    db.collection('Regions').get()
        .then((snapshot) => {
            snapshot.forEach((doc) => {
                console.log(doc.id, '=>', doc.data());
            });
        })
        .catch((err) => {
            console.log('Error getting documents', err);
        });
};

var events = () => {
    var events = [];
    console.log("Empty event array");
    console.log(events);
    var eventsRef = db.collection('Events');
    eventsRef.get(eventsRef)
    .then((snapshot) => {
        console.log(snapshot);
        snapshot.docs.map(doc => {
            event = doc.data()
            event['_id'] = doc.id;
            console.log(event);
            events.push(event); 
       });
       console.log("Event array after events have been pushed"); 
       console.log(events);
       return events;
    })
    .catch((err) => {
        console.log('Error getting documents', err);
    });
}

module.exports = {
    regions: regions,
    events: events
};