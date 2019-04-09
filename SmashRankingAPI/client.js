var express = require('express');
var app = express();


var firebase = require('firebase');
var port = process.env.PORT || 3000;

// Initialize Firebase
var config = {
    apiKey: "AIzaSyAW8K-5Pq5QywrZCxEQWLq6rajCgclUOYg",
    authDomain: "elo-rankings-531a9.firebaseapp.com",
    databaseURL: "https://elo-rankings-531a9.firebaseio.com",
    projectId: "elo-rankings-531a9",
    storageBucket: "elo-rankings-531a9.appspot.com",
    messagingSenderId: "791422824537"
  };
  firebase.initializeApp(config);

  

app.listen(port, function () {
    firebase.auth().signInWithEmailAndPassword("ebmcla01@louisville.edu", "password");
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            user.getIdToken().then(function(idToken) {  // <------ Check this line
                console.log(idToken); // It shows the Firebase token now
             });
        }
        else {
            console.log("Sign-in failed");
        }
    });
    console.log('Running on PORT: ' + port);
});

app.get("/", )
