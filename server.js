const express = require('express')
const socketIO = require('socket.io')
const http = require('http')
const cors = require('cors')

const {
  addUser,
  removeUser,
  getUser,
  getUsersInChannel,
  getChannels
} = require("./model/users.js")

const port = process.env.PORT || 4000


const app = express()
const server = http.createServer(app)
const io = socketIO(server)

const router = require('./router.js')
app.use(router)
app.use(cors())

io.on("connection", (socket) => {
  console.log("New connection");

  socket.on("join", ({ name, channel }, callback) => {
    console.log(name, channel);
    const {user, error} = addUser({
      id: socket.id,
      name: name, 
      channel: channel 
    })

    if (error) {
      return callback(error)
    }

    // socket.emit sends to just the current user
    socket.emit( 
      'message', 
      {
        user: "Bot", 
        text: `Hey there, ${user.name}! Welcome to the ${user.channel} channel. There are ${getUsersInChannel(user.channel).length} user(s) in this channel`
      }
    )

    //socket.to().emit sends to all other users except sender
    // socket.broadcast.to(user.channel).emit(
    socket.to(user.channel).emit(
      'message', 
      {
        user: "Bot", 
        text: `${user.name} has joined the ${user.channel} chat`
      }
    )

    socket.join(user.channel)

    io.emit("channelList", {activeChannels: getChannels()})

    io.to(user.channel).emit("channelData", {channel: user.channel, usersInChannel: getUsersInChannel(user.channel)})

    callback()
  })

  socket.on("retrieveChannels", () => {
    const channels = getChannels()
    socket.emit("channelList", {activeChannels: channels})
  })

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id)
    io.to(user.channel).emit(
      "message", 
      {
        user: user.name, 
        text: message
      }
    )

    // runs the callback function from client-side socket.emit
    // () => setMessage("")
    callback() 
  })



  socket.on("disconnect", () => {
    const user = removeUser(socket.id)

    if (user) {
      io.to(user.channel).emit(
        "message", 
        {
          user: "Bot", 
          text: `${user.name} has left the chat. ${getUsersInChannel(user.channel).length} user(s) still in the channel.`
        }
      )
      io.to(user.channel).emit(
        "channelData", 
        {
          channel: user.channel, 
          users: getUsersInChannel(user.channel)
        }
      )
    }
    console.log("Connection closed");
  })
})

server.listen(port, () => {
  console.log(`Listening on port ${port}`);
})