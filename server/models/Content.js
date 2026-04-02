const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Media = require('./Media');

const Content = sequelize.define('Content', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  section: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: 'section_name_unique' // ensures each section has unique keys (e.g., hero.title)
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON, // text underneath for sqlite handled automatically by sequelize json type, or fallback
    allowNull: true
  },
  mediaId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: Media,
      key: 'id'
    }
  }
}, {
  tableName: 'Content',
  timestamps: true
});

Content.belongsTo(Media, { foreignKey: 'mediaId', as: 'media' });

module.exports = Content;
