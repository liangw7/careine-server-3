var Med = require('../models/med');

exports.get = function(req, res, next) {

    Med.find(function(err, Meds) {

        if (err) {
            res.send(err);
        }

        res.json(Meds);

    });

}


exports.getById = function(req, res, next) {

    Med.findById({ _id: req.params.medId }, function(err, Med) {

        if (err) {
            res.send(err);
        }

        res.json(Med);

    });

}
exports.getByFilter = function(req, res, next) {

    
 
    Med.find( req.body, function(err, data) {
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
exports.getByPatient = function(req, res, next) {

    Med.find(req.body, function(err, data) {
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


exports.Update = function(req, res, next) {


    Med.findByIdAndUpdate(req.body._id, { $set: req.body }, { new: true },
        function(err, request) {
            if (err) {
                res.send(err);
            } else {
                res.json(request);
            }
        });
}

exports.create = function(req, res, next) {

    Med.create((req.body),
        function(err, Med) {

            if (err) {
                res.send(err);
            }

            res.json(Med);



        });

}

exports.delete = function(req, res, next) {

    Med.remove({
        _id: req.params.medId
    }, function(err, Med) {
        res.json(Med);
    });

}