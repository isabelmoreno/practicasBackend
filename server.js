var express = require("express");
var functions = require("./routes/functions");


var app = express();
app.use(express.bodyParser());


functions.initDB(function (err){
    if(err){

      console.log("Unable to connect to database");

    } 
    else{

        console.log("Connected to Database");
                
        var server = app.listen(3000, function() {
            console.log('Listening on port %d', server.address().port);
        });
        
    }
    
});

//Link routes and functions
app.get('/tshirts', functions.getAll);
app.get('/tshirt/:id', functions.getOne);
app.post('/tshirt', functions.addTshirt);
app.put('/tshirt/:id', functions.updateTshirt);
app.delete('/tshirt/:id', functions.deleteTshirt);
app.get('/hot', functions.getHot);