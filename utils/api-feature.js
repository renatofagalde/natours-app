class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // #1 FILTERING
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    const queryObject = { ...this.queryString };
    const excludeField = ['page', 'limit', 'sort', 'fields'];
    excludeField.forEach((el) => delete queryObject[el]); // aula 94

    //#2 advanced filter
    let queryString = JSON.stringify(queryObject);
    queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    // const tours = await Tour.find();
    // const tours = await Tour.find().where('duration').equals(5);
    // let query = Tour.find(JSON.parse(queryString));
    this.query.find(JSON.parse(queryString));

    return this;
  }

  sort() {
    if (this.queryString.sort) this.query = this.query.sort(this.queryString.sort.split(',').join(' '));
    else this.query = this.query.sort('-createdAt');

    return this;
  }

  //limitFields
  projection() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1; //convert string a number, or 1 for default value
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    // if (this.queryString.page) {
    //   const numTours = await Tour.countDocuments();
    //   if (skip >= numTours) throw new Error(`This page does not exist`);
    // }

    return this;
  }
}
module.exports = APIFeatures;
