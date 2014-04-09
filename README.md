Securechat
==========

A secure chat that uses Deffie Hellman for key exchange and AES cryptography to encrypt messages.


Installation
------------

npm install
npm test

If you dont have bower
npm install bower -g

Go to public directory and bower install

Build
-----

Build test to run on browser
browserify test/chat.js -o public/test/chat.js

Start
-----
npm start

For browser based tests, go to http://localhost:3000/test/chat.html





