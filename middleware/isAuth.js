const jwt = require('jsonwebtoken');
const jwtKey = require('../global_vars').jwtKey;

module.exports = (req,res,next) => {
    const authHeader = req.get('Authorization');
    //if the header doenst even exist
    if(!authHeader){
        const error = new Error('not Authenticated');
        error.statusCode = 401;
        throw error;
    }
    //get the token value
    const token = authHeader.split(' ')[1];
    let decodedToken;
    //try to decode it 
    try { 
        decodedToken = jwt.verify(token,jwtKey)
    }
    catch(err){
        err.statusCode = 500;
        throw err;
    }
    //check if its legit token
    if(!decodedToken){
        const error = new Error('not Authenticated');
        error.statusCode = 401;
        throw error;
    }
    //we have the true token so lets continue
    req.userId = decodedToken.userId;
    req.email = decodedToken.email;
    next();
}