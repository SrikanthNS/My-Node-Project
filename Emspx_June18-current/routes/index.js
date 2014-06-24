var express = require('express');
var router = express.Router();
var app = express();

exports.index = app.get('/', function(req, res) {
	
    res.send('respond with a resource');
});