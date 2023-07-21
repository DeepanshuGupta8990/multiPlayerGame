const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server,{pingInterval: 2000, pingTimeout: 5000});

app.get("/",(req,res)=>{
    res.sendFile(__dirname+"/index.html");   
})

let interval;
const players = {};

io.on('connection',(socket)=>{ 
    console.log("New user connected");

    //sending player id to player
    socket.emit("connected",socket.id);

    players[socket.id] = {
        x: 500 * Math.random(),
        y: 500 * Math.random(),
        color: `hsl(${Math.floor(Math.random() * 360)}, 100%, 50%)`
    }

    console.log(players);

   //emitting updated players list to all users
   io.emit("updatedPlayer",players);

   //receiving projectiles update
   socket.on("creatingParticle",(obj)=>{
    io.sockets.sockets.forEach((clientSocket)=>{
        if(clientSocket.id !== socket.id){
            io.to(clientSocket.id).emit('enemyProjectile',obj)
        }
    })
   })

   //receiving playerMovement
   socket.on("playerMove",(obj)=>{ 
    // console.log(obj)
    io.sockets.sockets.forEach((clientSocket)=>{
        if(clientSocket.id !== socket.id){
            io.to(clientSocket.id).emit('playerMove',[obj,socket.id])
        }
    })
   })

   //nokeyPressed
//    socket.on('noKeyPressed',(data)=>{
//     console.log(data)
//     io.emit("noKeyPressed1",(data)=>{

//     })
//    })

    //collison detect
    socket.on("collisionDetect",(data)=>{
        console.log(data)
        io.emit("collisionDetect",data);
    })

    socket.on('disconnect', (reason) => {
        delete players[socket.id]
        io.emit('disConnectedPlayer',players)
        console.log('A user disconnected');
      });


})

server.listen(4500,()=>{
    console.log("the server is running on 4500 port")
})
