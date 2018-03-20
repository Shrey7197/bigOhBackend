const express = require('express');
const router = express.Router();;
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const randomstring = require('randomstring');
const firebase = require('firebase');
const geolib = require('geolib');
const req = require("request")

const config = require('../FirebaseConfig/config');

// Initialize Firebase
firebase.initializeApp(config);

// Called from android accident button
// POST route /accidents
// @param   v_latitude:
//          v_longitude:
//          aadhaar:
//          pincode:
//          no_of_people:
router.post('/', (request, response, next) => {
    const caseId = randomstring.generate();

    const driver_details = firebase.database().ref('active_drivers');
    driver_details.orderByChild("pin").equalTo(request.body.pin).once('value', (snapshot_details => {
        var arr_driver = [];
        snapshot_details.forEach(function(driver) {
            arr_driver.push({
                driver_id: driver.val().driver_id,
                latitude: driver.val().location.latitude,
                longitude: driver.val().location.longitude,
                name: driver.val().name,
                phone_number: driver.val().phone_number
            });
        });

        var my_location = {
            latitude: request.body.v_latitude,
            longitude: request.body.v_longitude
        }
        var driver_assigned = arr_driver[geolib.findNearest(my_location, arr_driver, 0).key];

        var hospital_assigned;
        var url = "http://localhost:3000/hospitals/" + request.body.pin;
        req({
            url: url,
            json: true
        }, function (error, res, body) {
            if (!error && res.statusCode === 200) {
                var arr_hospital = [];
                body.forEach(hospital => {
                    arr_hospital.push({
                        hospital_id: hospital.hospitalId,
                        name: hospital.name,
                        latitude: hospital.h_latitude,
                        longitude: hospital.h_longitude
                    });
                });
                hospital_assigned = arr_hospital[geolib.findNearest(my_location,arr_hospital,0).key];
                console.log(hospital_assigned);
                console.log(driver_assigned);
                var reply;
                reply = {
                    caseId: caseId,
                    driver_name: driver_assigned.name,
                    driver_phone_no: driver_assigned.phone_number,
                    hospital_name: hospital_assigned.name
                }
                response.status(200).json(reply);
            }
        });



        // const delete_driver = firebase.database().ref('active_drivers/' + driver_assigned.driver_id);
        // delete_driver.remove();
    }));
});

module.exports = router;
