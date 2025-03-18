'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Wallet_Transfer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Event.init({
    sender_wallet_id: DataTypes.INTEGER,
    receiver_wallet_id: DataTypes.INTEGER,
    amount: DataTypes.DECIMAL,
    transfer_status: DataTypes.ENUM('foo','bar')
  }, {
    sequelize,
    modelName: 'Wallet_Transfer',
  });
  return Wallet_Transfer;
};