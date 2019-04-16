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
            var uid = decodedToken.uid;
            req.user = {id: uid, deity: decodedToken.deity, admin: decodedToken.admin};
            next();
          
            //Leaving for reference for now
          
            // admin.auth().setCustomUserClaims(uid, {deity: true}).then(() => {
             //   console.log('Probably success?');});
        }).catch(function(err) {
            console.log("An error happened!");
            console.log(err);
            return res.status(httpVerbs.UNAUTHORIZED).json({message: "Invalid Token"});
        });
        //Leaving for reference for now.

        //admin.auth().verifyIdToken(req.token).then((claims) => {
         //   console.log(claims);
        //});
        console.log("Bearer Token Provided");
    }
};