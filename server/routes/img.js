const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();


const { authToken, authAdminRole, authTokenImg } = require('../middlewares/auth');

//app.get('/img/:type/:img', authToken , (req, res) => {
app.get('/img/:type/:img', authTokenImg, (req, res) => {
    
    let type = req.params.type;
    let img = req.params.img;
    let pathImg = path.resolve(__dirname, `../../uploads/${type}/${img}`); // Path Absoluta

    if( fs.existsSync(pathImg)){
        res.sendFile(pathImg);
    }else{
        let noImg = path.resolve(__dirname, '../assets/no-image.jpg');
        res.sendFile(noImg);
    }
})

module.exports = app;