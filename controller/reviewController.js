const Review = require('./../models/reviewModel');
const APIFeatures = require(`./../utils/api-feature`);
const catchAsync = require(`./../utils/catchAsync`);
const AppError = require(`./../utils/appError`);
const factory = require('./handlerFactory');

exports.setTourUserIds = (request, response, next) => {
  //allow nested route || passar parametros alinhados na url
  if (!request.body.tour) request.body.tour = request.params.tourId;
  if (!request.body.user) request.body.user = request.user.id;
  next();
};

exports.getAllReviews = factory.getAll(Review);
exports.createReview = factory.createOne(Review);
exports.update = factory.updateOne(Review);
exports.delete = factory.deleteOne(Review);
exports.getReview = factory.getOne(Review);
