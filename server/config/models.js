module.exports = {
  Car: {
    brand: { type: 'String', required: true, label: 'Brand', minLength: 2, maxLength: 50 },
    model: { type: 'String', required: true, label: 'Model', minLength: 1, maxLength: 50 },
    year: { type: 'Number', required: true, label: 'Year', min: 1900, max: 2030 },
    price: { type: 'Number', required: true, label: 'Price (₱)', min: 0, max: 100000000 },
    inStock: { type: 'Boolean', label: 'In Stock', default: true }
  },
  Movie: {
    title: { type: 'String', required: true, label: 'Title', minLength: 1, maxLength: 200 },
    director: { type: 'String', required: true, label: 'Director', minLength: 2, maxLength: 100 },
    year: { type: 'Number', required: true, label: 'Release Year', min: 1888, max: 2030 },
    releaseDate: { type: 'Date', label: 'Release Date' },
    genre: { type: 'String', label: 'Genre', options: ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance'] },
    rating: { type: 'Number', label: 'Rating (1-10)', min: 1, max: 10 }
  }
};
