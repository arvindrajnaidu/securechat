var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

var room = "test";
var users = {}

server.listen(3000);


app.configure(function(){
  app.use(express.bodyParser())
  app.use(express.static(__dirname + '/public'));
});

// io.configure(function(){
//   io.set ("authorization", function(handshakeData, accept){    
//     accept(null, true);
//   });
// });
  


io.sockets.on('connection', function (socket) {
  socket.name = socket.handshake.query.name;
  // skt = @io.sockets.socket(payload.connectionId)  
  users[socket.name] = socket.id;

  socket.on('action_send_message', function(payload){
    io.sockets.socket(users[payload.to]).emit('event_message', {from: socket.name, message: payload.message});
  });

  socket.on('action_handshake', function(payload){
    io.sockets.socket(users[payload.to]).emit('action_handshake', {from: socket.name, publicKey : payload.publicKey});
  });

});