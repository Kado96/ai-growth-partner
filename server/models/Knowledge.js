const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Knowledge = sequelize.define('Knowledge', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    defaultValue: 'général'
  }
}, {
  tableName: 'KnowledgeBase',
  timestamps: true
});

module.exports = Knowledge;
