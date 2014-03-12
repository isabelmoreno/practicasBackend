// server.js
// =========
 
// Incluímos las dependencias que vamos a usar
var express  = require("express"),
    app      = express(),
    http     = require("http"),
    server   = http.createServer(app);
 	mongoose = require("mongoose");

// Configuramos la app para que pueda realizar métodos REST
app.configure(function () {
  app.use(express.bodyParser()); // JSON parsing
  app.use(express.methodOverride()); // HTTP PUT and DELETE support
  app.use(app.router); // simple route management
});

routes = require('./routes/tshirts')(app);

// Conexión
mongoose.connect('mongodb://localhost/tshirts', function(err, res) {
  if(err) {
    console.log('ERROR: connecting to Database. ' + err);
  } else {
    console.log('Connected to Database');
  }
});

// petición GET del root que sólo muestre "Hello world!"
app.get('/', function(req, res) {
  res.send("Hello world!");
});
 
// El servidor escucha en el puerto 3000
server.listen(3000, function() {
  console.log("Node server running on http://localhost:3000");
});