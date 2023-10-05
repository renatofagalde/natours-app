const User = require(`./../models/userModel`);
const sharp = require('sharp');
const multer = require(`multer`);
const catchAsync = require(`./../utils/catchAsync`);
// const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

// const multerStorage = multer.diskStorage({
//   destination: (request, file, callBackFunction) => {
//     callBackFunction(null, 'public/img/users');
//   },
//   filename: (request, file, callBackFunction) => {
//     const ext = file.mimetype.split('/')[1];
//     callBackFunction(null, `user-${request.user.id}-${Date.now()}.${ext}`);
//   },
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (request, file, callBackFunction) => {
  if (file.mimetype.startsWith('image')) {
    callBackFunction(null, true);
  } else {
    callBackFunction(new AppError(`Not an image!`, 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  filteFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');
exports.resizeUserPhoto = catchAsync(async (request, response, next) => {
  if (!request.file) return next();

  request.file.filename = `user-${request.user.id}-${Date.now()}.jpeg`;

  await sharp(request.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${request.file.filename}`);

  next();
});

const filterObj = (object, ...allowedFields) => {
  const newObject = {};
  Object.keys(object).forEach((el) => {
    if (allowedFields.includes(el)) newObject[el] = object[el];
  });
  return newObject;
};

exports.getMe = (request, response, next) => {
  request.params.id = request.user.id;
  next();
};

exports.updateMe = catchAsync(async (request, response, next) => {
  // #1 create a error if user posts password data
  if (request.body.password || request.body.passwordConfirm)
    return next(new AppError(`This route is not for password updates`, 400));

  // #2 filtered out unwanted fields names that are not allowed to be updated
  let filteredBody = filterObj(request.body, 'name', 'email');
  if (request.file) filteredBody.photo = request.file.filename;

  //#3 update user account
  const updateUser = await User.findByIdAndUpdate(request.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  response.status(200).json({
    status: 'success',
    data: {
      user: updateUser,
    },
  });
});

exports.deleteMe = catchAsync(async (request, response, next) => {
  await User.findByIdAndUpdate(request.user.id, { active: false });
  response.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.newUser = (request, response) => {
  response.status(500).json({
    status: 'error',
    requestedAt: request.requestTime,
    message: `This route is not defined!`,
  });
};

//users
exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
//only for data! Do not update password with this.
exports.updatePartOfUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
