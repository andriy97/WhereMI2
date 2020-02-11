var express = require('express');
const fs = require('fs');
var router = express.Router();
var server = express(); // better instead
// server.use('/', router);

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
// server.use(express.static(__dirname + '/media/HTML'));
// server.use(express.static(__dirname + '/media'));
// server.use('/', router);
// router.get('/', function(req, res) {
//   res.sendFile('/media/HTML/editor.html');
// });
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