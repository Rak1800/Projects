const bookmodel = require("../model/bookmodel");
const reviewmodel= require("../model/reviewmodel")
const usermodel = require("../model/usermodel");
const mongoose=require("mongoose")

const { isValid, isValidRequestBody, validInUpdate, validISBN } = require("../validator/validate");
const { create } = require("../model/bookmodel");

// create book
const createBook = async function (req, res) {

    try{
        let data=req.body
        let {title,excerpt,userId,ISBN,category,subcategory,releasedAt}=data
         
        if(isValidRequestBody(data))
         return res.status(400).send({status:false,msg:"provide the data in body"})

         if(isValid(title))
         return res.status(400).send({status:false,msg:"provide the title in body"})
          
         let findTitle= await bookmodel.findOne({title:title})
         
          if(findTitle)
          return res.status(400).send({status:false,msg:"Title is allready exist"})

          if(isValid(excerpt))
         return res.status(400).send({status:false,msg:"provide the excerpt in body"})
          
         if (!mongoose.isValidObjectId(userId))
         return res.status(400).send({status:false,msg:"provide valid userId"})

         let finduserId= await usermodel.findById({_id:userId})
         
         if (!finduserId)
         return res.status(404).send({status:false,msg:"userId is found"})

         if(finduserId._id!=req.userId)
              return res.status(400).send({status:false, message:"you are unathorized"})
 
         if(!validISBN.test(ISBN))
         return res.status(400).send({status:false,msg:"provide the ISBN in body or valid Isbn"})
          
         let findISBN= await bookmodel.findOne({ISBN:ISBN})
          if(findISBN)
          return res.status(400).send({status:false,msg:"ISBN is allready exist"})

          if(isValid(category))
          return res.status(400).send({status:false,msg:"provide the category in body"})

          if (typeof data.subcategory === "undefined"  || data.subcategory === null )
          return res.status(400).send({ status: false, msg:"please enter subcategory key or valid subcategory"})
      if (data.subcategory.length == 0) {
          return res.status(400).send({ status: false, msg: "subcategory is not valid" });
      }
           
            if(subcategory){
                if((typeof data.subcategory!=="string") || (typeof data.subcategory==="object") ){
             for (let i = 0; i < data.subcategory.length; i++) {
                if (subcategory[i] == 0) {
                    return res.status(400).send({ status: false, msg: "subcategory should have atleast one alpha" });
                }
    
                if (!/^([a-zA-Z]+)$/.test(subcategory[i])) {
                    return res.status(400).send({ status: false, msg: " enter valid subcategory in alphabets only" });
                }
            }  }
            }        else {
            return res.status(400).send({ status: false, msg: " enter valid subcategory in string or [] only" })
             }
        
          
        if(!releasedAt){
            return res.status(400).send({status:false,msg:"releasedAt key is not given"})
        }
        if (releasedAt) {
            if (!/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/.test(releasedAt))
                return res.status(400).send({ status: false, msg: "date format should be in YYYY-MM-DD" })
           
        }
         saveData= await bookmodel.create(data)
         return res.status(201).send({status:true,message :"created book ", data:saveData})

    }catch(error){
        res.status(500).send({status:false,msg:error.message})
    }
  
}



const bookList= async function (req,res){
      try{

   let  query=req.query

    let books= await bookmodel.find({$and:[query,{isDeleted:false}]}).select({_id:1,title:1,excerpt:1,userId:1,category:1,reviews:1,releasedAt:1}).sort({title:1})
    
    if(books.length==0)
    return res.status(404).send({status:false,message:"Books are not present"})
   
    
    return res.status(200).send({status:true,message:'Books list', data:books }) 
}catch(error){
    res.status(500).send({status:false,message:error.message})
}
}

let bookById= async function (req,res){
   try{
       let bookId=req.params.bookId
       if(!bookId)
       return res.status(400).send({status:false, message:" please Provide  book Id"})
         if(!mongoose.isValidObjectId(bookId))
         return res.status(400).send({status:false, message:"Provide valid book Id"})
          let findbookId=await bookmodel.findOne({_id:bookId,isDeleted:false})
if(!findbookId.length==0)
return res.status(404).send({status:false, message:"not found of bookId"})

  if(findbookId.userId!=req.userId)
 return res.status(400).send({status:false, message:"you are unathorized"})

let findReview = await reviewmodel.findOne({ bookId: bookId });


let bookDetails={findbookId, reviewsData:findReview }

res.status(200).send({status:true,message:"Books list", data:bookDetails})

}catch(error){
    res.status(500).send({status:false,messsage:error.message})
}
}

let updateBook= async function(req,res){

    try{
    let bookId=req.params.bookId
    if(!bookId)
    return res.status(400).send({status:false, message:"bookId is require"})
    if(!mongoose.isValidObjectId(bookId))
    return res.status(400).send({status:false, message:"provide the valid bookId"})
    let find=await bookmodel.findOne({_id:bookId})
    if(find.length==0)
    return res.status(400).send({status:false, message:"bookId is not present "})
    if(find.userId!=req.userId)
    return res.status(403).send({status:false, message:"you are unAutherized"})
    
    let data=req.body
    let {title,excerpt,releasedAt,ISBN}=data

    if(isValidRequestBody(data))
    return res.status(400).send({status:false, message:"provide the data"}) 

    if(validInUpdate(title))
    return res.status(400).send({status:false, message:"provide the title"})
     let findTitle=await bookmodel.findOne({title:title})
     if(findTitle)
     return res.status(400).send({status:false, message:"Title is allready exist"})
      if(validInUpdate(excerpt))
      return res.status(400).send({status:false, message:"provide the excerpt"})
if(validInUpdate(ISBN))
return res.status(400).send({status:false, message:"provide ISBN"})
let findISBN=await bookmodel.findOne({ISBN:ISBN})
 if(findISBN)
 return res.status(400).send({status:false, message:"allready present ISBN"})

if (validInUpdate(releasedAt))
return res.status(400).send({status:false, message:"provide the valid bookId"})

let updatedata= await bookmodel.findOneAndUpdate({_id:bookId, isDeleted:false},{$set:{title: data.title,
    excerpt: data.excerpt,
    releasedAt: data.releasedAt,
    ISBN: data.ISBN,}},{new:true})
    return res.status(200).send({status:true, message:"data is successfull update",data:updatedata})
}catch(error){
    res.status(500).send({status:false,message:error.message})
}

}

const deleteBook = async function (req, res) {
    try {
      let bookId = req.params.bookId; 
  
      if (!bookId) {
        return res.status(400).send({ status: false, msg: "Book Id is Required" });
      }
  
      if (!mongoose.isValidObjectId(bookId)) 
        return res.status(400).send({ status: false, msg: "Please provide a valid Book Id" });
      
      let findBook = await bookmodel.findOne({ _id: bookId, isDeleted:false });
      if(!findBook)
      return res.status(404).send({status: false, message: "Book not Found or Already been Deleted" });
      
      if(findBook.userId!=req.userId){
          return res.status(403).send({ status: false, msg: "You are not Authorized" });
      }
  
      //finsing the book that we want to delete and update the isDeleted as True in the database
      let deletedBook = await bookmodel.findOneAndUpdate(
        { _id: bookId },
        { $set: { isDeleted: true, deletedAt: new Date() } },
        { new: true }
      );
      return res.status(200).send({status: true,msg: "Book Deleted Successfully" });
    } catch (error) {
      res.status(500).send({ status: false, Error: error.message });
    }
  };

module.exports = { createBook,bookList,bookById,updateBook,deleteBook }