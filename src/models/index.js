const sequelize = require('../config/database');
const User = require('./User');
const Candidate = require('./Candidate');
const Role = require('./Role');
const Stack = require('./Stack');
const Sector = require('./Sector');
const RoleProfile = require('./RoleProfile');
const TestBlueprint = require('./TestBlueprint');
const BlueprintRule = require('./BlueprintRule');
const Question = require('./Question');
const QuestionOption = require('./QuestionOption');
const BugfixSpec = require('./BugfixSpec');
const BugfixTest = require('./BugfixTest');
const Invitation = require('./Invitation');
const TestSession = require('./TestSession');
const SessionQuestion = require('./SessionQuestion');
const Response = require('./Response');
const CandidateSectorAnalytics = require('./CandidateSectorAnalytics');
const CandidateRecommendation = require('./CandidateRecommendation');
const AuditEvent = require('./AuditEvent');
const CodingTelemetry = require('./CodingTelemetry');

// Associations
Role.hasMany(Stack, { foreignKey: 'roleId', as: 'stacks' });
Stack.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });

Role.hasMany(RoleProfile, { foreignKey: 'roleId', as: 'profiles' });
RoleProfile.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });

Sector.hasMany(RoleProfile, { foreignKey: 'sectorId', as: 'roleProfiles' });
RoleProfile.belongsTo(Sector, { foreignKey: 'sectorId', as: 'sector' });

Role.hasMany(TestBlueprint, { foreignKey: 'roleId', as: 'blueprints' });
TestBlueprint.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });

Stack.hasMany(TestBlueprint, { foreignKey: 'stackId', as: 'blueprints' });
TestBlueprint.belongsTo(Stack, { foreignKey: 'stackId', as: 'stack' });

TestBlueprint.hasMany(BlueprintRule, { foreignKey: 'blueprintId', as: 'rules', onDelete: 'CASCADE' });
BlueprintRule.belongsTo(TestBlueprint, { foreignKey: 'blueprintId', as: 'blueprint' });

Sector.hasMany(BlueprintRule, { foreignKey: 'sectorId', as: 'blueprintRules' });
BlueprintRule.belongsTo(Sector, { foreignKey: 'sectorId', as: 'sector' });

Stack.hasMany(BlueprintRule, { foreignKey: 'stackId', as: 'blueprintRules' });
BlueprintRule.belongsTo(Stack, { foreignKey: 'stackId', as: 'stack' });

Sector.hasMany(Question, { foreignKey: 'sectorId', as: 'questions' });
Question.belongsTo(Sector, { foreignKey: 'sectorId', as: 'sector' });

Stack.hasMany(Question, { foreignKey: 'stackId', as: 'questions' });
Question.belongsTo(Stack, { foreignKey: 'stackId', as: 'stack' });

Question.hasMany(QuestionOption, { foreignKey: 'questionId', as: 'options', onDelete: 'CASCADE' });
QuestionOption.belongsTo(Question, { foreignKey: 'questionId', as: 'question' });

Question.hasOne(BugfixSpec, { foreignKey: 'questionId', as: 'bugfixSpec', onDelete: 'CASCADE' });
BugfixSpec.belongsTo(Question, { foreignKey: 'questionId', as: 'question' });

Question.hasMany(BugfixTest, { foreignKey: 'questionId', as: 'bugfixTests', onDelete: 'CASCADE' });
BugfixTest.belongsTo(Question, { foreignKey: 'questionId', as: 'question' });

Candidate.hasMany(TestSession, { foreignKey: 'candidateId', as: 'sessions' });
TestSession.belongsTo(Candidate, { foreignKey: 'candidateId', as: 'candidate' });

Role.hasMany(TestSession, { foreignKey: 'roleId', as: 'sessions' });
TestSession.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });

Stack.hasMany(TestSession, { foreignKey: 'stackId', as: 'sessions' });
TestSession.belongsTo(Stack, { foreignKey: 'stackId', as: 'stack' });

TestBlueprint.hasMany(TestSession, { foreignKey: 'blueprintId', as: 'sessions' });
TestSession.belongsTo(TestBlueprint, { foreignKey: 'blueprintId', as: 'blueprint' });

TestSession.hasMany(SessionQuestion, { foreignKey: 'sessionId', as: 'sessionQuestions', onDelete: 'CASCADE' });
SessionQuestion.belongsTo(TestSession, { foreignKey: 'sessionId', as: 'session' });

Question.hasMany(SessionQuestion, { foreignKey: 'questionId', as: 'sessionQuestions' });
SessionQuestion.belongsTo(Question, { foreignKey: 'questionId', as: 'question' });

TestSession.hasMany(Response, { foreignKey: 'sessionId', as: 'responses', onDelete: 'CASCADE' });
Response.belongsTo(TestSession, { foreignKey: 'sessionId', as: 'session' });

Question.hasMany(Response, { foreignKey: 'questionId', as: 'responses' });
Response.belongsTo(Question, { foreignKey: 'questionId', as: 'question' });

TestSession.hasMany(CandidateSectorAnalytics, { foreignKey: 'sessionId', as: 'sectorAnalytics', onDelete: 'CASCADE' });
CandidateSectorAnalytics.belongsTo(TestSession, { foreignKey: 'sessionId', as: 'session' });

Sector.hasMany(CandidateSectorAnalytics, { foreignKey: 'sectorId', as: 'sectorAnalytics' });
CandidateSectorAnalytics.belongsTo(Sector, { foreignKey: 'sectorId', as: 'sector' });

TestSession.hasOne(CandidateRecommendation, { foreignKey: 'sessionId', as: 'recommendation', onDelete: 'CASCADE' });
CandidateRecommendation.belongsTo(TestSession, { foreignKey: 'sessionId', as: 'session' });

TestSession.hasMany(AuditEvent, { foreignKey: 'sessionId', as: 'auditEvents', onDelete: 'CASCADE' });
AuditEvent.belongsTo(TestSession, { foreignKey: 'sessionId', as: 'session' });

TestSession.hasMany(CodingTelemetry, { foreignKey: 'sessionId', as: 'codingTelemetries', onDelete: 'CASCADE' });
CodingTelemetry.belongsTo(TestSession, { foreignKey: 'sessionId', as: 'session' });

Question.hasMany(CodingTelemetry, { foreignKey: 'questionId', as: 'codingTelemetries' });
CodingTelemetry.belongsTo(Question, { foreignKey: 'questionId', as: 'question' });

module.exports = {
  sequelize,
  User,
  Candidate,
  Role,
  Stack,
  Sector,
  RoleProfile,
  TestBlueprint,
  BlueprintRule,
  Question,
  QuestionOption,
  BugfixSpec,
  BugfixTest,
  Invitation,
  TestSession,
  SessionQuestion,
  Response,
  CandidateSectorAnalytics,
  CandidateRecommendation,
  AuditEvent,
  CodingTelemetry
};

