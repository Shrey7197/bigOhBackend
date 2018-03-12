const express = require('express');
var cors = require('cors')
const moment = require('moment');
const bodyParser = require('body-parser');
// Call functions here
// Initialise the DB Connnections here.
// dbWrapper.dbInit()

var app = express();
app.use(cors({ origin: true }))
const port = process.env.PORT || 4000;
app.use(bodyParser.json());

app.use("/", (request, response, next)=>{
	response.sendJson = (data, code) =>{
		response.send({
			data,
			code
		})
	}
	next();
})

app.get("/", (request, response) => {
	response.sendJson("Oye!! Yeh toh chal gaya", 200);
})
