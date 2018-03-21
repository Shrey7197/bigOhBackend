const express = require('express');
const router = express.Router();;
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Importing driver models
const Driver = require('../models/drivers');

// Importing middleware for checking authentication
const checkAuth = require('../middleware/check-auth');

// Only hospitals or higher Officials can register a driver
// POST route /drivers/signup
// @params  driverId: Drivers unique ID
//          password: Drivers password
//          name: Drivers name
//          address: Drivers address
//          phoneNumber: Drivers phone number
router.post('/signup', (request, response, next) => {
    Driver.find({id: request.body.id}) // Checks if driver with same id exits or not
        .exec()
        .then(result => {
            if(result.length >= 1) {
                // Driver Id is already taken sending response 409
                return response.status(409).json({
                    message: 'This id Already exists'
                });
            } else {
                // Id is unique and has not been used by anyone
                // Hashing password
                bcrypt.hash(request.body.password, 10, (error, hash) => {
                    if(error) {
                        // Error occurred in hashing password send error response 500
                        return response.status(500).json({
                            error: error
                        });
                    } else {
                        // Password hashed
                        const driver = new Driver({
                            _id: new mongoose.Types.ObjectId(),
                            driverId: request.body.driverId,
                            password: hash,
                            name: request.body.name,
                            address: request.body.address,
                            phoneNumber: request.body.phoneNumber
                        });
                        driver
                            .save()  // Saved driver details to database
                            .then(result => {
                                // Saved driver details to the database sending response 201
                                response.status(201).json({
                                    message: 'Driver created',
                                    driverId: result.driverId,
                                    name: result.name
                                });
                            })
                            .catch(error => {
                                // Error occurred in saving driver details to database sending error response 500
                                response.status(500).json({
                                    error: error
                                });
                            })
                    }
                })
            }
        })
});

// Ambulance drivers can login using android app
// POST route /drivers/login
// @params  driverId: Drivers unique ID
//          password: Drivers password
router.post('/login', (request, response, next) => {
    Driver.find({ driverId: request.body.aadhaar }) // Checks if driver with same id exits or not
        .exec()
        .then(users => {
            if(users.length < 1) {
                // Driver not found send response 401
                return response.status(401).json({
                    message: 'Auth failed'
                });
            }// Hashed passwords don't match sending response 401
            // Driver found, hashing the password and comparing with the hashed password retrieved from database
            bcrypt.compare(request.body.password, users[0].password, (error, result) => {
                if(error) {
                    // Hashed passwords don't match sending response 401
                    return response.status(401).json({
                        message: 'Auth failed'
                    });
                }
                if(result){
                    // Hashed passwords matched
                    const secret_key = process.env.JWT_KEY;
                    // Creating authentication token
                    const token = jwt.sign(
                        {
                            driverId: users[0].driverId,
                            name: users[0].name
                        },
                        secret_key,
                        {
                            expiresIn: "1h"
                        }
                    );
                    // Sending response 200 along with driver data
                    return response.status(200).json({
                        _id: users[0]._id,
                        driverId: users[0].driverId,
                        token: token,
                        name: users[0].name,
                        address: users[0].address,
                        phoneNumber: users[0].phoneNumber
                    });
                }
            })
        })
        .catch(error => {
            // Error occurred in finding driverId sending error response 500
            response.status(500).json({
                error:error
            });
        });
});

// Only hospitals or higher Officials can delete a driver
// DELETE route /drivers/:driverId
router.delete('/:driverId', (request, response, next) => {
    // Removing driver from database
    Driver.remove({ driverId: request.params.driverId })
        .exec()
        .then(result => {
            // Delete operation successful sending response 200
            response.status(200).json({
                message: 'Driver deleted'
            });
        })
        .catch(error => {
            // Delete operation unsuccessful sending response 500
            response.status(500).json({
                error: error
            });
        });
});

module.exports = router;
