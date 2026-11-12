const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TestSession = sequelize.define('TestSession', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  candidateId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'candidate_id'
  },
  blueprintId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'blueprint_id'
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
  status: {
    type: DataTypes.STRING(20), // 'NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'EXPIRED'
    defaultValue: 'NOT_STARTED'
  },
  startedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'started_at'
  },
  endsAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'ends_at'
  },
  submittedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'submitted_at'
  },
  tabSwitchCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'tab_switch_count'
  },
  ipAddress: {
    type: DataTypes.STRING(45),
    allowNull: true,
    field: 'ip_address'
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'user_agent'
  }
}, {
  tableName: 'test_sessions',
  timestamps: false
});

module.exports = TestSession;

