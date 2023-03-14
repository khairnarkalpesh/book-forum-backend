const express = require('express');
const axios = require('axios');
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

const app = express();
const port = 3000;

app.use(express.json());

exports.checkEmail = ('/check-email', async (req, res) => {
    const { email } = req.body;
    const apiKey = process.env.API_LAYER_KEY;

    console.log(apiKey)

    try {
        const response = await axios.get(`http://apilayer.net/api/check?access_key=HC2c75MmOXggOEySRs2dJisjQXQArUJL&email=${email}&format=1`);
        const { format_valid, smtp_check } = response.data;

    console.log(response.data)

        if (format_valid && smtp_check) {
            res.send({ message: 'Email exists', exists: true });
        } else {
            res.send({ message: 'Email does not exist', exists: false });
        }
    } catch (error) {
        console.log(error);
        res.send({ message: 'Something went wrong', exists: false });
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
