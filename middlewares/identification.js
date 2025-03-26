const jwt = require('jsonwebtoken');

exports.identifier = (req,res,next) => {
    let token;
    if (req.headers.authorization) {
        token = req.headers.authorization;
    }
    else if (req.cookies && req.cookies['Authorization']) {
        token = req.cookies['Authorization'];
    }

    if(!token){
        return res.status(403).json({success: true, message: "Unauthorized!"})
    }
    try {
        const userToken = token.split(' ')[1]
        console.log("JWT verification result:", userToken, token);
        const jwtVerified = jwt.verify(userToken, process.env.TOKEN_SECRET);
        console.log("JWT verification result:", jwtVerified);
        if(jwtVerified){
            req.user = jwtVerified;
            next();
        }else {
            return res.status(401).json({ success: false, message: "Invalid Token" });
        }
    }catch(error){
        console.log(error)
        return res.status(401).json({ success: false, message: "Invalid Token..." }); 
    }
}