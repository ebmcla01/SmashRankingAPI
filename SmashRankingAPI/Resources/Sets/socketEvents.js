var admin = require('firebase-admin');
var db = admin.firestore();

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('User: ' + socket.user.id + ' has connected');

        createSet = (set) => {
    
            setsRef = db.collection("Events").doc(set.eventId).collection("Sets");
            delete set.eventId;
            setsRef.add({ setId: set.bestOf})
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

        joinSet = (set) => {
            console.log(set);
            console.log('User: ' + socket.user + ' has joined set ' + set.setId);
            socket.join(set.setId);
        }

        disconnect = () => {
            console.log('A user has disconnected');
        }

        socket.on('createSet', createSet);
        socket.on('joinSet', joinSet)
        socket.on('disconnect', disconnect);
    });
}