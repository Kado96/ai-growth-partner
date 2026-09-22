const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Visitor = sequelize.define('Visitor', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  ip: {
    type: DataTypes.STRING,
    allowNull: true
  },
  userAgent: {
    type: DataTypes.STRING,
    allowNull: true
  },
  path: {
    type: DataTypes.STRING,
    defaultValue: '/'
  }
}, {
  tableName: 'Visitors',
  timestamps: true
});

module.exports = Visitor;
