const express = require('express');
const router = express.Router();
const viewController = require('../controller/viewController');
const authController = require('../controller/authController');
const bookingController = require('../controller/bookingController');

//islogged do a query find, and protect to.
router.get('/me', authController.protect, viewController.getAccount);

//180
router.get(
  '/',
  bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewController.getOverview
); //180
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour); //180
router.get('/login', authController.isLoggedIn, viewController.getLoginForm); //login 187

module.exports = router;
