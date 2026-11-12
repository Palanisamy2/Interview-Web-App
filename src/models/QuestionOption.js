const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QuestionOption = sequelize.define('QuestionOption', {
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
  label: {
    type: DataTypes.STRING(2), // 'A', 'B', 'C', 'D'
    allowNull: false
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  isCorrect: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_correct'
  }
}, {
  tableName: 'question_options',
  timestamps: false
});

module.exports = QuestionOption;

