const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SessionQuestion = sequelize.define('SessionQuestion', {
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
  position: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  optionOrder: {
    type: DataTypes.JSON, // shuffled option ids [3, 1, 4, 2]
    allowNull: true,
    field: 'option_order'
  }
}, {
  tableName: 'session_questions',
  timestamps: false
});

module.exports = SessionQuestion;

