var Image = require('../models/image');
var mongoose = require('mongoose');
var fs = require('fs');

exports.uploadImage = function(req, res, next) {
    var newImage = req.body;
    /*{
        name: req.body.image.name,
        about: req.body.image.about,
        desc: req.body.image.desc,
        patientID: req.body.patientID,
        requestID: req.body.requestID,
    };*/

    Image.create(newImage, function(err, data) {

        if (err) {
            res.send(err);

        }
        console.log(data)
        var loadedfile = Buffer.from(req.body.profilePic, 'base64');
        // console.log(loadedfile)

        var path = '././images/' + data._id + '.jpg'
            // console.log(path)
        fs.writeFile(path, req.body.profilePic, function(err) {
            if (err) {
                return console.log(err);
            }
            console.log("File saved successfully!");
        });
        res.json(data);
    });
}


exports.getByPatient = function(req, res, next) {
    console.log('patientid', req.body.patientID)
    Image.find({ patientID: req.body.patientID }, function(err, data) {
        if (err) {
            res.send(err);
            console.log(err);

        }
        res.json(data);
        console.log(data)
        var _send = res.send;
        var sent = false;
        res.send = function(data) {
            if (sent) return;
            _send.bind(res)(data);
            sent = true;
        };
        next();

    });

}

exports.getImage = function(req, res, next) {
    // console.log('imageId: ', req.body.imageId);
    var path = '././images/' + req.body.imageId + '.jpg'
    fs.readFile(path, function(err, data) {
        if (err) {
            return console.log(err);
        }
        console.log('data: ', data)
        res.writeHead(200, { 'Content-Type': 'image/jpeg' });
        res.write(data);
        res.end();
    });

}

exports.delete = function(req, res, next) {

    Image.remove({
        ID: req.params.imageId
    }, function(err, Image) {
        var path = '././images/' + req.params.imageId + '.jpg'
        fs.unlink(path);
        res.json(Image);
    });

}