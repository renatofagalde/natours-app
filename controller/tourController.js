// const { request } = require('../app');
const Tour = require(`./../models/tourModel`);
const APIFeatures = require(`./../utils/api-feature`);
const AppError = require(`./../utils/appError`);
const catchAsync = require(`./../utils/catchAsync`);
const factory = require('./handlerFactory');
const sharp = require('sharp');
const multer = require(`multer`);

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

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

exports.resizeTourImages = catchAsync(async (request, response, next) => {
  console.log(`request => `, request.files);

  if (!request.files.imageCover || !request.files.images) return next();

  //1# COVER IMAGE
  request.body.imageCover = `tour-${request.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(request.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${request.body.imageCover}`);

  //2# LOOP THROUGH IMAGES
  request.body.images = [];
  await Promise.all(
    request.files.images.map(async (file, index) => {
      const filename = `tour-${request.params.id}-${Date.now()}-${index + 1}.jpeg`;
      await sharp(request.files.images[index].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);
      request.body.images.push(filename);
    })
  );

  next();
});

// upload.single('images')
// upload.array('images', 5);

exports.aliasTopTours = (request, response, next) => {
  request.query.limit = '5';
  request.query.sort = '-ratingsAverage,price';
  request.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = factory.getAll(Tour);

exports.getTour = factory.getOne(Tour, { path: 'reviews' });

exports.newTour = factory.createOne(Tour);
// do not update passwords with this
exports.updatePartOfTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (request, response, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        //   _id: null, //use some property
        _id: { $toUpper: '$difficulty' }, //use some property
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    }, //,
    //   {
    //     $match: {
    //       _id: { $ne: 'EASY' },
    //     },
    //   },
  ]);
  response.status(200).json({
    status: 'success',
    data: { stats },
  });
});

exports.getMonthlyPlan = catchAsync(async (request, response, next) => {
  const year = request.params.year * 1; // 2021

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);

  response.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});

// /tours-within?distance=233&center=34.117993,-118.1186897&unit=mi
// /tours-within/233/center/34.117993,-118.1186897/unit/mi

exports.getToursWithin = catchAsync(async (request, response, next) => {
  const { distance, latlng, unit } = request.params;
  const [lat, lng] = latlng.split(',');
  if (!lat || !lng) next(new AppError(`Please provide latlng in the format lat,lng`, 400));

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  response.status(200).json({
    status: 'success',
    result: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (request, response, next) => {
  const { latlng, unit } = request.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) next(new AppError(`Please provide latlng in the format lat,lng`, 400));

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [lng * 1, lat * 1] },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  response.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});
