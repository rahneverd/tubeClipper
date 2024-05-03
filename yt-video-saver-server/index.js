// Importing required modules
const express = require("express");
const cors = require("cors");
const scrapper = require("./scrapper");

require("dotenv").config();
const mysql = require("mysql");
// create this connection to your database
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to database: " + err.stack);
    return;
  }
  console.log("Connected to database as id " + connection.threadId);

  // Create video_info table if it doesn't exist
  const createTableQuery = `CREATE TABLE IF NOT EXISTS video_info (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  url VARCHAR(255),
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
  shortDescription TEXT
)`;
  connection.query(createTableQuery, (error, results, fields) => {
    if (error) {
      console.error("Error creating table: " + error.message);
      return;
    }
    console.log("Table 'video_info' created successfully");
  });
});

// Now you can use this connection to query your database

// Creating an instance of Express
const app = express();
const PORT = 5000;
// Using CORS middleware to enable cross-origin resource sharing
app.use(cors());
// Setting up a route to handle GET requests at '/download'
app.post("/save", async (req, res) => {
  // Calling the scrapper function to scrape the video URL
  scrapper(req.query.videoId)
    .then((videoInfo) => {
      // Inserting the scraped data into the 'video_info' table
      connection.query(
        "INSERT INTO video_info SET ?",
        videoInfo,
        (err, results) => {
          if (err) {
            console.error("Error inserting data:", err);
            res.status(500).send("Error inserting data");
          } else {
            console.log("Data inserted successfully");
            res.status(200).send("Data inserted successfully");
          }
        }
      );
      // Sending the scraped video URL back as a response
      res.status(200).send(videoInfo);
    })
    .catch((err) => {
      // Sending an error response if the video URL cannot be scraped
      res.status(400).send(err);
    });
});
// Instantiating a server to listen on port 8080
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
