const puppeteer = require('puppeteer');
const { saveToFile } = require('../utils/fileUtils');

const scrapeJobListings = async () => {;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    let jobListings = [];

    try { 
        await page.goto('https://www.linkedin.com/jobs/jobs-in-thailand?keywords=&location=Thailand&locationId=&geoId=105146118&f_TPR=r86400&position=1&pageNum=0', { waitUntil: 'networkidle0' });
        await page.waitForSelector('.job-search-card', { timeout: 60000 });
    
        let totalListings = 0;
        const maxListings = 20;
    
        while (totalListings < maxListings) {
          await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
          await page.waitForTimeout(3000);
    
          const loadMoreVisible = await page.evaluate(() => {
            const loadMoreButton = document.querySelector('button[aria-label="See more jobs"]');
            if (loadMoreButton) {
              loadMoreButton.click();
              return true;
            }
            return false;
          });
    
          if (loadMoreVisible) {
            await page.waitForSelector('.job-search-card', { timeout: 60000 });
          }
    
          jobListings = await page.evaluate(() => {
            const listings = [];
            const jobCards = document.querySelectorAll('.job-search-card');
            jobCards.forEach(card => {
              const url = card.querySelector('.base-card__full-link')?.getAttribute('href');
              listings.push({ url: url });
            });
            return listings;
          });
    
          totalListings = jobListings.length;
          saveToFile('./data/jobListings.json', jobListings);
    
          if (totalListings >= maxListings) {
            break;
          }
        }
    
      } catch (error) {
        console.error('An error occurred:', error);
        saveToFile('./data/jobListings.json', jobListings);
      } finally {
        await browser.close();
      }  
};

module.exports = { scrapeJobListings };
