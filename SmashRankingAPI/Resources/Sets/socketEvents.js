module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('User: ' + socket.user + ' has connected');

        createSet = (set) => {
            //Create Set here
            console.log(set);
            io.sockets.to(socket.id).emit("setCreated", "This will be the set id");
            socket.join("setId");
        }

        joinSet = (set) => {
            console.log(set);
            console.log('User: ' + socket.user + ' has joined set ' + setId);
            socket.join(set.id);
        }

        disconnect = () => {
            console.log('A user has disconnected');
        }

        socket.on('createSet', createSet);
        socket.on('joinSet', joinSet)
        socket.on('disconnect', disconnect);
    });
}