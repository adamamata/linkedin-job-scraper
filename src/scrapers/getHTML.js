const puppeteer = require('puppeteer');
const { chunkArray } = require('../utils/chunkArray');
const { saveToFile, readFromFile } = require('../utils/fileUtils');

// Function to retrieve inner text content
const getHTML = async () => {
    const jsonFile = './data/jobListings.json';
    const jobListings = readFromFile(jsonFile);
    
    const chunkSize = 5;
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
                    const element1 = document.querySelector('.top-card-layout__card');
                    const element2 = document.querySelector('.decorated-job-posting__details');

                    if (element1 && element2) {
                        let textContentFinal = element1.innerText + element2.innerText;
                        return { textContentFinal };
                    } else {
                        return null;
                    }
                });

                if (textContent) {
                    extractedContents[url] = textContent; 
                }

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
