var express = require('express');
var app = express();
var mongoose = require('mongoose');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cors = require('cors');
//var Image = require('./models/image');

var databaseConfig = require('./config/database');
var router = require('./app/routes');

mongoose.connect('mongodb://localhost/reviewking');

var conn = mongoose.connection;

var GridFsStorage = require('multer-gridfs-storage');
var Grid = require('gridfs-stream');
Grid.mongo = mongoose.mongo;
var gfs = Grid(conn.db);
//var ImageController = require('controllers/images');
app.listen(process.env.PORT || 8080);
console.log("App listening on port 8080");

//app.use(bodyParser.urlencoded({ extended: false })); // Parses urlencoded bodies
//app.use(bodyParser.json()); // Send JSON responses

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));
app.use(logger('dev')); // Log requests to API using morgan
app.use(cors());




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