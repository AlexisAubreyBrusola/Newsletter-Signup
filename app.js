const bodyParser = require("body-parser");
const express = require("express");
const client = require("@mailchimp/mailchimp_marketing");

const PORT = process.env.PORT;
const mailChimpApiKey = "90f7dd6a18780a3b57be9481f017073c-us12";
const serverPrefix = "us12"; // e.g., 'us12'
const mailChimpAudienceId = "a405a7ee54";

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("assets"));

// Mailchimp config
client.setConfig({
    apiKey: mailChimpApiKey,
    server: serverPrefix,
});

// Routes
app.listen(PORT || 3000, () => {
    console.log("The app is running on port 3000");
});

app.get("/", (req, res) => {
    res.sendFile(`${__dirname}/signup.html`);
});

app.post("/", (req, res) => {
    const firstName = req.body.firstname;
    const lastName = req.body.lastname;
    const email = req.body.email;

    console.log(`
        Name: ${firstName}
        Last Name: ${lastName}
        Email: ${email}
    `);

    const audienceData = {
        email_address: email,
        status: "subscribed",
        merge_fields: {
        FNAME: firstName,
        LNAME: lastName,
        },
    };

    // Asynchronous function to add a member to the Mailchimp audience
    async function run() {
        const response = await client.lists.addListMember(mailChimpAudienceId, audienceData);

        if (response.errors) {
            throw new Error(response.errors);
        };
        return response;
    }

    // Call the asynchronous function and handle the response
    run()
    .then((response) => {
        console.log(response.status);
        res.sendFile(`${__dirname}/success.html`);
    })
    .catch(errors => {
        console.log(`Catch ${errors}`);
        res.sendFile(`${__dirname}/failure.html`);
    })
});

app.post('/failure', (req, res) => {
    res.redirect('/');
});
