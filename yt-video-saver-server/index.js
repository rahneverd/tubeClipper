// Importing required modules
const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors');

// Creating an instance of Express
const app = express();
const PORT = 3000;

// Using CORS middleware to enable cross-origin resource sharing
app.use(cors());

// Setting up a route to handle GET requests at '/download'
app.post('/save', (req, res) => {
  // Implementation will go here
  console.log(req.query)
  res.status(200).send(req.query)
});

// Instantiating a server to listen on port 8080
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});