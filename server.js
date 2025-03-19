require('dotenv').config({ path: './Code/.env' });
const connectDB = require('./config/connectDB');
const express = require('express');
const authRoutes = require("./routes/auth");
const configViewEngine = require('./config/ViewEngine');
const webRoutes = require('./routes/web');

const app = express();
const port = process.env.PORT || 5000;
const hostname = process.env.HOST_NAME;

//config template engine and static files
configViewEngine(app);

//khai bao route
app.use('/', webRoutes);

connectDB();

app.use(express.json()); // Hỗ trợ đọc JSON request body
app.use("/api/auth", authRoutes); // Thêm route authentication

app.listen(port, () => 
    console.log(`Server đang chạy tại http://localhost:${port}`
));