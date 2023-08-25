require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const router = express.Router();
const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET,
});

//router for initiating payment
router.post('/order', async (req, res) => {
    try {
        const options = {
            amount: 50000, //amount should be in smallest currency unit
            currency: 'INR',
            
        };
        const order = await instance.orders.create(options);
        if (!order) return res.status(500).send("Some error Occured")
        return res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ error })
    }
});

//route for verify and capture payment
router.post('/verify', async (req, res) => {
    try {
        const {
            orderCreationId,
            razorpayPaymentId,
            razorpayOrderId,
            razorpaySignature,
            amount,
            currency
        } = req.body;
        const signature = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET);
        signature.update(`${orderCreationId}|${razorpayPaymentId}`);
        const digest = signature.digest("hex");

        if (digest !== razorpaySignature) return res.status(400).json({ msg: 'Transactions not legit' });
        const captureResponse = await instance.payment.capture(
            razorpayPaymentId,
            amount,
            currency
        );
        return res.status(200).json({
            status: 'success',
            orderId: razorpayOrderId,
            paymentId: razorpayPaymentId,
            captureResponse
        });
    } catch (error) {
        return res.status(500).send(error);
    }
})
module.exports = router;