const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BugfixSpec = sequelize.define('BugfixSpec', {
  questionId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    field: 'question_id'
  },
  language: {
    type: DataTypes.STRING(30),
    defaultValue: 'javascript'
  },
  starterCode: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'starter_code'
  },
  timeLimitMs: {
    type: DataTypes.INTEGER,
    defaultValue: 2000,
    field: 'time_limit_ms'
  },
  memoryLimitKb: {
    type: DataTypes.INTEGER,
    defaultValue: 128000,
    field: 'memory_limit_kb'
  }
}, {
  tableName: 'bugfix_specs',
  timestamps: false
});

module.exports = BugfixSpec;

