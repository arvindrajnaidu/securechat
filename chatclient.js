var CryptoJS = require("crypto-js");
var DF = require("./lib/diffieHellman");
var ss = require('socket.io-stream');
var fs = require('fs');

// Contact List Hack
var ChatClient = function (options) {

  this.contacts = options.contacts;  
  this.baseURL = options.baseURL || "http://localhost:3000";
  this.name = options.name;

  this.messageReceived = options.messageReceived;
  this.uploadReceived = options.uploadReceived;
  return this;
}

ChatClient.prototype.connect = function(cb){

  // Socket
  this.socket = require('socket.io-client').connect(this.baseURL + '?name=' + this.name, {
      transports: ['websocket'],
      'force new connection': true
  });

  this.socket.on('event_message', this.messageReceived);
  var that = this;

  // Handle upload event
  ss(this.socket).on('event_upload', function(stream, data) {    

    var filename = __dirname + "/downloads/" + data.filename;
    stream.pipe(fs.createWriteStream(filename));    
    stream.on('end', function(){
      that.uploadReceived(filename);
    }.bind(data));
  });

  this.socket.on('connect', cb);  

  // Stream
  this.stream = ss.createStream();

  this.contacts.forEach(function(contact){
    contact.df = new DF(that.socket, contact.name);
  })
}

ChatClient.prototype.setupSecureConversation = function(withUser, callback){
  this.contacts.filter(function(contact){
    return contact.name === withUser;
  })[0].df.getKey(callback);
}

ChatClient.prototype.sendSecureMessage = function(payload) {
  payload.message = this.encrypt(payload.message, payload.to);
  this.socket.emit('action_send_message', payload);
};

ChatClient.prototype.sendFile = function(payload) {
  ss(this.socket).emit('action_upload', this.stream, payload);
  fs.createReadStream(__dirname + "/fixtures/" + payload.filename).pipe(this.stream);
};


ChatClient.prototype.encrypt = function(paramStr, forUser){
  var key = this.contacts.filter(function(contact){
    return contact.name === forUser;
  })[0].df.getFinalKey();
  
  return CryptoJS.AES.encrypt(paramStr, key).toString();
};

ChatClient.prototype.decrypt = function(paramStr, forUser){
  var key = this.contacts.filter(function(contact){
    return contact.name === forUser;
  })[0].df.getFinalKey();

  return CryptoJS.AES.decrypt(paramStr, key).toString(CryptoJS.enc.Utf8);
};

module.exports = ChatClient;