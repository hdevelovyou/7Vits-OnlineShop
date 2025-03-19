'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Event_Promotion extends Model {
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
    event_id: DataTypes.INTEGER,
    promotionType: DataTypes.ENUM('foo','bar'),
    promotionValue: DataTypes.DECIMAL(10,2),
    description: DataTypes.TEXT,
  }, {
    sequelize,
    modelName: 'Event_Promotions',
  });
  return Event_Promotion;
};