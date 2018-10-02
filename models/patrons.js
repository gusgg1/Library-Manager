'use strict';
module.exports = (sequelize, DataTypes) => {
  const Patrons = sequelize.define('Patrons', {
    // id: DataTypes.INTEGER,
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    address: DataTypes.STRING,
    email: DataTypes.STRING,
    library_id: DataTypes.STRING,
    zip_code: DataTypes.INTEGER,
  }, {
    timestamps: false
  });
  Patrons.associate = function(models) {
    Patrons.hasMany(models.Loans, { foreignKey: 'patron_id' });
  };
  return Patrons;
};