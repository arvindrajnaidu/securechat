Securechat
==========

A secure chat that uses Deffie Hellman for key exchange and AES cryptography to encrypt messages.


Installation
------------

npm install

cd public
bower install

Start Server
-----

npm start

Test
----

npm test




Notes
-----
-----

Implemented
-----------

1) Diffie Hellman Key Exchange - A cool way to end up with private keys. The algorithm needs big primes to be secure, it was was way more fun than coding a PKI.

2) Standalone Mocha tests - npm install && npm test

3) Secure messaging - The users for now are ["You", "Me"] and they are in each other's contact list

4) File transfer - Transfers files using socketio streams. The test transfers a sample 1.8 mb


Not Done 
--------

1) Angular frontend.
2) iOS frontend.
3) SSL - (Easy should have done this :( )

I will be taking an extra week to finish the other 3 features.