//tours
const express = require('express');

const tourController = require(`./../controller/tourController`);
const authController = require(`./../controller/authController`);
// const reviewController = require(`./../controller/reviewController`);
const reviewRouter = require(`./../routes/reviewRoutes`);

const router = express.Router();

//64
// router.param(`id`, tourController.checkId);

router.use('/:tourId/reviews', reviewRouter);

router.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours);

router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );

// 300 miles, latlng where I live
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);
// /tours-within?distance=233&center=34.117993,-118.1186897&unit=mi
// /tours-within/233/center/34.117993,-118.1186897/unit/mi

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router.route('/tour-stats').get(tourController.getTourStats);
router
  .route(`/`)
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.newTour
  );
// .post(tourController.checkBody, tourController.newTour);

router
  .route(`/:id`)
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updatePartOfTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

// router
//   .route('/:tourId/reviews')
//   .post(authController.protect, authController.restrictTo('user'), reviewController.createReview);
module.exports = router;
