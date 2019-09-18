require('./config/config');
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const bodyParser = require('body-parser')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// Configuración para routas
app.use(require('./routes/index'));

app.get('/test', function(req, res){
    res.json('Get from server')
});


mongoose.connect(process.env.URLDB,
                 { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true }, 
                (err, res) => {
                    if (err) throw err;
                    console.log('Connected to DB!!!');
                });

app.listen(process.env.PORT, () => {
    console.log('Listen at port', process.env.PORT);
})