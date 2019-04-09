var httpVerbs = require('http-status-codes');
var admin = require('firebase-admin');

module.exports = firebaseAuth;

function firebaseAuth(req, res, next) {
    //return next for any paths meant to be public 
    //There will be none for this application since account creation is done via client

    if (!req.token) {
        console.log("Missing Bearer Token");
        return res.status(httpVerbs.UNAUTHORIZED).json({message: "Missing Bearer Token"});
    }

    else {
        admin.auth().verifyIdToken(req.token).then(function(decodedToken, claims) {
            console.log(claims);
            var uid = decodedToken.uid;
            console.log('User Id: ' + uid);
           // admin.auth().setCustomUserClaims(uid, {deity: true}).then(() => {
             //   console.log('Probably success?');});
        }).catch(function(err) {
            console.log(err);
        });
        admin.auth().verifyIdToken(req.token).then((claims) => {
            console.log(claims);
        });
        console.log("Bearer Token Provided");
        next();
        //TODO: Authentication
    }
};