'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
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
    user_id: DataTypes.INTEGER,
    category_id: DataTypes.INTEGER,
    productName: DataTypes.STRING,
    productDescription: DataTypes.TEXT,
    productPrice: DataTypes.DECIMAL(10,2),
    status: DataTypes.ENUM('foo','bar')
  }, {
    sequelize,
    modelName: 'Products',
  });
  return Product;
};