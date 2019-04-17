
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
                if (region.subregions) {
                    subregions = [];
                    for(i = 0; i < region.subregions.length; i++) {
                        subregion = {id: region.id + '-' + i, name: region.subregions[i]};
                        subregions.push(subregion);
                    }
                    region.subregions = subregions;
                }   
                regions.push(region);
            })
            if (regions.length > 0) res.send(regions);
            res.status(204).end();
        })
        .catch((err) => {
            console.log(err);
            res.status(404).end("Cannot get regions at this time.");
        });
};

regionController.regionDetail = function(req, res) {
    regionsRef.doc(req.params.regionId).get()
        .then((doc) => {
            region = doc.data();
            if (!region) res.status(204).end();
            region.id = doc.id;
            console.log(region);
            if (region.subregions) {
                subregions = [];
                for(i = 0; i < region.subregions.length; i++) {
                    subregion = {id: region.id + '-' + i, name: region.subregions[i]};
                    subregions.push(subregion);
                }
                region.subregions = subregions;
            }          
            res.json(region);
        })
        .catch((err) => {
            console.log(err);
            res.status(404).end();
        });
}

regionController.updateRegion = function(req, res) {
    if (!(req.user.admin || req.user.deity)) {
        res.status(httpVerbs.FORBIDDEN).send("User does not have sufficient priviledges");
    }
    regionsRef.doc(req.params.regionId).set(req.body, {merge: true})
        .then((data) => {
            console.log(data);
            res.send(data);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).end();
        });
    
}

regionController.deleteRegion = function(req, res) {
    if (!(req.user.admin || req.user.deity)) {
        res.status(httpVerbs.FORBIDDEN).send("User does not have sufficient priviledges");
    }

    regionsRef.doc(req.params.regionId).delete()
        .then(() => {
            res.status(httpVerbs.NO_CONTENT).end();
        })
        .catch((err) => {
            res.status(httpVerbs.NOT_FOUND).end();
        });
}

regionController.createRegion = function(req, res) {
    
    if (!(req.user.admin || req.user.deity)) {
        res.status(httpVerbs.FORBIDDEN).send("User does not have sufficient priviledges");
    }

    console.log("Creating new region");
    req.body.createdBy = req.user.id;
    regionsRef.add(req.body)
        .then((doc) => {
            res.status(httpVerbs.CREATED).send(doc.id);
        })
        .catch((err) => {
            res.status(httpVerbs.INTERNAL_SERVER_ERROR).send("Error creating region: ", err);
        });
}

module.exports = regionController;