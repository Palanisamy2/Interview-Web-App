const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BugfixTest = sequelize.define('BugfixTest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  questionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'question_id'
  },
  input: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  expectedOutput: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'expected_output'
  },
  isHidden: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_hidden'
  }
}, {
  tableName: 'bugfix_tests',
  timestamps: false
});

module.exports = BugfixTest;

