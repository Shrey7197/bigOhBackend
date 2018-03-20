const express = require('express');
const router = express.Router();;
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Importing User and UpdatedUser models
const Hospital = require('../models/hospitals');

// Get a list of hospitals in that pincode area
// Called from Android app
// GET route /hospitals/:pincode
router.get('/:pin', (request, response, next) => {
    Hospital.find( { pin: request.params.pin })
        .select('hospitalId name phoneNumber address pin h_latitude h_longitude')
        .exec()
        .then(result => {
            response.status(200).json(
                result.map(result => {
                    return {
                        hospitalId: result.hospitalId,
                        name: result.name,
                        phoneNumber: result.phoneNumber,
                        address: result.address,
                        pin: result.pin,
                        h_latitude: result.h_latitude,
                        h_longitude: result.h_longitude
                    }
                })
            );
        })
        .catch(error => {
            response.status(500).json({
                error: error
            });
        });
});

// Hospitals can register only through portal
// POST route /hospitals/signup
// @params  hospitalId: hospitals unique id
//          password: hospitals password
//          name: name of hospital
//          phoneNumber: phone number of hospital
//          address: hospitals address
//          pin: pincode of hospital
router.post('/signup', (request, response, next) => {
    Hospital.find({hospitalId: request.body.hospitalId}) // Checks hospitalId is unique or not
        .exec()
        .then(result => {
            if(result.length >= 1) {
                return response.status(409).json({
                    // hospitalId is already taken sending response 409
                    message: 'Hospital already exists'
                });
            } else {
                // Hospital has not been registered before
                // Hashing password
                bcrypt.hash(request.body.password, 10, (error, hash) => {
                    if(error) {
                        // Error occurred in hashing password send error response 500
                        return response.status(500).json({
                            error: error
                        });
                    } else {
                        // Password hashed
                        // creating hospital object and saving it
                        const hospital = new Hospital({
                            _id: new mongoose.Types.ObjectId(),
                            hospitalId: request.body.hospitalId,
                            password: hash,
                            name: request.body.name,
                            phoneNumber: request.body.phoneNumber,
                            address: request.body.address,
                            pin: request.body.pin,
                            h_latitude: request.body.h_latitude,
                            h_longitude: request.body.h_longitude
                        });
                        hospital
                            .save() // Saved hospital details to database
                            .then(result => {
                                // Saved hospital details to the database sending response 201
                                response.status(201).json({
                                    message: 'Hospital added to database',
                                    hospitalId: result.hospitalId,
                                    name: result.name,
                                    phoneNumber: result.phoneNumber,
                                    address: result.address,
                                    pin: result.pin,
                                    h_latitude: result.h_latitude,
                                    h_longitude: result.h_longitude
                                });
                            })
                            .catch(error => {
                                // Error occurred in saving hospital details to database sending error response 500
                                response.status(500).json({
                                    error: error
                                });
                            })
                    }
                })
            }
        })
});

// DELETE/: hospitals/:hospital_id
router.delete('/:hospitalId', (request, response, next) => {
    Hospital.remove({ hospitalId: request.params.hospitalId })
        .exec()
        .then(result => {
            var message = "Hospital deleted";
            response.status(200).json({
                message: message
            });
        })
        .catch(error => {
            response.status(500).json({
                error: error,
                message: 'hospital not deleted'
            });
        });
});

module.exports = router;