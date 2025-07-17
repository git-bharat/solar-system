const path = require('path');
const express = require('express');
const OS = require('os');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const app = express();
const cors = require('cors');

// Middleware setup
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/')));
app.use(cors());

// MongoDB Connection
// Use async/await or Promises for Mongoose connection for better error handling
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // Add server selection timeout to fail faster if connection cannot be established
    serverSelectionTimeoutMS: 5000 // 5 seconds
})
.then(() => {
    console.log("MongoDB Connection Successful");
    // Only start the server if MongoDB connection is successful
    app.listen(3000, () => {
        console.log("Server successfully running on port - " + 3000);
    });
})
.catch(err => {
    console.error("MongoDB Connection Error:", err);
    // Exit the process if a critical database connection fails
    process.exit(1); 
});

// Mongoose Schema and Model
var Schema = mongoose.Schema;

var dataSchema = new Schema({
    name: String,
    id: Number,
    description: String,
    image: String,
    velocity: String,
    distance: String
});
var planetModel = mongoose.model('planets', dataSchema);

// API Routes
app.post('/planet', function(req, res) {
    // Check if MongoDB is connected before querying
    if (mongoose.connection.readyState !== 1) {
        console.error("Database not connected when /planet was called.");
        return res.status(503).send("Database not available.");
    }

    planetModel.findOne({
        id: req.body.id
    }, function(err, planetData) {
        if (err) {
            console.error("Error fetching planet data:", err); // Log the actual error
            // Avoid using alert in server-side code, it's for browser
            res.status(500).send("Error in Planet Data retrieval. Please try again.");
        } else if (!planetData) {
            // Handle case where no planet is found for the given ID
            res.status(404).send("Planet not found. Select a number from 1 - 8.");
        } else {
            res.send(planetData);
        }
    });
});

app.get('/', async (req, res) => {
    res.sendFile(path.join(__dirname, '/', 'index.html'));
});

app.get('/os', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send({
        "os": OS.hostname(),
        "env": process.env.NODE_ENV
    });
});

app.get('/live', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send({
        "status": "live"
    });
});

app.get('/ready', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send({
        "status": "ready"
    });
});

// Export the app for testing
module.exports = app;
