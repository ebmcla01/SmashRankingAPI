
var httpVerbs = require('http-status-codes');

var admin = require('firebase-admin');
var db = admin.firestore();
var regionsRef = db.collection('Regions');



regionController = {}

regionController.regionList = function(req, res) {
    regions = [];
    console.log("Getting all regions");
    regionsRef.get()
        .then((snapshot) => {
            snapshot.docs.map((doc) => {
                region = doc.data();
                region.id = doc.id;
                regions.push(region);
            })
            res.send(regions);
        })
        .catch((err) => {
            console.log(err);
            res.status(404).end("Cannot get regions at this time");
        });
};

regionController.regionDetail = function(req, res) {
    regionsRef.doc(req.params.regionId).get()
        .then((doc) => {
            region = doc.data();
            region.id = doc.id;
            res.json(region);
        })
        .catch((err) => {
            console.log(err);
            res.status(404).end();
        });
}

regionController.updateRegion = function(req, res) {
    if (!(req.user.admin)) {
        res.status(httpVerbs.FORBIDDEN).send("User does not have sufficient priviledges");
    }
    regionsRef.doc(req.params.regionId).update(req.body)
        .then((data) => {
            console.log(data);
            res.send(data);
        })
        .catch((err) => {
            console.log(err);
            res.status(404).end("Region does not exist");
        });
    
}


module.exports = regionController;