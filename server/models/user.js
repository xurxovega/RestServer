const mongoose = require('mongoose');
// Para ver los mensajes más 'friendly'
const uniqueValidator = require('mongoose-unique-validator');


let roleValidate = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} not a correct value'
}

let Schema = mongoose.Schema;

let userSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name required']
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'Email required']
    },
    password: {
        type: String,
        required: [true, 'Password required']
    },
    img: {
        type: String,
        required: false
    },
    role:{        
        //required: true, 
        type: String,
        default: 'USER_ROLE',
        enum: roleValidate
    },
    state:{
        type: Boolean,
        default: true
    },
    google:{
        type: Boolean,
        default: false
    },
});

// Para no devolver el password
userSchema.methods.toJSON = function () {
    let user = this; // Por esto no debe ser función de flecha
    let userObject = user.toObject();
    delete userObject.password;
    return userObject;
}
// Para validar que no exista dos usuarios con el mismo email.
// Retorna el mensaje de erro de forma más 'friendly'
userSchema.plugin(uniqueValidator, {message: '{PATH} ya existe'})

module.exports = mongoose.model('User', userSchema);