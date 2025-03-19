'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Event_Usage extends Model {
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
    user_id: DataTypes.INTEGER,
    promotion_id: DataTypes.INTEGER,
    usageDate: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'Event_Usage',
  });
  return Event_Usage;
};