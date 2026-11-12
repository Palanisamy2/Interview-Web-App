const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TestBlueprint = sequelize.define('TestBlueprint', {
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
  stackId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'stack_id'
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  durationMinutes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'duration_minutes'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'test_blueprints',
  timestamps: false
});

module.exports = TestBlueprint;

