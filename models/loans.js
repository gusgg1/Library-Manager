'use strict';
module.exports = (sequelize, DataTypes) => {
  const Loans = sequelize.define('Loans', {
    // id: DataTypes.INTEGER,
    book_id: DataTypes.INTEGER,
    patron_id: DataTypes.INTEGER,
    loaned_on: DataTypes.DATE,
    return_by: DataTypes.DATE,
    returned_on: DataTypes.DATE
  }, {
    timestamps: false
  });
  Loans.associate = function(models) {
    Loans.belongsTo(models.Books, { foreignKey: 'book_id' });
    Loans.belongsTo(models.Patrons, { foreignKey: 'patron_id' });
  };
  return Loans;
};