var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , ss = require('socket.io-stream')
  , fs = require('fs')
  , io = require('socket.io').listen(server);

var users = {}

server.listen(3000);

app.configure(function(){
  app.use(express.bodyParser());
  app.use(express.static(__dirname + '/public'));
});

io.sockets.on('connection', function (socket) {

  // User management
  socket.name = socket.handshake.query.name;  

  // File
  var ioStream = ss.createStream();

  // File handler
  ss(socket).on('action_upload', function(stream, data) {
    var filename = __dirname + "/uploads/" + data.filename;
    stream.pipe(fs.createWriteStream(filename));    

    // Handle getting a file
    stream.on('end', function(){
      var skt = io.sockets.socket(users[data.to].connectionId);

      // Emit uploaded
      ss(skt).emit('event_upload', users[data.to].ioStream, data);
      fs.createReadStream(filename).pipe(users[data.to].ioStream);
    }.bind(data));
  });

  // Roster
  users[socket.name] = {connectionId : socket.id, ioStream : ioStream};

  // Event Handling
  socket.on('action_send_message', function(payload){
    io.sockets.socket(users[payload.to].connectionId).emit('event_message', {from: socket.name, message: payload.message});
  });

  socket.on('action_handshake', function(payload){
    io.sockets.socket(users[payload.to].connectionId).emit('action_handshake', {from: socket.name, publicKey : payload.publicKey});
  });

});