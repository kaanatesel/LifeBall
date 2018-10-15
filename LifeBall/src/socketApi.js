const socketio = require('socket.io');
const io = socketio();

const socketApi = {};
socketApi.io = io;

//Helpers
const randomColor = require('../bower_components/helpers/randomColor')

const users = {}

io.on('connection', (socket) => {
    console.log('New user has get in')
    socket.on('userName', (data) => {
        const defultData = {
            id: socket.id,
            position: {
                x: 0,
                y: 0,
            },
            color: randomColor(),

        }

        const userData = Object.assign(data, defultData)
        users[socket.id] = userData;
        socket.broadcast.emit('userName', users[socket.id])
        socket.emit('initplayers', users)
    })

    socket.on('disconnect', () => {
        socket.broadcast.emit('DisUser', users[socket.id]);
        delete users[socket.id];
        console.log(users);
    })

    socket.on('animate', (data) => {
        try{
            users[socket.id].position.x = data.x
            users[socket.id].position.y = data.y
            socket.broadcast.emit('animate', {
                socketId: socket.id,
                x: data.x,
                y: data.y
            })
        }catch(e){
            console.log(e)
        }

       
    })

    socket.on('newMessage', data => {
        const messageData = Object.assign({socketId:socket.id},data)
        socket.broadcast.emit('newMessage',messageData )
    })

})

module.exports = socketApi;