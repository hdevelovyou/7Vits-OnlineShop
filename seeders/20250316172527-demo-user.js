'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Users', [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'example@example.com',
        password: 'johndoe',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        firstName: 'Blank',
        lastName: 'Bire',
        email: 'BlankBire@gmail.com',
        password: 'blankbire',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  }, 

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {});
  }
};
