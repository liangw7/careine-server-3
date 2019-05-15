var Visit = require('../models/visit');

exports.getVisits = function(req, res, next) {

    Visit.find(function(err, Visits) {

        if (err) {
            res.send(err);
        }

        res.json(Visits);

    });

}
exports.getVisitsByPatient = function(req, res, next) {


    var pipeline=
         [
         {"$match": { "patientID": req.body.patientID}},
         {"$lookup": {
            "let": { "profile":"$profile"},
            "from": "categories",
            "pipeline":[
                {
                      "$match": {
                              "$expr": {
                                   "$and": [
                                        {
                                            "$eq": [{"$toString": "$_id"}, {"$toString":"$$profile._id"} ]
                                        },
                                        
                                    ]
                              }
                              }
                          }
                  ],

            "as": "profile"
        }},
        { "$unwind": {
            "path":'$profile',
            "preserveNullAndEmptyArrays": true
        }}

    ]

     
    Visit.aggregate(
        pipeline,
        function(err, result)	{
          
            console.log ('result',result)
            if(err)	{
                console.log(err);
            }
            else	{
                res.json(result);
            }
        });

}

exports.getVisitsByFilter = function(req, res, next) {

    console.log('req.body.filter', req.body.filter)

    Visit.find(req.body.filter, function(err, data) {
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

exports.getMonthlyVisits= function(req, res, next) {

    Visit.aggregate(
        [
            {$match: {status: {$ne:'avail'}}},
            {$group : { _id : { year : { $year : '$createdAt' }, month : { $month : '$createdAt' } }, count : { $sum : 1 }}},
            {$sort: {'_id.year':1, '_id.month':1}}
       
     //   "createdAt": { $gte: new Date((new Date().getTime() - (req.body.months * 24 * 60 * 60 * 1000))) }
     //       } }
        ],
       // cursor({ batchSize: 1000 }),
        function(err, result)	{
            if(err)	{
                console.log(err);
            }
            else	{
                res.json(result);
            }
        });
       

}
exports.getVisitsByProvider = function(req, res, next) {

    Visit.find({ providerID: req.params.providerID }, function(err, data) {
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

exports.getVisitsByRequester = function(req, res, next) {

    Visit.find({ requesterID: req.params.requesterID }, function(err, data) {
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
exports.UpdateVisit = function(req, res, next) {

    console.log('request', req.body)
    Visit.findByIdAndUpdate(req.body._id, { $set: req.body }, { new: true },
        function(err, request) {
            if (err) {
                res.send(err);
            } else {
                res.json(request);
            }
        });
}

exports.createVisit = function(req, res, next) {
    console.log('request', req.body)
    Visit.create(req.body, function(err, Visit) {

        if (err) {
            res.send(err);
        }
        res.json(Visit);


    });

}

exports.deleteVisit = function(req, res, next) {

    Visit.remove({
        _id: req.params.visitID
    }, function(err, visit) {
        res.json(visit);
    });

}