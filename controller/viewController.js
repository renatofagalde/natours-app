const Tour = require(`./../models/tourModel`);
const APIFeatures = require(`./../utils/api-feature`);
const catchAsync = require(`./../utils/catchAsync`);
const AppError = require('./../utils/appError');

exports.getOverview = catchAsync(async (request, response) => {
  //1# get tour data from collection
  const tours = await Tour.find();

  //2# build template

  //3# Render that template using tour data from 1

  //179
  response.status(200).render('overview', {
    title: 'All tour from likwi',
    tours,
  });
});

exports.getTour = catchAsync(async (request, response, next) => {
  //1# get the data for the requested tour, includind tour guides and reviews
  const tour = await Tour.findOne({ slug: request.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  //2# build template

  //3 redender template useing data from 1
  let title = undefined;
  if (!tour) {
    return next(new AppError(`There is not tour with ${request.params.slug} name`, 404));
  } else {
    title = tour.name;
  }

  //179
  // response
  //   .status(200)
  //   .set(
  //     'Content-Security-Policy',
  //     "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
  //   )
  //   .render('tour', {
  //     title: title,
  //     tour,
  //   });
  response
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.mapbox.com https://*.stripe.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com https://js.stripe.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )
    .render('tour', {
      title: `${tour.name} Tour`,
      tour,
    });
});

exports.getLoginForm = (request, response) => {
  //179
  response
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.cloudflare.com/ ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )
    .render('login', {
      title: `Log into your account`,
    });
};

exports.getAccount = (request, response) => {
  response
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.mapbox.com https://*.stripe.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com https://js.stripe.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )
    .render('account', {
      title: `Your account`,
    });
};
