var admin = require('firebase-admin');
var db = admin.firestore();

module.exports = (io) => {
    io.on('connection', (socket) => {
        createSet = (set) => {
            console.log('create');
            setsRef = db.collection("Events").doc(set.eventId).collection("Sets");
            setsRef.add({ bestOf: set.bestOf})
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

        availableCharacters = (set) => {

        }
        
        chooseCharacter = (set) => {
            console.log("Player chose ", set.character);
            //Get rank of chosen character for player
            //save rank to socket
            io.to(set.setId).emit("characterChosen", set.character);
            
        }

        joinSet = (set) => {
            player = {id: socket.user.id};
            socket.join(set.setId);

            console.log("Joining set");
            setRef = db.collection("Events").doc(set.eventId).collection("Sets").doc(set.setId);
            setRef.update({
                players: admin.firestore.FieldValue.arrayUnion(socket.user.id)
            }).then(() => {
                db.collection('Users').doc(player.id).collection("Ranks").get()
                    .then(snapshot => {
                        ranks = [];
                        snapshot.map(doc => {
                            rank = doc.data()
                            rank.id = doc.id;
                            ranks.push(rank);
                        });
                        player.ranks = ranks;
                        io.to(set.setId).emit("setJoined", player);
                    })
                    .catch(err => {
                        console.log(err);
                        //Error handing
                    });
                
            })
            .catch((err) => {
                console.log(err);
            });
            
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
    });
}