var httpVerbs = require('http-status-codes');
var admin = require('firebase-admin');

module.exports = {
    restAuth: restFirebaseAuth,
    socketAuth: socketFirebaseAuth
};

function restFirebaseAuth(req, res, next) {
    //return next for any paths meant to be public 
    //There will be none for this application since account creation is done via client

    if (!req.token) {
        console.log("Missing Bearer Token");
        return res.status(httpVerbs.UNAUTHORIZED).send("Missing Bearer Token");
    }

    else {
        admin.auth().verifyIdToken(req.token)
        .then(function(decodedToken) {
            var uid = decodedToken.uid;
            req.user = {id: uid, deity: decodedToken.deity, admin: decodedToken.admin};
            next();
        }).catch(function(err) {
            console.log("An error happened!");
            console.log(err);
            return res.status(httpVerbs.UNAUTHORIZED).send("Invalid Token");
        });
    }
}

function socketFirebaseAuth(socket, next) {
    const token = socket.handshake.query.token;

    if (!token) {
        console.log("Missing Bearer Token");
        return next(new Error('Authentication Error'));
    }

    else {
        admin.auth().verifyIdToken(req.token)
        .then(function(decodedToken) {
            var uid = decodedToken.uid;
            socket.user = {id: uid, admin: decodedToken.admin};
            next();
        }).catch(function(err) {
            console.log("An error happened!");
            console.log(err);
            return next(new Error('Authentication Error'))
        });
    }
}