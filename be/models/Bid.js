// models/Bid.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Bid = sequelize.define('Bid', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    auction_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    bidder_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  }, {
    tableName: 'bids',
    timestamps: false,
    underscored: true,
  });

  return Bid;
};
