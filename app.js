require('dotenv').config();

// import required packages
const express = require("express");
const https = require("https");
const bodyparser = require("body-parser");

const app = express();

app.use(express.static("public"));

app.use(bodyparser.urlencoded({ extended: true }));

// On the home route, send signup html template
app.get("/", function (req, res) {
    res.sendFile(__dirname + "/signup.html");
});

// Manage post request on home route and
// Send data to the MailChimp account via API 
app.post("/", function (req, res) {
    const firstName = req.body.fName;
    const email = req.body.email;
    const lastName = req.body.lName;

    const data = {
        members: [{
            email_address: email,
            status: "subscribed",
            merge_fields: {
                FNAME: firstName,
                LNAME: lastName
            }
        }]
    };

    // Converting string data to JSON data
    const jsonData = JSON.stringify(data);

    //API Keysconfigurations
    const dc = process.env.MAILCHIMP_SERVER;
    const listId = process.env.LIST_ID;
    const apiKey = process.env.API_KEY;
    const url = "https://" + dc + ".api.mailchimp.com/3.0/lists/" + listId;
    const options = {
        method: "POST",
        auth: apiKey
    }

    // Response with Success or failure page 
    const request = https.request(url, options, function (response) {
        if (response.statusCode === 200) {
            res.sendFile(__dirname + "/success.html");
        } else {
            res.sendFile(__dirname + "/failure.html");
        }
        response.on("data", function (data) {
            console.log(JSON.parse(data));
        });
    });


    request.write(jsonData);
    request.end();
});

// Failure route, button to redirect to home page
app.post("/failure", function (req, res) {
    res.redirect("/");
})

app.listen(process.env.PORT || 3000, function () {
    console.log("server is running on port 3000.");
});