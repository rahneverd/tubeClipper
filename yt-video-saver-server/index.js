// Importing required modules
const express = require("express");
const cors = require("cors");
const scrapper = require("./scrapper");
const mysql = require("mysql2");

// set env
require("dotenv").config();

// Creating an instance of Express
const app = express();

// Using CORS middleware to enable cross-origin resource sharing
app.use(cors());

// create a connection pool to MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
}).promise()



// Setting up a route to handle GET requests at '/download'
app.post("/save", async (req, res) => {
  // Calling the scrapper function to scrape the video URL
  scrapper(req.query.videoId)
    .then(async (videoInfo) => {      
      try {
        // Inserting the scraped data into the 'video_info' table
        videoInfo.keywords = JSON.stringify(videoInfo.keywords);
        videoInfo.timeStamp = (new Date()).toISOString()
        await pool.query("INSERT INTO video_info SET ?",
          videoInfo)
        // Sending the scraped video URL back as a response
        res.status(200).send(videoInfo);
      } catch (error) {
        console.log(error)
        // Sending an error response if the video URL cannot be scraped
        res.status(400).send(err);
      }
    })
    .catch((err) => {
      // Sending an error response if the video URL cannot be scraped
      res.status(400).send(err);
    });
});

//   // Create video_info table if it doesn't exist
const createTableQuery = `CREATE TABLE IF NOT EXISTS video_info (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  url VARCHAR(255) UNIQUE NOT NULL,
  thumbnail VARCHAR(255),
  uploadedOn VARCHAR(255),
  publishedOn VARCHAR(255),
  tags TEXT,
  keywords TEXT,
  embedUrl VARCHAR(255),
  views INT,
  isFamilyFriendly BOOLEAN,
  requiresSubscription BOOLEAN,
  identifier VARCHAR(255),
  length VARCHAR(255),
  category VARCHAR(255),
  channelId VARCHAR(255),
  channelName VARCHAR(255),
  shortDescription TEXT,
  timeStamp TIMESTAMP
)`;

pool.query(createTableQuery).then((resp) => {
  console.log("Table 'video_info' created successfully");
  // Instantiating a server to listen on port 8080
  app.listen(process.env.PORT, () => {
    console.log(`Server is running at http://localhost:${process.env.PORT}`);
  });
}).catch(error => {
  console.error("Error creating table: " + error.message);
})


