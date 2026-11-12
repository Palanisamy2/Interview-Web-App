const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BlueprintRule = sequelize.define('BlueprintRule', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  blueprintId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'blueprint_id'
  },
  sectorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'sector_id'
  },
  stackId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'stack_id'
  },
  language: {
    type: DataTypes.STRING(30),
    allowNull: true
  },
  easyCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'easy_count'
  },
  mediumCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'medium_count'
  },
  hardCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'hard_count'
  }
}, {
  tableName: 'blueprint_rules',
  timestamps: false
});

module.exports = BlueprintRule;

