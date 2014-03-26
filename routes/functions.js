var MongoClient = require('mongodb').MongoClient
    , format = require('util').format;

// variable connection will hold the connection to the db
var connection;

// variables holding the name of the db and the collection
var dbName = 'mongodb://localhost/test';
var collName = 'tshirts';

var mongo = require('mongodb');
var BSON = mongo.BSONPure;

// REDIS variables
var redis  = require("redis"),
    client = redis.createClient();

var ttl = 86400;

// Initiate the DB connection
var initDB = function (function_cb){

  MongoClient.connect(dbName, function(err, db) {
    connection = db;
    function_cb(err);
  });

};

// Function connecting to db and retrieving all tshirts in the DB
var findAllTshirts = function(function_cb) {
    console.log("GET - /tshirts");
    
    if (connection != null){
    // Collection holds the collection on the db
    var collection = connection.collection(collName);

    // Locate all the entries using find
    collection.find().limit(5).toArray(function(err, results) {
        console.dir(results);
        function_cb(err,results);
    });}
};

// EXPORT: GET /tshirts function
var getAll = function(req, res){
    findAllTshirts(function(err, results){
        if(err){
            res.send(500);
        }
        else
        {
            console.log("OK");
            res.send(results);
        }
    })
};

// Function connecting to db and retrieving one tshirts in the DB
var findTshirt = function(request, function_cb) {
    console.log("GET - /tshirt/:id");
    
    if (connection != null){
    // Collection holds the collection on the db
    var collection = connection.collection(collName);
    
    var o_id = new BSON.ObjectID(request.params.id);
        
    
    // Locate all the entries using find
    collection.find(o_id).toArray(function(err, results) {
        console.dir(results);
        function_cb(err,results);

    });
    }
};

// Stores access to tshirt in REDIS
var addHotTshirt = function(tshirt_id) {

    // Retrieve key in REDIS for tshirt
    client.get("hot."+ tshirt_id, function(err, instance){
        
        // Si the key does not exist yet
        if (!instance) {
        
            // Create new key with initial value 1
            // Expiration time (ttl) = 1 day
            client.set ("hot."+ tshirt_id, 1, "EX", ttl, function(error, result) {
                if (error){
                    console.log('Error: ' + error);  
                } 
                else {
                    console.log('Instance saved!');
                }
            });
        }
        
        // If the key exists in REDIS
        else {
            // If existing, add 1 to the current value
            client.incr("hot." + tshirt_id, function(error, inst){
                if (error){
                    console.log('Error: ' + error);  
                } 
                else{
                    console.log('Instance incremented!');  
                } 
            });
            
            // Reset expiration time (ttl) = 1 dat
            client.expire("hot." + tshirt_id, ttl, function(error){
                if (error) {
                    console.log('Error: ' + error);
                }
                else {
                    console.log('Instance expire time restaured!');  
                } 
            });
          }
        });
}

// EXPORT: GET /tshirt/:id function
var getOne = function(req, res){
    findTshirt(req, function(err, results){
        if(err){
            res.send(500);
        }
        else
        {
            addHotTshirt(req.params.id);
            console.log("OK");
            res.send(results);
        }
    })
};

// creates new tshirt in db
var newTshirt = function(request, function_cb){

    console.log('POST - /tshirt');
    console.log(request.params);

    if (connection != null){
        // Collection holds the collection on the db
        var collection = connection.collection(collName);
         

        console.log(request.query.model);
        console.log(request.query.style);
        console.log(request.query.size);
        console.log(request.query.colour);
        console.log(request.query.price);
        // Locate all the entries using find
        collection.save({
            model:    request.query.model,
            images :  request.query.images, 
            style:    request.query.style,
            size :    request.query.size, 
            colour:   request.query.colour, 
            price:    request.query.price,
            summary:  request.query.summary
        }, function(err, results) {
            console.dir(results);
            function_cb(err,results);
        });
    }
}

// EXPORT: POST /thshirt function
var addTshirt = function(req, res){
    newTshirt(req, function(err, results){
        if(err){
            res.send(500);
        }
        else
        {
            console.log("OK - created");
            res.send(results);
        }
    })
};

// Changes values in existing tshirt in db
var changeTshirt = function(request, function_cb){

    console.log('PUT - /tshirt/id');
    console.log(request.params);

    if (connection != null){
        // Collection holds the collection on the db
        var collection = connection.collection(collName);
         
        var o_id = new BSON.ObjectID(request.params.id);
        if(request.query.model != null){
            collection.update({_id: o_id}, {$set:{model: request.query.model}}, function_cb);
            console.log("model changed");
        }
        if(request.query.images != null){
            collection.update({_id: o_id}, {$set:{images: request.query.images}}, function_cb);
            console.log("image changed");
        }
        if(request.query.style != null){
            collection.update({_id: o_id}, {$set:{style: request.query.style}}, function_cb);
            console.log("style changed");
        }
        if(request.query.size != null){
            collection.update({_id: o_id}, {$set:{size: request.query.size}}, function_cb);
            console.log("size changed");
        }
        if(request.query.colour != null){
            collection.update({_id: o_id}, {$set:{colour: request.query.colour}}, function_cb);
            console.log("colour changed");
        }
        if(request.query.price != null){
            collection.update({_id: o_id}, {$set:{price: request.query.price}}, function_cb);
            console.log("price changed");
        }
        if(request.query.summary != null){
            collection.update({_id: o_id}, {$set:{summary: request.query.summary}}, function_cb);
            console.log("summary changed");
        }
        // Locate all the entries using find
        
    }
}

// EXPORT: PUT /thshirt/:id function
var updateTshirt = function(req, res){
    changeTshirt(req, function(err, results){
        if(err){
            res.send(500);
        }
        else
        {
            console.log("OK - created");
            res.send(results);
        }
    })

}

// Function connecting to db and deleting one tshirt in db
var deleteOne = function(request, function_cb) {
    console.log("DELETE - /tshirt/:id");
    
    if (connection != null){
    // Collection holds the collection on the db
    var collection = connection.collection(collName);
    
    var o_id = new BSON.ObjectID(request.params.id);
        
    
    // Locate all the entries using find
    collection.remove({_id: o_id}, function(err, results) {
        console.dir(results);
        function_cb(err,results);
    });
    }
};

// EXPORT: DELETE /thshirt/:id function
var deleteTshirt = function(req, res){
    deleteOne(req, function(err, results){
        if(err){
            res.send(500);
        }
        else
        {
            console.log("OK - deleted");
            res.send(results);
        }
    })

}

var getHotTshirts = function(function_cb){

    client.keys("hot.*", function (err, replies){
        if (replies.length == 0) {
          function_cb(err,replies);
        }
        if (!err) {
            var hotTshirts = [];
            var collection = connection.collection(collName);
            replies.forEach(function(item){
                var o_id = new BSON.ObjectID(item.substring(4));
                

                collection.find(o_id).toArray(function(err, results) {
                    if (err) {
                        function_cb(err,replies);
                    }
                    else {
                        hotTshirts.push(results);
                        console.log(results);
                        console.log("hotTshirts add");
                        console.log("Antes del if indexOf: " + replies.indexOf(item));
                        console.log("Antes del if lenght: " + replies.length);

                        if (replies.indexOf(item) == (replies.length - 1)){
                            console.log("En el if: " + replies.indexOf(item));
                            console.log("En el if: " + replies.length);
                            console.log("En el if: " + hotTshirts);
                            function_cb(err, hotTshirts);
                        }
                    }

                });

          });
            
          
        }
        else {
          function_cb(err, replies);
        }
  });
}

// EXPORT: GET /hot function
var getHot = function(req, res){
    getHotTshirts(function(err, results){
        if(err){
            res.send(500);
        }
        else
        {
            console.log("OK - got");
            res.send(results);
            res.end();
        }
    })

}

// close DB
var closeDB = function (){
    connection.close();
};

// Exporting the functions    
exports.initDB = initDB;
exports.getAll = getAll;
exports.getOne = getOne;
exports.addTshirt = addTshirt;
exports.updateTshirt = updateTshirt;
exports.deleteTshirt = deleteTshirt;
exports.getHot = getHot;
exports.closeDB = closeDB;


