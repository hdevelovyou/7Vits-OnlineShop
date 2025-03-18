'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Transactions', {
        // product_id: DataTypes.INTEGER,
        // buyer_id: DataTypes.INTEGER,
        // seller_id: DataTypes.INTEGER,
        // transactionStatus: DataTypes.ENUM('foo','bar'),
        // transactionDate: DataTypes.DATE,
        // paymentStatus: DataTypes.ENUM('foo','bar')
      transaction_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      product_id: {
        type: Sequelize.INTEGER
      },
      buyer_id: {
        type: Sequelize.INTEGER
      },
      seller_id: {
        type: Sequelize.INTEGER
      },
      transactionStatus: {
        type: Sequelize.ENUM('foo','bar')
      },
      transactionDate: {
        type: Sequelize.DATE
      },
      paymentStatus: {
        type: Sequelize.ENUM('foo','bar')
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Transactions');
  }
};