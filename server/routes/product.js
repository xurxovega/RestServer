const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const app = express();
const Product = require('../models/product');
const Category = require('../models/category');
const { authToken, authAdminRole } = require('../middlewares/auth');

// Obtener todos los productos
app.get('/products/:page?', authToken, (req, res) => {

    let itemsPerPage = 3;
    let page = req.params.page;
    let skip = 0;
    if (page === null || page <= 0 || page == 1)
    {
        skip = 0;
    }else{
        skip = (page-1) * itemsPerPage;
    }

    Product
        .find()
        .skip(skip)
        .limit(itemsPerPage)
        .populate('user', 'name email')
        .populate({ path: 'category', select: 'description user', populate: { path: 'user', select: 'name email' } })
        .exec( (err, products) => {
        if (err){
            return res.status(400).json({ ok: false, message: err });
        }
        Product.countDocuments((err, count) => {
            if (err){
                return res.status(400).json({ ok: false, message: err });
            }
            res.status(200).json({
                ok: true,
                products,
                total: count,
                pages: Math.ceil(count / itemsPerPage)
            })
        });
    });

});

// Obtener producto por id
app.get('/product/:id', authToken, (req, res) => {
    let id = req.params.id;

    Product.findById(id, {}, 
        {
            populate: { path: 'category', select: 'description user', populate: { path: 'user', select: 'name email' }}
            //,populate: { path: 'user', select: 'name email'}
        }, (err, product) => {
        if (err) {
            return res.status(400).json({ ok: false, message: err });
        }
        res.status(200).json({ok: true, product});
    });

});

// Crear Producto
app.post('/product', authToken, (req, res) => {
    let body = req.body;
    
    let idCategory = req.body.category;
    let idAvailable = true;

    if (req.body.available === null || req.body.available === ''){
        idAvailable = true;
    }else{
        idAvailable = Boolean(body.available);
    }
    
    Category.findById( idCategory , (err, categoryBD) => {
        if (err){
            return res.status(400).json({ ok: false, message: err });
        }
        if(!categoryBD){
            return res.status(400).json({ ok: false, message: 'Category not exists' })
        }
    });
    
    let product = new Product({
        name: body.name,
        priceUnity: body.priceUnity,
        description: body.description,
        available: idAvailable,
        category: idCategory,
        user: req.payload.user
    });

    product.save( (err, productSaved) => {
        if (err) {
            return res.status(500).json({ ok: false, message: err })
        }
        if (!productSaved){
            return res.status(400).json({ ok: false, message: 'Poduct not saved' })
        }
        res.status(201).json({ ok: true, productSaved })
    })
});

// Modificar Producto
app.put('/product/:id', authToken, (req, res) => {
    let id = req.params.id;

    let productUpdated = _.pick(req.body, ['name', 'priceUnity', 'description', 'available', 'category']);

    Product.findByIdAndUpdate(id, productUpdated, {new: true, runValidators: true}, (err, product) => {
        if (err) {
            return res.status(500).json({ ok: false, message: err })
        }
        res.status(400).json({ ok: false, product })
    });
});

// Borrar Producto
app.delete('/product/:id', authToken, (req, res) => {
    let id = req.params.id;

/*     Product.findByIdAndRemove(id, (err, productRemove) => {
        if(err) {
            return res.status(400).json({ ok: false, message: err });
        }
        res.status(200).json({ ok: true, productRemove });
    }); */

    let productUpdated = { available: false }; 
    Product.findByIdAndUpdate(id, productUpdated, { new: true, runValidators: true }, (err, product) => {
        if (err) {
            return res.status(500).json({ ok: false, message: err })
        }
        res.status(400).json({ ok: false, product })
    });

});


app.get('/products/search/:name', authToken, (req, res) => {

    name = req.params.name;
    let regex = new RegExp(name, 'i');
    Product
        .find({ name: regex})
        .populate('user', 'name email')
        .populate({ path: 'category', select: 'description user', populate: { path: 'user', select: 'name email' } })
        .exec((err, products) => {
            if (err) {
                return res.status(400).json({ ok: false, message: err });
            }
            res.status(200).json({ ok: true, products });
        });
});

module.exports = app;