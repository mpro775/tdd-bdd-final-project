const { Given } = require('@cucumber/cucumber');
const axios = require('axios');

const API_URL = 'http://localhost:8080/api/products';

Given('the following products', async function (dataTable) {
  try {
    const response = await axios.get(API_URL);
    const existingProducts = response.data;

    for (const product of existingProducts) {
      if (product.id) {
        await axios.delete(`${API_URL}/${product.id}`);
      }
    }
  } catch (error) {
    console.warn('Could not clear existing products, proceeding with creation:', error.message);
  }

  const rows = dataTable.hashes();

  for (const row of rows) {
    const product = {
      name: row.name,
      description: row.description,
      price: parseFloat(row.price),
      available: row.available.toLowerCase() === 'true',
      category: row.category
    };

    await axios.post(API_URL, product, {
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
