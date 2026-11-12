const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Response = sequelize.define('Response', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sessionId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'session_id'
  },
  questionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'question_id'
  },
  selectedOptionIds: {
    type: DataTypes.JSON, // array of ids
    allowNull: true,
    field: 'selected_option_ids'
  },
  textAnswer: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'text_answer'
  },
  codeAnswer: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'code_answer'
  },
  earnedPoints: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    field: 'earned_points'
  },
  isCorrect: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    field: 'is_correct'
  },
  timeSpentSec: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'time_spent_sec'
  },
  answeredAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'answered_at'
  }
}, {
  tableName: 'responses',
  timestamps: false
});

module.exports = Response;

