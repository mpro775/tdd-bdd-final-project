const request = require('supertest');
const app = require('../../src/app');
const { Product, Category } = require('../../src/models/product');
const { ProductFactory } = require('../factories');

const BASE_URL = '/api/products';

describe('Product Routes', () => {
  async function createProducts(count = 1) {
    const products = [];
    for (let i = 0; i < count; i += 1) {
      const productData = ProductFactory.build();
      const product = await Product.create(productData);
      products.push(product);
    }
    return products;
  }

  async function getProductCount() {
    const response = await request(app)
      .get(BASE_URL)
      .expect(200);

    return response.body.length;
  }

  describe('Basic Endpoints', () => {
    test('should return the index page', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.text).toContain('Product Catalog Administration');
    });

    test('should be healthy', async () => {
      const response = await request(app)
        .get(`${BASE_URL}/health`)
        .expect(200);

      expect(response.body.message).toBe('OK');
    });
  });

  describe('CREATE Product', () => {
    test('should create a new product', async () => {
      const testProduct = ProductFactory.build();

      const response = await request(app)
        .post(BASE_URL)
        .send(testProduct)
        .expect(201);

      expect(response.headers.location).toBeDefined();

      const newProduct = response.body;
      expect(newProduct.name).toBe(testProduct.name);
      expect(newProduct.description).toBe(testProduct.description);
      expect(newProduct.price).toBe(testProduct.price);
      expect(newProduct.available).toBe(testProduct.available);
      expect(newProduct.category).toBe(testProduct.category);
    });

    test('should not create a product without a name', async () => {
      const productData = ProductFactory.build();
      delete productData.name;

      const response = await request(app)
        .post(BASE_URL)
        .send(productData)
        .expect(400);

      expect(response.body.error).toBe('Validation Error');
    });

    test('should not create a product with no Content-Type', async () => {
      await request(app)
        .post(BASE_URL)
        .send('bad data')
        .expect(415);
    });

    test('should not create a product with wrong Content-Type', async () => {
      await request(app)
        .post(BASE_URL)
        .set('Content-Type', 'text/plain')
        .send('some plain text data')
        .expect(415);
    });

    test('should proceed if content type is correct but has extra parameters', async () => {
      const productData = ProductFactory.build();

      const response = await request(app)
        .post(BASE_URL)
        .set('Content-Type', 'application/json; charset=utf-8')
        .send(productData);

      expect(response.status).toBe(201);
    });
  });

  describe('READ Product', () => {
    test('should read a product', async () => {
      const product = await Product.create(ProductFactory.build());

      const response = await request(app)
        .get(`${BASE_URL}/${product.id}`)
        .expect(200);

      expect(response.body.id).toBe(product.id);
      expect(response.body.name).toBe(product.name);
    });

    test('should return 404 if product is not found', async () => {
      await request(app)
        .get(`${BASE_URL}/99999`)
        .expect(404);
    });
  });

  describe('UPDATE Product', () => {
    test('should update a product', async () => {
      const product = await Product.create(ProductFactory.build());

      const updatedData = {
        name: 'Updated Product',
        description: 'Updated product description',
        price: 88.88,
        available: false,
        category: Category.AUTOMOTIVE
      };

      const response = await request(app)
        .put(`${BASE_URL}/${product.id}`)
        .send(updatedData)
        .expect(200);

      expect(response.body.id).toBe(product.id);
      expect(response.body.name).toBe(updatedData.name);
      expect(response.body.description).toBe(updatedData.description);
      expect(response.body.price).toBe(updatedData.price);
      expect(response.body.available).toBe(updatedData.available);
      expect(response.body.category).toBe(updatedData.category);
    });

    test('should return 404 when updating a product that does not exist', async () => {
      const updatedData = ProductFactory.build();

      await request(app)
        .put(`${BASE_URL}/99999`)
        .send(updatedData)
        .expect(404);
    });
  });

  describe('DELETE Product', () => {
    test('should delete a product', async () => {
      const product = await Product.create(ProductFactory.build());
      const countBefore = await getProductCount();

      await request(app)
        .delete(`${BASE_URL}/${product.id}`)
        .expect(204);

      const countAfter = await getProductCount();

      expect(countBefore).toBe(1);
      expect(countAfter).toBe(0);
    });

    test('should return 404 when deleting a product that does not exist', async () => {
      await request(app)
        .delete(`${BASE_URL}/99999`)
        .expect(404);
    });
  });

  describe('LIST Products', () => {
    test('should list all products', async () => {
      await createProducts(3);

      const response = await request(app)
        .get(BASE_URL)
        .expect(200);

      expect(response.body.length).toBe(3);
    });

    test('should list products by name', async () => {
      await Product.create({
        name: 'iPhone',
        description: 'Apple phone',
        price: 500.00,
        available: true,
        category: Category.TOOLS
      });

      await Product.create({
        name: 'iPhone',
        description: 'Second Apple phone',
        price: 600.00,
        available: true,
        category: Category.TOOLS
      });

      await Product.create({
        name: 'T-Shirt',
        description: 'Blue shirt',
        price: 20.00,
        available: true,
        category: Category.CLOTHS
      });

      const response = await request(app)
        .get(`${BASE_URL}?name=iPhone`)
        .expect(200);

      expect(response.body.length).toBe(2);
      expect(response.body[0].name).toBe('iPhone');
    });

    test('should list products by category', async () => {
      await Product.create({
        name: 'Hammer',
        description: 'A strong hammer',
        price: 30.00,
        available: true,
        category: Category.TOOLS
      });

      await Product.create({
        name: 'Bread',
        description: 'Fresh bread',
        price: 2.00,
        available: true,
        category: Category.FOOD
      });

      const response = await request(app)
        .get(`${BASE_URL}?category=${Category.TOOLS}`)
        .expect(200);

      expect(response.body.length).toBe(1);
      expect(response.body[0].category).toBe(Category.TOOLS);
    });

    test('should list products by availability', async () => {
      await Product.create({
        name: 'Available Product',
        description: 'Available product description',
        price: 10.00,
        available: true,
        category: Category.FOOD
      });

      await Product.create({
        name: 'Unavailable Product',
        description: 'Unavailable product description',
        price: 15.00,
        available: false,
        category: Category.FOOD
      });

      const response = await request(app)
        .get(`${BASE_URL}?available=true`)
        .expect(200);

      expect(response.body.length).toBe(1);
      expect(response.body[0].available).toBe(true);
    });
  });
});

describe('Product Routes Error Handling', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should handle create errors', async () => {
    const productData = ProductFactory.build();

    jest.spyOn(Product, 'create').mockRejectedValue(new Error('create failed'));

    const response = await request(app)
      .post(BASE_URL)
      .send(productData)
      .expect(400);

    expect(response.body.error).toBe('Bad Request');
  });

  test('should handle list errors', async () => {
    jest.spyOn(Product, 'findAll').mockRejectedValue(new Error('list failed'));

    const response = await request(app)
      .get(BASE_URL)
      .expect(500);

    expect(response.body.error).toBe('Internal Server Error');
  });

  test('should handle read errors', async () => {
    jest.spyOn(Product, 'findByPk').mockRejectedValue(new Error('read failed'));

    const response = await request(app)
      .get(`${BASE_URL}/1`)
      .expect(500);

    expect(response.body.error).toBe('Internal Server Error');
  });

  test('should handle update errors', async () => {
    const product = await Product.create(ProductFactory.build());
    const updatedData = ProductFactory.build();

    jest.spyOn(Product.prototype, 'update').mockRejectedValue(new Error('update failed'));

    const response = await request(app)
      .put(`${BASE_URL}/${product.id}`)
      .send(updatedData)
      .expect(400);

    expect(response.body.error).toBe('Bad Request');
  });

  test('should handle delete errors', async () => {
    jest.spyOn(Product, 'findByPk').mockRejectedValue(new Error('delete failed'));

    const response = await request(app)
      .delete(`${BASE_URL}/1`)
      .expect(500);

    expect(response.body.error).toBe('Internal Server Error');
  });
});
