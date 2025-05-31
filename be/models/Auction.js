const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Auction = sequelize.define('Auction', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    item_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    start_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    current_bid: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('ongoing', 'finished'),
      defaultValue: 'ongoing',
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'auctions',
    timestamps: false, // ta tự quản lý created_at / updated_at
    underscored: true,
  });

  return Auction;
};