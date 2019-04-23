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

        chooseCharacter = (set) => {
            console.log("Player chose ", set.character);
            io.to(set.setId).emit("characterChosen", set.character);
        }

        joinSet = (set) => {
            player = {id: socket.user.id};
            socket.join(set.setId);
            //Join the player in the database toooooooo
            io.to(set.setId).emit("setJoined", player);
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