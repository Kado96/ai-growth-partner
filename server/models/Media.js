const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Media = sequelize.define('Media', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  path: {
    type: DataTypes.STRING,
    allowNull: false
  },
  mimeType: {
    type: DataTypes.STRING,
    allowNull: true
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  environment: {
    type: DataTypes.STRING, // 'local' or 'production'
    allowNull: false,
    defaultValue: 'local'
  }
}, {
  tableName: 'Media',
  timestamps: true
});

module.exports = Media;
