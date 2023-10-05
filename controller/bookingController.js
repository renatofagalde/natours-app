const stripe = require(`stripe`)(process.env.STRIPE_SECRETE_KEY);
const Tour = require(`./../models/tourModel`);
const Booking = require(`./../models/bookingModel`);
const APIFeatures = require(`./../utils/api-feature`);
const AppError = require(`./../utils/appError`);
const catchAsync = require(`./../utils/catchAsync`);

exports.getCheckoutSession = catchAsync(async (request, response, next) => {
  //1# get the currently booked tour
  const tour = await Tour.findById(request.params.tourID);

  //2# create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${request.protocol}://${request.get('host')}/?tour=${
      request.params.tourID
    }&user=${request.user.id}&price=${tour.price}`,
    cancel_url: `${request.protocol}://${request.get('host')}/tour/${tour.slug}`,
    customer_email: request.user.email,
    client_reference_id: request.params.tourID,
    line_items: [
      {
        name: `${tour.name} tour`,
        description: `${tour.summary}`,
        images: ['https://www.natours.dev/img/tours/tour-1-cover.jpg'],
        amount: tour.price * 100,
        currency: 'brl',
        quantity: 1,
      },
    ],
  });

  //3# send session as response
  response.status(200).json({
    status: 'success',
    session,
  });

  next();
});

exports.createBookingCheckout = catchAsync(async (request, response, next) => {
  const { tour, user, price } = request.query;
  if (!tour && !user && !price) return next();

  await Booking.create({ tour, user, price });

  response.redirect(request.originalURL.split('?')[0]);
  //return next();
});
