const puppeteer = require('puppeteer');
const { chunkArray } = require('../utils/chunkArray');
const { saveToFile, readFromFile } = require('../utils/fileUtils');

// Function to retrieve inner text content
const getHTML = async () => {
    const jsonFile = './data/jobListings.json';
    const jobListings = readFromFile(jsonFile);
    
    const chunkSize = 2; 
    const chunks = chunkArray(jobListings, chunkSize);

    const browser = await puppeteer.launch();
    const page = await browser.newPage(); 

    const extractedContents = {};   

    for (let chunk of chunks) {
        for (let job of chunk) {
            const url = job.url;
            try {
                await page.goto(url, { waitUntil: 'networkidle2' });

                // Retrieve inner text content
                const textContent = await page.evaluate(() => {
                    const element = document.querySelector('.decorated-job-posting__details');
                    return element ? element.innerText : 'Content not found';
                });

                extractedContents[url] = textContent; 

            } catch (error) {
                console.error(`Error scraping ${url}:`, error);
            }
        }

        saveToFile('./data/extractedContent.json', extractedContents)

    }

    await browser.close();

    saveToFile('./data/extractedContent.json', extractedContents);
    console.log('Saved extracted content to extractedContent.json');
};

module.exports = { getHTML };