const { When, Then, BeforeAll, AfterAll, setDefaultTimeout } = require('@cucumber/cucumber');
const { Builder, By, until, Select } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const assert = require('assert');

const BASE_URL = 'http://localhost:8080';
let driver;

setDefaultTimeout(60 * 1000);

BeforeAll(async function () {
  const options = new firefox.Options();
  options.addArguments('-headless');

  driver = await new Builder()
    .forBrowser('firefox')
    .setFirefoxOptions(options)
    .build();
});

AfterAll(async function () {
  if (driver) {
    await driver.quit();
  }
});

async function getField(fieldName) {
  const elementId = 'product_' + fieldName.toLowerCase().replace(/ /g, '_');
  return driver.findElement(By.id(elementId));
}

async function getButton(buttonText) {
  const buttonId = buttonText.toLowerCase() + '-btn';
  return driver.findElement(By.id(buttonId));
}

When('I visit the {string}', async function (pageName) {
  const pages = {
    'Home Page': '/'
  };

  await driver.get(BASE_URL + (pages[pageName] || '/'));
});

Then('I should see {string} in the title', async function (expectedTitle) {
  const actualTitle = await driver.getTitle();
  assert.strictEqual(
    actualTitle.includes(expectedTitle),
    true,
    `Expected title to include "${expectedTitle}", but got "${actualTitle}"`
  );
});

Then('I should not see {string}', async function (text) {
  const pageSource = await driver.getPageSource();
  assert.strictEqual(
    pageSource.includes(text),
    false,
    `Expected not to see "${text}" on the page`
  );
});

When('I set the {string} to {string}', async function (fieldName, value) {
  const field = await getField(fieldName);
  await field.clear();
  await field.sendKeys(value);
});

When('I select {string} in the {string} dropdown', async function (value, dropdownName) {
  const dropdownElement = await getField(dropdownName);
  const select = new Select(dropdownElement);
  await select.selectByVisibleText(value);
});

When('I press the {string} button', async function (buttonText) {
  const button = await getButton(buttonText);
  await driver.wait(until.elementIsVisible(button), 10000);
  await button.click();
});

Then('I should see the message {string}', async function (expectedMessage) {
  const message = await driver.findElement(By.id('flash_message'));
  await driver.wait(async () => {
    const text = await message.getText();
    return text.includes(expectedMessage);
  }, 10000);

  const actualMessage = await message.getText();
  assert.strictEqual(
    actualMessage.includes(expectedMessage),
    true,
    `Expected message "${expectedMessage}", but got "${actualMessage}"`
  );
});

When('I copy the {string} field', async function (fieldName) {
  const field = await getField(fieldName);
  this.copiedId = await field.getAttribute('value');
  assert.ok(this.copiedId, `Could not copy value from field "${fieldName}"`);
});

Then('the {string} field should be empty', async function (fieldName) {
  const field = await getField(fieldName);
  const value = await field.getAttribute('value');
  assert.strictEqual(value, '', `Expected field "${fieldName}" to be empty, but it was "${value}"`);
});

When('I paste the {string} field', async function (fieldName) {
  assert.ok(this.copiedId, 'No ID was copied to paste.');
  const field = await getField(fieldName);
  await field.clear();
  await field.sendKeys(this.copiedId);
});

Then('I should see {string} in the {string} field', async function (expectedValue, fieldName) {
  const field = await getField(fieldName);
  await driver.wait(until.elementIsVisible(field), 10000);
  const actualValue = await field.getAttribute('value');

  assert.strictEqual(
    actualValue,
    expectedValue,
    `Expected "${expectedValue}" in field "${fieldName}", but got "${actualValue}"`
  );
});

Then('I should see {string} in the {string} dropdown', async function (expectedValue, dropdownName) {
  const dropdown = await getField(dropdownName);
  const select = new Select(dropdown);
  const selectedOption = await select.getFirstSelectedOption();
  const actualValue = await selectedOption.getText();

  assert.strictEqual(
    actualValue,
    expectedValue,
    `Expected "${expectedValue}" in dropdown "${dropdownName}", but got "${actualValue}"`
  );
});

When('I change {string} to {string}', async function (fieldName, newValue) {
  const field = await getField(fieldName);
  await field.clear();
  await field.sendKeys(newValue);
});
