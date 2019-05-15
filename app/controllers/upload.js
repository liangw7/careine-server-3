var  Upload= require('../models/upload');

exports.getAll = function(req, res, next) {

    Upload.find(function(err, Upload) {

        if (err) {
            res.send(err);
        }

        res.json(Upload);

    });

}


exports.getById = function(req, res, next) {

 //   console.log('uploadId', req.params.uploadId)

    Upload.findById({ _id: req.params.uploadId }, function(err, Upload) {

        if (err) {
            res.send(err);
        }

        res.json(Upload);

    });

}


exports.getByFilter = function(req, res, next) {

  //  console.log ('filter',req.body.filter)
 
    Upload.find( req.body.filter, function(err, data) {
        if (err) {
            res.send(err);
            console.log(err);

        }
    //    console.log ('data', data)
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


exports.Update = function(req, res, next) {


    Upload.findByIdAndUpdate(req.body._id, { $set: req.body }, { new: true },
        function(err, request) {
            if (err) {
                res.send(err);
            } else {
                res.json(request);
            }
        });
}

exports.Create = function(req, res, next) {

    Upload.create((req.body),
        function(err, Upload) {

            if (err) {
                res.send(err);
            }

            res.json(Upload);



        });

}

exports.Delete = function(req, res, next) {

    Upload.remove({
        _id: req.params.uploadId
    }, function(err, Upload) {
        res.json(Upload);
    });

}