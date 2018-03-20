const express = require('express');
const router = express.Router();;
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Importing User and UpdatedUser models
const User = require('../models/users');
const UpdatedUser = require('../models/updated_users');

// Any user can signup by providing aadhaar number
// POST route /users/signup
// @params  aadhaar: users aadhaar number
//          password: users password
router.post('/signup', (request, response, next) => {
    User.find({aadhaar: request.body.aadhaar}) // Checks if user with same aadhaar number exits or not
        .exec()
        .then(result => {
            if(result.length >= 1) {
                return response.status(409).json({
                    // Aadhaar number is already taken sending response 409
                    message: 'Aadhaar number already exists'
                });
            } else {
                // Aadhaar number has not been registered before
                // Hashing password
                bcrypt.hash(request.body.password, 10, (error, hash) => {
                    if(error) {
                        // Error occurred in hashing password send error response 500
                        return response.status(500).json({
                            error: error
                        });
                    } else {
                        // Password hashed
                        // creating dummy user and saving it
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            aadhaar: request.body.aadhaar,
                            password: hash,
                            name: "Ramit Kovvalpurail",
                            gender: "Male",
                            age: 21,
                            phoneNumber: "9004126916",
                            address: "B-203 Agnes House,\nSavarkar Nagar\nThane-West",
                            pin: 400606,
                            bloodGroup: "O+ve",
                            insuranceId: null
                        });
                        user
                            .save() // Saved user details to database
                            .then(result => {
                                // Saved user details to the database sending response 201
                                response.status(201).json({
                                    message: 'User created',
                                    aadhaar: result.aadhaar,
                                    name: result.name,
                                    gender: result.gender,
                                    age: result.age,
                                    phoneNumber: result.phoneNumber,
                                    address: result.address,
                                    pin: result.pin,
                                    bloodGroup: result.bloodGroup,
                                    insuranceId: result.insuranceId
                                });
                            })
                            .catch(error => {
                                // Error occurred in saving user details to database sending error response 500
                                response.status(500).json({
                                    error: error
                                });
                            })
                    }
                })
            }
        })
});

// Users can login using android app
// POST route /users/login
// @params  aadhaar: users aadhaar number
//          password: users password
router.post('/login', (request, response, next) => {
    User.find({ aadhaar: request.body.aadhaar }) // Checks if user with same aadhaar number exists or not
        .exec()
        .then(users => {
            if(users.length < 1) {
                return response.status(401).json({
                    // No such user found send response 401
                    message: 'Auth failed'
                });
            }
            // User found, hashing the password and comparing with the hashed password retrieved from database
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
                            userId: users[0]._id,
                            aadhaar: users[0].aadhaar
                        },
                        secret_key,
                        {
                            expiresIn: "1h"
                        }
                    );
                    // Sending response 200 along with user data
                    return response.status(200).json({
                        id: users[0]._id,
                        aadhaar: users[0].aadhaar,
                        token: token,
                        name: users[0].name,
                        gender: users[0].gender,
                        age: users[0].age,
                        phoneNumber: users[0].phoneNumber,
                        address: users[0].address,
                        pin: users[0].pin,
                        bloodGroup: users[0].bloodGroup,
                        insuranceId: users[0].insuranceIdnpm
                    });
                }
            })
        })
        .catch(error => {
            // Error occurred in finding aadhaar number sending error response 500
            response.status(500).json({
                error:error
            });
        });
});

// Updates user data and stores in Updated User model
// POST route /users/login
// @params  aadhaar: users aadhaar number
//          name: users updated name
//          gender: users updated gender
//          age: users updated age
//          phoneNumber: users updated phone number
//          address: users updated address
//          pin: users updated pin
//          bloodGroup: users updated blood group
//          insuranceId: users updated insurance id
router.post('/save', (request, response, next) => {
    UpdatedUser.find({aadhaar: request.body.aadhaar}) // Checks if user with same aadhaar number exists or not
        .exec()
        .then(result => {
            if(result.length >= 1) {
                // If User details already present then overwrites it
                UpdatedUser.remove({ aadhaar: request.body.aadhaar })
                    .exec()
                    .then()
                    .catch(error => {
                        return response.status(500).json({
                            error: error
                        });
                    });
            }
            const user = new UpdatedUser({
                _id: new mongoose.Types.ObjectId(),
                aadhaar: request.body.aadhaar,
                name: request.body.name,
                gender: request.body.gender,
                age: request.body.age,
                phoneNumber: request.body.phoneNumber,
                address: request.body.address,
                pin: request.body.pin,
                bloodGroup: request.body.bloodGroup,
                insuranceId: request.body.insuranceId
            });
            user
                .save() // Saved user details to database
                .then(result => {
                    // Saved user details to the database sending response 201
                    response.status(201).json({
                        message: 'User updated',
                        aadhaar: result.aadhaar,
                        name: result.name,
                        gender: result.gender,
                        age: result.age,
                        phoneNumber: result.phoneNumber,
                        address: result.address,
                        pin: result.pin,
                        bloodGroup: result.bloodGroup,
                        insuranceId: result.insuranceId
                    });
                })
                .catch(error => {
                    // Error occurred in saving user details to database sending error response 500
                    response.status(500).json({
                        error: error
                    });
                })
        })
});

// Used for test purpose, deletes from both User and UpdatedUser model
// DELETE route /users/:aadhaar
router.delete('/:userAadhaar', (request, response, next) => {
    User.remove({ aadhaar: request.params.userAadhaar })
        .exec()
        .then(result => {
            var message = "user deleted from users ";
            UpdatedUser.remove({ aadhaar: request.params.userAadhaar })
                .exec()
                .then(result => {
                    message += "and updatedUsers database";
                    response.status(200).json({
                        message: message
                    });
                })
                .catch(error => {
                    message += "database";
                    response.status(500).json({
                        error: error,
                        message: message
                    });
                });
        })
        .catch(error => {
            response.status(500).json({
                error: error,
                message: 'user not deleted'
            });
        });
});

// Used for test purpose, gets details of users from database
// GET route /users/users
router.get('/users', (request, response, next) => {
    User.find()
        .select('aadhaar name gender age phoneNumber address pin bloodGroup insuranceId')
        .exec()
        .then(result => {
            response.status(200).json({
                count: result.length,
                users: result.map(result => {
                    return{
                        aadhaar: result.aadhaar,
                        name: result.name,
                        gender: result.gender,
                        age: result.age,
                        phoneNumber: result.phoneNumber,
                        address: result.address,
                        pin: result.pin,
                        bloodGroup: result.bloodGroup,
                        insuranceId: result.insuranceId
                    }
                })
            });
        })
        .catch(error => {
            response.status(500).json({
                error: error
            });
        });
});

// Used for test purpose, gets details of users from updated users database
// GET route /users/users
router.get('/updatedusers', (request, response, next) => {
    UpdatedUser.find()
        .select('aadhaar name gender age phoneNumber address pin bloodGroup insuranceId')
        .exec()
        .then(result => {
            response.status(200).json({
                count: result.length,
                users: result.map(result => {
                    return{
                        aadhaar: result.aadhaar,
                        name: result.name,
                        gender: result.gender,
                        age: result.age,
                        phoneNumber: result.phoneNumber,
                        address: result.address,
                        pin: result.pin,
                        bloodGroup: result.bloodGroup,
                        insuranceId: result.insuranceId
                    }
                })
            });
        })
        .catch(error => {
            response.status(500).json({
                error: error
            });
        });
});

module.exports = router;