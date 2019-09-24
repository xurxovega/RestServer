const express = require('express');
const app = express();
const _ = require('underscore');
const { authToken, authAdminRole } = require('../middlewares/auth');
let Category = require('../models/category');

 // Obtener todas las categorias
app.get('/categories/:page?', authToken, (req, res) => {
    
    var itemsPerPage = 3;
    var page = req.params.page;
    var skip = 0;
    if (page === null || page <= 0 || page == 1) {
        skip = 0;
    } else {
        skip = (page - 1) * itemsPerPage;
    }
    Category.find()
            .sort('description')
/*            .skip(skip)
            .limit(itemsPerPage) */
            .populate('user', 'name email')
            .exec((err, categories) => { 
                if (err) {
                    return res.status(500).json({ ok: false, message: err });
                }
                return res.json({
                    ok: true,
                    categories
                })
               /*  Category.countDocuments({}, (err, count) => {
                    return res.json({
                        ok: true,
                        categories: categories,
                        total: count,
                        pages: Math.ceil(count / itemsPerPage)
                    })
                }) */
            });
});

// Obtener categoria por Id.
app.get('/category/:id', authToken, (req, res) => {
    let id = req.params.id;

    Category.findById(id, (err, category) => {
        if (err){
            return res.status(400).json({ ok: false, message: err });
        }
        res.status(200).json({ok: true, category})
    })

});

// Crear categoria
app.post('/category', authToken, (req, res) => {
    let body = req.body;

    let category = new Category({
        description: body.description,
        user: req.payload.user
    });
    
    category.save((err, categorySaved) => {
        if (err) {
            return res.status(500).json({ ok: false, message: err });
        }
        if (!categorySaved){
            return res.status(400).json({ ok: false, message: err });
        }
        res.status(201).json({ ok: true, categorySaved })
    })

});

// Actualizar categoria
app.put('/category/:id', [authToken, authAdminRole], (req, res) => {
    let id = req.params.id;
    let body = req.body;

    if (!req.payload.user.role === 'ADMIN_ROLE') {
        return res.status(401).json({ ok: false, message: 'Not Authorized to Delete category' })
    }
/*     let description = {
        description: body.description
    } */
    let updateCategory = _.pick(body, ['description']); // Solo actualiza estos campos

    Category.findByIdAndUpdate(id, updateCategory, { new: true, runValidators: true }, (err, newCategory) => {
        if (err) {
            return res.status(400).json({ ok: false, message: err });
        }
        res.status(200).json({ ok: true, newCategory })
    });
});

// Borrar categoria. Solo puede borrar el admin.
app.delete('/category/:id', [authToken, authAdminRole],  (req, res) => {
    let id = req.params.id;

    // Esto se sustituye por el authAdminRole
    /* 
    if (!req.payload.user.role !== 'ADMIN_ROLE'){
        return res.status(401).json({ok: false, message: 'Not Authorized to Delete category'})
    } */
    
    Category.findByIdAndRemove(id, (err, categoryDeleted) => {
        if (err) {
            return res.status(400).json({ ok: false, message: err });
        }
        res.status(200).json({ ok: true, categoryDeleted })
    });
});

module.exports = app;