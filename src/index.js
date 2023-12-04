const { scrapeJobListings } = require('./scrapers/scrapeJobListings');
const { getHTML } = require('./scrapers/getHTML');
const cron = require('node-cron');

// Main function to run the application
const run = async () => {
  try {
    // console.log('Starting job listings scraping...');
    // await scrapeJobListings();
    console.log('Scraping complete. Now starting to get HTML content...');
    await getHTML();
    console.log('HTML content retrieval complete.');
  } catch (error) {
    console.error('An error occurred during run:', error);
  }
};

run();

//Schedule to run once a day at midnight
// cron.schedule('0 0 * * *', run);