var admin = require('firebase-admin');
var db = admin.firestore();

module.exports = (io) => {
    io.on('connection', (socket) => {
        createSet = (set) => {
            console.log('create');
            setsRef = db.collection("Events").doc(set.eventId).collection("Sets");
            setsRef.add({ bestOf: set.bestOf, players: [socket.user.id]})
                .then((doc) => {
                    console.log('docid: ' + doc.id);
                    io.sockets.to(socket.id).emit("setCreated", doc.id);
                    socket.join(doc.id);
                })
                .catch((err) => {
                    console.log(err);
                    io.sockets.to(socket.id).emit("errorCreatingSet", "Event does not exist");
                });
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
            setRef.update({
                players: admin.firestore.FieldValue.arrayUnion(socket.user.id)
            }).then(() => {
                setRef.get().then(doc => {
                    // doc.data().players.forEach(player => {
                    const joiner = doc.data().players[0] === socket.user.id ? doc.data().players[0] : doc.data().players[1];
                    const creator = doc.data().players[0] === socket.user.id ? doc.data().players[1] : doc.data().players[0];
                    console.log(joiner);
                    console.log(creator);

                    db.collection("Users").doc(joiner).collection("Ranks").get().then(ranks => {
                        let playerRanks = null;
                        playerRanks = ranks.docs.map(doc => {
                            var newRank = doc.data();
                            newRank.id = doc.id;
                            return newRank;
                        });
                        set.joiner = { id: socket.user.id, 
                                       displayName: socket.user.displayName, 
                                       rank: playerRanks };

                        db.collection("Users").doc(creator).collection("Ranks").get().then(ranks => {
                            playerRanks = null;
                            playerRanks = ranks.docs.map(doc => {
                                var newRank = doc.data();
                                newRank.id = doc.id;
                                return newRank;
                            });
                            set.creator = { rank: playerRanks };
                            console.log(set);
                            io.to(set.setId).emit('setJoined', set);
                        }).catch(err => console.log(err));
                    }).catch(err => console.log(err));
                }).catch(err => console.log(err)); // end setRef.get
            }).catch(err => console.log(err)); // end setRef.update
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
        socket.on('chooseCharater', chooseCharacter);
        socket.on('removeStage', removeStage);
        socket.on('chooseRank', chooseRank);
    });
}