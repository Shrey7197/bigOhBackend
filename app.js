const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const userRoutes = require('./api/routes/users');
const driverRoutes = require('./api/routes/drivers');
const hospitalRoutes = require('./api/routes/hospitals');
const accidentRoutes = require('./api/routes/accident');

// Setting up database connection
mongoose.connect('mongodb://smartindiauser-dummy-server:'
    + process.env.DB_PASSWORD
    + '@smartindiauser-dummy-server-shard-00-00-oxdc9.mongodb.net:27017,smartindiauser-dummy-server-shard-00-01-oxdc9.mongodb.net:27017,smartindiauser-dummy-server-shard-00-02-oxdc9.mongodb.net:27017/test?ssl=true&replicaSet=smartindiauser-dummy-server-shard-0&authSource=admin'
);

// Middleware for logging data on console
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Middleware for restricting request
app.use((request, response, next) => {
    response.header('Access-Control-Allow-Origin', '*');
    response.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    if(request.method === 'OPTIONS') {
        response.header(
            'Access-Control-Allow-Methods',
            'PUT, POST, PATCH, DELETE, GET'
        );
        return response.status(200).json({});
    }
    next();
});

// Setting up routes
app.use('/users', userRoutes);
app.use('/drivers', driverRoutes);
app.use('/hospitals', hospitalRoutes);
app.use('/accidents', accidentRoutes);

// If no predefined route found
app.use((request, response, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

app.use((error, request, response, next) => {
    response.status(error.status || 500);
    response.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;