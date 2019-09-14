// Obtenemos el puerto o asignamos uno
process.env.PORT = process.env.PORT || 3000;

//Entorno
process.env.NODE_ENV = process.NODE_ENV || 'dev';

//DB

let urlDB = '';

//if (process.env.NODE_ENV === 'dev'){
//    urlDB = 'mongodb://localhost:27017/cafe';
//}else{
    urlDB = 'mongodb://admin:admin1@ds223578.mlab.com:23578/cafe_xvs';
//}

process.env.URLDB = urlDB;