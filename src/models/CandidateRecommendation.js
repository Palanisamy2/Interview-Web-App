const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CandidateRecommendation = sequelize.define('CandidateRecommendation', {
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
  appliedRoleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'applied_role_id'
  },
  verdict: {
    type: DataTypes.STRING(30), // 'RECOMMENDED', 'BORDERLINE', 'NOT_RECOMMENDED'
    allowNull: false
  },
  level: {
    type: DataTypes.STRING(50), // 'Senior / Independent', 'Mid-Level', 'Junior (needs mentorship)', 'Not recommended'
    allowNull: false
  },
  overallScore: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    field: 'overall_score'
  },
  alternatives: {
    type: DataTypes.JSON, // [{ roleId, roleName, fit, hardFails }]
    allowNull: true,
    defaultValue: []
  },
  fitSummary: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'fit_summary'
  }
}, {
  tableName: 'candidate_recommendations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = CandidateRecommendation;

