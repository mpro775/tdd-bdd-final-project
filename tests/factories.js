const { faker } = require('@faker-js/faker');
const { Category } = require('../src/models/product');

class ProductFactory {
  static build() {
    const categories = [
      Category.CLOTHS,
      Category.FOOD,
      Category.HOUSEWARES,
      Category.AUTOMOTIVE,
      Category.TOOLS
    ];

    return {
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription().substring(0, 250),
      price: parseFloat(faker.commerce.price({ min: 1, max: 500, dec: 2 })),
      available: faker.datatype.boolean(),
      category: faker.helpers.arrayElement(categories)
    };
  }

  static async create() {
    const { Product } = require('../src/models/product');
    return Product.create(ProductFactory.build());
  }

  static buildList(count) {
    const products = [];
    for (let i = 0; i < count; i += 1) {
      products.push(ProductFactory.build());
    }
    return products;
  }

  static async createList(count) {
    const products = [];
    for (let i = 0; i < count; i += 1) {
      products.push(await ProductFactory.create());
    }
    return products;
  }
}

module.exports = { ProductFactory };
