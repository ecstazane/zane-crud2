module.exports = {
  Car: {
    brand: { type: 'String', required: true, label: 'Brand', minLength: 2, maxLength: 50 },
    model: { type: 'String', required: true, label: 'Model', minLength: 1, maxLength: 50 },
    year: { type: 'Number', required: true, label: 'Year', min: 1900, max: 2030 },
    price: { type: 'Number', required: true, label: 'Price (₱)', min: 0, max: 100000000 },
    inStock: { type: 'Boolean', label: 'In Stock', default: true }
  },
  Employee: {
    name: { type: 'String', required: true, label: 'Name', minLength: 2, maxLength: 50 },
    email: { type: 'email', required: true, label: 'Email', minLength: 2, maxLength: 50, unique: true },
    phone: { type: 'Number', required: true, label: 'Phone', minLength: 2, maxLength: 50 },
    id: { type: 'String', required: true, label: 'ID', minLength: 2, maxLength: 50, unique: true },
    position: { type: 'String', required: true, label: 'Position', minLength: 2, maxLength: 50 },
    salary: { type: 'Number', required: true, label: 'Salary (₱)', min: 0, max: 100000000 }
  }
};
