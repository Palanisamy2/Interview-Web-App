const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Question = sequelize.define('Question', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.STRING(20), // 'MCQ_SINGLE', 'MCQ_MULTI', 'OUTPUT', 'BUGFIX'
    allowNull: false
  },
  sectorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'sector_id'
  },
  stackId: {
    type: DataTypes.INTEGER,
    allowNull: true, // NULL if shared pool
    field: 'stack_id'
  },
  language: {
    type: DataTypes.STRING(30),
    allowNull: true
  },
  difficulty: {
    type: DataTypes.STRING(10), // 'EASY', 'MEDIUM', 'HARD'
    allowNull: false
  },
  points: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  title: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  explanation: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tags: {
    type: DataTypes.JSON, // JSON array for tags
    allowNull: true,
    defaultValue: []
  },
  expectedOutput: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'expected_output'
  },
  status: {
    type: DataTypes.STRING(20), // 'DRAFT', 'IN_REVIEW', 'APPROVED', 'RETIRED'
    defaultValue: 'APPROVED'
  },
  timesServed: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'times_served'
  },
  timesCorrect: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'times_correct'
  }
}, {
  tableName: 'questions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Question;

