const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RoleProfile = sequelize.define('RoleProfile', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  roleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'role_id'
  },
  sectorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'sector_id'
  },
  weight: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: false // e.g. 0.40
  },
  strongCutoff: {
    type: DataTypes.INTEGER,
    defaultValue: 75,
    field: 'strong_cutoff'
  },
  mediumCutoff: {
    type: DataTypes.INTEGER,
    defaultValue: 50,
    field: 'medium_cutoff'
  },
  minAcceptable: {
    type: DataTypes.INTEGER,
    defaultValue: 50,
    field: 'min_acceptable'
  },
  isMandatory: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_mandatory'
  }
}, {
  tableName: 'role_profiles',
  timestamps: false
});

module.exports = RoleProfile;

