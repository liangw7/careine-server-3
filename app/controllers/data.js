var Data = require('../models/data');
var Category = require('../models/category');
const mongoose = require('mongoose');

exports.getDatas = function(req, res, next) {

    Data.find(function(err, Datas) {

        if (err) {
            res.send(err);
        }

        res.json(Datas);

    });

}
exports.getDatasByPatient = function(req, res, next) {

    Data.find(req.body, function(err, data) {
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

    }).sort({"createdAt": 'desc'});

}

exports.getDatasByOb = function(req, res, next) {

    Data.find(req.body, function(err, data) {
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

    }).sort({"patientID": 'desc'});

}

exports.getPatientsByFilter = function(req, res, next) {

    console.log ('req.body.patientListID',req.body.patientListID)
    
   Category.findById({ _id: mongoose.Types.ObjectId(req.body.patientListID) })
   .exec(function(err, patientList) {

    if (err) throw err;
     
    
     console.log ('patientList',patientList.label.ch)  
    var optionSum=[];
    var obList=[];
    var obIDs=[];
    var obCount=patientList.obs.length;
    for (let ob of patientList.obs){
        obIDs.push(ob._id)
        for (let option of ob.options){
            ob.option = ob._id+"-"+ option.text;
            optionSum.push(ob.option);
        }
    }

    if (patientList.selectedObs&&patientList.selectedObs.length>0){
            for (let selectedOb of patientList.selectedObs){
            
                    obList.push(selectedOb._id);
            
                }
        
            if (req.body.serviceID){
                var pipeline= [
                    
                    { "$match": { "obID": {$in:obIDs} }},
                    {"$unwind": "$values"},
                  //  { "$match": { "values": {$exists:false } }},
                { "$project": { 
                                    optionSum: { $concat: [ "$obID", "-", "$values" ] },
                                    patientID:1,
                                    obID:1,
                                    values:1
            
                    } 
                    },
                    { "$match": { "optionSum": {$in:optionSum } }},
            
                    { "$lookup": {
                        "let": { "patientID": "$patientID" },
                        "from": "users",
                        "pipeline": [
                        { "$match": { "$expr":{ '$and':[
                                                        { "$eq": [ {"$toString":"$_id"}, '$$patientID' ] },
                                                    //  { "$eq": [ {"$toString":"$profile._id"}, req.body.profileID ] }
                                                    ]}
                        } }
                        ],
                        "as": "patientData"
                    }},
                    {"$unwind": "$patientData"},
                    { "$match": { "patientData.profiles": {'$elemMatch' :{'_id':req.body.profileID } }}},
                    { "$match": { "patientData.serviceList": {'$elemMatch' :{'_id':req.body.serviceID } }}},
                    
                    {"$group": {_id:{obID: "$obID",patientID:"$patientID"},
                                values:{$last:"$values"},
                                optionSums: {$push: '$optionSum'},
                                count:{$sum:1}
                            }
                    },
                    { "$match": { "count": {"$gte":obCount } }},
                
                    {"$project":{
                        patientID:'$_id.patientID',
                        values:1,
                        _id:0
                    }},
            
                    { "$lookup": {
                        "let": { "patientID": "$patientID" },
                        "from": "datas",
                        "pipeline": [
                        { "$match": { "$expr": { "$eq": [ "$patientID", "$$patientID" ] } } }
                        ],
                        "as": "patientData"
                    }},
            
                    {"$unwind": "$patientData"},
                
                    { "$match": { "patientData.obID": {$in:obList} }},
            
                    {"$project":{
                        patientID:"$patientID",
                        email: '$patientData.patientEmail',
                        obID:'$patientData.obID',
                        selectedObs:{name:'$patientData.obName', value:'$patientData.value', values:'$patientData.values'}
                
                    }},
                    {"$group": {_id:{patientID: "$patientID",email:"$email", obID:"$obID"},
                            selectedObs: {$last: '$selectedObs'}
                            }
                    },
                    
                    {"$project":{
                        patientID:"$_id.patientID",
                        email: '$_id.email',
                        obID:'$_id.obID',
                        selectedObs:1
                
                    }},
                    { "$sort" : { obID: 1 } },
                {"$group": {_id:{patientID: "$patientID",email:"$email"},
                            selectedObs: {$push: '$selectedObs'}
                            }
                    },
                    {"$project":{
                        patientID:"$_id.patientID",
                        email: '$_id.email',
                    
                        selectedObs:1,
                        _id:0
                
                    }},
                    {"$project":{
                        _id:"$patientID",
                        email: '$email',
                        selectedObs:1
                    }},
                
                    
                    ]       
            }
            else {
                console.log ('optionSum no service id',optionSum)
                var pipeline= [
                    { "$match": { "obID": {$in:obIDs} }},
                    {"$unwind": "$values"},
                  //  { "$match": { "values": {$exists:false } }},
                    { "$project": { 
                                    optionSum: { $concat: [ "$obID", "-", "$values" ] },
                                    patientID:1,
                                    obID:1,
                                    values:1
            
                    } 
                    },
                    { "$match": { "optionSum": {$in:optionSum } }},
            
                    { "$lookup": {
                        "let": { "patientID": "$patientID" },
                        "from": "users",
                        "pipeline": [
                        { "$match": { "$expr":{ '$and':[
                                                        { "$eq": [ {"$toString":"$_id"}, '$$patientID' ] },
                                                    //  { "$eq": [ {"$toString":"$profile._id"}, req.body.profileID ] }
                                                    ]}
                        } }
                        ],
                        "as": "patientData"
                    }},
                    {"$unwind": "$patientData"},
                    { "$match": { "patientData.profiles": {'$elemMatch' :{'_id':req.body.profileID } }}},
                
                    
                    {"$group": {_id:{obID: "$obID",
                                    patientID:"$patientID",
                                    name:'$patientData.name',
                                    gender:'$patientData.gender',
                                    age:'$patientData.age'},
                                values:{$last:"$values"},
                                optionSums: {$push: '$optionSum'},
                                count:{$sum:1}
                            }
                    },
                    { "$match": { "count": {"$gte":obCount } }},
                
                    {"$project":{
                        patientID:'$_id.patientID',
                        name:'$_id.name',
                        gender:'$_id.gender',
                        age:'$_id.age',
                        values:1,
                        _id:0
                    }},
            
                    { "$lookup": {
                        "let": { "patientID": "$patientID" },
                        "from": "datas",
                        "pipeline": [
                        { "$match": { "$expr":
                                        { "$and":[
                                            {"$eq":[ "$patientID", "$$patientID" ] },
                                            {"$in":["$obID",obList]}

                                                ]} } }
                        ],
                        "as": "patientData"
                    }},
            
                    {"$unwind": "$patientData"},
                
                //    { "$match": { "patientData.obID": {$in:obList} }},
            
                {"$project":{
                    patientID:"$patientID",
                    name:'$name',
                    gender:'$gender',
                    age:'$age',
                 //   email: '$patientData.patientEmail',
                    obID:'$patientData.obID',
                    selectedObs:{name:'$patientData.obName', value:'$patientData.value', values:'$patientData.values'}
            
                }},
                {"$group": {_id:{patientID: "$patientID",
                                name:'$name',
                                gender:'$gender',
                                age:'$age',
                             //   email:"$email", 
                                obID:"$obID"},
                        selectedObs: {$last: '$selectedObs'}
                        }
                },
                
                {"$project":{
                    patientID:"$_id.patientID",
                    name:'$_id.name',
                    gender:'$_id.gender',
                    age:'$_id.age',
                   // email: '$_id.email',
                    obID:'$_id.obID',
                    selectedObs:1
            
                }},
                { "$sort" : { obID: 1 } },
                {"$group": {_id:{patientID: "$patientID",
                              //  email:"$email",
                                name:'$name',
                                gender:'$gender',
                                age:'$age'},
                        selectedObs: {$push: '$selectedObs'}
                        }
                },
                {"$project":{
                    patientID:"$_id.patientID",
                  //  email: '$_id.email',
                    name:'$_id.name',
                    gender:'$_id.gender',
                    age:'$_id.age',
                    selectedObs:1,
                    _id:0
            
                }},
                {"$project":{
                    _id:"$patientID",
                  //  email: '$email',
                    name:'$name',
                    gender:'$gender',
                    age:'$age',
                    selectedObs:1
                }},
                
                    
                    ]       
            
            }
   }
    else{
        if (req.body.serviceID){
        pipeline= [
            {"$match":{'obID':{'$in':obIDs}}},
            {"$unwind": "$values"},
         //   { "$match": { "values.text": {$exists:false } }},
           { "$project": { 
                            optionSum: { $concat: [ "$obID", "-", "$values" ] },
                            patientID:1,
                             obID:1,
                             values:1
    
            } 
            },
            { "$match": { "optionSum": {$in:optionSum } }},
            { "$lookup": {
                "let": { "patientID": "$patientID" },
                "from": "users",
                "pipeline": [
                { "$match": { "$expr":{ '$and':[
                                                { "$eq": [ {"$toString":"$_id"}, '$$patientID' ] },
                                              //  { "$eq": [ {"$toString":"$profile._id"}, req.body.profileID ] }
                                            ]}
                  } }
                ],
                "as": "patientData"
            }},
            {"$unwind": "$patientData"},
            { "$match": { "patientData.profiles": {'$elemMatch' :{'_id':req.body.profileID } }}},
            { "$match": { "patientData.serviceList": {'$elemMatch' :{'_id':req.body.serviceID } }}},
            {"$group": {_id:{obID: "$obID",patientID:"$patientID"},
                        values:{$last:"$values"},
                        optionSums: {$push: '$optionSum'},
                        count:{$sum:1}
                    }
            },
            { "$match": { "count": {"$gte":obCount } }},
    
           
            {"$project":{
                patientID:'$_id.patientID',
                 values:1,
                _id:0
            }},
            { "$lookup": {
                "let": { "patientID": "$patientID" },
                "from": "users",
                "pipeline": [
                { "$match": { "$expr": { "$eq": [ {"$toString":"$_id"}, "$$patientID" ] } } }
                ],
                "as": "patient"
            }},
            {"$unwind": "$patient"},
            {"$project":{
                _id:0
            }}, 
            {"$project":{
                name:'$patient.name',
                gender:'$patient.gender',
                birthday:'$patient.birthday',
                email:'$patient.email',
                _id:'$patient._id',
            }},           
         ] 
        }
        else {
            pipeline= [
                {"$match":{'obID':{'$in':obIDs}}},
                {"$unwind": "$values"},
              //  { "$match": { "values.text": {$exists:false } }},
               { "$project": { 
                                optionSum: { $concat: [ "$obID", "-", "$values" ] },
                                patientID:1,
                                 obID:1,
                                 values:1
        
                } 
                },
                { "$match": { "optionSum": {$in:optionSum } }},
                { "$lookup": {
                    "let": { "patientID": "$patientID" },
                    "from": "users",
                    "pipeline": [
                    { "$match": { "$expr":{ '$and':[
                                                    { "$eq": [ {"$toString":"$_id"}, '$$patientID' ] },
                                                  //  { "$eq": [ {"$toString":"$profile._id"}, req.body.profileID ] }
                                                ]}
                      } }
                    ],
                    "as": "patientData"
                }},
                {"$unwind": "$patientData"},
                { "$match": { "patientData.profiles": {'$elemMatch' :{'_id':req.body.profileID } }}},
               {"$group": {_id:{obID: "$obID",patientID:"$patientID"},
                            values:{$last:"$values"},
                            optionSums: {$push: '$optionSum'},
                            count:{$sum:1}
                        }
                },
                { "$match": { "count": {"$gte":obCount } }},
        
               
                {"$project":{
                    patientID:'$_id.patientID',
                     values:1,
                    _id:0
                }},
                { "$lookup": {
                    "let": { "patientID": "$patientID" },
                    "from": "users",
                    "pipeline": [
                    { "$match": { "$expr": { "$eq": [ {"$toString":"$_id"}, "$$patientID" ] } } }
                    ],
                    "as": "patient"
                }},
                {"$unwind": "$patient"},
                {"$project":{
                    _id:0
                }}, 
                {"$project":{
                    name:'$patient.name',
                    gender:'$patient.gender',
                    birthday:'$patient.birthday',
                    email:'$patient.email',
                    _id:'$patient._id',
                }},           
             ] 
        }      
        } 
    

    console.log('profileID',req.body.profileID);
    Data.aggregate(
            pipeline,
            function(err, result)   {
                console.log ('_id',req.body.patientListID )
                console.log ('result',result)
                if(err) {
                    console.log(err);
                }
                else    {
                    res.json(result);
                }
            });
            });
    }
     

exports.getReport = function(req, res, next) {

        var    pipeline= [
                { "$match": { "obID": req.body.obID }},

                { "$lookup": {
                    "let": {"patientID":"$patientID" },
                    "from": "users",
                    "pipeline":[
                        {
                              "$match": {
                                      "$expr": {
                                           "$and": [
                                                {
                                                    "$eq": [ {"$toString":"$_id"}, "$$patientID" ]
                                                }
                                             
                                                
                                            ]
                                      }
                                      }
                                  }
                          ],

                    "as": "patientData"
                }}, 
                {"$unwind": "$patientData"},  
                {"$unwind": "$patientData.profiles"},  
                { "$match": { "patientData.profiles._id": req.body.profileID }},
               
                {"$group": {_id:{obID: "$obID",patientID:"$patientID"},
                            values:{$last:"$values"}}
                },
                {"$project":{
                    obID:'$_id.obID',
                    patientID:'$_id.patientID',
                    values:1
                }},
                {"$unwind": "$values"},    
                {"$group": {_id:{values:"$values"},
                            count:{$sum:1}},
                },     
                {"$project":{
                    values:'$_id.values',
                  count:1,
                  _id:0
                   
                }},  

             ]       
     
        Data.aggregate(
                pipeline,
                function(err, result)   {
                    console.log ('_id',req.body.profileID )
                    console.log ('result',result)
                    if(err) {
                        console.log(err);
                    }
                    else    {
                        res.json(result);
                    }
                })
    }


exports.getMultiReport_test = function(req, res, next) {

        var    pipeline= [
                { "$match": { "obID": req.body.obID }},
               
                {"$group": {_id:{obID: "$obID",patientID:"$patientID"},
                            values:{$last:"$values"}}
                },
                {"$limit":300},
                {"$project":{
                    obID:'$_id.obID',
                    patientID:'$_id.patientID',
                    values:1
                }},
                {"$unwind": "$values"},    
                { "$lookup": {
                    "let": { "patientID": "$patientID" },
                    "from": "datas",
                    "pipeline": [
                    { "$match": { "$expr": {"$and":[ { "$eq": [ {"$toString":"$patientID"}, {"$toString":"$$patientID"} ] },
                                                      {"$eq":[ {"$toString":"$obID"}, {"$toString":req.body.obYID}]}   ]}
                                       
                                } 
                            }
                    ],
                    "as": "patientData"
                }},
           
                {"$unwind": "$patientData"},

            
                {"$group": {_id:{obID: "$obID",patientID:"$patientID", obYID:"$patientData.obID", values:"$values"},
                            valueYs:{$last:"$patientData.values"}}
                },
                {"$project":{
                    obID:'$_id.obID',
                    patientID:'$_id.patientID',
                    obYID:'$_id.obYID',
                    values:'$_id.values',
                    valueYs:1
                }},
                {"$unwind": "$valueYs"},
                { "$sort" : { valueYs: 1 } },
                {"$group": {_id:{values:"$values",valueYs:'$valueYs'},
                            count:{$sum:1}},
                },     
                {"$project":{
                    values:'$_id.values',
                    valueYs:{values:'$_id.valueYs',count:'$count'},
                     _id:0
                      
                   }},  
                   {"$group": {_id:{values:"$values"},
                               valueYs:{"$push":"$valueYs"}}
                   }, 
                   {"$project":{
                       values:'$_id.values',
                       valueYs:1,
                       _id:0
                      }}
             ]
        
     
        Data.aggregate(
                pipeline,
                function(err, result)   {
                    console.log ('_id',req.body.patientListID )
                    console.log ('result',result)
                    if(err) {
                        console.log(err);
                    }
                    else    {
                        res.json(result);
                    }
                }).option({allowDiskUse:true})
    }
exports.getMultiReport = function(req, res, next) {

    var    pipeline= [
            { "$match": { "obID": {'$in':[req.body.obID,req.body.obYID] }}},
           // {"$limit":300},

            {"$unwind":"$values"},
            {"$group": {_id:{patientID:"$patientID"},
                        data:{$push:{'obID':"$obID", 'values':'$values'},
                        }
                }
            },
            {"$project":{
              
                patientID:'$_id.patientID',
                data:1
            }},
            {"$group": {_id:{data:"$data"},
                        count:{$sum:1
                        }
                        }

            },
            {"$project":{
              
                data:'$_id.data',
                count:1,
                _id:0
            }},
         


    
         

            
            

          
         
            ]
    
    
    Data.aggregate(
            pipeline,
            function(err, result)   {
                console.log ('_id',req.body.patientListID )
                console.log ('result',result)
                if(err) {
                    console.log(err);
                }
                else    {
                    res.json(result);
                }
            })
}
  
exports.getDatasByFollowup = function(req, res, next) {

    Data.find(req.body, function(err, data) {
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

    }).sort({"createdAt": 'desc'});

}

exports.getDatasByVisit = function(req, res, next) {

    Data.find(req.body,function(err, data) {
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

    }).sort({"createdAt": 'desc'});

}
exports.getDatasByOrder = function(req, res, next) {

    Data.find(req.body,function(err, data) {
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

    }).sort({"createdAt": 'desc'});

}

exports.getDatasByFilter = function(req, res, next) {

    console.log ('filter',req.body)
 
    Data.find( req.body, function(err, data) {
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

exports.getById = function(req, res, next) {

  

    Data.findById({ _id: req.params.dataId }, function(err, Category) {

        if (err) {
            res.send(err);
        }

        res.json(Category);

    });

}

exports.Create = function(req, res, next) {
    console.log('request', req.body)
    Data.create(req.body, function(err, Data) {

        if (err) {
            res.send(err);
        }
        res.json(Data);

    });

}

exports.Delete = function(req, res, next) {

    Data.remove({
        _id: req.params.dataID
    }, function(err, data) {
        res.json(data);
    });
}

exports.Update = function(req, res, next) {

    Data.findByIdAndUpdate(req.body._id, { $set: req.body }, { new: true },
        function(err, request) {
            if (err) {
                res.send(err);
            } else {
                res.json(request);
            }
        });
}

