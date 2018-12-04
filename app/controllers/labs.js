var Lab = require('../models/lab');
var mongoose = require('mongoose');
var fs = require('fs');

exports.uploadLab = function(req, res, next) {
    var newLab = req.body;
    /*{
        name: req.body.lab.name,
        about: req.body.lab.about,
        desc: req.body.lab.desc,
        patientID: req.body.patientID,
    };*/

    Lab.create(newLab, function(err, data) {

        if (err) {
            res.send(err);

        }
        console.log(data)
        var loadedfile = Buffer.from(req.body.profilePic, 'base64');
        // console.log(loadedfile)

        var path = '././labs/' + data._id + '.jpg'
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
    Lab.find({ patientID: req.body.patientID }, function(err, data) {
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

exports.getLab = function(req, res, next) {
    // console.log('imageId: ', req.body.imageId);
    var path = '././labs/' + req.body.labId + '.jpg'
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

    Lab.remove({
        ID: req.params.labId
    }, function(err, Lab) {
        var path = '././labs/' + req.params.labId + '.jpg'
        fs.unlink(path);
        res.json(Lab);
    });
}
    
exports.Update = function(req, res, next) {


        Lab.findByIdAndUpdate(req.body._id, { $set: req.body }, { new: true },
            function(err, lab) {
                if (err) {
                    res.send(err);
                } else {
                    res.json(lab);
                }
            });
    }
    
exports.create = function(req, res, next) {
    
        Lab.create((req.body),
            function(err, lab) {
    
                if (err) {
                    res.send(err);
                }
    
                res.json(lab);
    
    
    
            });
    
        }

exports.getByVisit = function(req, res, next) {

            Lab.find(req.body, function(err, data) {
                if (err) {
                    res.send(err);
                    console.log(err);
        
                }
                res.json(data);
        
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
        