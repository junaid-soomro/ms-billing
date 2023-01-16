var express = require('express');
var router = express.Router();
require("dotenv").config();
const bodyParser = require('body-parser')
const cors = require('cors')

const stripe = require('stripe')('sk_test_w1R7w4xGQoGEM9edi7cboKSo00fcFv38JK');

const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(cors())

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY;

router.post('/pay', async (req, res) => {
    const {email} = req.body;
    console.log(email)
    const paymentIntent = await stripe.paymentIntents.create({
        amount: 5000,
        currency: 'usd',
        // Verify your integration in this guide by including this parameter
        metadata: {integration_check: 'accept_a_payment'},
        receipt_email: email,
      });

      res.json({'client_secret': paymentIntent['client_secret']})
})




const cvv = 244;
const zipCode = 75500;
const address = "Karachi";


router.post("/l2verification", (req, res) => {
    const { cvvB, zipCodeB, addressB } = req.body;
    const verify = cvvB === cvv &&  zipCodeB === zipCode && addressB === address;
    if(verify){
            res.status(200).json({ message: 'Credit Card Verified' });
    }
     else {
        res.status(404).json({message : "Invalid Credit Card"})
    }
});


module.exports = router;