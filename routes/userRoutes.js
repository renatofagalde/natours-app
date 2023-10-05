const express = require(`express`);
const router = express.Router();
const userController = require(`./../controller/userController`);
const authController = require(`./../controller/authController`);

//open to world
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

//after this point all this middlare
router.use(authController.protect);

//hack: using getMe to put ID in the params and re-use getUser method
router.get('/me', userController.getMe, userController.getUser);
router.patch('/updateMyPassword', authController.updatePassword);
router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);
router.delete('/deleteMe', userController.deleteMe);

//hack: using getMe to put ID in the params and re-use getUser method
router.use(authController.restrictTo('admin'));

//users
router.route(`/`).get(userController.getAllUsers).post(userController.newUser);

router
  .route(`/:id`)
  .get(userController.getUser)
  .patch(userController.updatePartOfUser)
  .delete(userController.deleteUser);

module.exports = router;
