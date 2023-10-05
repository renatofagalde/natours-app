const express = require('express');
const reviewController = require('./../controller/reviewController');
const authController = require(`./../controller/authController`);

const router = express.Router({ mergeParams: true }); //158

//after this point all this middlare
router.use(authController.protect);
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .patch(authController.restrictTo('user', 'admin'), reviewController.update)
  .delete(authController.restrictTo('user', 'admin'), reviewController.delete)
  .get(reviewController.getReview);

module.exports = router;
