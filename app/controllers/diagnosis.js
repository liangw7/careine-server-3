var Diagnosis = require('../models/diagnosis');

exports.getAllDiagnosis = function(req, res, next) {

    Diagnosis.find(function(err, Diagnosis) {

        if (err) {
            res.send(err);
        }

        res.json(Diagnosis);

    });

}


exports.getById = function(req, res, next) {

    console.log('diagnosisId', req.params.DiagnosisId)

    Diagnosis.findById({ _id: req.params.diagnosisId }, function(err, Diagnosis) {

        if (err) {
            res.send(err);
        }

        res.json(Diagnosis);

    });

}


exports.getByFilter = function(req, res, next) {

    console.log ('filter',req.body.filter)
 
    Diagnosis.find( req.body.filter, function(err, data) {
        if (err) {
            res.send(err);
            console.log(err);

        }
        console.log ('data', data)
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


    Diagnosis.findByIdAndUpdate(req.body._id, { $set: req.body }, { new: true },
        function(err, request) {
            if (err) {
                res.send(err);
            } else {
                res.json(request);
            }
        });
}

exports.Create = function(req, res, next) {

    Diagnosis.create((req.body),
        function(err, Diagnosis) {

            if (err) {
                res.send(err);
            }

            res.json(Diagnosis);



        });

}

exports.Delete = function(req, res, next) {

    Diagnosis.remove({
        _id: req.params.diagnosisId
    }, function(err, Diagnosis) {
        res.json(Diagnosis);
    });

}