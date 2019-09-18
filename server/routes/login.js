const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user')
const app = express();
const jwt = require('jsonwebtoken');


app.post('/login', (req, res) => {
    let body = req.body;
    
    let email = body.email;
    let password = body.password;

    User.findOne({email: email}, (err, userDB) => {
        if (err) {
            return res.status(500).json({ ok: false, message: err });
        }

        if (!userDB){
            return res.status(400).json({ ok: false, message: `User ${email} not login correctly` });
        }

        if(!bcrypt.compareSync(password, userDB.password) ){
            return res.status(400).json({ ok: false, message: `Password not correctly` });
        }
        let token = jwt.sign({
            user: userDB
        }, process.env.SEED_TOKEN 
        , { 
            expiresIn: process.env.EXPIRES_TOKEN 
        })

        return res.json({
            ok: true, user: userDB, token: token
        });
    })
})
module.exports = app;