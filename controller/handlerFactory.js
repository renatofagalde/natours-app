const catchAsync = require(`./../utils/catchAsync`);
const AppError = require(`./../utils/appError`);
const APIFeatures = require(`./../utils/api-feature`);

exports.deleteOne = (Model) =>
  catchAsync(async (request, response, next) => {
    const document = await Model.findByIdAndDelete(request.params.id);
    if (!document) return next(new AppError('No document found with that ID', 404));
    response.status(204).json({
      status: 'success',
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (request, response, next) => {
    const document = await Model.findByIdAndUpdate(request.params.id, request.body, {
      new: true,
      runValidators: true,
    });
    if (!document) return next(new AppError('No document found with that ID', 404));
    response.status(200).json({
      status: 'success',
      data: { document },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: document,
      },
    });
  });

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (request, response, next) => {
    let query = Model.findById(request.params.id);
    if (populateOptions) query = query.populate(populateOptions);

    const document = await query;

    if (!document) return next(new AppError('No document found with that ID', 404));
    response.status(200).json({
      status: 'success',
      data: { document },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (request, response, next) => {
    //to allow for nested GET reviews on Tour
    let filter = {};
    if (request.params.tourId) filter = { tour: request.params.tourId };

    const features = new APIFeatures(Model.find(), request.query)
      .filter()
      .sort()
      .projection()
      .paginate();
    // const documents = await features.query.explain();
    const documents = await features.query;

    response.status(200).json({
      status: 'success',
      results: documents.length,
      data: { data: documents },
    });
  });
