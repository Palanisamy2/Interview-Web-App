const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Invitation = sequelize.define('Invitation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  candidateEmail: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'candidate_email'
  },
  roleId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'role_id'
  },
  stackId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'stack_id'
  },
  token: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'expires_at'
  },
  usedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'used_at'
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'created_by'
  }
}, {
  tableName: 'invitations',
  timestamps: false
});

module.exports = Invitation;

