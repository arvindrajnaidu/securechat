var ChatClient = require('../chatclient');
var sinon = require('sinon');
var chai = require('chai')
var assert = chai.assert;
var tempMessage = "We are upto no good";

describe('Securechat', function() {
  var me, you;  
  var myMessageSpy = sinon.spy();  
  var yourMessageSpy = sinon.spy();
  var yourUploadSpy = sinon.spy();

  before(function(done) {
    me = new ChatClient({ messageReceived : myMessageSpy, name: "Me", contacts: [{name: "You"}]});
    me.connect(function(){
      you = new ChatClient({ messageReceived : yourMessageSpy, uploadReceived: yourUploadSpy, name: "You", contacts: [{name: "Me"}]});  
      you.connect(done);
    });
  });

  after(function(done) {
    done();
  });

  describe('Key Exchange', function(){
    before(function(done){
      me.setupSecureConversation("You", done);
    });
    
    it('Our key should be the same', function(){     
      var myKeys = me.contacts[0].df.finalKeys;
      var yourKeys = you.contacts[0].df.finalKeys;
      for(i=0; i<myKeys.length;i++){
        assert.equal(myKeys[i].toString(), yourKeys[i].toString())
      }
    });
  });

  describe('Send Secure Message', function(){
    
    before(function(done){
      me.sendSecureMessage({to: "You", message: tempMessage});
      setTimeout(done, 100);
    });

    it('Should send a secure message', function(){      
      var encryptedMessage = yourMessageSpy.firstCall.args[0].message;
      assert.equal(you.decrypt.call(you, encryptedMessage, "Me"), tempMessage);
    })

  });

  describe('Send File', function(){
    
    before(function(done){
      me.sendFile({to: "You", filename: "test.wav"});
      setTimeout(done, 3000);
    });

    it('Should send a file', function(){      
      assert(you.uploadReceived.called);
    });

  });

  
});
