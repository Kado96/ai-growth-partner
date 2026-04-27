const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Blog = sequelize.define('Blog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  serviceId: {
    type: DataTypes.STRING,
    allowNull: true // peut être nul pour des articles généraux
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT, // format Markdown
    allowNull: false
  },
  readingTime: {
    type: DataTypes.INTEGER,
    defaultValue: 5
  },
  tags: {
    type: DataTypes.JSON, // tableau de strings ["IA", "Marketing", ...]
    allowNull: true
  },
  author: {
    type: DataTypes.STRING,
    defaultValue: 'Kora Agency Expert'
  }
}, {
  tableName: 'Blogs',
  timestamps: true
});

module.exports = Blog;
