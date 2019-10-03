const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const User = require('../models/user');
const Product = require('../models/product');
const fs = require('fs');
const path = require('path');

app.use(fileUpload());

app.put('/upload/:type/:id', (req, res) => {

    if(!req.files){
        return res.status(400).json({ok: false, message: 'No data send'});
    }

    let file      = req.files.file;
    let extAllow  = ['png', 'jpg', 'gif', 'jpeg'];
    let extFile   = file.name.split('.')[1];
    let fileName  =  file.name;
    let typeImg   = req.params.type;
    let id        = req.params.id;
    let typeAllow = ['users', 'products'];
    
    if (typeAllow.indexOf(typeImg) < 0) {
        return res.status(500).json({ ok: false, message: 'Type not allowed ' + typeAllow.join(',') });
    }

    if(extAllow.indexOf(extFile) < 0){
        return res.status(500).json({ ok: false, message: 'Ext not allowed ' + extAllow.join(',') });
    }

    let nameFile = `${id}-${new Date().getMilliseconds()}.${extFile}`;  

    file.mv(`uploads/${typeImg}/${nameFile}`, (err) => {
        if(err){
            return res.status(500).json({ ok: false, message: err });
        }
        // res.status(200).json({ ok: true, message: 'File Upload succesfully' });
        switch (typeImg) {
            case 'users':
                imgUser(id, res, nameFile);
                break;
            case 'products':
                imgProduct(id, res, nameFile);
                break;
        }
    });
});

function imgUser(id, res, fileName){

    User.findById(id, (err, userDB)=> {
        if(err){
            deleteFile(userDB.img, 'users');
            return res.status(500).json({ok: false, message: err});
        }
        if(!userDB){
            deleteFile(userDB.img, 'users');
            return res.status(400).json({ ok: false, message: 'User not exists'});
        }

        deleteFile(userDB.img, 'users');
        userDB.img = fileName;

        userDB.save((err, userSaved) => {
            res.json({
                ok: true,
                user: userSaved,
                img : fileName
            });
        });
    })
}

function imgProduct(id, res, fileName){

    Product.findById(id, (err, productDB) => {
        if (err) {
            deleteFile(productDB.img, 'products');
            return res.status(500).json({ ok: false, message: err });
        }
        if (!productDB) {
            deleteFile(productDB.img, 'products');
            return res.status(400).json({ ok: false, message: 'Products not exists' });
        }
        
        deleteFile(productDB.img, 'products');
        productDB.img = fileName;

        productDB.save((err, productSaved) => {
            res.json({
                ok: true,
                user: productSaved,
                img: fileName
            });
        });
    });
}


function deleteFile(fileName, type) {
    let pathImg = path.resolve(__dirname, `../../uploads/${type}/${fileName}`);
    if (fs.existsSync(pathImg)) {
        fs.unlinkSync(pathImg); // Borrado de fichero
    }
}

module.exports = app;