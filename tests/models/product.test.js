const { Product, Category } = require('../../src/models/product');
const { ProductFactory } = require('../factories');

describe('Product Model', () => {
  describe('Product Creation', () => {
    test('should create a product and assert that it exists', () => {
      const productData = {
        name: 'Fedora',
        description: 'A red hat',
        price: 12.50,
        available: true,
        category: Category.CLOTHS
      };

      const product = new Product(productData);

      expect(product).toBeDefined();
      expect(product.id).toBeNull();
      expect(product.name).toBe('Fedora');
      expect(product.description).toBe('A red hat');
      expect(product.available).toBe(true);
      expect(product.price).toBe(12.50);
      expect(product.category).toBe(Category.CLOTHS);
    });

    test('should add a product to the database', async () => {
      const products = await Product.findAll();
      expect(products).toEqual([]);

      const productData = ProductFactory.build();
      const product = await Product.create(productData);

      expect(product.id).toBeDefined();

      const allProducts = await Product.findAll();
      expect(allProducts.length).toBe(1);

      const newProduct = allProducts[0];
      expect(newProduct.name).toBe(productData.name);
      expect(newProduct.description).toBe(productData.description);
      expect(parseFloat(newProduct.price)).toBe(productData.price);
      expect(newProduct.available).toBe(productData.available);
      expect(newProduct.category).toBe(productData.category);
    });
  });

  describe('Product Read', () => {
    test('should read a product from the database', async () => {
      const productData = ProductFactory.build();
      const product = await Product.create(productData);

      const foundProduct = await Product.findByPk(product.id);

      expect(foundProduct).toBeDefined();
      expect(foundProduct.name).toBe(productData.name);
    });
  });

  describe('Product Update', () => {
    test('should update a product in the database', async () => {
      const productData = ProductFactory.build();
      const product = await Product.create(productData);

      product.name = 'Updated Product';
      await product.save();

      const updatedProduct = await Product.findByPk(product.id);

      expect(updatedProduct.name).toBe('Updated Product');
    });
  });

  describe('Product Delete', () => {
    test('should delete a product from the database', async () => {
      const productData = ProductFactory.build();
      const product = await Product.create(productData);

      await product.destroy();

      const deletedProduct = await Product.findByPk(product.id);
      expect(deletedProduct).toBeNull();
    });
  });

  describe('Product List', () => {
    test('should list all products', async () => {
      await Product.create(ProductFactory.build());
      await Product.create(ProductFactory.build());
      await Product.create(ProductFactory.build());

      const products = await Product.findAll();

      expect(products.length).toBe(3);
    });
  });

  describe('Product Finders', () => {
    test('should find products by name', async () => {
      await Product.create({
        name: 'iPhone',
        description: 'Apple phone',
        price: 500.00,
        available: true,
        category: Category.TOOLS
      });

      await Product.create({
        name: 'iPhone',
        description: 'Another Apple phone',
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

      const products = await Product.findByName('iPhone');

      expect(products.length).toBe(2);
      expect(products[0].name).toBe('iPhone');
    });

    test('should find products by availability', async () => {
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

      const products = await Product.findByAvailability(true);

      expect(products.length).toBe(1);
      expect(products[0].available).toBe(true);
    });

    test('should find products by category', async () => {
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

      const products = await Product.findByCategory(Category.TOOLS);

      expect(products.length).toBe(1);
      expect(products[0].category).toBe(Category.TOOLS);
    });

    test('should find products by price', async () => {
      await Product.create({
        name: 'Cheap Product',
        description: 'Cheap product description',
        price: 9.99,
        available: true,
        category: Category.UNKNOWN
      });

      await Product.create({
        name: 'Expensive Product',
        description: 'Expensive product description',
        price: 99.99,
        available: true,
        category: Category.UNKNOWN
      });

      const products = await Product.findByPrice(9.99);

      expect(products.length).toBe(1);
      expect(parseFloat(products[0].price)).toBe(9.99);
    });
  });

  describe('Product Serialize', () => {
    test('should serialize a product', async () => {
      const product = await Product.create({
        name: 'Serialized Product',
        description: 'Serialized product description',
        price: 25.50,
        available: true,
        category: Category.HOUSEWARES
      });

      const serialized = product.serialize();

      expect(serialized.id).toBe(product.id);
      expect(serialized.name).toBe('Serialized Product');
      expect(serialized.description).toBe('Serialized product description');
      expect(serialized.price).toBe(25.50);
      expect(serialized.available).toBe(true);
      expect(serialized.category).toBe(Category.HOUSEWARES);
    });
  });
});

describe('Product Model Default Finders', () => {
  test('should find products by default availability', async () => {
    await Product.create({
      name: 'Default Available Product',
      description: 'Available by default search',
      price: 12.00,
      available: true,
      category: Category.FOOD
    });

    await Product.create({
      name: 'Default Unavailable Product',
      description: 'Unavailable product',
      price: 15.00,
      available: false,
      category: Category.FOOD
    });

    const products = await Product.findByAvailability();

    expect(products.length).toBe(1);
    expect(products[0].available).toBe(true);
  });
});
