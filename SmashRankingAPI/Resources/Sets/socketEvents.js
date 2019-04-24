var admin = require('firebase-admin');
var db = admin.firestore();

module.exports = (io) => {
    io.on('connection', (socket) => {

        createSet = (set) => {
            console.log('create');
            db.collection('Users').doc(socket.user.id).get()
                .then(doc => {
                    setsRef = db.collection("Events").doc(set.eventId).collection("Sets");
                    setsRef.add({ bestOf: set.bestOf, challenger: {id: socket.user.id, displayName: doc.data().displayName}})
                        .then((doc) => {
                            console.log('docid: ' + doc.id);
                            io.sockets.to(socket.id).emit("setCreated", doc.id);
                            socket.join(doc.id);
                        })
                        .catch((err) => {
                            console.log(err);
                            io.sockets.to(socket.id).emit("errorCreatingSet", "Event does not exist");
                        });
                })
            
        }

        pickWinner = (set) => {
            console.log(set.winner + " choosen as winner");
            io.sockets.to(set.setId).emit("winnerPicked", {user: socket.user.id, winner: set.winner});
        }

        confirmWinner = (set) => {
            //set.confirmation should be a bool
            console.log(set.confirmation);

            io.sockets.to(set.setId).emit("winnerConfirmed", {user: socket.user.id, confirmed: set.confirmation});

        }
        
        chooseCharacter = (set) => {
            console.log("Player chose ", set.character);
            //Get rank of chosen character for player
            //save rank to socket
            io.to(set.setId).emit("characterChosen", {id: socket.user.id, character: set.character});
            
        }

        chooseRank = (set) => {
            console.log("Player chose rank ", set.rank);
            io.to(set.setId).emit("rankChosen", {id: socket.user.id, rank: set.rank});
        }

        joinSet = (set) => {
            socket.join(set.setId);
            setRef = db.collection("Events").doc(set.eventId).collection("Sets").doc(set.setId);
            db.collection("Users").doc(socket.user.id).get()
            .then((doc) => {
                user = doc.data();
                const opponent = {id: socket.user.id, displayName: user.displayName};
                setRef.update({
                    opponent: opponent
                }).then(() => {
                    setRef.get().then(doc => {
                        // doc.data().players.forEach(player => {
                        const challenger = doc.data().challenger;
                        // const joiner = doc.data().players[0] === socket.user.id ? doc.data().players[0] : doc.data().players[1];
                        // const creator = doc.data().players[0] === socket.user.id ? doc.data().players[1] : doc.data().players[0];
                        // console.log(joiner);
                        // console.log(creator);
                       
                        db.collection("Users").doc(opponent.id).collection("Ranks").get().then(ranks => {
                            let playerRanks = null;
                            playerRanks = ranks.docs.map(doc => {
                                var newRank = doc.data();
                                newRank.id = doc.id;
                                return newRank;
                            });
                            opponent.ranks = playerRanks;
                            // set.joiner = { id: socket.user.id, 
                            //                displayName: socket.user.displayName, 
                            //                rank: playerRanks };
    
                            db.collection("Users").doc(challenger.id).collection("Ranks").get().then(ranks => {
                                playerRanks = null;
                                playerRanks = ranks.docs.map(doc => {
                                    var newRank = doc.data();
                                    newRank.id = doc.id;
                                    return newRank;
                                });
                                challenger.ranks = playerRanks;
                                // set.creator = { id: challenger.id,
                                //                 displayName: challenger.displayName,
                                //                 rank: playerRanks };
                                set.joiner = opponent;
                                set.creator = challenger;
                                console.log(set);
                                io.to(set.setId).emit('setJoined', set);
                            }).catch(err => console.log(err));
                        }).catch(err => console.log(err));
                    }).catch(err => console.log(err)); // end setRef.get
                }).catch(err => console.log(err)); // end setRef.update
            }).catch(err => console.log(err));
            
        }

        removeStage = (set) => {
            io.to(set.setId).emit("stageBanned", set.stage);
        }

        disconnect = () => {
            console.log('\ndisconnection -------');
            console.log(Object.keys(io.sockets.sockets))
        }

        socket.on('createSet', createSet);
        socket.on('joinSet', joinSet)
        socket.on('disconnect', disconnect);
        socket.on('chooseCharacter', chooseCharacter);
        socket.on('removeStage', removeStage);
        socket.on('chooseRank', chooseRank);
        socket.on('pickWinner', pickWinner);
        socket.on('confirmWinner', confirmWinner);
    });
}