const puppeteer = require('puppeteer');
const { chunkArray } = require('../utils/chunkArray');
const { saveToFile, readFromFile } = require('../utils/fileUtils');

// Function to extract trackingId from URL and remove '=='
const extractTrackingIdFromUrl = (url) => {
    if (!url) {
        console.error('Invalid or undefined URL');
        return null;
    }

    try {
        const urlObj = new URL(url);
        let trackingId = urlObj.searchParams.get('trackingId');
        if (trackingId) {
            return trackingId.replace(/==$/, '');
        }
    } catch (error) {
        console.error(`Error parsing URL: ${url}`, error);
    }
    return null;
};

// Function to retrieve inner text content
const getHTML = async () => {
    const jsonFile = './data/jobListings.json';
    const jobListings = readFromFile(jsonFile);
    
    const chunkSize = 5;
    const chunks = chunkArray(jobListings, chunkSize);

    const browser = await puppeteer.launch();
    const page = await browser.newPage(); 

    const extractedContents = []; // Initialize as an array

    for (let chunk of chunks) {
        for (let job of chunk) {
            const url = job.url;
            const trackingId = extractTrackingIdFromUrl(url); // Extract trackingId from URL
    
            // If trackingId is null or undefined, continue to the next URL
            if (!trackingId) {
                continue;
            }
    
            try {
                await page.goto(url, { waitUntil: 'networkidle2' });
    
                // Retrieve inner text content
                const textContent = await page.evaluate(() => {
                    const element1 = document.querySelector('.top-card-layout__card');
                    const element2 = document.querySelector('.decorated-job-posting__details');
    
                    if (element1 && element2) {
                        let textContentFinal = element1.innerText + element2.innerText;
                        return textContentFinal; // Return the text content directly
                    } else {
                        return null;
                    }
                });
    
                if (textContent) {
                    extractedContents.push({ id: trackingId, url: url, content: textContent });
                }
    
            } catch (error) {
                console.error(`Error scraping ${url}:`, error);
                // Continue to the next URL even if this one fails
            }
        }
    
        saveToFile('./data/extractedContent.json', extractedContents)
    }
    
    await browser.close();
    saveToFile('./data/extractedContent.json', extractedContents);
    console.log('Saved extracted content to extractedContent.json');
    
};

module.exports = { getHTML };
