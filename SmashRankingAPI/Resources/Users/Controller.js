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
        usersRef = usersRef.where('region', '==', req.query.region);
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
    if (req.body.role && !req.user.admin) {
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
        var regionRef = regionsRef.doc(req.body.regionId);

        regionRef.get()
            .then((doc) => {
               if (!doc.exists) {
                   res.status(404).send("Region does not exist");
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
    .then(() => {
        res.status(204).end();
    })
    .catch((err) => {
        console.log(err);
        res.status(404).send("User does not exist");
    })
    
};

userController.createUser = function(req, res) {
    console.log("Creating new user");
    var primary = req.body.primaryCharacter;
    delete req.body.primaryCharacter;
    req.body.dateJoined = admin.firestore.Timestamp.fromMillis(Date.now());
    req.body.role = "Player";
    req.body.isActive = true;
    var regionRef = regionsRef.doc(req.body.regionId)
    // console.log(req.body.displayName);
    // claims = {displayName: req.body.displayName};
    // console.log(claims);
    // console.log(req.user.id);
    // admin.auth().setCustomUserClaims(req.user.id, claims).then(() => {
    //     console.log('User given display name');
    // }).catch(err => console.log(err));

    regionRef.get()
        .then((doc) => {
            if (!doc.exists) {
                res.status(404).send("Region does not exist");
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
                    userRef.collection("Ranks").add(
                        {
                            character: primary,
                            slotNumber: 1,
                            score: 100,
                            lastUpdated: req.body.dateJoined
                        }
                    )
                    .then(() => {
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

userController.createRank = (req, res) => {
    if ((!req.user.id == req.params.userId)) {
        res.status(403).send("User does not have sufficient privledges");
    }
    ranksRef = usersRef(req.params.userId).collection('Ranks');
    ranksRef.add(req.body)
        .then(doc => {
            res.status(201).send(doc.id);
        })
        .catch(err => {
            console.log(err);
            res.status(500).send("Error adding document");
        });
}

module.exports = userController;