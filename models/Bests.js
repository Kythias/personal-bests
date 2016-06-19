var mongoose = require('mongoose');

var BestSchema = new mongoose.Schema({
    title: String,
    weight: Number,
    date: { type: Date, default: Date.now },
    author: String
});



mongoose.model('Best', BestSchema);