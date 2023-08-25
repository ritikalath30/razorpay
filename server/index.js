require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json({ extended: false }));

//payment routes
app.use("/payment", require('./payment'));
app.listen(5000, () => {
    console.log('server running at 5000')
}) 