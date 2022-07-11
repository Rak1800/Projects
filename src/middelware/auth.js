const jwt = require("jsonwebtoken");


//--------------------------------- AUTHENTICATION MIDDLEWARE ------------------------------------------------------------------------

const checkAuth = function (req, res, next) {

  
  try {
    let token = req.headers["x-api-key"];
    if (!token) token = req.headers["X-API-KEY"];
    if (!token)
      return res.status(401).send({ status: false, msg: "token must be present" });
        try{
          var decodedToken = jwt.verify(token, "functionup-radon-project3-group52")
      
      }
      catch(err){
          return res.status(401).send({status:false,msg:"token is invalid or expired"})

      }
   req.userId = decodedToken.userId;
   

    next();
  } catch (error) {
    res.status(500).send({ status: false, Error: error.message });
  }
};



module.exports={checkAuth}