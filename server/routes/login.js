const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user')
const app = express();
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

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

//configuracion google
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    //const userid = payload['sub'];
    //console.log(payload);

    return {
        name: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

app.post('/google', async (req, res) => {
    
    let token = req.body.idtoken;
    let googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({ok: false, message: e})
        });
    User.findOne({email: googleUser.email}, (err, userDB) => {
        if(err){
            return res.status(500).json({ ok: false, message: err });
        }
        if(userDB){
            if (userDB.google === false){ // Si se ha logado como no Google pero le dio a sign en google.
                return res.status(400).json({ ok: false, message: 'User already existes, not possible to login for google' });
            }else{
                let token = jwt.sign({
                    user: userDB
                    }, process.env.SEED_TOKEN, {
                        expiresIn: process.env.EXPIRES_TOKEN
                    });
                return res.json({
                    ok: true, user: userDB, token: token
                });
            }
        }
        if (!userDB) {
            let user = new User({
                name: googleUser.name,
                email: googleUser.email,
                password: ':)', // Al no estar encriptada nunca va a coincidar con el hash de nuestra clave secreta
                img: googleUser.img,
                google: true
            });

            user.save( (err, userDB) => {
                if (err) {
                    return res.status(400).json({ ok: false, message: err });
                }
                // En lugar de hacer esto, se pone una regla en el userSchema
                //userDB.password = null;
                res.status(200).json({ ok: true, user: userDB, token: token });
            });
        }
    })

    //res.json({googleUser});
})

module.exports = app;