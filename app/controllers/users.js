var User = require('../models/user');
const mongoose = require('mongoose');
var fs = require('fs');
//var ObjectId = mongoose.Types.ObjectId;

exports.getUsers = function(req, res, next) {

    User.find(function(err, data) {

        if (err) {
            res.send(err);

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


exports.getUserById = function(req, res, next) {
  
  User.findById({ _id: req.params.User_id },
        function(err, data) {

            if (err) {
                res.send(err);

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

exports.getByFilter = function(req, res, next) {

    
 
    User.find( req.body, function(err, data) {
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
exports.getCount= function(req, res, next) {

    User.count(req.body,
        function(err, data) {
            if (err) {
                res.send(err);

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
exports.getDailyPatients= function(req, res, next) {

        User.aggregate(
            [   { $match: {role: 'patient'}},
                {$group : { _id : { year : { $year : '$createdAt' }, month : { $month : '$createdAt' }, day : {$dayOfMonth : '$createdAt'} }, count : { $sum : 1 }       }}
  
           
         //   "createdAt": { $gte: new Date((new Date().getTime() - (req.body.days * 24 * 60 * 60 * 1000))) }
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

exports.getMonthlyPatients= function(req, res, next) {



        var IDList=[];
        for (let id of req.body.serviceIDs){
            IDList.push(mongoose.Types.ObjectId(id));
        }
        var pipeline=   [   
            { $match: {role:'patient',serviceList: {'$elemMatch' :{'_id':{'$in':req.body.serviceIDs }}}}},
            {$group : { _id : { year : { $year : '$createdAt' }, month : { $month : '$createdAt' } }, count : { $sum : 1 }}},
            {$sort: {'_id.year':1, '_id.month':1}}
       
     //   "createdAt": { $gte: new Date((new Date().getTime() - (req.body.months * 24 * 60 * 60 * 1000))) }
     //       } }
        ];


    

    User.aggregate(
        pipeline,
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
exports.getCountByService= function(req, res, next) {


            var IDList=[];
            for (let id of req.body.serviceIDs){
                IDList.push(mongoose.Types.ObjectId(id));
            }
            var pipeline=   [   
                { '$match': {'role':'patient',
                            'serviceList': {'$elemMatch' :{'_id':{'$in':req.body.serviceIDs }}}
                        }
                    },
                {'$unwind':'$serviceList'},
                { '$match': {'serviceList._id':{'$in':req.body.serviceIDs }}},
                { '$lookup': {
                    "let": { "serviceListID": "$serviceList._id" },
                    "from": "users",
                    "pipeline": [
                    { "$match": { "$expr":{'$or':[
                                                { '$and':[
                                                    { "$eq": [ {"$toString":"$_id"}, '$$serviceListID' ] }
                                                   
                                                ],
                                            }
                                          
                                          
                                        ]
                                    }
                      } 
                    }
                    ],
                    "as": "serviceList.service"
                }},
                {'$unwind':'$serviceList.service'},
                {'$group' : { _id : { serviceName : '$serviceList.service.name' , 
                                      serviceID :'$serviceList._id' },
                           
                            count : { $sum : 1 }
                            }
                },
                    
                {"$project":{
                        serviceName:'$_id.serviceName',
                        serviceID:'$_id.serviceID',
                        count:1,
                   
                        
                    }
                },
           ];
    
    
        
    
        User.aggregate(
            pipeline,
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
    
exports.getPatientsByPlace= function(req, res, next) {

    User.aggregate(
        [   { $match: {role: 'patient'}},
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



exports.getUsersByRole = function(req, res, next) {

    User.find({ 'role': req.params.role },
        function(err, data) {
            if (err) {
                res.send(err);

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

exports.getUsersByProfile = function(req, res, next) {

   // console.log('req.body', req.body)

    User.find(req.body, function(err, data) {
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

exports.getUserByEmail = function(req, res, next) {

    User.findOne({ 'email': req.params.email },
        function(err, data) {
            if (err) {
                res.send(err);

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


exports.createUser = function(req, res, next) {
    //console.log(req.body);
    // var user = JSON.parse(req.body);
    User.create(req.body, function(err, data) {

        if (err) {
            res.send(err);

        }
        if (req.body.profilePic != undefined) {
            var loadedfile = Buffer.from(req.body.profilePic, 'base64');
            // console.log(loadedfile)

            var path = '././profile_photos/' + data._id + '.jpg'
                // console.log(path)
            console.log('pic', req.body.profilePic)
            fs.writeFile(path, req.body.profilePic, function(err) {
                if (err) {
                    return console.log(err);
                }
                console.log("File saved successfully!");
            });
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
exports.updateUser = function(req, res, next) {

    User.findByIdAndUpdate(req.body._id, { $set: req.body }, { new: true },
        function(err, data) {
            if (err) {
                res.send(err);
            }
            console.log('pic', req.body.profilePic)
            if (req.body.profilePic != undefined) {
                var loadedfile = Buffer.from(req.body.profilePic, 'base64');
                // console.log(loadedfile)

                var path = '././profile_photos/' + req.body._id + '.jpg'
                    // console.log(path)
                fs.writeFile(path, req.body.profilePic, function(err) {
                    if (err) {
                        return console.log(err);
                    }
                    console.log("File saved successfully!");
                });
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
exports.getProfilePhoto = function(req, res, next) {
    console.log(req.body.userId)
    var path = '././profile_photos/' + req.body.userId + '.jpg';
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

exports.deleteUser = function(req, res, next) {
    var valid_id = mongoose.Types.ObjectId.isValid(req.params.id);
    console.log('id', valid_id)
    User.remove({
        _id: req.params.User_id
    }, function(err, data) {
        if (err) {
            res.send(err);

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

exports.getUserProfiles = function(req, res, next) {

        var pipeline= [
                    { "$match": { "_id": mongoose.Types.ObjectId(req.body.filterID) }},
                             
                    { "$unwind": "$profiles"},
                    { "$lookup": {
                     "let": { "profilesID": "$profiles._id" },
                       "from": "categories",
                        "pipeline": [
                         { "$match": { "$expr": { "$eq": [ {"$toString":"$_id"}, {"$toString":"$$profilesID"} ] } } }
                          ],
                         "as": "profiles_doc"
                        }
                    },
                        { "$unwind": "$profiles_doc"},

                        {"$group": {_id:{_id: "$_id",
                                        name:"$name"},
                                    profiles: {$push:"$profiles_doc"}
                
                            }
                        },
                        {"$project": {name:"$_id.name",
                                    _id:"$_id._id",
                                     profiles: "$profiles"}
                        },

                            ];
                    User.aggregate(
                          pipeline,
                         function(err, result)   {
                  
                         if(err) {
                             console.log(err);
                         }
                         else{
                              res.json(result);
                         }
                     })
                  
         }
         

exports.getProviders = function(req, res, next) {

            var pipeline= [
                        { "$match": { "_id": mongoose.Types.ObjectId(req.body.serviceID) }},
                                 
                        { "$unwind": "$providers"},

                        { "$lookup": {
                         "let": { "providersID": "$providers._id" },
                           "from": "users",
                            "pipeline": [
                             { "$match": { "$expr": { "$eq": [ {"$toString":"$_id"}, {"$toString":"$$providersID"} ] } } }
                              ],
                             "as": "providers_doc"
                            }
                        },

                        { "$unwind": "$providers_doc"},
    
                            {"$group": {_id:{_id: "$_id",
                                            name:"$name",
                                            desc:"$desc",
                                            photo: "$photo"},
                                        providers: {$push:"$providers_doc"}
                    
                                }
                            },
                            {"$project": {name:"$_id.name",
                                        _id:"$_id._id",
                                        photo:"$_id.photo",
                                        desc:"$_id.desc",
                                         providers: "$providers"}
                            },
    
                                ];
                        User.aggregate(
                              pipeline,
                             function(err, result)   {
                      console.log ('result providers', result)
                             if(err) {
                                 console.log(err);
                             }
                             else{
                                  res.json(result);
                             }
                         })
                      
             }

exports.getlabItems = function(req, res, next) {

                var pipeline= [
                    { "$match": { "_id":{"$eq" : mongoose.Types.ObjectId(req.body.patientID)}}},
            
                    { "$unwind": "$profiles"}, 
                    { "$lookup": {
                        "let": { "profilesID": "$profiles._id" },
                        "from": "categories",
                        "pipeline": [
                                { "$match": { "$expr": { "$eq": [ {"$toString":"$_id"}, {"$toString":"$$profilesID"} ] } } }
                                ],
                        "as": "detail_profiles"
                    }}, 
                   // { "$replaceRoot": { newRoot: "$$obSets" } },                
                    { "$unwind": "$detail_profiles"},
                    { "$unwind": "$detail_profiles.forms"},

                    //look for lab form
                    { "$match": { "detail_profiles.forms.formType":{"$eq" : "lab"}}},
                    { "$lookup": {
                        "let": { "formsID": "$detail_profiles.forms._id" },
                        "from": "categories",
                        "pipeline": [
                                { "$match": { "$expr": { "$eq": [ {"$toString":"$_id"}, {"$toString":"$$formsID"} ] } } }
                                ],
                        "as": "detail_profiles.detail_forms"
                    }},
                    { "$unwind": "$detail_profiles.detail_forms"},
                    { "$unwind": "$detail_profiles.detail_forms.obSets"},
                    //group labs together
                    {"$group":{"_id": {"_id":"$_id"},
                                "obSets":{"$push":"$detail_profiles.detail_forms.obSets"}
                     
                              }
                    },

                    { "$unwind": "$obSets"},

                    { "$lookup": {
                        "let": { "obSetsID": "$obSets._id" },
                        "from": "categories",
                        "pipeline": [
                                { "$match": { "$expr": { "$eq": [ {"$toString":"$_id"}, {"$toString":"$$obSetsID"} ] } } }
                                ],
                        "as": "detail_obSets"
                    }},

                    { "$unwind": "$detail_obSets"},


                    { "$replaceRoot": { newRoot: "$detail_obSets" } }, 

                    { "$unwind": "$labItems"},
                    { "$lookup": {
                            "let": { "labItemsID": "$labItems._id" },
                            "from": "labitems",
                            "pipeline": [
                                    { "$match": { "$expr": { "$eq": [ {"$toString":"$_id"}, {"$toString":"$$labItemsID"} ] } } }
                                    ],
                            "as": "detail_labItems"
                                }
                    },
            
                    { "$unwind": 
                            "$detail_labItems"
                    },
                    { "$lookup": {
                            "let": { "labItemsID": "$labItems._id" },
                            "from": "labs",
                            "pipeline": [
                                    { "$match": 
                                       { "$expr": {
                                        "$and":[     
                                                {
                                                   "$eq": [ "$patientID", req.body.patientID ]
                                                },
                                                {
                                                   "$eq": ["$labItemID", {"$toString":"$$labItemsID"} ]
                                                }
                                                ]
                                      } }}],
                                    
                            "as": "value_labItems"
                    }},
                    { "$unwind": 
                            {"path": "$value_labItems",
                            "preserveNullAndEmptyArrays": true
                            }
                    },
                    {"$addFields": {
                        "value_labItems.values":
                        { "$cond": {
                            if :{"$ne": ["$value_labItems.value", null]},
                            then:{
                             "$map":
                                {
                                  input: "$value_labItems.options",
                                  as: "option",
                                  in: { "$cond": 
                                            { if:{ "$and":
                                            [{ $gte:[{"$toDecimal":"$value_labItems.value"}, "$$option.from" ] },
                                            { $lt: [{"$toDecimal":"$value_labItems.value"}, "$$option.to" ] }
                                            ]
                                            }, 
                                            then: "$$option",
                                            else:''
                                            }
                                        }
                                }
                           },
                         else:[]
                            }
                            }
                        }
                    },
            
                    {"$group":{
                                _id:{_id:"$_id", 
                                    label:"$label",
                                    labID:"$detail_labItems._id", 
                                    labLabel:"$detail_labItems.label",
                                    labUOM:"$detail_labItems.uom",
                                    labType:"$detail_labItems.labType"
                                },
                                labValue:{"$push":"$value_labItems.value"},
                                labValueID:{"$push":"$value_labItems._id"},
                                labValues:{"$push":"$value_labItems.values"},
                                labTimeStamps:{"$push":"$value_labItems.resultAt"}
                        }
            
                    },
                    {"$project":{
                        _id:"$_id._id",
                        label:"$_id.label",
                        labs:{_id:"$_id.labID", 
                            label:"$_id.labLabel",
                            uom:"$_id.labUOM",
                            valueSet:"$labValue",
                            labValueID:"$labValueID",
                            valuesSet:"$labValues" ,
                            timeStamps:"$labTimeStamps"
                            }
            
                    }},
                    {"$group":{
                                _id:{_id:"$_id", 
                                    label:"$label"
                                    },
                            labs:{"$push":"$labs"}
                        
                        }
            
                    },
            
                    {"$project":{
                        _id:"$_id._id",
                        label:"$_id.label",
                        labs:"$labs"
                    }}
                  
                  
                ];
                User.aggregate(
                    pipeline,
                    function(err, result)   {
                        console.log ('_id',req.body)
                        console.log ('result',result)
                        if(err) {
                            console.log(err);
                            }
                        else{
                            res.json(result);
                            }
                        })
                              
                     }
                        
            