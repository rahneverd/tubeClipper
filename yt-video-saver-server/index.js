// Importing required modules
const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors');
const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const scrapper = require('./scrapper')
// Creating an instance of Express
const app = express();
const PORT = 3000;
// Using CORS middleware to enable cross-origin resource sharing
app.use(cors());
// Setting up a route to handle GET requests at '/download'
app.post('/save', async (req, res) => {
  // Calling the scrapper function to scrape the video URL
  let videoInfo = await scrapper(req.query.videoId)
  // Sending the scraped video URL back as a response
  res.status(200).send(videoInfo)
});
// Instantiating a server to listen on port 8080
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});