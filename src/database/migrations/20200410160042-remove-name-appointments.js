'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('appointments', 'name');
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'appointments',
      'name',
      Sequelize.DATE
    );
  }
};
