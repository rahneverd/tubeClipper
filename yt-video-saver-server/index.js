// Importing required modules
const express = require('express');
const cors = require('cors');
const scrapper = require('./scrapper');
const mysql = require('mysql2');
const youtubedl = require('youtube-dl-exec');
const path = require('path');
const fs = require('fs');

// set env
require('dotenv').config();

// Creating an instance of Express
const app = express();

// Using CORS middleware to enable cross-origin resource sharing
app.use(cors());

// create a connection pool to MySQL
const pool = mysql
  .createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
  })
  .promise();

app.get('/', (req, res) => {
  res.send('App is running!');
});

// Setting up a route to handle POST requests at '/save'
app.post('/save', async (req, res) => {
  try {
    const secretKey = JSON.parse(req.query.data).secretKey;
    const videoId = JSON.parse(req.query.data).videoId;
    await checkSecretKey(secretKey);
    // Scrape video info and save to DB
    let videoInfo = await saveVideo(videoId);
    // Sending the scraped video info back as a response
    res.status(200).send(videoInfo);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Setting up a route to handle POST requests at '/saveAndDownload'
app.post('/saveAndDownload', async (req, res) => {
  try {
    const secretKey = JSON.parse(req.query.data).secretKey;
    const videoId = JSON.parse(req.query.data).videoId;
    await checkSecretKey(secretKey);
    // Scrape video info and save to DB
    let videoInfo = await saveVideo(videoId);
    videoInfo = await downloadVideo(videoInfo);
    // Sending the scraped video info back as a response
    res.status(200).send(videoInfo);
  } catch (error) {
    res.status(400).send(error);
  }
});

function checkSecretKey(secretKey) {
  return new Promise((resolve, reject) => {
    if (secretKey === process.env.SECRET_KEY) {
      resolve();
    } else {
      reject('Invalid secret key');
    }
  });
}

async function saveVideo(videoId) {
  return new Promise((resolve, reject) => {
    // Calling the scrapper function to scrape the video URL
    scrapper(videoId)
      .then(async (videoInfo) => {
        videoInfo.keywords = JSON.stringify(videoInfo.keywords);
        videoInfo.timeStamp = new Date().toISOString();
        try {
          // Inserting the scraped data into the 'video_info' table
          await pool.query('INSERT INTO video_info SET ?', videoInfo);
          // Sending the scraped video info back as a response
          resolve(videoInfo);
        } catch (error) {
          // Sending an error response
          reject(err);
        }
      })
      .catch((err) => {
        // Sending an error response if the video URL cannot be scraped
        reject(err);
      });
  });
}

async function downloadVideo(videoInfo) {
  console.log('oas url: ', videoInfo.url);
  return new Promise((resolve, reject) => {
    try {
      /**
       * We'll use the child process returned by youtubedl.exec
       * and pipe the output directly to the output stream
       */
      const child = youtubedl.exec(videoInfo.url, {
        dumpSingleJson: true
      });

      /**
       * We use this buffer to store the information of the video
       */
      const videoInfoBuffer = [];
      child.stdout?.on('data', (chunk) => {
        videoInfoBuffer.push(chunk);
      });

      /**
       * Once exited, notify the user where the file was saved
       * If there's an error, notify the user also
       */
      child.on('exit', (code) => {
        if (code !== 0) {
          reject({ code: 1, message: 'Failed to download video' });
        } else {
          /**
           * Get the default title of the video if not output flag provided
           */
          const videoInfoString =
            Buffer.concat(videoInfoBuffer).toString('utf-8');
          const videoInfoObj = JSON.parse(videoInfoString);
          const videoTitle = videoInfoObj.fulltitle.replace(/[^\w\s]/gi, '');
          // ,
          //   '/downloads'
          const outputFilePath = path.resolve(
            __dirname,
            'downloads',
            `${videoTitle}.mp4`
          );
          const outputStream = fs.createWriteStream(outputFilePath);

          // Write the video to file
          child.stdout?.pipe(outputStream);

          // Notify user once done
          outputStream.on('finish', async () => {
            console.log(`Video downloaded and saved to ${outputFilePath}`);
            outputStream.end();
            // resolve(outputFilePath);
            videoInfo.outputFilePath = outputFilePath;
            try {
              // updating data in the 'video_info' table
              await pool.query('UPDATE video_info SET ? WHERE url = ?', [
                videoInfo,
                videoInfo.url
              ]);
              resolve(videoInfo);
            } catch (error) {
              // Sending an error response
              reject(err);
            }
          });
        }
      });
    } catch (error) {
      reject({ code: 0, message: error });
    }
  });
}

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
  timeStamp TIMESTAMP,
  outputFilePath TEXT
)`;

pool
  .query(createTableQuery)
  .then((resp) => {
    console.log("Table 'video_info' created successfully");
    // Instantiating a server to listen on port 8080
    app.listen(process.env.PORT, () => {
      console.log(`Server is running at http://localhost:${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error creating table: ' + error.message);
  });
