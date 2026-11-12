const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CodingTelemetry = sequelize.define('CodingTelemetry', {
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
  timeToFirstKeystrokeMs: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'time_to_first_keystroke_ms' // Thinking/reading time before typing
  },
  activeTypingMs: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'active_typing_ms'
  },
  idleThinkingMs: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'idle_thinking_ms' // Pausing / logic formulation time
  },
  totalKeystrokes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'total_keystrokes'
  },
  backspaceCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'backspace_count' // Code churn & editing hesitation
  },
  pasteCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'paste_count' // External paste tracking
  },
  runCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'run_count' // Number of test runs executed
  },
  syntaxErrorsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'syntax_errors_count'
  },
  testPassProgression: {
    type: DataTypes.JSON, // Array of { timestamp, passedCount, totalCount, runDurationMs, error }
    allowNull: true,
    defaultValue: [],
    field: 'test_pass_progression'
  },
  codeSnapshots: {
    type: DataTypes.JSON, // Array of { timestamp, codeLength, sample }
    allowNull: true,
    defaultValue: [],
    field: 'code_snapshots'
  }
}, {
  tableName: 'coding_telemetry',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = CodingTelemetry;

