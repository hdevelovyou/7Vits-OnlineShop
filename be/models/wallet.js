const db = require('../config/connectDB');

// Create wallet table if not exists
const createWalletTable = async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS wallets (
                id INT NOT NULL AUTO_INCREMENT,
                user_id INT NOT NULL,
                balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                UNIQUE KEY (user_id),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('Wallet table checked/created successfully');
    } catch (error) {
        console.error('Error creating wallet table:', error);
    }
};

// Create transactions table if not exists
const createTransactionTable = async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS transactions (
                id INT NOT NULL AUTO_INCREMENT,
                user_id INT NOT NULL,
                amount DECIMAL(15, 2) NOT NULL,
                type ENUM('deposit', 'withdraw', 'purchase', 'refund', 'sell') NOT NULL,
                status ENUM('pending', 'completed', 'failed', 'cancelled') NOT NULL DEFAULT 'pending',
                reference_id VARCHAR(255),
                payment_method VARCHAR(50),
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('Transactions table checked/created successfully');
    } catch (error) {
        console.error('Error creating transactions table:', error);
    }
};

// Initialize tables
createWalletTable();
createTransactionTable();

// Get user wallet
const getUserWallet = async (userId) => {
    try {
        const [wallet] = await db.query('SELECT * FROM wallets WHERE user_id = ?', [userId]);
        
        if (wallet.length === 0) {
            // Create wallet if not exists
            await db.query('INSERT INTO wallets (user_id, balance) VALUES (?, 0)', [userId]);
            return { id: null, user_id: userId, balance: 0 };
        }
        
        return wallet[0];
    } catch (error) {
        console.error('Error getting user wallet:', error);
        throw error;
    }
};

// Update wallet balance
const updateWalletBalance = async (userId, amount) => {
    try {
        await getUserWallet(userId); // Ensure wallet exists
        
        await db.query(
            'UPDATE wallets SET balance = balance + ? WHERE user_id = ?',
            [amount, userId]
        );
        
        const [updatedWallet] = await db.query('SELECT * FROM wallets WHERE user_id = ?', [userId]);
        return updatedWallet[0];
    } catch (error) {
        console.error('Error updating wallet balance:', error);
        throw error;
    }
};

// Create a new transaction
const createTransaction = async (transactionData) => {
    try {
        const { user_id, amount, type, status, reference_id, payment_method, description } = transactionData;
        
        const [result] = await db.query(
            'INSERT INTO transactions (user_id, amount, type, status, reference_id, payment_method, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [user_id, amount, type, status || 'pending', reference_id, payment_method, description]
        );
        
        const [transaction] = await db.query('SELECT * FROM transactions WHERE id = ?', [result.insertId]);
        return transaction[0];
    } catch (error) {
        console.error('Error creating transaction:', error);
        throw error;
    }
};

// Update transaction status
const updateTransactionStatus = async (transactionId, status) => {
    try {
        await db.query('UPDATE transactions SET status = ? WHERE id = ?', [status, transactionId]);
        
        const [transaction] = await db.query('SELECT * FROM transactions WHERE id = ?', [transactionId]);
        return transaction[0];
    } catch (error) {
        console.error('Error updating transaction status:', error);
        throw error;
    }
};

// Get user transactions
const getUserTransactions = async (userId) => {
    try {
        const [transactions] = await db.query(
            'SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        return transactions;
    } catch (error) {
        console.error('Error getting user transactions:', error);
        throw error;
    }
};

module.exports = {
    getUserWallet,
    updateWalletBalance,
    createTransaction,
    updateTransactionStatus,
    getUserTransactions
}; 