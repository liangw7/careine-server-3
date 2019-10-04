var express = require('express');
var app = express();
var mongoose = require('mongoose');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cors = require('cors');
const mysql = require('mysql');
//var Image = require('./models/image');

var databaseConfig = require('./config/database');
var router = require('./app/routes');
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

var GridFsStorage = require('multer-gridfs-storage');
var Grid = require('gridfs-stream');
Grid.mongo = mongoose.mongo;
var gfs = Grid(conn.db);
//var ImageController = require('controllers/images');
const server = app.listen(process.env.PORT || 8080);
server.keepAliveTimeout = 60000 * 2;
console.log("App listening on port 8080");

//app.use(bodyParser.urlencoded({ extended: false })); // Parses urlencoded bodies
//app.use(bodyParser.json()); // Send JSON responses

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));
app.use(logger('dev')); // Log requests to API using morgan
app.use(cors());

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
app.get('/AxiService/UserTable', function (req, res) {

    mc_2.query('SELECT * FROM UserTable', function (error, results, fields) {
     
        if (error) throw error;
        return res.send({ error: false, data: results, message: 'Todos list.' });
    });
   
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