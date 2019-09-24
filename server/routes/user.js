const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const app = express();

const User  = require('../models/user');

const { authToken, authAdminRole } = require('../middlewares/auth');

app.get('/users/:page?', authToken, (req, res) =>  {

    // Para hacerlo así la url debería ser /users?from=10 o /users?limit=10 o /users?limit=10&from =4
    //let from = req.query.from || 0;
    //from = Number(from);
    //let limit = req.query.limit || 0;
    //limit = Number(limit);

    //console.log(req.payload);

    var itemsPerPage = 3;
    var page = req.params.page;
    var skip = 0;
    if (page === null || page <= 0 || page == 1)
    {
        skip = 0;
    }else{
        skip = (page-1) * itemsPerPage;
    }

    User.find({state: true},'name email role state google img')
        .skip(skip)
        .limit(itemsPerPage)
        .exec((err, users) => {
        if (err) {
            return res.status(400).json({ ok: false, message: err });
        }
            User.countDocuments({ state: true }, (err, count) =>{
            return res.json({
                ok: true,
                users: users,
                total: count,
                pages: Math.ceil(count / itemsPerPage)
            })
        })

    })
    //res.json('Get from Users')
});

app.post('/users', [authToken, authAdminRole], (req, res) => {

    let user = new User({
        name:     req.body.name,
        email:    req.body.email,
        password: bcrypt.hashSync(req.body.password, 10),
        role:     req.body.role
    });

    user.save((err, userDB) => {
        if (err){
            return res.status(400).json({ ok: false, message: err });
        }
        // En lugar de hacer esto, se pone una regla en el userSchema
        //userDB.password = null;
        res.status(200).json({ok:true, user: userDB});
    })

});

app.put('/users/:id', [authToken, authAdminRole], (req, res) => {
    let id = req.params.id;
    //let updateUser = req.body;
    let updateUser = _.pick(req.body, ['name', 'email', 'img', 'role', 'state']); // Solo actualiza estos campos

    User.findByIdAndUpdate(
        { id: id },
        updateUser,
        { new: true, runValidators: true },
        (err, userDB) => {
            if (err) {
                return res.status(400).json({ ok: false, message: err });
            }
            res.status(200).json({ ok: true, user: userDB });
        });

    /* User.findById(id, (err, userDB) => {
        if (err) {
            return res.status(400).json({ ok: false, message: err });
        } else {
            User.updateOne({id: id}, req.body, { new:true, runValidators:true }, (err, userDB) => {
                if (err) {
                    return res.status(400).json({ ok: false, message: err });
                }
                res.status(200).json({ ok: true, user: userDB });
            })
        }
    }) */

});


app.delete('/users/:id', [authToken, authAdminRole], (req, res) => {

    let id = req.params.id;

/*     
    User.findByIdAndRemove(id,(err, userDeleted) => {
        if (err) {
            return res.status(400).json({ ok: false, message: err });
        }
        if (!userDeleted){
            return res.status(400).json({ ok: false, message: 'User not exists' });
        }
        res.json({ ok: false, user: userDeleted })
    }) */
    // En lugar de borrar, se marca como borrado.
    User.findByIdAndUpdate(id, {state: false}, {new: true}, (err, userDB) => {
        if (err) {
            return res.status(400).json({ ok: false, message: err });
        }
        //res.status(200).json({ ok: true, message: err });
        res.json({ ok: true, user: userDB });

    })

 
});

module.exports = app ;