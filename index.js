//require express,socketio
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
//require cors
const cors = require("cors");
//user functions
const { addUser, removeUser, getUser, getUsersInRoom } = require("./users");

//routes controller
const router = require("./router");
const app = express();
//server create
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

//socket io setup with express server
const io = socketio(server, {
  cors: {
    origin: "https://baat-chit.netlify.app",
    // origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

//cors middleware
app.use(cors());

//routes middleware
app.use(router);

//socket io event listerner for new connection
io.on("connect", (socket) => {
  console.log("New user connected with id: ", socket.id);

  /*-----event listeners for this socket connection are below-----*/

  //join event handler
  socket.on("join", ({ name, room }, callback) => {
    console.log(name, room);
    //try to add user
    const { error, user } = addUser({ id: socket.id, name, room });
    //if there is error return callback to frontend with that error
    //i.e Username is already taken
    if (error) return callback(error);
    /* if there is no error and user is added, add this user to specified room
    using socket.join. NOTE: this is a socket built in method to create a arbitrary 
    channel than each individual socket to join.it is used to broadcast events
    to specific subset arbitrary channel */

    socket.join(user.room);
    // emit event for message when admin joins the rooms
    socket.emit("message", {
      user: "admin",
      text: `Hi ${user.name}, Welcome to the room ${user.room}`,
    });
    //broadcast joined message to all users of this room
    socket.broadcast
      .to(user.room)
      .emit("message", { user: "admin", text: `${user.name}, has joined!` });

    //send data about users in the room to everybody in this room
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
    //callback without error
    callback();
  });

  // socket.on("reconnect_attempt", () => {
  //   console.log("reconnect");
  // });

  //send message event handler
  socket.on("sendMessage", (message, callback) => {
    //get user
    const user = getUser(socket.id);
    //emit an event for new message in this room
    io.to(user.room).emit("message", { user: user.name, text: message });
    callback();
  });

  // socket.on("typing", (name) => {
  //   //get user
  //   const user = getUser(socket.id);
  //   //emit an event for new message in this room
  //   io.to(user.room).emit("message", { user: "user", text: "name" });
  // });

  //for disconnect event
  socket.on("disconnect", () => {
    console.log("User has left with id: ", socket.id);
    //remove user from users array with it socket id
    const user = removeUser(socket.id);
    if (user) {
      // if user is removed successfully emit message to everyone in this room
      io.to(user.room).emit("message", {
        user: "admin",
        text: `${user.name}, has left!`,
      });
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`server started on port: ${PORT}`);
});
