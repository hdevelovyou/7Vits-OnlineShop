const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('testdb', 'root', null, {
    host: 'localhost',
    dialect: 'mysql'
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

connectDB(); // Gọi hàm để kết nối DB

module.exports = connectDB;
