const express = require('express');
const { Product } = require('../models/product');
const { validateProduct, checkContentType } = require('../middleware/validation');

const router = express.Router();

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.status(200).json({ status: 200, message: 'OK' });
});

/**
 * CREATE A NEW PRODUCT
 */
router.post('/', checkContentType('application/json'), validateProduct, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    const location = `/api/products/${product.id}`;

    res.status(201)
      .location(location)
      .json(product.serialize());
  } catch (error) {
    res.status(400).json({
      error: 'Bad Request',
      message: error.message
    });
  }
});

/**
 * LIST ALL PRODUCTS OR SEARCH PRODUCTS
 */
router.get('/', async (req, res) => {
  try {
    const { name, category, available, availability } = req.query;
    const availableParam = available !== undefined ? available : availability;
    let products;

    if (name) {
      products = await Product.findByName(name);
    } else if (category) {
      products = await Product.findByCategory(category);
    } else if (availableParam !== undefined) {
      const isAvailable = String(availableParam).toLowerCase() === 'true';
      products = await Product.findByAvailability(isAvailable);
    } else {
      products = await Product.findAll();
    }

    res.status(200).json(products.map((product) => product.serialize()));
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

/**
 * READ A PRODUCT
 */
router.get('/:productId', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.productId);

    if (!product) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Product not found'
      });
    }

    return res.status(200).json(product.serialize());
  } catch (error) {
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

/**
 * UPDATE A PRODUCT
 */
router.put('/:productId', checkContentType('application/json'), validateProduct, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.productId);

    if (!product) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Product not found'
      });
    }

    await product.update(req.body);

    return res.status(200).json(product.serialize());
  } catch (error) {
    return res.status(400).json({
      error: 'Bad Request',
      message: error.message
    });
  }
});

/**
 * DELETE A PRODUCT
 */
router.delete('/:productId', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.productId);

    if (!product) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Product not found'
      });
    }

    await product.destroy();

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

module.exports = router;
