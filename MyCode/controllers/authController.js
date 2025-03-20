const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/connectDB');

exports.register = async (req, res) => {
    const { firstName, lastName, userName, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = `INSERT INTO users (firstName, lastName, userName, email, password) VALUES (?, ?, ?, ?, ?)`;

    db.query(sql, [firstName, lastName, userName, email, hashedPassword], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'User registered successfully' });
    });
};

exports.login = (req, res) => {
    const { email, password } = req.body;
    const sql = `SELECT * FROM users WHERE email = ?`;

    db.query(sql, [email], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(400).json({ error: 'User not found' });

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Wrong password' });

        const token = jwt.sign({ id: user.id }, 'secretkey', { expiresIn: '1h' });
        res.json({ message: 'Login successful', token });
    });
};