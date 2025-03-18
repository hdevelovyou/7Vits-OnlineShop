'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init({
    product_id: DataTypes.INTEGER,
    buyer_id: DataTypes.INTEGER,
    seller_id: DataTypes.INTEGER,
    transactionStatus: DataTypes.ENUM('foo','bar'),
    transactionDate: DataTypes.DATE,
    paymentStatus: DataTypes.ENUM('foo','bar')
  }, {
    sequelize,
    modelName: 'Transactions',
  });
  return Transaction;
};