var Category = require('../models/category');

const mongoose = require('mongoose');

exports.get = function(req, res, next) {

    Category.find(function(err, Categories) {

        if (err) {
            res.send(err);
        }

        res.json(Categories);

    });

}

exports.getById = function(req, res, next) {

    console.log('categoryId', req.params.categoryId)

    Category.findById({ _id: req.params.categoryId }, function(err, Category) {

        if (err) {
            res.send(err);
        }

        res.json(Category);

    });

}
exports.getSummary = function(req, res, next) {

   var pipeline= [
                           { "$match": { "_id": mongoose.Types.ObjectId(req.body.obSetID) }},
                        
                            { "$unwind": 
                              "$obs"
                               // {"path": "$obSets",
                               // "preserveNullAndEmptyArrays": true}
                                },
                            { "$lookup": {
                                "let": { "obsID": "$obs._id" },
                                "from": "categories",
                                "pipeline": [
                                { "$match": { "$expr": { "$eq": [ {"$toString":"$_id"}, {"$toString":"$$obsID"} ] } } }
                                ],
                                "as": "obs_doc"
                            }},
                            { "$unwind": '$obs_doc'
                            },
            
                            {'$addFields':{'obs_doc.patientID': req.body.patientID, 'obs_doc.index':'$obs.index'}
                            },
                            
                            {"$project":{
                            
                                obs:0
                            
                            }},
            
                            { "$lookup": {
                                "let": {"obsID": "$obs_doc._id" , 
                                        "patientID":"$obs_doc.patientID"},
                                "from": "datas",
                                "pipeline":[
                                    {
                                          "$match": {
                                                  "$expr": {
                                                      
                                                        "$and": [
                                                            {
                                                                "$eq": [ {"$toString":"$obID"}, {"$toString":"$$obsID"} ]
                                                            },
                                                            {
                                                                "$eq": [ {"$toString":"$patientID"}, {"$toString":"$$patientID"} ]
                                                            }
                                                        ]    
                                                    }
                                                  }
                                              }
                                      ],
          
                                "as": "obs_doc.patientData"
                            }},
                            { "$unwind": {
                                "path":'$obs_doc.patientData',
                                "preserveNullAndEmptyArrays": true
                } },
                { "$lookup": {
                    "let": {"patientID":"$obs_doc.patientID",
                            "visitID": "$obs_doc.patientData.visitID"},
                    "from": "visits",
                    "pipeline":[
                        {
                              "$match": {
                                      "$expr": {
                                          
                                            "$and": [
                                                {
                                                    "$eq": [ {"$toString":"$_id"}, {"$toString":"$$visitID"} ]
                                                },
                                                {
                                                    "$eq": [ {"$toString":"$patientID"}, {"$toString":"$$patientID"} ]
                                                }
                                            ]    
                                        }
                                      }
                                  }
                          ],

                    "as": "obs_doc.patientData.visitData"
                }},
                    { "$unwind": {
                    "path":'$obs_doc.patientData.visitData',
                    "preserveNullAndEmptyArrays": true
                    } },
                            { "$lookup": {
                                "let": { "mappingLab":"$obs_doc.mappingLab", 
                                          "patientID":"$obs_doc.patientID" },
                                "from": "labs",
                                "pipeline":[
                                    {
                                          "$match": {
                                                  "$expr": {
                                                       "$and": [
                                                            {
                                                                "$eq": [ "$labItemID", {"$toString":"$$mappingLab._id"} ]
                                                            },
                                                            {
                                                                "$eq": [ "$patientID", "$$patientID" ]
                                                            },
                                                           // {
                                                           //   "$gte": [ "$$mappingLab.searchDays",{"$subtract": [{"$toDate":req.body.visitDate}, "$resultAt"  ] } ]
                                                         // },
                                                            
                                                        ]
                                                  }
                                                  }
                                              }
                                      ],
          
                                "as": "obs_doc.labData"
                            }},  
    
                            { "$unwind": {
                                "path":'$obs_doc.labData',
                                "preserveNullAndEmptyArrays": true
                } },
                            {"$addFields": {
                                "obs_doc.patientData":
                                               { "$cond": {
                                                   if :{'$eq': ["$obs_doc.type", 'mapping lab']},
                                                    then:"$obs_doc.labData",
                                                   else:"$obs_doc.patientData"
                                                   
                                                   }
                                           }
                                       }
                            },

                    
               

               
        
     {"$addFields": {
        "obs_doc.value":{ $ifNull: [ "$obs_doc.patientData.value", ''] },
        "obs_doc.values":{ $ifNull: [ "$obs_doc.patientData.values", []] },
        "obs_doc.alertLevel":   { "$cond": {
                    if :{"$and":[{"$ne": ["$obs_doc.patientData.value", null]},
                                {"$ne": ["$obs_doc.patientData.value", '']},
                                {"$in":["$obs_doc.type",["number", "mapping ob", "mapping lab","mapping", "calculation"]]}
                                ]
                            },
                    then:{
                    "$map":
                        {
                        input: "$obs_doc.options",
                        as: "option",
                        in: { "$cond": 
                                    { if:{ "$and":
                                    [{ $gte:[{ '$toDecimal': '$obs_doc.patientData.value'}, "$$option.from" ] },
                                    { $lt: [{'$toDecimal': '$obs_doc.patientData.value'}, "$$option.to" ] }
                                    ]
                                    }, 
                                    then: { $ifNull: [ "$$option.alertLevel", 0] },
                                    else:0
                                    }
                                }
                        }
                },
                else:[0]
                    
                    }
            },
        "obs_doc.createdAt":  { "$cond": {
            if :{'$eq': ["$obs_doc.type", 'mapping lab']},
             then:"$obs_doc.labData.resultAt",
            else:"$obs_doc.patientData.visitData.visitDate"
            
            }
    }
                    }      
    },

    {"$addFields": {
        "obs_doc.alertLevel":
        { "$cond": {
            if :{'$eq': ["$obs_doc.type", 'string']},
             then:  0,
            else:{
                "$reduce": {
                    input: "$obs_doc.alertLevel",
                    initialValue: 0,
                    in: { $add: [ "$$value", "$$this" ] }
                }
            }
            
            }
        }
      
    }      
    },
    
    {"$addFields": {
        "obs_doc.alertLevel":{ $ifNull: [ "$obs_doc.alertLevel", 0 ]},
    }
    },

    { "$sort": { "obs_doc.createdAt": 1 }},  
                         
    {"$group": {_id:{_id: "$_id",
                            name:"$name",
                            label:"$label",
                            patientID:req.body.patientID,
                            obName: "$obs_doc.name",
                            obLabel: "$obs_doc.label",
                            obID:"$obs_doc._id",
                            obType:"$obs_doc.type",
                            obIndex:"$obs_doc.index"

                        },
                    valueSet: {$push:"$obs_doc.value"},
                    valuesSet:{$push:"$obs_doc.values"},
                    timeSet:{$push:"$obs_doc.createdAt"},
                    alertLevelSet:{$push:"$obs_doc.alertLevel"},
                        }
            },
    
    {"$project":{
                    _id:'$_id._id',
                    name:'$_id.name',
                    label:'$_id.label',
                    patientID:'$_id.patientID',
                    obs:{_id:"$_id.obID", 
                        name:"$_id.obName",
                        label:"$_id.obLabel",
                        type:"$_id.obType",
                        index:'$_id.obIndex',
                        valueSet:"$valueSet", 
                        valuesSet:"$valuesSet", 
                        timeSet:"$timeSet",
                        alertLevelSet:"$alertLevelSet",
                    },
                }
            },

   
 { "$sort": { "obs.index": 1 }}, 

{"$group": {_id:{_id: "$_id",
                name:"$name",
                label:"$label",
                patientID:req.body.patientID,},
                
                obs:{$push:"$obs"}
            }
    },
    {"$project":{
        _id:'$_id._id',
        name:'$_id.name',
        label:'$_id.label',
        patientID:'$_id.patientID',
        obs:1
    }
} 


   

        ];
             Category.aggregate(
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

exports.getReport = function(req, res, next) {

    
    var type=req.body.type;
    var context=req.body.context;

   
    if (type=='mapping ob'&&context=='visit'){
        var pipeline= [
            
                        { "$match": { "_id": mongoose.Types.ObjectId(req.body.obID) }},
                             
                                { "$lookup": {
                                   "let": {"obID": "$mappingOb._id"
                                          },
                                   "from": "datas",
                                   "pipeline":[
                                       {
                                             "$match": {
                                                     "$expr": {

                                                       "$or":[
                                                               {
                                                                   "$and": [
                                                                       {
                                                                           "$eq": [ {"$toString":"$obID"}, {"$toString":"$$obID"} ]
                                                                       },
                                                                    
                                                                   ]
                                                               }
                                                           ]
                                                         
                                                        
                                                       }
                                                     }
                                                 }
                                         ],
             
                                   "as": "data"
                               }},
                             {"$unwind": "$data"},   

                            { "$lookup": {
                                "let": {"visitID": "$data.visitID",
                                        "mappingOb": "$mappingOb",
                                       },
                                "from": "visits",
                                "pipeline":[
                                    {
                                          "$match": {
                                                  "$expr": {

                                                    "$or":[
                                                            {
                                                                "$and": [
                                                                    {
                                                                        "$eq": [ {"$toString":"$_id"}, {"$toString":"$$visitID"} ]
                                                                    },
                                                                    {
                                                                        "$or": [
                                                                            
                                                                         
                                                                            {"$and":[{"$ne": [ req.body.procedureDate,null]},  
                                                                                    {"$gt": [ "$$mappingOb.frameDays",0]},
                                                                                    {"$lte": [ {"$subtract":["$$mappingOb.frameDays","$$mappingOb.searchDays"]},
                                                                                            {"$divide":  [{"$subtract":
                                                                                                [{"$toDate":'$visitDate'}, 
                                                                                                {"$toDate":req.body.procedureDate} 
                                                                                                ] },
                                                                                            1000 * 3600 * 24 ]
                                                                                            } ]
                                                                                    },
                                                                                    {"$gte": [ {"$add":["$$mappingOb.frameDays","$$mappingOb.searchDays"]},
                                                                                    {"$divide":  [{"$subtract":
                                                                                        [{"$toDate":'$visitDate'}, 
                                                                                        {"$toDate":req.body.procedureDate} 
                                                                                        ] },
                                                                                    1000 * 3600 * 24 ]
                                                                                    } ]
                                                                                }]
                                                                            },
                                                                            //look backwards from currentDate
                                                                            {"$and":[
                                                                               
                                                                                  {"$eq": [ "$$mappingOb.frameDays",0]},
                                                                                  {"$gte": [ "$$mappingOb.searchDays",
                                                                                       {"$divide":
                                                                                                [{"$subtract":
                                                                                                        [{"$toDate":req.body.currentDate}, 
                                                                                                        {"$toDate":"$visitDate"} 
                                                                                                        ] },
                                                                                                1000 * 3600 * 24 
                                                                                                ]
                          
                                                                                             }
                                                                                       
                                                                                            ]
                                                                                      }]
                                                                      },
                                                                              {
                                                                                "$and": [
                                                                                
                                                                                    {"$eq": [ "$$mappingOb.frameDays",0]},
                                                                                    {"$eq": [ "$$mappingOb.searchDays",0]},
                                                                                        
                                                                                  
                                                                                    
                                                                                ]
                                                                              },
                                                                            
                                                                        ]
                                                                      },
                                                                 
                                                                ]
                                                            }
                                                        ]
                                                      
                                                     
                                                    }
                                                  }
                                              }
                                      ],
          
                                "as": "data.visit"
                            }},

                             
                                //get values from option 
                                {"$addFields": {
                                    "data.value":{ $ifNull: [ "$data.value",''] }
                               }},

                                {"$addFields": {
                                    "data.values":
                                    { "$cond": {
                                        if :{"$and":[{"$ne": ["$data.value", '']},
                                                     {"$in":["$type",["number", "mapping ob","mapping", "mapping lab"]]}
                                                    ]
                                                },
                                        then:{
                                         "$map":
                                            {
                                              input: "$options",
                                              as: "option",
                                              in: { "$cond": 
                                                        { if:{ "$and":
                                                        [{ $gte:[{"$toDecimal":"$value"}, "$$option.from" ] },
                                                        { $lt: [{"$toDecimal":"$value"}, "$$option.to" ] }
                                                        ]
                                                        }, 
                                                        then: "$$option",
                                                        else:null
                                                        }
                                                    }
                                            }
                                       },
                                       else:  { "$cond": {
                                                    if :{"$and":[
                                                                {"$eq":["$type","list"]}
                                                                ]
                                                            },
                                                    then:{
                                                    "$map":
                                                        {
                                                        input: "$options",
                                                        as: "option",
                                                        in: { "$cond": 
                                                            { if:{ "$and":
                                                                    [{ "$in":["$$option.text", "$data.values" ] }
                                                                    
                                                                    ]
                                                                    }, 
                                                                    then: "$$option",
                                                                    else:null
                                                                    }
                                                                }
                                                        }
                                                },
                                                else:[]
                                        
                                            }
                                }
                                        
                                        }
                                }
                                }
                            },
                            { "$lookup": {
                                "let": {"patientID":"$data.patientID" },
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
            
                                "as": "data.patientData"
                            }}, 
                            {"$unwind": "$data.patientData"},  
                            {"$unwind": "$data.patientData.profiles"},  
                            { "$match": { "data.patientData.profiles._id": req.body.profileID }},
                            {"$unwind": "$data.patientData.serviceList"}, 
                            { "$match": { "data.patientData.serviceList._id": req.body.serviceID }},
                            {"$group": {_id:{obID: "$_id",
                                        patientID:"$data.patientID"},
                                        values:{$last:"$data.values"}}
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


                            


                   
     
             ];
            }
    else  if (type=='mapping ob'&&context=='patient'){
                var pipeline= [
                    
                                { "$match": { "_id": mongoose.Types.ObjectId(req.body.obID) }},
                                     
                                        { "$lookup": {
                                           "let": {"obID": "$mappingOb._id"
                                                  },
                                           "from": "datas",
                                           "pipeline":[
                                               {
                                                     "$match": {
                                                             "$expr": {
        
                                                               "$or":[
                                                                       {
                                                                           "$and": [
                                                                               {
                                                                                   "$eq": [ {"$toString":"$obID"}, {"$toString":"$$dataID"} ]
                                                                               },
                                                                            
                                                                           ]
                                                                       }
                                                                   ]
                                                                 
                                                                
                                                               }
                                                             }
                                                         }
                                                 ],
                     
                                           "as": "data"
                                       }},
                                   
                                        //get values from option 
                                        {"$addFields": {
                                            "data.value":{ $ifNull: [ "$data.value",''] }
                                       }},
        
                                        {"$addFields": {
                                            "data.values":
                                            { "$cond": {
                                                if :{"$and":[{"$ne": ["$data.value", '']},
                                                             {"$in":["$type",["number", "mapping ob","mapping", "mapping lab"]]}
                                                            ]
                                                        },
                                                then:{
                                                 "$map":
                                                    {
                                                      input: "$options",
                                                      as: "option",
                                                      in: { "$cond": 
                                                                { if:{ "$and":
                                                                [{ $gte:[{"$toDecimal":"$data.value"}, "$$option.from" ] },
                                                                { $lt: [{"$toDecimal":"$data.value"}, "$$option.to" ] }
                                                                ]
                                                                }, 
                                                                then: "$$option",
                                                                else:null
                                                                }
                                                            }
                                                    }
                                               },
                                               else:  { "$cond": {
                                                            if :{"$and":[
                                                                        {"$eq":["$type","list"]}
                                                                        ]
                                                                    },
                                                            then:{
                                                            "$map":
                                                                {
                                                                input: "$options",
                                                                as: "option",
                                                                in: { "$cond": 
                                                                    { if:{ "$and":
                                                                            [{ "$in":["$$option.text", "$data.values" ] }
                                                                            
                                                                            ]
                                                                            }, 
                                                                            then: "$$option",
                                                                            else:null
                                                                            }
                                                                        }
                                                                }
                                                        },
                                                        else:[]
                                                
                                                    }
                                        }
                                                
                                                }
                                        }
                                        }
                                    },
                                    { "$lookup": {
                                        "let": {"patientID":"$data.patientID" },
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
                    
                                        "as": "data.patientData"
                                    }}, 
                                    {"$unwind": "$data.patientData"},  
                                    {"$unwind": "$data.patientData.profiles"},  
                                    { "$match": { "data.patientData.profiles._id": req.body.profileID }},
                                    {"$unwind": "$data.patientData.serviceList"}, 
                                    { "$match": { "data.patientData.serviceList._id": req.body.serviceID }},

                                    {"$group": {_id:{obID: "$_id",
                                                patientID:"$data.patientID"},
                                                values:{$last:"$data.values"}}
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
        
        
                                    
        
        
                           
             
                     ];
                    }
        
    else {
                var pipeline= [
                                        
                                        //get detail of ob from category
        
                                        { "$match": { "_id": mongoose.Types.ObjectId(req.body.obID) }},
                                     
                                        //get value from data document
                                        { "$lookup": {
                                            "let": {"mappingLab": "$mappingLab"
                                                   },
                                            "from": "labs",
                                            "pipeline":[
                                                {"$match": 
                            {"$expr": 
                                {
                                    "$and": [
                                     {"$eq": [ "$labItemID", {"$toString":"$$mappingLab._id"} ]
                                     },
                                   
                                      {"$or":[
                                          {"$and":[
                                              //if framedays is grater than 0, meaning there is need to calculate days from treatment starting date adding frame days to evaluate the tratment outcome
                                              {"$ne": [ req.body.procedureDate,null]},   
                                              {"$gt": [ "$$mappingLab.frameDays",0]},
                                                   {"$lte": [ {"$subtract":["$$mappingLab.frameDays","$$mappingLab.searchDays"]},
                                                            {"$divide":  [{"$subtract":
                                                                [{"$toDate":"$resultAt"}, 
                                                                {"$toDate":req.body.procedureDate} 
                                                                ] },
                                                            1000 * 3600 * 24 ]
                                                            } ]
                                                    },
                                                    {"$gt": [ {"$add":["$$mappingLab.frameDays","$$mappingLab.searchDays"]},
                                                    {"$divide":  [{"$subtract":
                                                        [{"$toDate":"$resultAt"}, 
                                                        {"$toDate":req.body.procedureDate} 
                                                        ] },
                                                    1000 * 3600 * 24 ]
                                                    } ]
                                                }]
                                            },
                                       //to look backwards for the value within search days
                                          {"$and":[{"$eq": [ "$$mappingLab.frameDays",0]},
                                                    {"$gte": [ "$$mappingLab.searchDays",
                                                             {"$divide":
                                                                      [{"$subtract":
                                                                              [{"$toDate":req.body.visitDate}, 
                                                                              {"$toDate":"$resultAt"} 
                                                                              ] },
                                                                      1000 * 3600 * 24 
                                                                      ]

                                                                   }
                                                             
                                                                  ]
                                                            }]
                                            },
                                        ]
                                    },
                                ]
                                    
                                }
                            }
                        }
                                                  ],
                      
                                            "as": "data"
                                        }},
                                        { "$unwind": '$data' },

                                     
                                        {"$addFields": {
                                            "data.values":
                                            { "$cond": {
                                                if :{"$and":[{"$ne": ["$data.value", null]},
                                                             {"$in":["$type",["number", "mapping ob","mapping", "mapping lab"]]}
                                                            ]
                                                        },
                                                then:{
                                                 "$map":
                                                    {
                                                      input: "$options",
                                                      as: "option",
                                                      in: { "$cond": 
                                                                { if:{ "$and":
                                                                [{ $gte:[{"$toDecimal":"$data.value"}, "$$option.from" ] },
                                                                { $lt: [{"$toDecimal":"$data.value"}, "$$option.to" ] }
                                                                ]
                                                                }, 
                                                                then: "$$option",
                                                                else:null
                                                                }
                                                            }
                                                    }
                                               },
                                               else:  { "$cond": {
                                                            if :{"$and":[
                                                                        {"$eq":["$type","list"]}
                                                                        ]
                                                                    },
                                                            then:{
                                                            "$map":
                                                                {
                                                                input: "$options",
                                                                as: "option",
                                                                in: { "$cond": 
                                                                    { if:{ "$and":
                                                                            [{ "$in":["$$option.text", "$data.values" ] }
                                                                            
                                                                            ]
                                                                            }, 
                                                                            then: "$$option",
                                                                            else:null
                                                                            }
                                                                        }
                                                                }
                                                        },
                                                        else:[]
                                                
                                                    }
                                        }
                                                
                                                }
                                        }
                                        }
                                    },
                                    { "$lookup": {
                                        "let": {"patientID":"$data.patientID" },
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
                    
                                        "as": "data.patientData"
                                    }}, 
                                    {"$unwind": "$data.patientData"},  
                                    {"$unwind": "$data.patientData.profiles"},  
                                    { "$match": { "data.patientData.profiles._id": req.body.profileID }},
                                    {"$unwind": "$data.patientData.serviceList"}, 
                                    { "$match": { "data.patientData.serviceList._id": req.body.serviceID }},

                                    {"$group": {_id:{obID: "$_id",
                                                patientID:"$data.patientID"},
                                                values:{$last:"$data.values"}}
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
        
             
                     ];
                    }
    

                  Category.aggregate(
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
           
exports.getlabItems = function(req, res, next) {

    var labIDs=[];
    for (let labID of req.body.labIDs){
        labIDs.push(mongoose.Types.ObjectId(labID))
    }

    var pipeline= [

        {"$match":{"_id": {"$in": labIDs}}},
                      
        { "$unwind": "$labItems"
        },

        { "$lookup": {
                "let": { "labItemsID": "$labItems._id" },
                "from": "labitems",
                "pipeline": [
                        { "$match": { "$expr": { "$eq": [ {"$toString":"$_id"}, {"$toString":"$$labItemsID"} ] } } }
                        ],
                "as": "detail_labItems"
        }},

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
    Category.aggregate(
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
            

exports.getForm = function(req, res, next) {

var patientType='patient';
var visitType='visit';
var profileIDs=[];
//console.log (' profileID', req.body.profileID)
//console.log (' formTypes', req.body.formTypes)

for (let profileID of req.body.profileIDs){
    profileIDs.push(mongoose.Types.ObjectId(profileID));
}
    
   Category.find({ _id: {$in:profileIDs}}).exec(function(err, profiles) {

    if (err) throw err;
    console.log ('profiles',profiles)

    var formIDs=[];
    for (let profile of profiles){
        for (let form of profile.forms){
            if (req.body.visitType){
               if (req.body.visitType==form.visitType&&req.body.formTypes.indexOf (form.formType)>-1&&formIDs.indexOf(mongoose.Types.ObjectId(form._id))==-1)
                {
                    formIDs.push(mongoose.Types.ObjectId(form._id) )
                }
            }
            else{
                if (req.body.formTypes.indexOf (form.formType)>-1&&formIDs.indexOf(mongoose.Types.ObjectId(form._id))==-1)
                {
                    formIDs.push(mongoose.Types.ObjectId(form._id) )
                }

            }
    }
    }

    if (!req.body.patientID){
        var pipeline= [
            
               { "$match": { "_id": {$in: formIDs } }},
            
                {"$unwind": '$obSets'},
                {"$project":{obs:0 }},

                { "$lookup": {
                    "let": { "obSetsID": "$obSets._id" },
                    "from": "categories",
                    "pipeline": [
                    { "$match": { "$expr": { "$eq": [ {"$toString":"$_id"}, {"$toString":"$$obSetsID"} ] } } }
                    ],
                    "as": "obSets_doc"
                }},
                { "$lookup": {
                    "let": { "obSetsID": "$obSets._id" },
                    "from": "orderitems",
                    "pipeline": [
                    { "$match": { "$expr": { "$eq": [ {"$toString":"$_id"}, {"$toString":"$$obSetsID"} ] } } }
                    ],
                    "as": "obSets_order"
                }},

                { "$unwind": {
                    "path":'$obSets_doc',
                    "preserveNullAndEmptyArrays": true
            } },
            { "$unwind": {
                "path":'$obSets_order',
                "preserveNullAndEmptyArrays": true
        } },
                {"$addFields": {
                    "obSets_doc":
                                   { "$cond": {
                                       if :{'$gt': ["$obSets_doc", null]},
                                       then:"$obSets_doc",
                                       else:"$obSets_order"
                                       
                                       }
                               }
                           }
                       },
                       
                {"$unwind": '$obSets_doc.obs'},

                { "$lookup": {
                    "let": { "obsID": "$obSets_doc.obs._id" },
                    "from": "categories",
                    "pipeline": [
                    { "$match": { "$expr": { "$eq": [ {"$toString":"$_id"}, {"$toString":"$$obsID"} ] } } }
                    ],
                    "as": "obSets_doc.obs_doc"
                }},

               

                {"$unwind": '$obSets_doc.obs_doc'},

               

                {'$addFields':{'obSets_doc':{'name':'$obSets_doc.name', 
                                            '_id':'$obSets_doc._id', 
                                            'addsIn':'$obSets.addsIn', 
                                            'index':'$obSets.index',
                                            'field':'$obSets.field',
                                            'obs_doc':{//'name':'$obSets_doc.obs.name',
                                                        //'_id':'$obSets_doc.obs._id',
                                                        'addsIn':'$obSets_doc.obs.addsIn', 
                                                        'required':'$obSets_doc.obs.required', 
                                                        'options':'$obSets_doc.obs_doc.options',
                                                         'seiry': '$obSets_doc.obs_doc.seiry'}}}},

    {"$addFields": {
        "obSets_doc.obs_doc.label":{ $ifNull: [ "$obSets_doc.obs_doc.label", {ch:'$obSets_doc.obs_doc.name',en:''}] }
            }},  
    {"$addFields": {
         "obSets_doc.label":{ $ifNull: [ "$obSets_doc.label", {ch:'$obSets_doc.name',en:''}] }
    }},

    {"$addFields": {
       "label":{ $ifNull: [ "$label", {ch:'$name',en:''}] }
    }}, 
    {"$addFields": {
        "obSets_doc.obs_doc.education":{ $ifNull: [ "$obSets_doc.obs_doc.education", {ch:'$obSets_doc.obs_doc.resource',en:''}] }
    }}, 
    { '$sort' : { 'obSets_doc.obs_doc.index': 1 } },
    
                {"$group": {_id:{_id: "$_id",
                            name:"$name",
                            internalName:"$internalName",
                            label:'$label',
                            formType:"$formType",
                            formStyle:"$formStyle",  
                           addsIn:'$obSets_doc.addsIn',
                           obSetField:'$obSets_doc.field',
                           obSetName:'$obSets_doc.name',
                           obSetLabel:'$obSets_doc.label',
                           obSetIndex:'$obSets_doc.index',
                           obSetID:'$obSets_doc._id'},
                        
                            obs: {$push: '$obSets_doc.obs_doc'}}},

                {"$project":{
                                _id:'$_id._id',
                                name:'$_id.name',
                                internalName:"$_id.internalName",
                                label:'$_id.label',
                                formType:'$_id.formType',
                                formStyle:"$_id.formStyle",  
                                obSetName:'$_id.obSetName',
                                obSetField:'$_id.obSetField',
                                obSetLabel:'$_id.obSetLabel',
                                obSetIndex:'$_id.obSetIndex',
                                addsIn:'$_id.addsIn',
                                obSetID: '$_id.obSetID',
                                obs:1
                                    
                        }},
                            

                {'$addFields':{'obSets':{'label':'$obSetLabel', 'index':'$obSetIndex','field':'$obSetField','name':'$obSetName', '_id':'$obSetID', 'addsIn':'$addsIn', 'obs':'$obs'}}},

                { $sort : { 'obSets.index': 1 } },
                {"$group": {_id:{_id: "$_id",name:"$name", internalName:"&internalName",label:'$label',formType:"$formType"},
                        
                            obSets: {$push: '$obSets'}}},

                {"$project":{
                    _id:'$_id._id',
                    name:'$_id.name',
                    internalName:"$_id.internalName",
                    label:'$_id.label',
                    formType:'$_id.formType',
                    formStyle:'$_id.formStyle',
                    obSets:1
                        
                }},

                { $sort : { internalName: 1 } }
            ];
        
        }
    else {
        pipeline= [
                       { "$match": { "_id": {$in:formIDs } }},
                    
                        
                        { "$unwind": 
                          "$obSets"
                           // {"path": "$obSets",
                           // "preserveNullAndEmptyArrays": true}
                            },
                       
        
                        { "$lookup": {
                            "let": { "obSetsID": "$obSets._id" },
                            "from": "categories",
                            "pipeline": [
                            { "$match": { "$expr": { "$eq": [ {"$toString":"$_id"}, {"$toString":"$$obSetsID"} ] } } }
                            ],
                            "as": "obSets_doc"
                        }},
                    
                      
                     { "$lookup": {
                        "let": { "obSetsID": "$obSets._id" },
                        "from": "orderitems",
                        "pipeline": [
                        { "$match": { "$expr": { "$eq": [ {"$toString":"$_id"}, {"$toString":"$$obSetsID"} ] } } }
                        ],
                        "as": "obSets_order"
                    }},
    
                    { "$unwind": {
                        "path":'$obSets_doc',
                        "preserveNullAndEmptyArrays": true
                } },
                { "$unwind": {
                    "path":'$obSets_order',
                    "preserveNullAndEmptyArrays": true
            } },
                    {"$addFields": {
                        "obSets_doc":
                                       { "$cond": {
                                           if :{'$gt': ["$obSets_doc", null]},
                                           then:"$obSets_doc",
                                           else:"$obSets_order"
                                           
                                           }
                                   }
                               }
                           },
                    
                        { "$unwind": 
                       // '$obSets_doc.obs'
                        {
                            "path": '$obSets_doc.obs',
                            "preserveNullAndEmptyArrays": true}
                     },
        
                        { "$lookup": {
                            "let": { "obsID": "$obSets_doc.obs._id" },
                            "from": "categories",
                            "pipeline": [
                            { "$match": { "$expr": { "$eq": [ {"$toString":"$_id"}, {"$toString":"$$obsID"} ] } } }
                            ],
                            "as": "obSets_doc.obs_doc"
                        }},
        
                        { "$unwind": {
                            "path":'$obSets_doc.obs_doc',
                            "preserveNullAndEmptyArrays": true
                    } },
                    {"$addFields": {
                        "label":{ $ifNull: [ "$label", {ch:'$name',en:''}] }
                    }},
                        {'$addFields':{'obSets_doc':{'name':'$obSets_doc.name', 
                                                    '_id':'$obSets_doc._id', 
                                                    'addsIn':'$obSets.addsIn', 
                                                    'index':'$obSets.index',
                                                    'field':'$obSets.field',
                                                    'obs_doc':{//'name':'$obSets_doc.obs.name',
                                                                //'_id':'$obSets_doc.obs._id',
                                                                'patientID': req.body.patientID,
                                                                'visitID': req.body.visitID,
                                                                'addsIn':'$obSets_doc.obs.addsIn',
                                                                'required':'$obSets_doc.obs.required',
                                                                'index':'$obSets_doc.obs.index',
                                                              
                                                                //'options':'$obSets_doc.obs_doc.options'
                                                            }}}},
                     {"$addFields": {
                            "obSets_doc.label":{ $ifNull: [ "$obSets_doc.label", {ch:'$obSets_doc.name',en:''}] }
                        }},
        
                        { "$lookup": {
                            "let": { "obsID": "$obSets_doc.obs_doc._id" , 
                                    "obSetsID": "$obSets_doc._id" , 
                                    "patientID":"$obSets_doc.obs_doc.patientID",
                                    "visitID":"$obSets_doc.obs_doc.visitID",
                                    "context": "$obSets_doc.obs_doc.context",
                                    "mappingOb":"$obSets_doc.obs_doc.mappingOb"},
                            "from": "datas",
                            "pipeline":[
                                {
                                      "$match": {
                                              "$expr": {
                                                  "$or":[
                                                      {
                                                    "$and": [
                                                        {
                                                            "$eq": [ "$obID", {"$toString":"$$obsID"} ]
                                                        },
                                                        {
                                                            "$eq": [ "$patientID", "$$patientID" ]
                                                        },
                                                        {
                                                          "$eq": [ "$$context", patientType ]
                                                      },
                                                        
                                                    ]
                                                  },
                                                  {
                                                    "$and": [
                                                        {
                                                            "$eq": [ "$obID", {"$toString":"$$obsID"} ]
                                                        },
                                                        {
                                                            "$eq": [ "$patientID", "$$patientID" ]
                                                        },
                                                        {
                                                            "$eq": [ {"$toString":"$problemItemID"}, {"$toString":"$$obSetsID" }]
                                                        },
                                                    ]
                                                  },
                                                  {
                                                    "$and": [
                                                        {
                                                            "$eq": [ "$obID", {"$toString":"$$obsID"} ]
                                                        },
                                                        {
                                                            "$eq": [ "$patientID", "$$patientID" ]
                                                        },
                                                        {
                                                            "$eq": [ {"$toString":"$medicationItemID"}, {"$toString":"$$obSetsID"} ]
                                                        },
                                                    ]
                                                  },
                                                {
                                                    "$and": [
                                                        {
                                                            "$eq": [ "$obID", {"$toString":"$$obsID"} ]
                                                        },
                                                        {
                                                            "$eq": [ "$patientID", "$$patientID" ]
                                                        },
                                                        {
                                                            "$eq": [ "$visitID", "$$visitID" ]
                                                        },
                                                        {
                                                          "$eq": [ "$$context", visitType ]
                                                      },
                                                        
                                                    ]
                                                },
                                                {
                                                    "$and": [
                                                        {
                                                            "$eq": [ "$obID", {"$toString":"$$mappingOb._id"} ]
                                                        },
                                                        {
                                                            "$eq": [ "$patientID", "$$patientID" ]
                                                        }
                                                      
                                                        
                                                    ]
                                                  },
                                            ]
                                                  
                                              }
                                              }
                                          }
                                  ],
      
                            "as": "obSets_doc.obs_doc.patientData"
                        }},

                        //to get last value
                        
                            {"$addFields": {
                                "obSets_doc.obs_doc.patientData":
                                    { "$arrayElemAt": [ "$obSets_doc.obs_doc.patientData", -1 ] }
                            }
                        },
                     
                        { "$lookup": {
                            "let": { "mappingLab":"$obSets_doc.obs_doc.mappingLab", 
                                      "patientID":"$obSets_doc.obs_doc.patientID" },
                            "from": "labs",
                            "pipeline":[
                                {
                                      "$match": {
                                              "$expr": {
                                                   "$and": [
                                                        {
                                                            "$eq": [ "$labItemID", {"$toString":"$$mappingLab._id"} ]
                                                        },
                                                        {
                                                            "$eq": [ "$patientID", "$$patientID" ]
                                                        },
                                                       // {
                                                       //   "$gte": [ "$$mappingLab.searchDays",{"$subtract": [{"$toDate":req.body.visitDate}, "$resultAt"  ] } ]
                                                     // },
                                                        
                                                    ]
                                              }
                                              }
                                          }
                                  ],
      
                            "as": "obSets_doc.obs_doc.labData"
                        }},  

                        //lookup lab collection
        {"$addFields": {
                        "obSets_doc.obs_doc.labData":   
                        { "$cond": {
                            if:{ "$eq": ["$obSets_doc.obs_doc.mappingLab.seiry", 0]},
                            then:  { "$arrayElemAt": [ "$obSets_doc.obs_doc.labData", -1 ] },
                            else: { "$arrayElemAt": [ "$obSets_doc.obs_doc.labData", -2 ] },
                                    }
                                }
                                //last element
                         }
        },
                        
        /*    { "$unwind": {
                            "path":'$obSets_doc.obs_doc.LabData',
                            "preserveNullAndEmptyArrays": true
            } },*/
                  
//asign lab data to ob value

    
                

            {"$addFields": {
                        "obSets_doc.obs_doc.values":{ $ifNull: [ "$obSets_doc.obs_doc.patientData.values", []] }
                    }
            },
      
    

            //get lab value when patient data is null
            {"$addFields": {
                "obSets_doc.obs_doc.patientData":
                               { "$cond": {
                                   if :{
                                    "$and": [
                                        {'$eq': ["$obSets_doc.obs_doc.type", 'mapping lab']},
                                        {"$eq": [ "obSets_doc.obs_doc.patientData", null ]} 
                                    ]
                               },
                                   then:"$obSets_doc.obs_doc.labData",
                                   else:"$obSets_doc.obs_doc.patientData"
                                   
                                   }
                           }
                       }
            },
            {"$addFields": {
                "obSets_doc.obs_doc.value":{ $ifNull: [ "$obSets_doc.obs_doc.patientData.value", ''] }
            }
    },

            {"$addFields": {
                "obSets_doc.obs_doc.label":{ $ifNull: [ "$obSets_doc.obs_doc.label", {ch:'$obSets_doc.obs_doc.name',en:''}] }
            }
    },
         
            {"$addFields": {
                "obSets_doc.obs_doc.values":
                { "$cond": {
                    if :{"$and":[{"$ne": ["$obSets_doc.obs_doc.value", '']},
                                 {"$in":["$obSets_doc.obs_doc.type",["number", "mapping ob","mapping", "mapping lab"]]}
                                ]
                            },
                    then:{
                     "$map":
                        {
                          input: "$obSets_doc.obs_doc.options",
                          as: "option",
                          in: { "$cond": 
                                    { if:{ "$and":
                                    [{ $gte:[{"$toDecimal":"$obSets_doc.obs_doc.value"}, "$$option.from" ] },
                                    { $lt: [{"$toDecimal":"$obSets_doc.obs_doc.value"}, "$$option.to" ] }
                                    ]
                                    }, 
                                    then: "$$option",
                                    else:null
                                    }
                                }
                        }
                   },
                   else:  { "$cond": {
                                if :{"$and":[
                                            {"$in":["$obSets_doc.obs_doc.type",["list"]]}
                                            ]
                                        },
                                then:{
                                "$map":
                                    {
                                    input: "$obSets_doc.obs_doc.options",
                                    as: "option",
                                    in: { "$cond": 
                                        { if:{ "$and":
                                                [{ "$in":["$$option.text", "$obSets_doc.obs_doc.values" ] }
                                                
                                                ]
                                                }, 
                                                then: "$$option",
                                                else:null
                                                }
                                            }
                                    }
                            },
                            else:[]
                    
                        }
            }
                    
                    }
            }
        }
    },
    {"$addFields": {
        "obSets_doc.obs_doc.values":
        {$filter: {
        input: "$obSets_doc.obs_doc.values",
        as: "item",
        cond: { $ne: [ "$$item", null ] }
     }
        }
    }
},
{ "$unwind": {
    "path":'$obSets_doc.obs_doc.values',
    "preserveNullAndEmptyArrays": true
} },

//{"$addFields": {
//    "obSets_doc.obs_doc.values.number":{ $ifNull: [ "$obSets_doc.obs_doc.values.number", 0] }
//}
//},
    {"$group": {_id:{_id: "$_id",
                        name:"$name",
                        label:"$label",
                        formType:"$formType",
                        formStyle:"$formStyle",
                        obSetAddsIn: '$obSets_doc.addsIn',
                        obSetField: '$obSets_doc.field',
                        obSetName:'$obSets_doc.name',
                        obSetLabel:'$obSets_doc.label',
                        obSetIndex:{"$toDecimal":'$obSets_doc.index'},
                        obSetID:'$obSets_doc._id',
                        obID:'$obSets_doc.obs_doc._id',
                        obName:'$obSets_doc.obs_doc.name',
                        obFormula:'$obSets_doc.obs_doc.formula',
                        obLabel:'$obSets_doc.obs_doc.label',
                        obOptions:'$obSets_doc.obs_doc.options',
                        obAddsIn: '$obSets_doc.obs_doc.addsIn',
                        obRequired: '$obSets_doc.obs_doc.required',
                        obType:'$obSets_doc.obs_doc.type',
                        obValue:'$obSets_doc.obs_doc.value',
                        obIndex: {"$toDecimal":'$obSets_doc.obs_doc.index'},
                        obContext: '$obSets_doc.obs_doc.context',
                        obCalculationItems:'$obSets_doc.obs_doc.calculationItems',
                        obSingleSelection:'$obSets_doc.obs_doc.singleSelection'
                        
                    },
                obValues: {$push: '$obSets_doc.obs_doc.values'},
                obNumber: {$sum: '$obSets_doc.obs_doc.values.number'}},
                    
                    
    },

  

    {"$project":{
        _id:'$_id._id',
        name:'$_id.name',
        label:'$_id.label',
        formType:'$_id.formType',
        formStyle:'$_id.formStyle',
        obSetName:'$_id.obSetName',
        obSetLabel:'$_id.obSetLabel',
        obSetField:'$_id.obSetField',
        obSetIndex:'$_id.obSetIndex',
        obSetAddsIn:'$_id.obSetAddsIn',
        obSetID: '$_id.obSetID',
        obs:{ _id:'$_id.obID',
             name: '$_id.obName',
             label: '$_id.obLabel',
             options:'$_id.obOptions',
             addsIn:'$_id.obAddsIn',
             required:'$_id.obRequired',
            formula:'$_id.obFormula',
             type:'$_id.obType', 
             value:'$_id.obValue',
             index:'$_id.obIndex',
             context:'$_id.obContext',
             calculationItems:'$_id.obCalculationItems',
             singleSelection:'$_id.obSingleSelection',
             values:'$obValues',
             number:'$obNumber'
    }
    }
},
   
{ "$sort": { "obs.index": 1 }},          

    {"$group": {_id:{_id: "$_id",
                    name:"$name",
                    label:"$label",
                    formType:"$formType", 
                    formStyle:"$formStyle", 
                    obSetAddsIn:'$obSetAddsIn',
                    obSetField:'$obSetField',
                    obSetIndex:'$obSetIndex',
                    obSetName:'$obSetName',
                    obSetLabel:'$obSetLabel',
                    obSetID:'$obSetID'},
            obs: {$push: '$obs'},
            obsSum: {$sum: '$obs.number'},
                  
                }
        },

      

        {"$project":{
            _id:'$_id._id',
            name:'$_id.name',
            label:'$_id.label',
            formType:'$_id.formType',
            formStyle:'$_id.formStyle',
            obSetName:'$_id.obSetName',
            obSetLabel:'$_id.obSetLabel',
            obSetAddsIn:'$_id.obSetAddsIn',
            obSetField:'$_id.obSetField',
            obSetIndex:'$_id.obSetIndex',
            obSetID: '$_id.obSetID',
            obs:{
                $map:
                    {
                      input: "$obs",
                       as: "ob",
                       in: 
                        { "$cond": {
                            if:{ "$eq": ["$$ob.type", 'calculation']},
                            then: {"value":"$obsSum", 
                                    "_id":"$$ob._id",
                                    "name":"$$ob.name",
                                    "label":"$$ob.label",
                                    "type":"$$ob.type",
                                    "addsIn": "$$ob.addIn",
                                    "required": "$$ob.required",
                                    "options": "$$ob.options",
                                    "index":"$$ob.index",
                                    "context":"$$ob.context",
                                    "calculationItems":'$$ob.calculationItems',
                                    "singleSelection":'$$ob.singleSelection',
                                    "values":{
                                        "$map":
                                                {
                                                input: "$$ob.options",
                                                as: "option",
                                                in: { "$cond": 
                                                            { if:{ "$and":
                                                            [{ $gte:[{"$toDecimal":"$obsSum"}, "$$option.from" ] },
                                                            { $lt: [{"$toDecimal":"$obsSum"}, "$$option.to" ] }
                                                            ]
                                                            }, 
                                                            then: "$$option",
                                                            else:null
                                                            }
                                                        }
                                                }
                                        }
                                    },
                            else: "$$ob"
                                    }
                                }
                            }
                        }
    }},



      
        {'$addFields':{'obSets':{'name':'$obSetName','label':'$obSetLabel','field':'$obSetField','index':'$obSetIndex',   '_id':'$obSetID', 'addsIn':'$obSetAddsIn', 'obs':'$obs'}}},

        { "$sort": { "obSets.index": 1 }},  
        
        {"$group": {_id:{_id: "$_id",name:"$name",label:"$label",formType:"$formType",formStyle:"$formStyle"},
                    
                        obSets: {$push: '$obSets'}}},

            {"$project":{
                _id:'$_id._id',
                name:'$_id.name',
                label:'$_id.label',
                formType:'$_id.formType',
                formStyle:'$_id.formStyle',
                obSets:1
                    
            }},
            { $sort : { name: 1 } }

];
                
            }
        Category.aggregate(
                 pipeline,
                function(err, result)   {
                console.log ('_id',req.body.formIDs)
                console.log ('result',result)
                if(err) {
                    console.log(err);
                }
                else{
                     res.json(result);
                }
            })
         });
}
exports.getFormById = function(req, res, next) {

    var patientType='patient';
    var visitType='visit';
    var formIDs =[];
    for (let formID of req.body.formIDs){
        formIDs.push( mongoose.Types.ObjectId(formID))
    }
   
    
     if (!req.body.patientID){
            var pipeline= [
                
                { "$match": { "_id": {$in:formIDs } }},
                
                    {"$unwind": '$obSets'},
                    {"$project":{obs:0 }},
    
                    { "$lookup": {
                        "let": { "obSetsID": "$obSets._id" },
                        "from": "categories",
                        "pipeline": [
                        { "$match": { "$expr": { "$eq": [ {"$toString":"$_id"}, {"$toString":"$$obSetsID"} ] } } }
                        ],
                        "as": "obSets_doc"
                    }},
                    { "$lookup": {
                        "let": { "obSetsID": "$obSets._id" },
                        "from": "orderitems",
                        "pipeline": [
                        { "$match": { "$expr": { "$eq": [ {"$toString":"$_id"}, {"$toString":"$$obSetsID"} ] } } }
                        ],
                        "as": "obSets_order"
                    }},
    
                    { "$unwind": {
                        "path":'$obSets_doc',
                        "preserveNullAndEmptyArrays": true
                } },
                { "$unwind": {
                    "path":'$obSets_order',
                    "preserveNullAndEmptyArrays": true
            } },
                    {"$addFields": {
                        "obSets_doc":
                                       { "$cond": {
                                           if :{'$gt': ["$obSets_doc", null]},
                                           then:"$obSets_doc",
                                           else:"$obSets_order"
                                           
                                           }
                                   }
                               }
                           },
                           
                    {"$unwind": '$obSets_doc.obs'},
    
                    { "$lookup": {
                        "let": { "obsID": "$obSets_doc.obs._id" },
                        "from": "categories",
                        "pipeline": [
                        { "$match": { "$expr": { "$eq": [ {"$toString":"$_id"}, {"$toString":"$$obsID"} ] } } }
                        ],
                        "as": "obSets_doc.obs_doc"
                    }},
    
                   
    
                    {"$unwind": '$obSets_doc.obs_doc'},
    
                   
    
                    {'$addFields':{'obSets_doc':{'name':'$obSets_doc.name', 
                                                '_id':'$obSets_doc._id', 
                                                'addsIn':'$obSets.addsIn', 
                                                'index':'$obSets.index',
                                                'field':'$obSets.field',
                                                'obs_doc':{//'name':'$obSets_doc.obs.name',
                                                            //'_id':'$obSets_doc.obs._id',
                                                            'addsIn':'$obSets_doc.obs.addsIn', 
                                                            'options':'$obSets_doc.obs_doc.options',
                                                             'seiry': '$obSets_doc.obs_doc.seiry'}}}},
    
        {"$addFields": {
            "obSets_doc.obs_doc.label":{ $ifNull: [ "$obSets_doc.obs_doc.label", {ch:'$obSets_doc.obs_doc.name',en:''}] }
                }},  
        {"$addFields": {
             "obSets_doc.label":{ $ifNull: [ "$obSets_doc.label", {ch:'$obSets_doc.name',en:''}] }
        }},
    
        {"$addFields": {
           "label":{ $ifNull: [ "$label", {ch:'$name',en:''}] }
        }}, 
        {"$addFields": {
            "obSets_doc.obs_doc.education":{ $ifNull: [ "$obSets_doc.obs_doc.education", {ch:'$obSets_doc.obs_doc.resource',en:''}] }
        }}, 
        { '$sort' : { 'obSets_doc.obs_doc.index': 1 } },
        
                    {"$group": {_id:{_id: "$_id",
                                name:"$name",
                                label:'$label',
                                formType:"$formType",
                                formStyle:"$formStyle",  
                               addsIn:'$obSets_doc.addsIn',
                               obSetField:'$obSets_doc.field',
                               obSetName:'$obSets_doc.name',
                               obSetLabel:'$obSets_doc.label',
                               obSetIndex:'$obSets_doc.index',
                               obSetID:'$obSets_doc._id'},
                            
                                obs: {$push: '$obSets_doc.obs_doc'}}},
    
                    {"$project":{
                                    _id:'$_id._id',
                                    name:'$_id.name',
                                    label:'$_id.label',
                                    formType:'$_id.formType',
                                    formStyle:"$_id.formStyle",  
                                    obSetName:'$_id.obSetName',
                                    obSetField:'$_id.obSetField',
                                    obSetLabel:'$_id.obSetLabel',
                                    obSetIndex:'$_id.obSetIndex',
                                    addsIn:'$_id.addsIn',
                                    obSetID: '$_id.obSetID',
                                    obs:1
                                        
                            }},
                                
    
                    {'$addFields':{'obSets':{'label':'$obSetLabel', 'index':'$obSetIndex','field':'$obSetField','name':'$obSetName', '_id':'$obSetID', 'addsIn':'$addsIn', 'obs':'$obs'}}},
    
                    { $sort : { 'obSets.index': 1 } },
                    {"$group": {_id:{_id: "$_id",name:"$name",label:'$label',formType:"$formType"},
                            
                                obSets: {$push: '$obSets'}}},
    
                    {"$project":{
                        _id:'$_id._id',
                        name:'$_id.name',
                        label:'$_id.label',
                        formType:'$_id.formType',
                        formStyle:'$_id.formStyle',
                        obSets:1
                            
                    }},
    
                    { $sort : { name: 1 } }
                ];
            
            }
        else {
            pipeline= [
                { "$match": { "_id": {$in:formIDs } }},
                        
                            
                            { "$unwind": 
                              "$obSets"
                               // {"path": "$obSets",
                               // "preserveNullAndEmptyArrays": true}
                                },
                           
            
                            { "$lookup": {
                                "let": { "obSetsID": "$obSets._id" },
                                "from": "categories",
                                "pipeline": [
                                { "$match": { "$expr": { "$eq": [ {"$toString":"$_id"}, {"$toString":"$$obSetsID"} ] } } }
                                ],
                                "as": "obSets_doc"
                            }},
                        
                          
                         { "$lookup": {
                            "let": { "obSetsID": "$obSets._id" },
                            "from": "orderitems",
                            "pipeline": [
                            { "$match": { "$expr": { "$eq": [ {"$toString":"$_id"}, {"$toString":"$$obSetsID"} ] } } }
                            ],
                            "as": "obSets_order"
                        }},
        
                        { "$unwind": {
                            "path":'$obSets_doc',
                            "preserveNullAndEmptyArrays": true
                    } },
                    { "$unwind": {
                        "path":'$obSets_order',
                        "preserveNullAndEmptyArrays": true
                } },
                        {"$addFields": {
                            "obSets_doc":
                                           { "$cond": {
                                               if :{'$gt': ["$obSets_doc", null]},
                                               then:"$obSets_doc",
                                               else:"$obSets_order"
                                               
                                               }
                                       }
                                   }
                               },
                        
                            { "$unwind": 
                           // '$obSets_doc.obs'
                            {
                                "path": '$obSets_doc.obs',
                                "preserveNullAndEmptyArrays": true}
                         },
            
                            { "$lookup": {
                                "let": { "obsID": "$obSets_doc.obs._id" },
                                "from": "categories",
                                "pipeline": [
                                { "$match": { "$expr": { "$eq": [ {"$toString":"$_id"}, {"$toString":"$$obsID"} ] } } }
                                ],
                                "as": "obSets_doc.obs_doc"
                            }},
            
                            { "$unwind": {
                                "path":'$obSets_doc.obs_doc',
                                "preserveNullAndEmptyArrays": true
                        } },
                        {"$addFields": {
                            "label":{ $ifNull: [ "$label", {ch:'$name',en:''}] }
                        }},
                            {'$addFields':{'obSets_doc':{'name':'$obSets_doc.name', 
                                                        '_id':'$obSets_doc._id', 
                                                        'addsIn':'$obSets.addsIn', 
                                                        'index':'$obSets.index',
                                                        'field':'$obSets.field',
                                                        'obs_doc':{//'name':'$obSets_doc.obs.name',
                                                                    //'_id':'$obSets_doc.obs._id',
                                                                    'patientID': req.body.patientID,
                                                                    'visitID': req.body.visitID,
                                                                    'orderID': req.body.orderID,
                                                                    'addsIn':'$obSets_doc.obs.addsIn',
                                                                    'required':'$obSets_doc.obs.required',
                                                                    'index':'$obSets_doc.obs.index',
                                                                  
                                                                    //'options':'$obSets_doc.obs_doc.options'
                                                                }}}},
                         {"$addFields": {
                                "obSets_doc.label":{ $ifNull: [ "$obSets_doc.label", {ch:'$obSets_doc.name',en:''}] }
                            }},
            
                            { "$lookup": {
                                "let": { "obsID": "$obSets_doc.obs_doc._id" , 
                                        "obSetsID": "$obSets_doc._id" , 
                                        "patientID":"$obSets_doc.obs_doc.patientID",
                                        "orderID":"$obSets_doc.obs_doc.orderID",
                                        "visitID":"$obSets_doc.obs_doc.visitID",
                                        "context": "$obSets_doc.obs_doc.context",
                                        "mappingOb":"$obSets_doc.obs_doc.mappingOb"},
                                "from": "datas",
                                "pipeline":[
                                    {
                                          "$match": {
                                                  "$expr": {
                                                      "$or":[
                                                          {
                                                        "$and": [
                                                            {
                                                                "$eq": [ "$obID", {"$toString":"$$obsID"} ]
                                                            },
                                                            {
                                                                "$eq": [ "$patientID", "$$patientID" ]
                                                            },
                                                            {
                                                              "$eq": [ "$$context", patientType ]
                                                          },
                                                            
                                                        ]
                                                      },
                                                      {
                                                        "$and": [
                                                            {
                                                                "$eq": [ "$obID", {"$toString":"$$obsID"} ]
                                                            },
                                                            {
                                                                "$eq": [ "$patientID", "$$patientID" ]
                                                            },
                                                            {
                                                                "$eq": [ {"$toString":"$problemItemID"}, {"$toString":"$$obSetsID" }]
                                                            },
                                                        ]
                                                      },
                                                      {
                                                        "$and": [
                                                            {
                                                                "$eq": [ "$obID", {"$toString":"$$obsID"} ]
                                                            },
                                                            {
                                                                "$eq": [ "$patientID", "$$patientID" ]
                                                            },
                                                            {
                                                                "$eq": [ {"$toString":"$medicationItemID"}, {"$toString":"$$obSetsID"} ]
                                                            },
                                                        ]
                                                      },
                                                    {
                                                        "$and": [
                                                            {
                                                                "$eq": [ "$obID", {"$toString":"$$obsID"} ]
                                                            },
                                                            {
                                                                "$eq": [ "$patientID", "$$patientID" ]
                                                            },
                                                            {
                                                                "$eq": [ "$visitID", "$$visitID" ]
                                                            },
                                                            {
                                                                "$eq": [ "$$context", null ]
                                                            },
                                                           
                                                            
                                                        ]
                                                    },
                                                    {
                                                        "$and": [
                                                            {
                                                                "$eq": [ "$obID", {"$toString":"$$obsID"} ]
                                                            },
                                                            {
                                                                "$eq": [ "$patientID", "$$patientID" ]
                                                            },
                                                            {
                                                                "$eq": [ "$visitID", "$$visitID" ]
                                                            },
                                                            {
                                                                "$eq": [ "$$context", 'visit' ]
                                                            },
                                                           
                                                            
                                                        ]
                                                    },
                                                    {
                                                        "$and": [
                                                            {
                                                                "$eq": [ "$obID", {"$toString":"$$obsID"} ]
                                                            },
                                                            {
                                                                "$eq": [ "$patientID", "$$patientID" ]
                                                            },
                                                            {
                                                                "$eq": [ "$orderID", "$$orderID" ]
                                                            },
                                                            {
                                                                "$eq": [ "$visitID", "$$visitID" ]
                                                            },
                                                            {
                                                                "$eq": [ "$$context", 'order' ]
                                                            },
                                                           
                                                           
                                                            
                                                        ]
                                                    },
                                                    {
                                                        "$and": [
                                                            {
                                                                "$eq": [ "$obID", {"$toString":"$$mappingOb._id"} ]
                                                            },
                                                            {
                                                                "$eq": [ "$patientID", "$$patientID" ]
                                                            },
                                                            {"$and":[{"$ne": [ req.body.procedureDate,null]},  
                                                                    {"$gt": [ "$$mappingOb.frameDays",0]},
                                                                    {"$lte": [ {"$subtract":["$$mappingOb.frameDays","$$mappingOb.searchDays"]},
                                                                            {"$divide":  [{"$subtract":
                                                                                [{"$toDate":req.body.visitDate}, 
                                                                                {"$toDate":req.body.procedureDate} 
                                                                                ] },
                                                                            1000 * 3600 * 24 ]
                                                                            } ]
                                                                    },
                                                                    {"$gte": [ {"$add":["$$mappingOb.frameDays","$$mappingOb.searchDays"]},
                                                                    {"$divide":  [{"$subtract":
                                                                        [{"$toDate":req.body.visitDate}, 
                                                                        {"$toDate":req.body.procedureDate} 
                                                                        ] },
                                                                    1000 * 3600 * 24 ]
                                                                    } ]
                                                                }]
                                                            },
                                                          
                                                            
                                                        ]
                                                      },
                                                      {"$and":[
                                                        {
                                                            "$eq": [ "$obID", {"$toString":"$$mappingOb._id"} ]
                                                        },
                                                        {
                                                            "$eq": [ "$patientID", "$$patientID" ]
                                                        },
                                                          {"$eq": [ "$$mappingOb.frameDays",0]},
                                                          {"$gte": [ "$$mappingOb.searchDays",
                                                               {"$divide":
                                                                        [{"$subtract":
                                                                                [{"$toDate":req.body.visitDate}, 
                                                                                {"$toDate":"$resultAt"} 
                                                                                ] },
                                                                        1000 * 3600 * 24 
                                                                        ]
  
                                                                     }
                                                               
                                                                    ]
                                                              }]
                                                        },
                                                      {
                                                        "$and": [
                                                            {
                                                                "$eq": [ "$obID", {"$toString":"$$mappingOb._id"} ]
                                                            },
                                                            {
                                                                "$eq": [ "$patientID", "$$patientID" ]
                                                            },
                                                           
                                                            {"$eq": [ "$$mappingOb.frameDays",0]},
                                                            {"$eq": [ "$$mappingOb.searchDays",0]},
                                                                
                                                          
                                                            
                                                        ]
                                                      },
                                                ]
                                                      
                                                  }
                                                  }
                                              }
                                      ],
          
                                "as": "obSets_doc.obs_doc.patientData"
                            }},
                            
            {"$addFields": {
                "obSets_doc.obs_doc.patientData":
                    { "$arrayElemAt": [ "$obSets_doc.obs_doc.patientData", -1 ] }
             }
           },
                         
          { "$lookup": {
             "let": { "mappingLab":"$obSets_doc.obs_doc.mappingLab", 
                    "patientID":"$obSets_doc.obs_doc.patientID" },
             "from": "labs",
             "pipeline":[
                        {"$match": 
                            {"$expr": 
                                {
                                    "$and": [
                                     {"$eq": [ "$labItemID", {"$toString":"$$mappingLab._id"} ]
                                     },
                                      {"$eq": [ "$patientID", "$$patientID" ]
                                     },
                                      {"$or":[
                                          {"$and":[{"$ne": [ req.body.procedureDate,null]},  
                                                   {"$gt": [ "$$mappingLab.frameDays",0]},
                                                   {"$lte": [ {"$subtract":["$$mappingLab.frameDays","$$mappingLab.searchDays"]},
                                                            {"$divide":  [{"$subtract":
                                                                [{"$toDate":"$resultAt"}, 
                                                                {"$toDate":req.body.procedureDate} 
                                                                ] },
                                                            1000 * 3600 * 24 ]
                                                            } ]
                                                    },
                                                    {"$gt": [ {"$add":["$$mappingLab.frameDays","$$mappingLab.searchDays"]},
                                                    {"$divide":  [{"$subtract":
                                                        [{"$toDate":"$resultAt"}, 
                                                        {"$toDate":req.body.procedureDate} 
                                                        ] },
                                                    1000 * 3600 * 24 ]
                                                    } ]
                                                }]
                                            },
                                        {"$and":[
                                              {"$ne": [ req.body.procedureDate,null]},
                                              {"$lte": [ "$$mappingLab.frameDays",0]},
                                               {"$lte": [
                                                    {"$divide":
                                                       [{"$subtract":
                                                          [{"$toDate":"$resultAt"}, 
                                                            {"$toDate":req.body.procedureDate} 
                                                           ]
                                                        },
                                                        1000 * 3600 * 24 
                                                      ]
                                                     },0
                                                     ]
                                                  }
                                                ]
                                          },
                                          {"$and":[{"$eq": [ "$$mappingLab.frameDays",0]},
                                                    {"$gte": [ "$$mappingLab.searchDays",
                                                             {"$divide":
                                                                      [{"$subtract":
                                                                              [{"$toDate":req.body.visitDate}, 
                                                                              {"$toDate":"$resultAt"} 
                                                                              ] },
                                                                      1000 * 3600 * 24 
                                                                      ]

                                                                   }
                                                             
                                                                  ]
                                                            }]
                                            },
                                        ]
                                    },
                                ]
                                    
                                }
                            }
                        }
                                ],
          
                                "as": "obSets_doc.obs_doc.labData"
                            }},  
    
                            {"$addFields": {
                                "obSets_doc.obs_doc.labData":   
                                { "$cond": {
                                    if:{ "$eq": ["$obSets_doc.obs_doc.mappingLab.seiry", 0]},
                                    then:  { "$arrayElemAt": [ "$obSets_doc.obs_doc.labData", -1 ] },
                                    else: { "$arrayElemAt": [ "$obSets_doc.obs_doc.labData", -2 ] },
                                            }
                                        }
                                        //last element
                                 }
                },
                                
                /*    { "$unwind": {
                                    "path":'$obSets_doc.obs_doc.LabData',
                                    "preserveNullAndEmptyArrays": true
                    } },*/
                          
        //asign lab data to ob value
        
            
                        
        
                    {"$addFields": {
                                "obSets_doc.obs_doc.values":{ $ifNull: [ "$obSets_doc.obs_doc.patientData.values", []] }
                            }
                    },
              
            
                    {"$addFields": {
                        "obSets_doc.obs_doc.patientData":
                                       { "$cond": {
                                           if :{'$eq': ["$obSets_doc.obs_doc.type", 'mapping lab']},
                                           then:"$obSets_doc.obs_doc.labData",
                                           else:"$obSets_doc.obs_doc.patientData"
                                           
                                           }
                                   }
                               }
                    },
                    {"$addFields": {
                        "obSets_doc.obs_doc.value":{ $ifNull: [ "$obSets_doc.obs_doc.patientData.value", ''] }
                    }
            },
        
                    {"$addFields": {
                        "obSets_doc.obs_doc.label":{ $ifNull: [ "$obSets_doc.obs_doc.label", {ch:'$obSets_doc.obs_doc.name',en:''}] }
                    }
            },
                 
                    {"$addFields": {
                        "obSets_doc.obs_doc.values":
                        { "$cond": {
                            if :{"$and":[{"$ne": ["$obSets_doc.obs_doc.value", '']},
                                         {"$in":["$obSets_doc.obs_doc.type",["number", "mapping ob","mapping", "mapping lab"]]}
                                        ]
                                    },
                            then:{
                             "$map":
                                {
                                  input: "$obSets_doc.obs_doc.options",
                                  as: "option",
                                  in: { "$cond": 
                                            { if:{ "$and":
                                            [{ $gte:[{"$toDecimal":"$obSets_doc.obs_doc.value"}, "$$option.from" ] },
                                            { $lt: [{"$toDecimal":"$obSets_doc.obs_doc.value"}, "$$option.to" ] }
                                            ]
                                            }, 
                                            then: "$$option",
                                            else:null
                                            }
                                        }
                                }
                           },
                           else:  { "$cond": {
                                        if :{"$and":[
                                                    {"$in":["$obSets_doc.obs_doc.type",["list"]]}
                                                    ]
                                                },
                                        then:{
                                        "$map":
                                            {
                                            input: "$obSets_doc.obs_doc.options",
                                            as: "option",
                                            in: { "$cond": 
                                                { if:{ "$and":
                                                        [{ "$in":["$$option.text", "$obSets_doc.obs_doc.values" ] }
                                                        
                                                        ]
                                                        }, 
                                                        then: "$$option",
                                                        else:null
                                                        }
                                                    }
                                            }
                                    },
                                    else:[]
                            
                                }
                    }
                            
                            }
                    }
                }
            },
            {"$addFields": {
                "obSets_doc.obs_doc.values":
                {$filter: {
                input: "$obSets_doc.obs_doc.values",
                as: "item",
                cond: { $ne: [ "$$item", null ] }
             }
                }
            }
        },
        { "$unwind": {
            "path":'$obSets_doc.obs_doc.values',
            "preserveNullAndEmptyArrays": true
        } },
        
        //{"$addFields": {
        //    "obSets_doc.obs_doc.values.number":{ $ifNull: [ "$obSets_doc.obs_doc.values.number", 0] }
        //}
        //},
            {"$group": {_id:{_id: "$_id",
                                name:"$name",
                                label:"$label",
                                formType:"$formType",
                                formStyle:"$formStyle",
                                obSetAddsIn: '$obSets_doc.addsIn',
                                obSetField: '$obSets_doc.field',
                                obSetName:'$obSets_doc.name',
                                obSetLabel:'$obSets_doc.label',
                                obSetIndex:{"$toDecimal":'$obSets_doc.index'},
                                obSetID:'$obSets_doc._id',
                                obID:'$obSets_doc.obs_doc._id',
                                obName:'$obSets_doc.obs_doc.name',
                                obFormula:'$obSets_doc.obs_doc.formula',
                                obLabel:'$obSets_doc.obs_doc.label',
                                obOptions:'$obSets_doc.obs_doc.options',
                                obAddsIn: '$obSets_doc.obs_doc.addsIn',
                                obRequired: '$obSets_doc.obs_doc.required',
                                obMappingOb: '$obSets_doc.obs_doc.mappingOb',
                                obType:'$obSets_doc.obs_doc.type',
                                obValue:'$obSets_doc.obs_doc.value',
                                obIndex: {"$toDecimal":'$obSets_doc.obs_doc.index'},
                                obContext: '$obSets_doc.obs_doc.context',
                                obCalculationItems:'$obSets_doc.obs_doc.calculationItems',
                                obSingleSelection:'$obSets_doc.obs_doc.singleSelection'
                                
                            },
                        obValues: {$push: '$obSets_doc.obs_doc.values'},
                        obNumber: {$sum: '$obSets_doc.obs_doc.values.number'}},
                            
                            
            },
        
         
        
            {"$project":{
                _id:'$_id._id',
                name:'$_id.name',
                label:'$_id.label',
                formType:'$_id.formType',
                formStyle:'$_id.formStyle',
                obSetName:'$_id.obSetName',
                obSetLabel:'$_id.obSetLabel',
                obSetField:'$_id.obSetField',
                obSetIndex:'$_id.obSetIndex',
                obSetAddsIn:'$_id.obSetAddsIn',
                obSetID: '$_id.obSetID',
                obs:{ _id:'$_id.obID',
                     name: '$_id.obName',
                     label: '$_id.obLabel',
                     options:'$_id.obOptions',
                     addsIn:'$_id.obAddsIn',
                     required:'$_id.obRequired',
                    mappingOb:'$_id.obMappingOb',
                    formula:'$_id.obFormula',
                     type:'$_id.obType', 
                     value:'$_id.obValue',
                     index:'$_id.obIndex',
                     context:'$_id.obContext',
                     calculationItems:'$_id.obCalculationItems',
                     singleSelection:'$_id.obSingleSelection',
                     values:'$obValues',
                     number:'$obNumber'
            }
            }
        },
           
        { "$sort": { "obs.index": 1 }},          
            {"$group": {_id:{_id: "$_id",
                            name:"$name",
                            label:"$label",
                            formType:"$formType", 
                            formStyle:"$formStyle", 
                            obSetAddsIn:'$obSetAddsIn',
                            obSetField:'$obSetField',
                            obSetIndex:'$obSetIndex',
                            obSetName:'$obSetName',
                            obSetLabel:'$obSetLabel',
                            obSetID:'$obSetID'},
                    obs: {$push: '$obs'},
                    obsSum: {$sum: '$obs.number'},
                          
                        }
                },
        
              
        
                {"$project":{
                    _id:'$_id._id',
                    name:'$_id.name',
                    label:'$_id.label',
                    formType:'$_id.formType',
                    formStyle:'$_id.formStyle',
                    obSetName:'$_id.obSetName',
                    obSetLabel:'$_id.obSetLabel',
                    obSetAddsIn:'$_id.obSetAddsIn',
                    obSetField:'$_id.obSetField',
                    obSetIndex:'$_id.obSetIndex',
                    obSetID: '$_id.obSetID',
                    obs:{
                        $map:
                            {
                              input: "$obs",
                               as: "ob",
                               in: 
                                { "$cond": {
                                    if:{ "$eq": ["$$ob.type", 'calculation']},
                                    then: {"value":"$obsSum", 
                                            "_id":"$$ob._id",
                                            "name":"$$ob.name",
                                            "label":"$$ob.label",
                                            "type":"$$ob.type",
                                            "addsIn": "$$ob.addIn",
                                            "required": "$$ob.required",
                                            "options": "$$ob.options",
                                            "index":"$$ob.index",
                                            "context":"$$ob.context",
                                            "calculationItems":'$$ob.calculationItems',
                                            "singleSelection":'$$ob.singleSelection',
                                            "values":{
                                                "$map":
                                                        {
                                                        input: "$$ob.options",
                                                        as: "option",
                                                        in: { "$cond": 
                                                                    { if:{ "$and":
                                                                    [{ $gte:[{"$toDecimal":"$obsSum"}, "$$option.from" ] },
                                                                    { $lt: [{"$toDecimal":"$obsSum"}, "$$option.to" ] }
                                                                    ]
                                                                    }, 
                                                                    then: "$$option",
                                                                    else:null
                                                                    }
                                                                }
                                                        }
                                                }
                                            },
                                    else: "$$ob"
                                            }
                                        }
                                    }
                                }
            }},
        
        
        
              
                {'$addFields':{'obSets':{'name':'$obSetName','label':'$obSetLabel','field':'$obSetField','index':'$obSetIndex',   '_id':'$obSetID', 'addsIn':'$obSetAddsIn', 'obs':'$obs'}}},
        
                { "$sort": { "obSets.index": 1 }},  
                
                {"$group": {_id:{_id: "$_id",name:"$name",label:"$label",formType:"$formType",formStyle:"$formStyle"},
                            
                                obSets: {$push: '$obSets'}}},
        
                    {"$project":{
                        _id:'$_id._id',
                        name:'$_id.name',
                        label:'$_id.label',
                        formType:'$_id.formType',
                        formStyle:'$_id.formStyle',
                        obSets:1
                            
                    }},
                    { $sort : { name: 1 } }
    
    
    
    ];
                    
                }
            Category.aggregate(
                     pipeline,
                    function(err, result)   {
                    console.log ('_id',req.body.formIDs)
                    console.log ('result',result)
                    if(err) {
                        console.log(err);
                    }
                    else{
                         res.json(result);
                    }
                })
            
    }

          
exports.getUserForm = function(req, res, next) {

     var formIDs=[];
  
        for (let formID of req.body.formIDs){
            
                    formIDs.push(mongoose.Types.ObjectId(formID) )
                }
    
  if (!req.body.userID){
            var pipeline= [
                
                { "$match": { "_id": {$in: formIDs } }},
                
                    {"$unwind": '$obSets'},
                    {"$project":{obs:0 }},
    
                    { "$lookup": {
                        "let": { "obSetsID": "$obSets._id" },
                        "from": "categories",
                        "pipeline": [
                        { "$match": { "$expr": { "$eq": [ {"$toString":"$_id"}, {"$toString":"$$obSetsID"} ] } } }
                        ],
                        "as": "obSets_doc"
                    }},
                    {"$unwind": '$obSets_doc'},
                    {"$unwind": '$obSets_doc.obs'},
    
                    { "$lookup": {
                        "let": { "obsID": "$obSets_doc.obs._id" },
                        "from": "categories",
                        "pipeline": [
                        { "$match": { "$expr": { "$eq": [ {"$toString":"$_id"}, {"$toString":"$$obsID"} ] } } }
                        ],
                        "as": "obSets_doc.obs_doc"
                    }},
    
                   
    
                    {"$unwind": '$obSets_doc.obs_doc'},
    
                    {'$addFields':{'obSets_doc':{'name':'$obSets_doc.name', 
                                                '_id':'$obSets_doc._id', 
                                                'addsIn':'$obSets.addsIn', 
                                                'index':'$obSets.index',
                                                'obs_doc':{//'name':'$obSets_doc.obs.name',
                                                            //'_id':'$obSets_doc.obs._id',
                                                            'addsIn':'$obSets_doc.obs.addsIn', 
                                                            'options':'$obSets_doc.obs_doc.options'}}}},
    
        {"$addFields": {
            "obSets_doc.obs_doc.label":{ $ifNull: [ "$obSets_doc.obs_doc.label", {ch:'$obSets_doc.obs_doc.name',en:''}] }
                }},  
        {"$addFields": {
             "obSets_doc.label":{ $ifNull: [ "$obSets_doc.label", {ch:'$obSets_doc.name',en:''}] }
        }},
    
        {"$addFields": {
           "label":{ $ifNull: [ "$label", {ch:'$name',en:''}] }
        }}, 
        {"$addFields": {
            "obSets_doc.obs_doc.education":{ $ifNull: [ "$obSets_doc.obs_doc.education", {ch:'$obSets_doc.obs_doc.resource',en:''}] }
        }}, 
        
                    {"$group": {_id:{_id: "$_id",
                                name:"$name",
                                label:'$label',
                                formType:"$formType", 
                               addsIn:'$obSets_doc.addsIn',
                               obSetName:'$obSets_doc.name',
                               obSetLabel:'$obSets_doc.label',
                               obSetIndex:'$obSets_doc.index',
                               obSetID:'$obSets_doc._id'},
                            
                                obs: {$push: '$obSets_doc.obs_doc'}}},

                  {"$project":{
                                    _id:'$_id._id',
                                    name:'$_id.name',
                                    label:'$_id.label',
                                    formType:'$_id.formType',
                                    obSetName:'$_id.obSetName',
                                    obSetLabel:'$_id.obSetLabel',
                                    obSetIndex:'$_id.obSetIndex',
                                    addsIn:'$_id.addsIn',
                                    obSetID: '$_id.obSetID',
                                    obs:1
                                        
                            }},
                                
    
                    {'$addFields':{'obSets':{'label':'$obSetLabel', 'index':'$obSetIndex','name':'$obSetName', '_id':'$obSetID', 'addsIn':'$addsIn', 'obs':'$obs'}}},
    
                    { $sort : { 'obSets.index': 1 } },

                    {"$group": {_id:{_id: "$_id",name:"$name",label:'$label',formType:"$formType"},
                            
                                obSets: {$push: '$obSets'}}},
    
                  
                        {"$project":{
                                    _id:'$_id._id',
                                    name:'$_id.name',
                                    label:'$_id.label',
                                    formType:'$_id.formType',
                                    obSets:1
                                        
                                }},
                
                                { $sort : { formType: 1 } }
                ];
            
            }
    else {
        pipeline= [
            { "$match": { "_id": {$in:formIDs } }},
         
             
             { "$unwind": 
               "$obSets"
                // {"path": "$obSets",
                // "preserveNullAndEmptyArrays": true}
                 },
            

             { "$lookup": {
                 "let": { "obSetsID": "$obSets._id" },
                 "from": "categories",
                 "pipeline": [
                 { "$match": { "$expr": { "$eq": [ {"$toString":"$_id"}, {"$toString":"$$obSetsID"} ] } } }
                 ],
                 "as": "obSets_doc"
             }},
         
           
          { "$lookup": {
             "let": { "obSetsID": "$obSets._id" },
             "from": "orderitems",
             "pipeline": [
             { "$match": { "$expr": { "$eq": [ {"$toString":"$_id"}, {"$toString":"$$obSetsID"} ] } } }
             ],
             "as": "obSets_order"
         }},

         { "$unwind": {
             "path":'$obSets_doc',
             "preserveNullAndEmptyArrays": true
     } },
     { "$unwind": {
         "path":'$obSets_order',
         "preserveNullAndEmptyArrays": true
 } },
         {"$addFields": {
             "obSets_doc":
                            { "$cond": {
                                if :{'$gt': ["$obSets_doc", null]},
                                then:"$obSets_doc",
                                else:"$obSets_order"
                                
                                }
                        }
                    }
                },
         
             { "$unwind": 
            // '$obSets_doc.obs'
             {
                 "path": '$obSets_doc.obs',
                 "preserveNullAndEmptyArrays": true}
          },

             { "$lookup": {
                 "let": { "obsID": "$obSets_doc.obs._id" },
                 "from": "categories",
                 "pipeline": [
                 { "$match": { "$expr": { "$eq": [ {"$toString":"$_id"}, {"$toString":"$$obsID"} ] } } }
                 ],
                 "as": "obSets_doc.obs_doc"
             }},

             { "$unwind": {
                 "path":'$obSets_doc.obs_doc',
                 "preserveNullAndEmptyArrays": true
         } },
         {"$addFields": {
             "label":{ $ifNull: [ "$label", {ch:'$name',en:''}] }
         }},
             {'$addFields':{'obSets_doc':{'name':'$obSets_doc.name', 
                                         '_id':'$obSets_doc._id', 
                                         'addsIn':'$obSets.addsIn', 
                                         'index':'$obSets.index',
                                         'field':'$obSets.field',
                                         'obs_doc':{//'name':'$obSets_doc.obs.name',
                                                     //'_id':'$obSets_doc.obs._id',
                                                     'userID': req.body.userID,
                                               
                                                     'addsIn':'$obSets_doc.obs.addsIn',
                                                     'index':'$obSets_doc.obs.index',
                                                   
                                                     //'options':'$obSets_doc.obs_doc.options'
                                                 }}}},
          {"$addFields": {
                 "obSets_doc.label":{ $ifNull: [ "$obSets_doc.label", {ch:'$obSets_doc.name',en:''}] }
             }},

             { "$lookup": {
                 "let": { "obsID": "$obSets_doc.obs_doc._id" , 
                         "userID":"$obSets_doc.obs_doc.userID",
                        },
                 "from": "datas",
                 "pipeline":[
                     {
                           "$match": {
                                   "$expr": {
                                       "$or":[
                                           {
                                         "$and": [
                                             {
                                                 "$eq": [{"$toString": "$obID"}, {"$toString":"$$obsID"} ]
                                             },
                                             {
                                                 "$eq": [{"$toString": "$registryUserID"},{"$toString": "$$userID"} ]
                                             },
                                           
                                             
                                         ]
                                       },
                                    ]
                                       
                                   }
                                   }
                               }
                       ],

                 "as": "obSets_doc.obs_doc.userData"
             }},
             
             { "$unwind": 
  
              {
                  "path": '$obSets_doc.obs_doc.userData',
                  "preserveNullAndEmptyArrays": true}
           },
 

         
     

 {"$addFields": {
             "obSets_doc.obs_doc.values":{ $ifNull: [ "$obSets_doc.obs_doc.userData.values", []] }
         }
 },
 {"$addFields": {
    "obSets_doc.obs_doc.value":{ $ifNull: [ "$obSets_doc.obs_doc.userData.value", ''] }
}
},
 {"$addFields": {
     "obSets_doc.obs_doc.label":{ $ifNull: [ "$obSets_doc.obs_doc.label", {ch:'$obSets_doc.obs_doc.name',en:''}] }
 }
},

 {"$addFields": {
     "obSets_doc.obs_doc.values":
    { "$cond": {
                     if :{"$and":[
                                 {"$in":["$obSets_doc.obs_doc.type",["list"]]}
                                 ]
                             },
                     then:{
                     "$map":
                         {
                         input: "$obSets_doc.obs_doc.options",
                         as: "option",
                         in: { "$cond": 
                             { if:{ "$and":
                                     [{ "$in":["$$option.text", "$obSets_doc.obs_doc.values" ] }
                                     
                                     ]
                                     }, 
                                     then: "$$option",
                                     else:null
                                     }
                                 }
                         }
                 },
                 else:[]
         
             }
 }
         
         }
 },


{ "$unwind": {
"path":'$obSets_doc.obs_doc.values',
"preserveNullAndEmptyArrays": true
} },

//{"$addFields": {
//    "obSets_doc.obs_doc.values.number":{ $ifNull: [ "$obSets_doc.obs_doc.values.number", 0] }
//}
//},
{"$group": {_id:{_id: "$_id",
             name:"$name",
             label:"$label",
             formType:"$formType", 
             obSetAddsIn: '$obSets_doc.addsIn',
             obSetField: '$obSets_doc.field',
             obSetName:'$obSets_doc.name',
             obSetLabel:'$obSets_doc.label',
             obSetIndex:{"$toDecimal":'$obSets_doc.index'},
             obSetID:'$obSets_doc._id',
             obID:'$obSets_doc.obs_doc._id',
             obName:'$obSets_doc.obs_doc.name',
             obLabel:'$obSets_doc.obs_doc.label',
             obOptions:'$obSets_doc.obs_doc.options',
             obAddsIn: '$obSets_doc.obs_doc.addsIn',
     
             obType:'$obSets_doc.obs_doc.type',
             obValue:'$obSets_doc.obs_doc.value',
             obIndex: {"$toDecimal":'$obSets_doc.obs_doc.index'},
             obContext: '$obSets_doc.obs_doc.context',
             obCalculationItems:'$obSets_doc.obs_doc.calculationItems',
             obSingleSelection:'$obSets_doc.obs_doc.singleSelection'
             
         },
     obValues: {$push: '$obSets_doc.obs_doc.values'},
     obNumber: {$sum: '$obSets_doc.obs_doc.values.number'}},
         
         
},
{"$addFields": {
    "obValues":
    {$filter: {
    input: "$obValues",
    as: "item",
    cond: { $ne: [ "$$item", null ] }
    }
    }
    }
    },

{ "$sort": { "_id.obIndex": 1 }}, 

{"$project":{
_id:'$_id._id',
name:'$_id.name',
label:'$_id.label',
formType:'$_id.formType',
obSetName:'$_id.obSetName',
obSetLabel:'$_id.obSetLabel',
obSetField:'$_id.obSetField',
obSetIndex:'$_id.obSetIndex',
obSetAddsIn:'$_id.obSetAddsIn',
obSetID: '$_id.obSetID',
obs:{ _id:'$_id.obID',
  name: '$_id.obName',
  label: '$_id.obLabel',
  options:'$_id.obOptions',
  addsIn:'$_id.obAddsIn',


  type:'$_id.obType', 
  value:'$_id.obValue',
  index:'$_id.obIndex',
  context:'$_id.obContext',
  calculationItems:'$_id.obCalculationItems',
  singleSelection:'$_id.obSingleSelection',
  values:'$obValues',
  number:'$obNumber'
}
}
},

{ "$sort": { "obs.index": 1 }},          
{"$group": {_id:{_id: "$_id",
         name:"$name",
         label:"$label",
         formType:"$formType", 
         obSetAddsIn:'$obSetAddsIn',
         obSetField:'$obSetField',
         obSetIndex:'$obSetIndex',
         obSetName:'$obSetName',
         obSetLabel:'$obSetLabel',
         obSetID:'$obSetID'},
 obs: {$push: '$obs'},
 obsSum: {$sum: '$obs.number'},
       
     }
},



{"$project":{
 _id:'$_id._id',
 name:'$_id.name',
 label:'$_id.label',
 formType:'$_id.formType',
 obSetName:'$_id.obSetName',
 obSetLabel:'$_id.obSetLabel',
 obSetAddsIn:'$_id.obSetAddsIn',
 obSetField:'$_id.obSetField',
 obSetIndex:'$_id.obSetIndex',
 obSetID: '$_id.obSetID',
 obs:{
     $map:
         {
           input: "$obs",
            as: "ob",
            in: 
             { "$cond": {
                 if:{ "$eq": ["$$ob.type", 'calculation']},
                 then: {"value":"$obsSum", 
                         "_id":"$$ob._id",
                         "name":"$$ob.name",
                         "label":"$$ob.label",
                         "type":"$$ob.type",
                         "addsIn": "$$ob.addIn",
                         "options": "$$ob.options",
                         "index":"$$ob.index",
                         "context":"$$ob.context",
                         "calculationItems":'$$ob.calculationItems',
                         "singleSelection":'$$ob.singleSelection',
                         "values":{
                             "$map":
                                     {
                                     input: "$$ob.options",
                                     as: "option",
                                     in: { "$cond": 
                                                 { if:{ "$and":
                                                 [{ $gte:[{"$toDecimal":"$obsSum"}, "$$option.from" ] },
                                                 { $lt: [{"$toDecimal":"$obsSum"}, "$$option.to" ] }
                                                 ]
                                                 }, 
                                                 then: "$$option",
                                                 else:null
                                                 }
                                             }
                                     }
                             }
                         },
                 else: "$$ob"
                         }
                     }
                 }
             }
}},




{'$addFields':{'obSets':{'name':'$obSetName','label':'$obSetLabel','field':'$obSetField','index':'$obSetIndex',   '_id':'$obSetID', 'addsIn':'$obSetAddsIn', 'obs':'$obs'}}},

{ "$sort": { "obSets.index": 1 }},  

{"$group": {_id:{_id: "$_id",name:"$name",label:"$label",formType:"$formType"},
         
             obSets: {$push: '$obSets'}}},

 {"$project":{
     _id:'$_id._id',
     name:'$_id.name',
     label:'$_id.label',
     formType:'$_id.formType',
     obSets:1
         
 }},

];
     
 }
                
 Category.aggregate(
    pipeline,
   function(err, result)   {
   console.log ('_id',req.body.formIDs)
   console.log ('result',result)
   if(err) {
       console.log(err);
   }
   else{
        res.json(result);
   }
})
          
             
    }
    
      
  
exports.getProblemForm = function(req, res, next) {

    var patientType='patient';
    var visitType='visit';
    var obIDs=[];
   
    var problemID=mongoose.Types.ObjectId(req.body.problemID);
    console.log ('problem._id-1', problemID)

  
   
            pipeline= [
                           { "$match": { "_id": problemID}},
                           { "$unwind": "$obs"},
                           { "$lookup": {
                                "let": { "id": "$obs._id" },
                                "from": "categories",
                                "pipeline": [
                                { "$match": { "$expr": { "$eq": [ {"$toString":"$_id"}, {"$toString":"$$id"} ] } } }
                                ],
                                "as": "obs_doc"
                            }},
            
                            { "$unwind": 
                                '$obs_doc', },

                     
                            {'$project':
                                { 
                                'addsIn':'$obs.addsIn',
                                'index':'$obs.index',
                                'name':'$obs.name',
                                'label':'$obs_doc.label',
                                 'options':'$obs_doc.options',
                                 'type':'$obs_doc.type',
                                 'context':'$obs_doc.context',
                                  '_id':'$obs_doc._id',
                                  'values':[]
                               
                                }
                             }

];
                    
            Category.aggregate(
                     pipeline,
                    function(err, result)   {
                    console.log ('_id',req.body.formIDs)
                    console.log ('result',result)
                    if(err) {
                        console.log(err);
                    }
                    else{
                         res.json(result);
                    }
                })
            
    
} 


exports.getByPatient = function(req, res, next) {

    Category.find(req.body, function(err, data) {
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

exports.getByField = function(req, res, next) {

    Category.find({ 'field': req.params.field }, function(err, data) {
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
exports.getByFilter = function(req, res, next) {

    Category.find(req.body, function(err, data) {
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
exports.getOrderMasters = function(req, res, next) {

    Category.find(req.body, function(err, data) {
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

exports.getByFields = function(req, res, next) {
    console.log('fileds', req.body)

    Category.find({ 'field': { $in: req.body } }, function(err, data) {
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

exports.getByActivityType = function(req, res, next) {

    console.log('activityType', req.params)

    Category.find({ 'activityType': req.params.activityType }, function(err, data) {
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

exports.getByFormType = function(req, res, next) {

    console.log('formType', req.params)

    Category.find({ 'formType': req.params.formType }, function(err, data) {
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
exports.getByProfileType = function(req, res, next) {

    console.log('profileType', req.params)

    Category.find({ 'profileType': req.params.profileType }, function(err, data) {
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

    Category.findByIdAndUpdate(req.body._id, { $set: req.body }, { new: true },
        function(err, request) {
            if (err) {
                res.send(err);
            } else {
                res.json(request);
            }
        });
}

exports.create = function(req, res, next) {

    Category.create((req.body),
        function(err, Category) {

            if (err) {
                res.send(err);
            }

            res.json(Category);

        });

}

exports.delete = function(req, res, next) {

    Category.remove({
        _id: req.params.categoryId
    }, function(err, Category) {
        res.json(Category);
    });

}


