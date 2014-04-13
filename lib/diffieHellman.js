var BigNumber = require('./bignumber')

var publicPrime = new BigNumber("2691119");
var publicBase = new BigNumber("2");

var async = require('async');

function getRandom(){
  return new BigNumber(Math.floor((Math.random()*100)+1));
}


// Determines a common key by doing a Diffie Hellman Key Exchange.
// Although of slight importance, it performs the handshake repeatedly until the a large set of common keys are found (15)

var DiffieHellman = function (socket, withUser) {
  this.starter = false;
  this.socket = socket;
  this.withUser = withUser;
  this.privateKeys = [];
  this.finalKeys = [];
  this.socket.on('action_handshake', this.handleShakeHand.bind(this));
}

// Call to establish 
DiffieHellman.prototype.getKey = function(callback){
  // Keep shaking hands until you both have 15 common keys
  async.whilst(
      function () { return this.finalKeys.length < 5 }.bind(this),
      function(callback){
        this.shakeHand(callback);
      }.bind(this),
      function (err) {
          callback();
      }
  );
}

// Flatten the keys array
DiffieHellman.prototype.getFinalKey = function(callback){
  var retStr = "";
  this.finalKeys.forEach(function(key){
    retStr = retStr + key.toString();
  });
  return retStr;
}

// Start off handshaking
DiffieHellman.prototype.shakeHand = function(callback){
  this.callback = callback;
  this.starter = true;  

  // Create a private key  
  var privateKey = getRandom();
  this.privateKeys.push(privateKey);

  // Create a public key  
  var publicKey = publicBase.pow(privateKey).mod(publicPrime);
  this.socket.emit("action_handshake", {to: this.withUser, publicKey : publicKey.toString()});
}

// Handle a handshake request
DiffieHellman.prototype.handleShakeHand = function(payload){  

  var receivedPublicKey = new BigNumber(payload.publicKey);

  // If you started the handshake
  if(this.starter){
    var currentPrivateKey = this.privateKeys[this.privateKeys.length-1];
    this.finalKeys.push (receivedPublicKey.pow(currentPrivateKey).mod(publicPrime));      
    this.starter = false;
    this.callback();
  } else {    
    // Record the final key
    var privateKey = getRandom();
    this.privateKeys.push (privateKey);    
    this.finalKeys.push (receivedPublicKey.pow(privateKey).mod(publicPrime));          

    // Send your public key
    var publicKey = publicBase.pow(privateKey).mod(publicPrime);
    // This action is now done in response
    this.socket.emit("action_handshake", {to: this.withUser, publicKey : publicKey.toString()});
  }
}

module.exports = DiffieHellman;