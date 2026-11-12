const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CandidateSectorAnalytics = sequelize.define('CandidateSectorAnalytics', {
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
  sectorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'sector_id'
  },
  totalQuestions: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'total_questions'
  },
  correctCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'correct_count'
  },
  earnedPoints: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: false,
    field: 'earned_points'
  },
  maxPoints: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: false,
    field: 'max_points'
  },
  scorePercentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    field: 'score_percentage'
  },
  tier: {
    type: DataTypes.STRING(20), // 'STRONG', 'MEDIUM', 'LOW', 'INSUFFICIENT_DATA'
    allowNull: false
  }
}, {
  tableName: 'candidate_sector_analytics',
  timestamps: false
});

module.exports = CandidateSectorAnalytics;

