require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authRoutes); // Đổi URL API để tránh trùng với route frontend

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
//update