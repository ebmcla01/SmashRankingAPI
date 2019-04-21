var admin = require('firebase-admin');
var db = admin.firestore();
var usersRef = db.collection('Users');
var regionsRef = db.collection('Regions');

userController = {};

userController.userList = function(req, res) {
    var users = [];
    if (req.query.role) {
        usersRef = usersRef.where('role', '==', req.query.role);
    }
    if (req.query.regionId) {
        usersRef = usersRef.where('region.id', '==', req.query.regionId);
    }
    usersRef.get()
        .then((snapshot) => {
            snapshot.docs.map((doc) => {
                user = doc.data();
                user.id = doc.id;
                users.push(user);
            });
            res.json(users);
        })
        .catch((err) => {
            console.log(err);
            res.status(404).send("Users do not exist");
        })
};

userController.userDetail = function(req, res) {
    userRef = usersRef.doc(req.params.userId);
    userRef.get()
        .then((snapshot) => {
            var user = snapshot.data();
            user.id = snapshot.id;
            user.ranks = [];
            userRef.collection("Ranks").get()
                .then((snapshot) => {
                    snapshot.docs.map((doc) => {
                        rank = doc.data();
                        rank.id = doc.id;
                        user.ranks.push(rank);
                    });
                    res.json(user);
                })
                .catch((err) => {
                    console.log(err);
                });
            
        })
        .catch((err) => {
            console.log(err);
            res.status(404).send("User does not exist");
        })
};

userController.updateUser = function(req, res) {
    if (req.body.role && !(req.user.admin || req.user.deity)) {
        res.status(403).send("User does not have sufficient priviledges");
    }
    else if (req.body.role) {
        var role = req.body.role == "admin" ? true : null;
        admin.auth().setCustomUserClaims(req.user.id, {admin: role}).then(() => {
            console.log('User given admin role');});
    }
    else if (!(req.params.userId == req.user.id)) {
        res.status(403).send("User does not have sufficient priviledges");
    }
    userRef = usersRef.doc(req.params.userId);

    if (req.body.regionId) {
        var regionId = res.body.regionId;
        delete res.body.regionId
        var regionSplit = regionId.split("-");
        var regionRef = regionsRef.doc(regionSplit[0])

        regionRef.get()
            .then((snapshot) => {
                var region = snapshot.data();
                req.body.region = {id: regionSplit[0], name: region.name};
                if (regionSplit[1]) { 
                    req.body.region.subregion = region.subregions[regionSplit[1]];
                }
                userRef.update(req.body)
                    .then(() => {
                        res.status(204).end();
                    })
                    .catch((err) => {
                        console.log(err);
                        res.status(404).send("User does not exist");
                    })
            })
            .catch((err) => {
                console.log(err);
                res.status(404).send("Region does not exist");
            });  
    }
    else {
        userRef.update(req.body)
                    .then(() => {
                        res.status(204).end();
                    })
                    .catch((err) => {
                        console.log(err);
                        res.status(404).send("User does not exist");
                    })
    }
};

userController.deleteUser = function(req, res) {
    if (!(req.user.admin || req.user.deity || req.user.id == req.params.userId)) {
        res.status(httpVerbs.FORBIDDEN).send("User does not have sufficient priviledges");
    }
    userRef = usersRef.doc(req.params.userId);
    userRef.update({
        isActive: false
    })
    .then((update) => {
        res.status(204).end();
    })
    .catch((err) => {
        console.log(err);
        res.status(404).send("User does not exist");
    })
    
};

userController.createUser = function(req, res) {
    console.log("Creating new user");
    var regionId = req.body.regionId;
    var primary = req.body.primaryCharacter;
    delete req.body.regionId;
    delete req.body.primaryCharacter;
    var regionSplit = regionId.split("-");
    req.body.dateJoined = Date.now();
    req.body.role = "Player";
    req.body.isActive = true;
    var regionRef = regionsRef.doc(regionSplit[0])

    regionRef.get()
        .then((snapshot) => {
            var region = snapshot.data();
            req.body.region = {id: regionSplit[0], name: region.name};
            if (regionSplit[1]) { 
                req.body.region.subregion = region.subregions[regionSplit[1]];
            }
            userRef = usersRef.doc(req.user.id);
            userRef.get()
                .then((user) => {
                    if (user.exists) {
                        res.status(409).send("User already exists")
                    }
                });
            userRef.set(req.body)
                .then((doc) => {
                    userRef.collection("Ranks").doc('1').set(
                        {
                            character: primary,
                            score: 100,
                            lastUpdated: req.body.dateJoined
                        }
                    )
                    .then((rank) => {
                        res.status(201).send(doc.id);
                    })
                    .catch((err) => {
                        console.log(err);
                        res.status(500).send("Error adding rank");
                    })
                    
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).send("Error adding User");
                });
        })
        .catch((err) => {
            console.log(err);
            res.status(404).send("Region does not exist");
        });  
};

module.exports = userController;