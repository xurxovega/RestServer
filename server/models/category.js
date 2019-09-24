const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// Para ver los mensajes más 'friendly'
//const uniqueValidator = require('mongoose-unique-validator');

let categorySchema = new Schema({
    description: {
        type: String,
        unique: true,
        required: true,
    },
    user: {
        type: Schema.Types.ObjectId, 
        ref: 'User'
    }
});

module.exports = mongoose.model('Category', categorySchema);