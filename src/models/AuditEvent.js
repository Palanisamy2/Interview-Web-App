const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditEvent = sequelize.define('AuditEvent', {
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
  eventType: {
    type: DataTypes.STRING(50), // 'TAB_BLUR', 'COPY', 'PASTE', 'FULLSCREEN_EXIT', etc.
    allowNull: false,
    field: 'event_type'
  },
  meta: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'audit_events',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = AuditEvent;

