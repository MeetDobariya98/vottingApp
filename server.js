const express = require('express');
const app = express();
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const db = require('./db');

// Load environment variables
dotenv.config();

// Middleware
app.use(bodyParser.json());

// Import routes
const userRoutes = require('./routs/userRouts');

// Use routes
app.use('/user', userRoutes);

// Define port
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server is live on port ${PORT}`);
});
