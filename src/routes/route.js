const express=require("express");
const router =express.Router();
const bookcontroller=require("../controller/bookcontroller");
const usercontroller=require("../controller/usercontroller");
const reviewcontroller=require("../controller/reviewcontroller");
const auth=require("../middelware/auth")

// user
router.post("/register", usercontroller.createUser)
router.post("/login", usercontroller.userLogin)

//book
router.post("/books",auth.checkAuth,bookcontroller.createBook)
router.get("/books",auth.checkAuth,bookcontroller.bookList)
router.get("/books/:bookId",auth.checkAuth,bookcontroller.bookById)
router.put("/books/:bookId",auth.checkAuth,bookcontroller.updateBook)
router.delete("/books/:bookId",auth.checkAuth,bookcontroller.deleteBook)

//review
router.post("/books/:bookId/review",auth.checkAuth,reviewcontroller.reviewBook)
router.put("/books/:bookId/review/:reviewId",auth.checkAuth,reviewcontroller.updateReviews)
router.delete("/books/:bookId/review/:reviewId",auth.checkAuth,reviewcontroller.deleteReview)




module.exports=router