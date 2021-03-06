module.exports = function(app) {

  var redis  = require("redis"),
    client = redis.createClient();

  var ttl = 86400;
	
  var Tshirt = require('../models/tshirt.js');

  //GET - Return all tshirts in the DB
  findAllTshirts = function(req, res) {
    console.log("GET - /tshirts");
    return Tshirt.find(function(err, tshirts) {
      if(!err) {
		return res.send(tshsirts);
      } else {
        res.statusCode = 500;
        console.log('Internal error(%d): %s',res.statusCode,err.message);
        return res.send({ error: 'Server error' });
      }
    });
  };

  //GET - Return a Tshirt with specified ID
  findById = function(req, res) {
    console.log("GET - /tshirt/:id");
    return Tshirt.findById(req.params.id, function(err, tshirt) {
      if(!tshirt) {
        res.statusCode = 404;
        return res.send({ error: 'Not found' });
      }
      if(!err) {
		
		// Guardamos el acceso a la camiseta en REDIS
		client.get("hot."+req.params.id, function(err, instance){
		  // Si la clave no existe
          if (!instance) {
            // Si no existía, creamos una nueva clave con valor inicial 1.
			// Tiempo de expiración ttl = 1 día
            client.set ("hot."+req.params.id, 1, "EX", ttl, function(error, result) {
              if (error) console.log('Error: ' + error);
              else {
                console.log('Instance saved!');
              }
            });
          }
		  // Si estaba en REDIS
          else {
            // Si existía, incrementamos su valor en 1.
            client.incr("hot."+req.params.id, function(error, inst){
              if (error) console.log('Error: ' + error);
              else console.log('Instance incremented!');
            });
			// Reiniciamos el tiempo de expiración.
            client.expire("hot."+req.params.id, ttl, function(error){
              if (error) console.log('Error: ' + error);
              else console.log('Instance expire time restaured!');
            });
          }
        });
        // Send { status:OK, tshirt { tshirt values }}
        return res.send({ status: 'OK', tshirt:tshirt });
        // Send {tshirt values}
        // return res.send(tshirt);
      } else {
        res.statusCode = 500;
        console.log('Internal error(%d): %s',res.statusCode,err.message);
        return res.send({ error: 'Server error' });
      }
    });
  };

  //POST - Insert a new Tshirt in the DB
  addTshirt = function(req, res) {
    console.log('POST - /tshirt');
    console.log(req.body);

    var tshirt = new Tshirt({
      model:    req.body.model,
      images :  req.body.images, 
      style:    req.body.style,
      size :    req.body.size, 
      colour:   req.body.colour, 
      price:    req.body.price,
      summary:  req.body.summary  
    });

    tshirt.save(function(err) {
      if(!err) {
        console.log("Tshirt created");
        return res.send({ status: 'OK', tshirt:tshirt });
      } else {
        console.log(err);
        if(err.name == 'ValidationError') {
          res.statusCode = 400;
          res.send({ error: 'Validation error' });
        } else {
          res.statusCode = 500;
          res.send({ error: 'Server error' });
        }
        console.log('Internal error(%d): %s',res.statusCode,err.message);
      }
    });
  };

  //PUT - Update a register already exists
  updateTshirt = function(req, res) {
    console.log("PUT - /tshirt/:id");
    console.log(req.body);
    return Tshirt.findById(req.params.id, function(err, tshirt) {
      if(!tshirt) {
        res.statusCode = 404;
        return res.send({ error: 'Not found' });
      }

      if (req.body.model != null) tshirt.model = req.body.model;
      if (req.body.price != null) tshirt.price = req.body.price;
      if (req.body.images != null) tshirt.images = req.body.images; 
      if (req.body.style != null) tshirt.style = req.body.style;
      if (req.body.size != null) tshirt.size  = req.body.size;
      if (req.body.colour != null) tshirt.colour = req.body.colour;
      if (req.body.summary != null) tshirt.summary = req.body.summary;

      return tshirt.save(function(err) {
        if(!err) {
          console.log('Updated');
          return res.send({ status: 'OK', tshirt:tshirt });
        } else {
          if(err.name == 'ValidationError') {
            res.statusCode = 400;
            res.send({ error: 'Validation error' });
          } else {
            res.statusCode = 500;
            res.send({ error: 'Server error' });
          }
          console.log('Internal error(%d): %s',res.statusCode,err.message);
        }
      });
    });
  }

  //DELETE - Delete a Tshirt with specified ID
  deleteTshirt = function(req, res) {
    console.log("DELETE - /tshirt/:id");
    return Tshirt.findById(req.params.id, function(err, tshirt) {
      if(!tshirt) {
        res.statusCode = 404;
        return res.send({ error: 'Not found' });
      }

      return tshirt.remove(function(err) {
        if(!err) {
          console.log('Removed tshirt');
          return res.send({ status: 'OK' });
        } else {
          res.statusCode = 500;
          console.log('Internal error(%d): %s',res.statusCode,err.message);
          return res.send({ error: 'Server error' });
        }
      })
    });
  }
  
  // GET HOT - Get the "what's hot" products
  hot = function(req, res){
	console.log("GET - /hots");
	client.keys("hot.*", function (err, replies){
		if (replies.length == 0) {
		  res.statusCode = 404;
		  return res.send({ error: 'Not hot tshirts now' });
		}
		if (!err) {
		  var hotTshirts = [];
		  replies.forEach(function(item){
			Tshirt.findById(item.substring(4), function (err, tshirt){
			  if (err) {
				console.log("Hot Tshirt Not Found");
				res.statusCode = 500;
				console.log('Internal error(%d): %s',res.statusCode,err.message);
				return res.send({ error: 'Server error' });
			  }
			  else {
				hotTshirts.push(tshirt);
				console.log(tshirt);
				console.log("hotTshirts add");
			  }
			});
		  });
		  console.log("Este mensaje se muestra el primero");
		  console.log(hotTshirts);
		  res.send(hotTshirts);
		}
		else {
		  res.statusCode = 500;
		  console.log('Internal error(%d): %s',res.statusCode,err.message);
		  return res.send({ error: 'Server error' });
		}
  });
  }

  //Link routes and functions
  app.get('/tshirts', findAllTshirts);
  app.get('/tshirt/:id', findById);
  app.post('/tshirt', addTshirt);
  app.put('/tshirt/:id', updateTshirt);
  app.delete('/tshirt/:id', deleteTshirt);
  
  //What's hot
  app.get('/hots', hot);

}


