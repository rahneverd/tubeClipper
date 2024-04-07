// Importing required modules
const express = require('express');
const cors = require('cors');
const scrapper = require('./scrapper')
// Creating an instance of Express
const app = express();
const PORT = 3000;
// Using CORS middleware to enable cross-origin resource sharing
app.use(cors());
// Setting up a route to handle GET requests at '/download'
app.post('/save', async (req, res) => {
  // Calling the scrapper function to scrape the video URL
  scrapper(req.query.videoId).then((videoInfo) => {
    // Sending the scraped video URL back as a response
    res.status(200).send(videoInfo)
  }).catch((err) => {
    // Sending an error response if the video URL cannot be scraped
    res.status(400).send(err)
  })

});
// Instantiating a server to listen on port 8080
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});