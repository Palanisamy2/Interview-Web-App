const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Stack = sequelize.define('Stack', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  roleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'role_id'
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false // 'react', 'nodejs'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'stacks',
  timestamps: false
});

module.exports = Stack;

