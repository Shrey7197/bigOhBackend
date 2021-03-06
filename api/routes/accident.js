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
const Hospital_Reached = require('../models/reached_hospital');

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

    const driver_details = firebase.database().ref('available_drivers');
    driver_details.orderByChild("pin").equalTo(request.body.pin).once('value', (snapshot_details => {
        var arr_driver = [];
        snapshot_details.forEach((driver) => {
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
        }, (error, res, body) => {
            if (!error && res.statusCode === 200) {
                var arr_hospital = [];
                body.forEach(hospital => {
                    arr_hospital.push({
                        hospital_id: hospital.hospitalId,
                        name: hospital.name,
                        latitude: hospital.h_latitude,
                        longitude: hospital.h_longitude,
                        address: hospital.address
                    });
                });
                hospital_assigned = arr_hospital[geolib.findNearest(my_location,arr_hospital,0).key];
                const active_case_details = firebase.database().ref('active_cases');
                var active_case_Ref = active_case_details;
                active_case_Ref.child(caseId).set({
                    case_ID: caseId,
                    V_Latitude: my_location.latitude,
                    V_Longitude: my_location.longitude,
                    hospital_ID: hospital_assigned.hospital_id,
                    H_Latitude: hospital_assigned.latitude,
                    H_Longitude: hospital_assigned.longitude,
                    pincode: request.body.pin,
                    driver_ID: driver_assigned.driver_id,
                    D_Latitude: driver_assigned.latitude,
                    D_Longitude: driver_assigned.longitude,
                    aadhaar: request.body.aadhaar,
                    type: "Accident",
                    flag: 0
                });
                var reply;
                reply = {
                    caseId: caseId,
                    driver_name: driver_assigned.name,
                    driver_phone_no: driver_assigned.phone_number,
                    hospital_name: hospital_assigned.name,
                    hospital_address: hospital_assigned.address
                }
                response.status(200).json(reply);
            }
        });

        const delete_driver = firebase.database().ref('available_drivers/' + driver_assigned.driver_id);
        delete_driver.remove();
    }));
});

router.post('/reached_victim', (request, response, next) => {
    const update_details = firebase.database().ref('active_cases');
    var caseId = request.body.caseId;
    var update_d = update_details;
    update_d.child(caseId).update({
        "flag" : 1
    });
    response.status(200).json({
        message: "Driver reaced victim location"
    });
});

router.post('/reached_hospital', (request, response, next) => {
    const details = [];
    const case_details = firebase.database().ref('active_cases');
    case_details.orderByChild("case_ID").equalTo(request.body.case_ID).once('value', (snapshot_details) => {
        snapshot_details.forEach((cas) => {
                details.push({
                    aadhaar: cas.val().aadhaar,
                    caseId: cas.val().case_ID,
                    driverId: cas.val().driver_ID,
                    hospitalId: cas.val().hospital_ID,
                    pincode: cas.val().pincode,
                    type: cas.val().type
                });
                console.log(details[0].pincode);

                const hospitalReached = new Hospital_Reached({
                    aadhaar: details[0].aadhaar,
                    caseId: details[0].caseId,
                    driverId: details[0].driverId,
                    hospitalId: details[0].hospitalId,
                    pin: details[0].pincode,
                    type: details[0].type
                });

                console.log(hospitalReached);

                hospitalReached
                    .save()
                    .then(result => {
                        console.log(hospitalReached.caseId);
                        const delete_detail = firebase.database().ref('active_cases/' + details[0].caseId);
                        delete_detail.remove();
                        response.status(200).json({
                            message: 'Hospital Reached'
                        });
                    })
                    .catch(error => {
                        response.status(500).json({
                            error: error
                        });
                    })
            });
        });
});

router.delete('/:caseId', (request, response, next) => {
    // Removing case from database
    Hospital_Reached.remove({ caseId: request.params.caseId })
        .exec()
        .then(result => {
            // Delete operation successful sending response 200
            response.status(200).json({
                message: 'Case deleted'
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
