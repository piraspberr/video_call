const express = require('express');
const next = require("next");
const dev = process.env.NODE_ENV !== "production";

const app1 = next({ dev });


const handle = app1.getRequestHandler();
app1.prepare().then(()=> {
    const app = express()
    const server = require('http').Server(app);
    const { v4: uuidv4} = require('uuid');
    const io = require('socket.io')(server); 
    const {ExpressPeerServer} = require('peer');

    const peerServer = ExpressPeerServer(server, {
        debug: true
    });
    app.use(express.static('public'));
    app.use('/peerjs', peerServer);

    app.set('view engine', 'ejs');

     


    app.get('/', (req, res) => {
        res.redirect(`/${uuidv4()}`);
    });

    app.get('/:room', (req, res) => {
        res.render('room', { roomId: req.param.room })
    });


    io.on('connection', socket => {
        socket.on('join-room', (roomId, userId) => {
            socket.join(roomId);
            socket.to(roomId).broadcast.emit('user-connected', userId);
            socket.on('message', message => {
                io.to(roomId).emit('createMessage', message)
            })
        })
    })

    server.listen(process.env.PORT || 3000, (err)=>{
        if(err) throw err;
        console.log("Server ready!");
    });

}).catch((ex)=>{
    console.error(ex.stack);
    process.exit(1)
})
