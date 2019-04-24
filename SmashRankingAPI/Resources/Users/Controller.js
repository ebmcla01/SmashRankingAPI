const admin = require('firebase-admin');
const ranking = require('../../Rankings');
const db = admin.firestore();
let usersRef = db.collection('Users');
let regionsRef = db.collection('Regions');


userController = {};

getUsers = async (req) => {
    const ref = db.collection("Users");
    let queryRef = ref;
    if (req.query.role) {
        queryRef = queryRef.where('role', '==', req.query.role);
    }
    if (req.query.region) {
        queryRef = queryRef.where('regionId', '==', req.query.region);
    }
    const users = [];
    const usersRef = await queryRef.get();
    for (userRef of usersRef.docs)  {
        const user = userRef.data();
        user.id = userRef.id; 
        console.log(userRef.id);
        user.ranks = []; 
        const ranksRef = await ref.doc(user.id).collection("Ranks").get();
        for ( rankRef of ranksRef.docs) {
            const rank = rankRef.data();
            rank.id = rankRef.id;
            user.ranks.push(rank);
        }
        users.push(user);
    }
    // console.log(users);
    return users;
}

userController.userList = async function(req, res) {
    

    try {
        //console.log(getUsers(req));
        users =  await getUsers(req);
        console.log(users);
    }
    catch (e) {
        console.log('Error getting users', e);
    }
    res.json(users);
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
    var regionRef = regionsRef.doc(req.body.regionId);

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

getOpponentScore = async (player) => {
    console.log("geting Opponent score ", player.id);
    const rankRef = db.collection("Users").doc(player.id).collection("Ranks").doc(player.rank.id)
    const rank = await rankRef.get();
    console.log("Opponent's score is ", rank.data().score);
    return rank.data().score;
}

getPlayerScore = async (params) => {
    console.log("getting player's score ", params.userId);
    const rankRef = db.collection("Users").doc(params.userId).collection("Ranks").doc(params.rankId);
    const rank = await rankRef.get();
    console.log("Player\'s score id ", rank.data().score);
    return rank.data().score;
}

userController.updateScore = async (req, res) => {
    console.log("Updating score");
    const now = new Date();
    const opponentScore = await getOpponentScore(req.body.opponent);
    const playerScore = await getPlayerScore(req.params);
    const newScore = ranking(playerScore, opponentScore, req.body.didWin);
    console.log(req.params.userId, " new score is ", newScore);
    // console.log(newScore);
    db.collection("Users").doc(req.params.userId).collection("Ranks")
        .doc(req.params.rankId)
        .update({
            score: newScore,
            lastUpdated: now.toISOString()
        })
        .then(() => {
            console.log(newScore.toString());
            res.send(newScore.toString());
        })
        .catch((err) => console.log(err));

    //Lets say we get a winner and loser object with id and rankId in req.body
    


    //Save to History collection
}

module.exports = userController;