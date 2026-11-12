const {
  Candidate,
  TestSession,
  Role,
  Stack,
  Sector,
  CandidateSectorAnalytics,
  CandidateRecommendation,
  AuditEvent,
  CodingTelemetry,
  SessionQuestion,
  Question,
  QuestionOption,
  BugfixTest,
  Response,
  Invitation
} = require('../models');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');

/**
 * GET /admin/candidates
 * List candidates with session and scores
 */
async function listCandidates(req, res) {
  try {
    const { search, roleId, status } = req.query;

    const sessionWhere = {};
    if (roleId) sessionWhere.roleId = roleId;
    if (status) sessionWhere.status = status;

    const candidateWhere = {};
    if (search) {
      candidateWhere[Op.or] = [
        { name: { [Op.iLike || Op.like]: `%${search}%` } },
        { email: { [Op.iLike || Op.like]: `%${search}%` } }
      ];
    }

    const candidates = await Candidate.findAll({
      where: candidateWhere,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: TestSession,
          as: 'sessions',
          where: Object.keys(sessionWhere).length ? sessionWhere : undefined,
          required: false,
          include: [
            { model: Role, as: 'role', attributes: ['id', 'name', 'code'] },
            { model: Stack, as: 'stack', attributes: ['id', 'name', 'code'] },
            { model: CandidateRecommendation, as: 'recommendation' }
          ]
        }
      ]
    });

    return res.json(candidates);
  } catch (error) {
    console.error('List candidates error:', error);
    return res.status(500).json({ error: 'Failed to list candidates' });
  }
}

/**
 * GET /admin/sessions/:id/report
 * Detailed candidate report (radar charts, verdict, telemetry, questions review)
 */
async function getSessionReport(req, res) {
  try {
    const { id } = req.params;

    const session = await TestSession.findByPk(id, {
      include: [
        { model: Candidate, as: 'candidate' },
        { model: Role, as: 'role' },
        { model: Stack, as: 'stack' },
        {
          model: CandidateSectorAnalytics,
          as: 'sectorAnalytics',
          include: [{ model: Sector, as: 'sector' }]
        },
        { model: CandidateRecommendation, as: 'recommendation' },
        { model: AuditEvent, as: 'auditEvents' },
        {
          model: CodingTelemetry,
          as: 'codingTelemetries',
          include: [{ model: Question, as: 'question', attributes: ['id', 'title', 'type'] }]
        }
      ]
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Retrieve question-by-question response breakdown
    const sessionQuestions = await SessionQuestion.findAll({
      where: { sessionId: id },
      order: [['position', 'ASC']],
      include: [
        {
          model: Question,
          as: 'question',
          include: [
            { model: Sector, as: 'sector' },
            { model: QuestionOption, as: 'options' },
            { model: BugfixTest, as: 'bugfixTests' }
          ]
        }
      ]
    });

    const responses = await Response.findAll({ where: { sessionId: id } });
    const responseMap = new Map(responses.map(r => [r.questionId, r]));

    const questionReviews = sessionQuestions.map(sq => {
      const q = sq.question;
      const resp = responseMap.get(q.id);

      return {
        id: q.id,
        position: sq.position,
        title: q.title,
        body: q.body,
        type: q.type,
        difficulty: q.difficulty,
        points: q.points,
        explanation: q.explanation,
        sector: q.sector,
        options: q.options,
        expectedOutput: q.expectedOutput,
        bugfixTests: q.bugfixTests,
        candidateResponse: resp ? {
          selectedOptionIds: resp.selectedOptionIds,
          textAnswer: resp.textAnswer,
          codeAnswer: resp.codeAnswer,
          earnedPoints: resp.earnedPoints,
          isCorrect: resp.isCorrect,
          timeSpentSec: resp.timeSpentSec
        } : null
      };
    });

    // Format radar chart data
    const radarData = (session.sectorAnalytics || []).map(sa => ({
      sector: sa.sector ? sa.sector.name : `Sector ${sa.sectorId}`,
      score: Number(sa.scorePercentage),
      fullMark: 100,
      tier: sa.tier
    }));

    return res.json({
      session: {
        id: session.id,
        status: session.status,
        startedAt: session.startedAt,
        submittedAt: session.submittedAt,
        tabSwitchCount: session.tabSwitchCount,
        candidate: session.candidate,
        role: session.role,
        stack: session.stack
      },
      sectorAnalytics: session.sectorAnalytics,
      recommendation: session.recommendation,
      radarData,
      auditEvents: session.auditEvents,
      codingTelemetries: session.codingTelemetries,
      questionReviews
    });
  } catch (error) {
    console.error('Session report error:', error);
    return res.status(500).json({ error: 'Failed to generate report' });
  }
}

/**
 * POST /admin/invitations
 * Create candidate invitation token
 */
async function createInvitation(req, res) {
  try {
    const { email, roleId, stackId, daysValid = 7 } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const token = uuidv4().replace(/-/g, '').slice(0, 24);
    const expiresAt = new Date(Date.now() + daysValid * 24 * 60 * 60 * 1000);

    const invite = await Invitation.create({
      candidateEmail: email,
      roleId: roleId || null,
      stackId: stackId || null,
      token,
      expiresAt,
      createdBy: req.user?.id || null
    });

    return res.status(201).json({
      invite,
      inviteUrl: `/register?token=${token}`
    });
  } catch (error) {
    console.error('Create invitation error:', error);
    return res.status(500).json({ error: 'Failed to create invitation' });
  }
}

/**
 * GET /admin/stats
 * Dashboard metrics
 */
async function getDashboardStats(req, res) {
  try {
    const totalCandidates = await Candidate.count();
    const totalSessions = await TestSession.count();
    const submittedSessions = await TestSession.count({ where: { status: 'SUBMITTED' } });

    const recommendations = await CandidateRecommendation.findAll({
      attributes: ['verdict', 'overallScore']
    });

    const recommendedCount = recommendations.filter(r => r.verdict === 'RECOMMENDED').length;
    const passRate = recommendations.length > 0
      ? Number(((recommendedCount / recommendations.length) * 100).toFixed(1))
      : 0;

    const avgScore = recommendations.length > 0
      ? Number((recommendations.reduce((sum, r) => sum + Number(r.overallScore), 0) / recommendations.length).toFixed(1))
      : 0;

    return res.json({
      totalCandidates,
      totalSessions,
      submittedSessions,
      passRate,
      avgScore
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
}

module.exports = {
  listCandidates,
  getSessionReport,
  createInvitation,
  getDashboardStats
};

