var ChatClient = require('../chatclient');
var sinon = require('sinon');
var chai = require('chai')
var assert = chai.assert;
var tempMessage = "We are upto no good";

describe('Securechat', function() {
  var me, you;  
  var myMessageSpy = sinon.spy();  
  var yourMessageSpy = sinon.spy();

  before(function(done) {
    me = new ChatClient({ messageReceived : myMessageSpy, name: "Me"});
    me.connect(function(){
      you = new ChatClient({ messageReceived : yourMessageSpy, name: "You" });  
      you.connect(done);
    });
  });

  after(function(done) {
    done();
  });

  describe('Key Exchange', function(){
    before(function(done){
      me.shakeHand("You");
      setTimeout(done, 500);
    });
    
    it('Our key should be the same', function(){          
      assert.equal(me.ourKey, you.ourKey);
    });
  });

  describe('Send Secure Message', function(done){
    
    before(function(done){
      me.sendSecureMessage({to: "You", message: tempMessage});
      setTimeout(done, 100);
    });

    it('Should send a secure message', function(){      
      var encryptedMessage = yourMessageSpy.firstCall.args[0].message;
      assert.equal(you.decrypt.call(you, encryptedMessage, "Me"), tempMessage);
    })

  });
  
});
