const fs = require('fs');
const path = require('path');

// Save data to a file
const saveToFile = (filePath, data) => {
  // Ensure directory exists
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Write the file
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Read data from a file
const readFromFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  return null; // Or handle this case as you see fit
};

module.exports = { saveToFile, readFromFile };
