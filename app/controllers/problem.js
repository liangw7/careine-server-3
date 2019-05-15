var Problem = require('../models/problem');

exports.getAllProblem = function(req, res, next) {

    Problem.find(function(err, Problem) {

        if (err) {
            res.send(err);
        }

        res.json(Problem);

    });

}


exports.getById = function(req, res, next) {

 //   console.log('ProblemId', req.params.id)

    Problem.findById({ _id: req.params.id }, function(err, Problem) {

        if (err) {
            res.send(err);
        }

        res.json(Problem);

    });

}


exports.getByFilter = function(req, res, next) {

   // console.log ('filter',req.body.filter)
 
    Problem.find( req.body.filter, function(err, data) {
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


    Problem.findByIdAndUpdate(req.body._id, { $set: req.body }, { new: true },
        function(err, request) {
            if (err) {
                res.send(err);
            } else {
                res.json(request);
            }
        });
}

exports.Create = function(req, res, next) {

    Problem.create((req.body),
        function(err, Problem) {

            if (err) {
                res.send(err);
            }

            res.json(Problem);



        });

}

exports.Delete = function(req, res, next) {

    Problem.remove({
        _id: req.params.id
    }, function(err, Problem) {
        res.json(Problem);
    });

}