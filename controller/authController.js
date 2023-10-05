const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const catchAsync = require(`../utils/catchAsync`);
const Email = require(`./../utils/email`);
const User = require(`./../models/userModel`);
const AppError = require('./../utils/appError');

const signToken = function (id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, response) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true, // prevent cross site attack
  };
  if (process.env.NODE_ENV === 'productionn') cookieOptions.secure = true;
  user.password = undefined;
  response.cookie('jwt', token, cookieOptions);
  response.status(statusCode).json({ status: `success`, token, data: { user } });
};

exports.signup = catchAsync(async (request, response, next) => {
  // const newUser = await User.create(request.body); // security bad
  const newUser = await User.create({
    name: request.body.name,
    email: request.body.email,
    password: request.body.password,
    passwordConfirm: request.body.passwordConfirm,
    passwordChangeAt: new Date().toISOString(),
    role: request.body.role,
  });
  const url = `${request.protocol}://${request.get('host')}/me`;
  await new Email(newUser, url).sendWelcome();
  createSendToken(newUser, 201, response);
});

exports.login = catchAsync(async (request, response, next) => {
  const { email, password } = request.body;

  // #1 Check if email and password exist
  if (!email || !password) return next(new AppError(`Please provide email and password`, 400));

  // #2 Check if users exists and password is correct
  const user = await User.findOne({ email }).select('+password');
  // const correct = await user.correctPassword(password, user.password); moved to if below

  console.log(user, password);
  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError(`Incorrect email or passoword`, 401)); //unauthorized

  // #3 If everything ok, send token to client
  createSendToken(user, 200, response);
});

exports.logout = (request, response) => {
  response.cookie('jwt', 'loggetdout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  response.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (request, response, next) => {
  // 1# Getting token and check of it's there
  let token = null;
  if (request.headers.authorization && request.headers.authorization.startsWith('Bearer')) {
    token = request.headers.authorization.split(' ')[1];
  } else if (request.cookies.jwt) token = request.cookies.jwt;

  if (!token) return next(new AppError(`You are not logged in`, 401));

  // 2# Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3# Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(new AppError('The user belonging to this token does no longer exist', 401));

  // 4# check if user changed password after JWT token was issued
  // if (currentUser.changedPasswordAfter(decoded.iat))
  //   return next(new AppError('User recently changed password, please log in again', 401));

  // GRANT ACCESS TO PROTECTED ROUTE
  request.user = currentUser;
  response.locals.user = currentUser;
  console.log(`protect()\tCheck and allowed user => ${currentUser}`);
  return next();
});

//only for rendered pages, no errors
exports.isLoggedIn = async (request, response, next) => {
  // 1# Getting token and check of it's there

  if (request.cookies.jwt) {
    try {
      const token = request.cookies.jwt;

      // 2# Verification token
      const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

      // 3# Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) return next();

      // THERE IS A LOGGED IN USER
      response.locals.user = currentUser;
      console.log(`user logged in => \t`, JSON.stringify(response.locals));
      return next();
    } catch (error) {
      console.log(error);
      return next();
    }
  }
  return next();
};

exports.restrictTo = (...roles) => {
  return (request, response, next) => {
    if (!roles.includes(request.user.role))
      return next(new AppError(`You do not have permission to perform this action`, 403)); //FORBIDDEN

    next();
  };
};

exports.forgotPassword = catchAsync(async (request, response, next) => {
  // 1# GET USER BASED ON POST EMAIL
  const user = await User.findOne({ email: request.body.email });
  if (!user) return next(new AppError(`There is no user with email address`, 404));

  // 2# GENERATE THE RANDOM PASSWORD
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  console.log(`user ${user.name} => ${user.passwordResetExpires}`);

  try {
    //3# SEND IT TO USER'S EMAIL
    const resetURL = `${request.protocol}://${request.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    console.log(`before`);
    await new Email(user, resetURL).sendPasswordReset();
    console.log(`after`);
    response.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (err) {
    console.log(err);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('There was an error sending the email. Try again later!', 500));
  }
});

exports.resetPassword = catchAsync(async (request, response, next) => {
  // #1 Get user based on the token
  const hashedToken = crypto.createHash('sha256').update(request.params.token).digest('hex');

  // #2 if token has not expired, and there is user, set the new password
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) return next(new AppError(`Token is invalid or has expired`, 400));

  user.password = request.body.password;
  user.passwordConfirm = request.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // #3 Update changePasswordAt property fro the user
  // #4 Log the user in, send JWT
  createSendToken(user, 200, response);
});

exports.updatePassword = catchAsync(async (request, response, next) => {
  // #1 get user from the collection
  const user = await User.findById(request.user.id).select('+password');

  // #2 check if the posted password is correct
  if (!(await user.correctPassword(request.body.passwordCurrent, user.password)))
    return next(new AppError(`Your current password is wrong`, 401));

  // #3 if so, update password
  user.password = request.body.password;
  user.passwordConfirm = request.body.passwordConfirm;
  await user.save();
  // User.findByIdAndUpdate will not work as intended,
  // because the pre.save() configs to password and others

  // #4 log user in, send JWT
  createSendToken(user, 200, response);
});
