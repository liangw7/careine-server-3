var express = require('express');

var app = express();

//let http = require('http').Server(app);
//var io = require('socket.io');
var mongoose = require('mongoose');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cors = require('cors');
const mysql = require('mysql');
const fs = require('fs');
var server = require('http').createServer(app);
let io = require("socket.io")(server);

var helmet = require('helmet');
var databaseConfig = require('./config/database');
var router = require('./app/routes');
//socket connection
var ExpressPeerServer = require('peer').ExpressPeerServer;

const mc = mysql.createConnection({
    host: 'bj-cdb-qcpjo1zh.sql.tencentcdb.com',
    user: 'AIoT',
    port: '63182',
    password: 'aiot3767',
    database: 'AxiDB'
});
const mc_2 = mysql.createConnection({
    host: 'bj-cdb-qcpjo1zh.sql.tencentcdb.com',
    user: 'AIoT',
    port: '63182',
    password: 'aiot3767',
    database: 'AxiService'
});
mc.connect();
mc_2.connect();
//mongoose.connect('mongodb://careline:alex2005@ds040017.mlab.com:40017/careline');
console.log('mongo connecting...',process.env.MONGO_ATLAS_PW);
mongoose.connect(databaseConfig.url);
// mongoose.connect('mongodb://careline-db:dd1b871b-f747-4dbe-a355-e9ecebdc4fa2@https://careline-db.documents.azure.com:443');
var conn = mongoose.connection;

var Grid = require('gridfs-stream');
Grid.mongo = mongoose.mongo;


/* http.createServer(app, function (request, response) {
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.end('Hello World\n');
    let io = socketIO(app);
io.on('connection', (socket) => {
        console.log('user connected');
        socket.on('new-message', (message) => {
            console.log(message);
          });
    });
 }).listen(process.env.PORT || 8080);*/
 //const express  = require('express');
 //const app      = express();
 //const server   = app.listen(8080); // or whatever port you want
 

 //const server = http.createServer(app);

 /*const io = require("socket.io")(server);
 io.origins((origin, callback) => {
    if (origin !== 'https://www.digitalbaseas.com') {
        return callback('origin not allowed', false);
    }
    callback(null, true);
  });
 io.on("connection", () => {
     console.log("Connected!");
 });*/

 
io.on("connection", socket => {
  // Log whenever a user connects
  console.log("user connected");

  // Log whenever a client disconnects from our websocket server
  socket.on("disconnect", function() {
    console.log("user disconnected");
  });

  // When we receive a 'message' event from our client, print out
  // the contents of that message and then echo it back to our client
  // using `io.emit()`
  //on stands for recerive message, emit stands for send message
  socket.on("add-message", message => {
    console.log("Message Received: " + message);
    io.emit("message", { type: "new-message", text: message });
  });
});
// server.listen(8080);

server.listen(8080, () => {
    console.log('started on port 8080');
  });

const options = {
    debug: true,
    path: '/ws/'
}
const peerserver = ExpressPeerServer(server, options);
peerserver.on('connection', (client) => {
    console.log ('peer server connected')  });
peerserver.on('disconnect', (client) => { 
   console.log ('peer server disconnected') });
app.use(options.path, peerserver);

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));
app.use(logger('dev')); // Log requests to API using morgan
app.use(cors());

app.use(helmet.hsts({
    maxAge: 31536000000,
    includeSubDomains: true,
    force: true
}));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  app.get('/hello', function (req, res) {

  
    res.send('hello world');


});
  
app.get('/AxiDB/AxiDevice', function (req, res) {
  
    mc.query('SELECT * FROM AxiDevice', function (error, results, fields) {
      
        if (error) throw error;
        return res.send({ error: false, data: results, message: 'Todos list.' });
    });
  
});

app.post('/AxiDB/deviceValue', function (req, res) {

    var userID =req.body.userID
  
    mc.query('SELECT * FROM '+userID, function (error, results, fields) {
     
        if (error) throw error;
        return res.send({ error: false, data: results, message: 'Todos list.' });
    });
    
});
app.post('/AxiDB/deviceValueByDevice', function (req, res) {

    var userID =req.body.userID;
    var devices=req.body.devices;
    var deviceList=[];
    for (let device of devices){
            deviceList.push("'"+device.ID+"'");
    }
    console.log ('deviceList', deviceList)
 
    var query="SELECT * FROM "+userID+" where deviceID in ("+ deviceList +")";
  
     
     console.log ('query', query);

    mc.query(query, function (error, results, fields) {
     
        if (error) throw error;
        return res.send({ error: false, data: results, message: 'Todos list.' });
    });
    
});

app.post('/AxiDB/deviceValueByDeviceByFilter', function (req, res) {

    var query =req.body.query;
   console.log ('query', query);

    mc.query(query, function (error, results, fields) {
     
        if (error) throw error;
        return res.send({ error: false, data: results, message: 'Todos list.' });
    });
    
});

app.get('/AxiService/UserTable', function (req, res) {

    mc_2.query('SELECT * FROM UserTable', function (error, results, fields) {
     
        if (error) throw error;
        return res.send({ error: false, data: results, message: 'Todos list.' });
    });
   
});

app.get('/1wA8PJMdnC', function (req, res) {

  
        res.send('hello world');
   
   
});




app.get('/1wA8PJMdnC.txt', function (req, res) {
    

     res.send('884c5af88d8c3a66d760a04e450cd944');
 //   res.send('1wA8PJMdnC.txt');
  });

app.get('/MP_verify_UceEyY3YwfCfPPqY.txt', function (req, res) {
    

    res.send('UceEyY3YwfCfPPqY');
   
});

app.get('/.well-known/acme-challenge/QRCvYMr7WwrSuDMQE1XJ440MoExOuRtqDsOEu2HagZA', function (req, res) {
    
res.send('QRCvYMr7WwrSuDMQE1XJ440MoExOuRtqDsOEu2HagZA.yT40tVUHzz5ObCQcOZBeRcR5LEyhj0-Do0U0cUsTf9o');
   
});


/*var storage = GridFsStorage({
    gfs: gfs,
    filename: function(req, file, cb) {
        var datetimestamp = Date.now();

        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]);
    },

    metadata: function(req, file, cb) {
        cb(null, { originalname: file.originalname });
    },
    root: 'uploads' //root name for collection to store files into
});

var upload = multer({ //multer settings for single upload
    storage: storage
}).single('image');*/


router(app);
