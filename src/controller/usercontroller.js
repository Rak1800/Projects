const jwt = require("jsonwebtoken");
const usermodel = require("../model/usermodel");
const { isValid, isValidRequestBody, validEmail, validPassword,validName, validPhone } = require("../validator/validate")


//create user
let createUser = async function (req, res) {
    try {
        let requestBody = req.body
        let { title, name, phone, email, password, address } = requestBody

        if (isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Please provide the Details" });
        }

        const enums=["Mr","Mrs","Miss"]
         title =enums.includes(requestBody.title)
            if(!title)
            return res.status(400).send({ status: false, message: "Title should be Mr, Miss, Mrs" });
        

        if (isValid(name)) {
            return res.status(400).send({ status: false, message: "Please provide a Name or a Valid Name" });
        }

        if (!validName.test(name)) {
            return res.status(400).send({ status: false, message: "Name cannot be a number" });
        } 
        

        if (isValid(phone)) {
            return res.status(400).send({ status: false, message: "Please provide a Phone Number or a Valid Phone Number" });
        }
        if (typeof phone==="string"){
            var Phone= phone.trim()
           }

        if (!validPhone.test(Phone)) {
            return res.status(400).send({ status: false, message: `${phone} is not valid phone Number` });
        }
        let isAllreadyExistPhone = await usermodel.findOne({ phone: phone})
        if (isAllreadyExistPhone) {
            return res.status(400).send({ status: false, message: `${phone} already exist` });
        }

        if (isValid(email)) {
            return res.status(400).send({ status: false, message: "Please provide a Email or a Valid Email" });
        }
          if (typeof email==="string"){
           var Email= email.trim()
          }
        if (!validEmail.test(Email)) {
            return res.status(400).send({ status: false, message: `${email} is not valid` });
        }

        let isAllreadyExistEmail = await usermodel.findOne({ email: email})
        if (isAllreadyExistEmail) {
            return res.status(400).send({ status: false, message: `${email} already exist` });
        }

        if (isValid(password)) {
            return res.status(400).send({ status: false, message: "Please provide a Password or a Valid Password" });
        }
        if (typeof password==="string"){
            var Password= password.trim()
           }
        if (!validPassword.test(Password)) {
            return res.status(400).send({ status: false, message: "Password must contain atleast one upper and lower Case and a special character and should be 8 to 15 character length" });
        }

        if (typeof address != 'object') {
            return res.status(400).send({ status: false, message: "Please provide a address And address should be an object" });
        }
        if(isValid(address.street)){
            return res.status(400).send({ status: false, message: "Street should be Present" });
        }//number use
        if(isValid(address.city)){
            return res.status(400).send({ status: false, message: "City should be Present" });
        }
        if(isValid(address.pincode)){
            return res.status(400).send({ status: false, message: "Pincode should be Present" });
        }

        let createUser= await usermodel.create(requestBody)
            return res.status(201).send({status:true, message: "User Created" ,data: createUser })
    }catch(error){
       return res.status(500).send({status:false, message: error.message});
    }

}




//login user
let userLogin = async function (req, res) {
    try {
        let requestBody = req.body;
        let { email, password } = requestBody;

        if (isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: `Please Provide your Email and Password` });
        }

        if (isValid(email)) {
            return res.status(400).send({ status: false, message: `Email is required` });
        }

        if (!validEmail.test(email)) {
            return res.status(400).send({ status: false, message: `Email Should be a Valid Email Address` });
        }

        if (isValid(password)) {
            return res.status(400).send({ status: false, message: `Password is required` });
        }

        if (!(validPassword).test(password)) {
            return res.status(400).send({ status: false, message: `Password should be Minimum 8 character and Maximum 15 character long and should be Alpha-Numeric` });
        }


        let user = await usermodel.findOne({ email: email, password: password });
        if (!user)
            return res.status(400).send({status: false,message: "Invalid Email or Password"});
        let token = jwt.sign({
            userId: user._id.toString(),
            batch: "radon",
            organisation: "FunctionUp",
            iat: new Date().getTime()/1000
        },
            "functionup-radon-project3-group52",
            {
                expiresIn: "1m" 
            });

        res.setHeader("x-api-key", token)

        return res.status(200).send({ status: true, token: token, message: "User Logged in Successfully" });


    } catch (error) {
        res.status(500).send({ status: false, error: error.message })

    }
}

module.exports = { userLogin, createUser }
