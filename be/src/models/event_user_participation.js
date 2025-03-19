'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Event_User_Participation extends Model {
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
    event_id: DataTypes.INTEGER,
    participationDate: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'Event_User_Participation',
  });
  return Event_User_Participation;
};