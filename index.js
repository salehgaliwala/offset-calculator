const puppeteer = require('puppeteer');
const express = require('express');
const app = express();
const port = 3000;
const cors = require("cors");
app.use(cors()); 
app.get('/getLoggedFlightHTML', async (req, res) => {
  try {
  const browser = await puppeteer.launch({ headless: true,args:['--no-sandbox']});
  const page = await browser.newPage();
  const { departure, arrival, pax , flightClass, trip} = req.query;
  // Navigate to the form URL
  await page.goto('https://regreener.earth/flight-compensator');
  await page.waitForTimeout(1000); 
  await page.waitForSelector('#CybotCookiebotDialog');

  // Inject JavaScript code to hide the element
  await page.evaluate(() => {
    const cookieDialog = document.querySelector('#CybotCookiebotDialog');
    if (cookieDialog) {
      cookieDialog.style.display = 'none';
    }
  });
 await page.waitForSelector('.mobile-nav');
 // Inject JavaScript code to hide the element
  await page.evaluate(() => {
    const mobilenav = document.querySelector('.mobile-nav');
    if (mobilenav ) {
      mobilenav.style.display = 'none';
    }
  });
  await page.waitForSelector('.form-card--row-auto');
  const sections = await page.$$('.form-card--row-auto');
  const firstSection = sections[0]; 
  // Wait for the form to load
  await firstSection.waitForSelector('.rg-select input');
  const inputInSection = await firstSection.$('.rg-select input');
  // Click on the input box in class selector '.rg-list'
  await inputInSection.click();

  // Provide the text to be written in the input box
  const inputText = departure;
  await inputInSection.type(inputText);

  // Wait for the dropdown to appear

  const liElements = await firstSection.$$('.rg-select--list li');  
  // Find the matching option in the dropdown and click it
  const optionText = inputText;
  for (const liElement of liElements) {
    // Extract text from the span inside the li element
    const spanText = await liElement.$eval('span', span => span.textContent.trim());

    // Check if the text matches
    if (spanText === optionText) {
      // Click on the matching li element
      await page.waitForTimeout(1000);
      console.log(spanText);
      await liElement.click();
      break; // Exit the loop after clicking
    }
  }

  await page.click('.rg-input--field');
  await page.type('.rg-input--field', pax);
  // Select the class
  // Select a value in the .flight-cal--dropdown-dark select based on a provided value
  const selectValue = flightClass; // Replace with the actual value
  await page.select('.flight-cal--dropdown-dark select', selectValue);

  const secondSection = sections[1]; 
  // Wait for the form to load
  await secondSection.waitForSelector('.rg-select input');
  const inputInsecondSection = await secondSection.$('.rg-select input');
  // Click on the input box in class selector '.rg-list'
  await inputInsecondSection.click();

  // Provide the text to be written in the input box
  const inputSecondText = arrival;
  await inputInSection.type(inputSecondText);

  // Wait for the dropdown to appear

  const liSecondElements = await secondSection.$$('.rg-select--list li');  
  // Find the matching option in the dropdown and click it
  const optionSeondText = inputSecondText;
  for (const liSecondElement of liSecondElements) {
    // Extract text from the span inside the li element
    const spanSeoncondText = await liSecondElement.$eval('span', span => span.textContent.trim());

    // Check if the text matches
    if (spanSeoncondText === optionSeondText) {
      // Click on the matching li element
      await page.waitForTimeout(1000);
      console.log(spanSeoncondText);
      await liSecondElement.click();
      break; // Exit the loop after clicking
    }
  }
   await page.waitForSelector('.rg-button.flight');
   await page.click('.rg-button.flight');
  // Submit the form or perform any other actions as needed
  await page.waitForSelector('.logged-flight');

  // Get the HTML content of the element with class 'logged-flight'
  const loggedFlightHTML = await page.$eval('.logged-flight', element => element.innerHTML);

  // Echo the HTML content
  console.log(loggedFlightHTML);

  // Close the browser
  await browser.close();

  // Close the browser

  res.send(loggedFlightHTML);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
  });

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
})
