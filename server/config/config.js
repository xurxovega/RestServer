// Obtenemos el puerto o asignamos uno
process.env.PORT = process.env.PORT || 3000;

//Entorno
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// Variable for DB
let urlDB = '';

if (process.env.NODE_ENV === 'dev'){
    urlDB = 'mongodb://localhost:27017/cafe';
}else{
    urlDB = process.env.MONGO_URI; // Declarada en Heroku como heroku config
}

process.env.URLDB = urlDB;

// Expires Token
process.env.EXPIRES_TOKEN = '48h'; // 1 day

// Password Token
process.env.SEED_TOKEN = process.env.SEED_TOKEN || '533D_T0K3N';

process.env.CLIENT_ID = process.env.CLIENT_ID || '422001404629-5bc4jfmcko7ihlnlaibt6gelhscff4hb.apps.googleusercontent.com'