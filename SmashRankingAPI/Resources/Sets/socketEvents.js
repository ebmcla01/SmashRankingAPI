var admin = require('firebase-admin');
var db = admin.firestore();

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('User: ' + socket.user.id + ' has connected');

        createSet = (set) => {
    
            setsRef = db.collection("Events").doc(set.eventId).collection("Sets");
            setsRef.add({ bestOf: set.bestOf})
                .then((doc) => {
                    io.sockets.to(socket.id).emit("setCreated", doc.id);
                    socket.join(doc.id);
                })
                .catch((err) => {
                    console.log(err);
                    io.sockets.to(socket.id).emit("errorCreatingSet", "Event does not exist");
                });
            console.log(set);
            
        }

        chooseCharacter = (set) => {
            console.log("Player chose ", set.character);
            io.to(set.setId).emit("characterChosen", set.character);
        }

        joinSet = (set) => {
            console.log(set);
            player = {id: socket.user.id};
            console.log('User: ' + socket.user.id + ' has joined set ' + set.setId);
            socket.join(set.setId);
            //Join the player in the database toooooooo
            io.to(set.setId).emit("setJoined", player);
        }

        removeStage = (set) => {
            console.log('Remove stage: ', set.stage);
            io.to(set.setId).emit("stageBanned", set.stage);
        }

        disconnect = () => {
            console.log('A user has disconnected');
        }

        socket.on('createSet', createSet);
        socket.on('joinSet', joinSet)
        socket.on('disconnect', disconnect);
        socket.on('chooseCharater', chooseCharacter);
        socket.on('removeStage', removeStage);
    });
}