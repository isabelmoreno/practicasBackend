var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Kart = new Schema({
  product:  { type: String, require: true },
  number:   { type: Number, require: true },
  size:     { type: Number, 
              enum: [36, 38, 40, 42, 44, 46],
              require: true 
            },
  modified: { type: Date, default: Date.now }    
});

Kart.path('model').validate(function (v) {
    return ((v != "") && (v != null));
});

module.exports = mongoose.model('Kart', Kart);