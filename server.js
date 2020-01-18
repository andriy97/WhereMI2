var express = require('express');
const fs = require('fs');
var server = express(); // better instead

//parsing del contenuto della richiesta 
var bodyParser = require('body-parser');
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({
  extended: true
}));
server.use(express.json());
server.use(express.urlencoded({
  extended: true
}));

server.use('/media', express.static(__dirname + '/media'));
server.use(express.static(__dirname + '/public'));
server.use('/config', express.static(__dirname + '/config'));

server.post('/config/general.json', function (req, res) {
  console.log(req.body);
  var body = JSON.stringify(req.body);
  fs.writeFile(__dirname + '/config/general.json', body, function (err) {
    if (err) {
      return console.log(err);
    }
    console.log("The file was saved!");

  });

});

server.listen(8000);