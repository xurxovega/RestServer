const jwt = require('jsonwebtoken');

//Validar token

let authToken = (req, res, next) => {
    let token = req.get('Authorization');
    //res.json({token});
    jwt.verify(token, process.env.SEED_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(401).json({ ok: false, message: err });
        }
        req.payload = decoded;
        next();
    })
    
};

let authAdminRole = (req, res, next) => {
    
    req.isAdminRole = false;
    if (req.payload.user.role === 'ADMIN_ROLE'){
        req.isAdminRole = true;
        next();
    }else{
        return res.status(403).json({ ok: false, message: 'Not authorized for create user' });

    }
    
}

let authTokenImg = (req, res, next) => {
    let token = req.query.token;
    jwt.verify(token, process.env.SEED_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(401).json({ ok: false, message: err });
        }
        req.payload = decoded;
        next();
    })
}


module.exports = {
    authToken,
    authAdminRole,
    authTokenImg
}