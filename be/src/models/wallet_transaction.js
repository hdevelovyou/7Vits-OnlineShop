'use strict';
const {
  Model
} = require('sequelize');
const transaction = require('./transaction');
module.exports = (sequelize, DataTypes) => {
  class Wallet_Transaction extends Model {
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
    wallet_id: DataTypes.INTEGER,
    amount: DataTypes.DECIMAL,
    transactionType: DataTypes.ENUM('foo','bar'),
    transactionStatus: DataTypes.ENUM('foo','bar'),
    paymentMethod:DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Wallet_Transaction',
  });
  return Wallet_Transaction;
};