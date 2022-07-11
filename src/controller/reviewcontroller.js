const { default: mongoose } = require("mongoose");
const bookmodel = require("../model/bookmodel");
const reviewmodel = require("../model/reviewmodel.js");
const {isValidRequestBody,validRating, isValid} = require("../validator/validate");

//review

const reviewBook = async function (req, res) {
  try {
    let bookId = req.params.bookId;

    if (!bookId) {
      return res.status(400) .send({ status: false, message: "Book Id is required" });
    }

    if (!mongoose.isValidObjectId(bookId)) {
      return res.status(400).send({ status: false, message :"Please Provide a valid book Id" });
    }

    let bookDetail = await bookmodel.findOne({_id: bookId,isDeleted:false});

    if (bookDetail.length == 0) {
      return res.status(404).send({ status: false, message: "Book Not found" });
    }
    if(bookDetail.userId!=req.userId)
    return res.status(400).send({status:false, message:"you are unathorized"})

    let data = req.body;

    let { review, rating, reviewedBy } = data;

    if (isValidRequestBody(data)) {
      //validating is there any data inside request body
      return res.status(400).send({ status: false, message: "Please provide the Details" });
    }

    if (isValid(review)) {
      return res.status(400).send({ status: false, message: "Review is required" }); 
    }

    if (isValid(rating)) {
      return res.status(400).send({ status: false, message: "Rating is required" });
    }
    if (!validRating.test(rating)) {
      return res.status(400).send({ status: false, message: "Rating must be between 1 to 5" });
    }
    if (isValid(reviewedBy)) {
      return res.status(400).send({ status: false, message: "Reviewer Name is required" });
    }
    let reviewData = {
      bookId: bookId,
      reviewedBy: data.reviewedBy,
      reviewedAt: Date.now(),
      rating: data.rating,
      review: data.review,
    };

    let savedData = await reviewmodel.create(reviewData);

    await bookmodel.findOneAndUpdate(
      { _id: bookId, isDeleted: false },
      { $inc: { reviews: 1 } }
    );

    let reviewDetails = {
      _id: `ObjectId(${savedData._id})`,
      bookId: `ObjectId(${savedData.bookId})`,
      reviewedBy: savedData.reviewedBy,
      reviewedAt: savedData.reviewedAt,
      rating: savedData.rating,
      review: savedData.review,
    }
    return res.status(201).send({
      status: true,
      message: "Review Created Successfully",
      data: reviewDetails,
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};


const updateReviews = async function (req, res) {
  try {

      let bookId = req.params.bookId;
      let reviewId = req.params.reviewId;
      let data = req.body;

      if (isValidRequestBody(data)) {
          return res.status(400).send({ status: false, msg: "please enter some data for update" })
      }
      if (!bookId) {
          return res.status(400).send({ status: false, msg: "Book Id is Required" });
      }
      if (!reviewId) {
          return res.status(400).send({ status: false, message: "reviewId is  Required" })
      }
      if (!mongoose.isValidObjectId(bookId)) { 
        return res.status(400).send({ status: false, msg: "Please Provide a valid book Id" });
      }
      const findbook = await bookmodel.findOne({ _id: bookId, isDeleted: false })
      if (findbook.length==0) {
          return res.status(400).send({ status: false, message: "No book exist with this id" })
      }
       if(findbook.userId!=req.userId)
         return res.status(400).send({status:false, message:"you are unathorized"})   

      // validating bookId is a valid object Id or not
      if (!mongoose.isValidObjectId(reviewId)) { 
        return res.status(400).send({ status: false, msg: "Please Provide a valid review Id" });
      }
      let findreview = await reviewmodel.findOne({ _id: reviewId })
      if (findreview.length==0) {
          return res.status(400).send({ status: false, message: "No review exist with this id" })
      }
      let updateReview = await reviewmodel.findOneAndUpdate({ _id: reviewId, bookId: bookId },
          { $set: { review: data.review, rating: data.rating, reviewedBy: data.reviewedBy } }, { new: true })
      return res.status(200).send({ status: true, message: "Review updated successfully" ,data:updateReview})
   }catch (error) {
      res.status(500).send({ status: false, Error: error.message });

  }
}




const deleteReview = async function (req, res) {
  try {
    let bookId = req.params.bookId
    if (!bookId) {
      return res.status(400).send({ status: false, msg: "book Id is required" });
    }
    if (!mongoose.isValidObjectId(bookId)) {
      return res.status(400).send({ status: false, msg: "Please provide a valid Book Id" });
    }
    const findbook = await bookmodel.findOne({ _id: bookId, isDeleted: false })
      if (findbook.length==0) {
          return res.status(400).send({ status: false, message: "No book exist with this id" })
      }
       if(findbook.userId!=req.userId)
         return res.status(400).send({status:false, message:"you are unathorized"})   

    let reviewId = req.params.reviewId
    if (!reviewId) return res.status(400).send({ status: false, msg: "review Id is required" });
    if (!mongoose.isValidObjectId(reviewId)) {
      return res.status(400).send({ status: false, msg: "Please provide a valid review Id" });
    }

    let findreview = await reviewmodel.findOne({ _id: reviewId, isDeleted: false });
    if (!findreview) {
      return res.status(400).send({ status: false, msg: "not found" });
    } else {
      await reviewmodel.findByIdAndUpdate({ _id: reviewId }, { $set: { isDeleted: true, deletedAt: new Date() } }, { new: true });
    }


    await bookmodel.findOneAndUpdate(
      { _id: bookId, isDeleted: false },
      { $inc: { reviews: -1 } }
    );

    return res.status(200).send({ status: true, msg: "Review is Deleted" })


  } catch (error) {
    return res.status(500).send({ status: false, message: error.message })
  }
}


module.exports = { reviewBook, deleteReview,updateReviews };