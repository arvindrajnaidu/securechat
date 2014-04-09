var CryptoJS = require("crypto-js");

var publicPrime = 15486173;
var publicBase = 5;
  
function discrete_exp(t,u,n) {   
// args are base, exponent, modulus
// computes s = (t ^ u) mod n
// (see Bruce Schneier's book, _Applied Cryptography_ p. 244)
  var s = 1;
  while (u) { 
    if (u&1) {
      s = (s*t) % n
    }; 
    u >>= 1; 
    t = (t*t)%n; 
  };
  return s;
}

var ChatClient = function (options) {
  this.keys = {};
  this.baseURL = options.baseURL || "http://localhost:3000";
  this.privateKey = Math.floor((Math.random()*1000000)+1);
  this.publicKey = discrete_exp(5, this.privateKey, 15486173);  
  this.name = options.name;
  this.messageReceived = options.messageReceived;
  return this;
}

ChatClient.prototype.connect = function(cb){
  this.socket = require('socket.io-client').connect(this.baseURL + '?name=' + this.name, {
      transports: ['websocket'],
      'force new connection': true
  });

  this.socket.on('event_message', this.messageReceived);
  this.socket.on('action_handshake', this.handleShakeHand.bind(this));
  this.socket.on('connect', cb);  
}

ChatClient.prototype.shakeHand = function(withUser){
  this.socket.emit("action_handshake", {to: withUser, publicKey : this.publicKey});
}

ChatClient.prototype.handleShakeHand = function(payload){

  if(!this.keys[payload.from]){

    var ourKey = discrete_exp(payload.publicKey, this.privateKey, 15486173).toString();
    this.keys[payload.from] = ourKey;

    this.shakeHand(payload.from);
  }
}

ChatClient.prototype.sendSecureMessage = function(payload) {
  payload.message = this.encrypt(payload.message, payload.to);
  this.socket.emit('action_send_message', payload);
};

ChatClient.prototype.encrypt = function(paramStr, forUser){
  return CryptoJS.AES.encrypt(paramStr, this.keys[forUser]).toString();
};

ChatClient.prototype.decrypt = function(paramStr, forUser){
  return CryptoJS.AES.decrypt(paramStr, this.keys[forUser]).toString(CryptoJS.enc.Utf8);
};


module.exports = ChatClient;