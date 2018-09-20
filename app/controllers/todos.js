var Todo = require('../models/todo');

exports.getTodos = function(req, res, next) {

    Todo.find(function(err, todos) {

        if (err) {
            res.send(err);
        }

        res.json(todos);

    });

}
exports.getTodosByPatient = function(req, res, next) {

    Todo.find({ patientID: req.params.patientID }, function(err, data) {
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
exports.getTodosByProvider = function(req, res, next) {

    Todo.find({ providerID: req.params.providerID }, function(err, data) {
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

exports.getTodosByRequester = function(req, res, next) {

    Todo.find({ requesterID: req.params.requesterID }, function(err, data) {
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
exports.UpdateTodo = function(req, res, next) {

    console.log('request', req.body)
    Todo.findByIdAndUpdate(req.body._id, { $set: req.body }, { new: true },
        function(err, request) {
            if (err) {
                res.send(err);
            } else {
                res.json(request);
            }
        });
}

exports.createTodo = function(req, res, next) {
    console.log('request', req.body)
    Todo.create(req.body, function(err, todo) {

        if (err) {
            res.send(err);
        }
        res.json(todo);


    });

}

exports.deleteTodo = function(req, res, next) {

    Todo.remove({
        _id: req.params.todoID
    }, function(err, todo) {
        res.json(todo);
    });

}