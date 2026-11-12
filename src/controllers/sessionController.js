const {
  TestSession,
  Candidate,
  Role,
  Stack,
  TestBlueprint,
  SessionQuestion,
  Question,
  QuestionOption,
  BugfixSpec,
  BugfixTest,
  Response,
  CandidateSectorAnalytics,
  CandidateRecommendation,
  AuditEvent,
  CodingTelemetry,
  Sector,
  RoleProfile
} = require('../models');
const { buildTest } = require('../services/testGenerator');
const { gradeQuestion, aggregateSectors } = require('../services/scoringEngine');
const { recommend } = require('../services/roleFitEngine');
const { runCodeInSandbox } = require('../services/codeRunner');
const { Op } = require('sequelize');

/**
 * POST /sessions
 * Create a new test session
 */
async function createSession(req, res) {
  try {
    const { roleId, stackId, candidateId } = req.body;
    if (!roleId || !stackId || !candidateId) {
      return res.status(400).json({ error: 'roleId, stackId, and candidateId are required' });
    }

    // Check if blueprint exists
    let blueprint = await TestBlueprint.findOne({
      where: { roleId, stackId, isActive: true }
    });

    if (!blueprint) {
      // Fallback: try finding any blueprint for this role
      blueprint = await TestBlueprint.findOne({
        where: { roleId, isActive: true }
      });
    }

    const session = await TestSession.create({
      candidateId,
      blueprintId: blueprint ? blueprint.id : null,
      roleId,
      stackId,
      status: 'NOT_STARTED',
      userAgent: req.headers['user-agent'] || '',
      ipAddress: req.ip || req.connection?.remoteAddress || ''
    });

    return res.status(201).json(session);
  } catch (error) {
    console.error('Create session error:', error);
    return res.status(500).json({ error: error.message || 'Failed to create test session' });
  }
}

/**
 * POST /sessions/:id/start
 * Begin test, generate questions via blueprint, set ends_at
 */
async function startSession(req, res) {
  try {
    const { id } = req.params;
    const session = await TestSession.findByPk(id, {
      include: [
        { model: TestBlueprint, as: 'blueprint' },
        { model: Role, as: 'role' },
        { model: Stack, as: 'stack' }
      ]
    });

    if (!session) {
      return res.status(404).json({ error: 'Test session not found' });
    }

    if (session.status === 'SUBMITTED' || session.status === 'EXPIRED') {
      return res.status(400).json({ error: 'Test session has already been completed or expired' });
    }

    if (session.status === 'NOT_STARTED') {
      const durationMinutes = session.blueprint ? session.blueprint.durationMinutes : 45;
      const startedAt = new Date();
      const endsAt = new Date(startedAt.getTime() + durationMinutes * 60 * 1000);

      // Build questions from blueprint
      const blueprintId = session.blueprintId || (await TestBlueprint.findOne({ where: { roleId: session.roleId } }))?.id;
      if (!blueprintId) {
        return res.status(400).json({ error: 'No test blueprint configured for this role and stack' });
      }

      const generatedQuestions = await buildTest(blueprintId, session.candidateId);

      // Save session questions
      await SessionQuestion.destroy({ where: { sessionId: session.id } });
      await SessionQuestion.bulkCreate(
        generatedQuestions.map(gq => ({
          sessionId: session.id,
          questionId: gq.questionId,
          position: gq.position,
          optionOrder: gq.optionOrder
        }))
      );

      session.status = 'IN_PROGRESS';
      session.startedAt = startedAt;
      session.endsAt = endsAt;
      session.blueprintId = blueprintId;
      await session.save();
    }

    return res.json({
      id: session.id,
      status: session.status,
      startedAt: session.startedAt,
      endsAt: session.endsAt,
      durationMinutes: session.blueprint?.durationMinutes || 45
    });
  } catch (error) {
    console.error('Start session error:', error);
    return res.status(500).json({ error: error.message || 'Failed to start test session' });
  }
}

/**
 * GET /sessions/:id/questions
 * Returns questions sanitized (no answers or hidden tests)
 */
async function getSessionQuestions(req, res) {
  try {
    const { id } = req.params;
    const session = await TestSession.findByPk(id);
    if (!session) {
      return res.status(404).json({ error: 'Test session not found' });
    }

    // Check if expired
    if (session.status === 'IN_PROGRESS' && session.endsAt && new Date() > new Date(session.endsAt)) {
      session.status = 'EXPIRED';
      await session.save();
      return res.status(403).json({ error: 'Test time has expired', status: 'EXPIRED' });
    }

    const sessionQuestions = await SessionQuestion.findAll({
      where: { sessionId: id },
      order: [['position', 'ASC']],
      include: [
        {
          model: Question,
          as: 'question',
          include: [
            { model: Sector, as: 'sector', attributes: ['id', 'code', 'name'] },
            { model: QuestionOption, as: 'options', attributes: ['id', 'label', 'text'] }, // exclude isCorrect!
            { model: BugfixSpec, as: 'bugfixSpec' },
            {
              model: BugfixTest,
              as: 'bugfixTests',
              where: { isHidden: false }, // only visible test cases!
              required: false,
              attributes: ['id', 'input', 'expectedOutput', 'isHidden']
            }
          ]
        }
      ]
    });

    // Retrieve existing responses to populate draft state
    const responses = await Response.findAll({ where: { sessionId: id } });
    const responseMap = new Map(responses.map(r => [r.questionId, r]));

    const questionsList = sessionQuestions.map(sq => {
      const q = sq.question;
      const existingResp = responseMap.get(q.id);

      // Reorder options according to shuffled sq.optionOrder
      let orderedOptions = q.options;
      if (sq.optionOrder && Array.isArray(sq.optionOrder) && q.options) {
        const optMap = new Map(q.options.map(o => [o.id, o]));
        orderedOptions = sq.optionOrder.map(optId => optMap.get(optId)).filter(Boolean);
      }

      return {
        id: q.id,
        position: sq.position,
        type: q.type,
        difficulty: q.difficulty,
        points: q.points,
        title: q.title,
        body: q.body,
        sector: q.sector,
        options: orderedOptions,
        bugfixSpec: q.bugfixSpec ? {
          starterCode: q.bugfixSpec.starterCode,
          language: q.bugfixSpec.language
        } : null,
        visibleTests: q.bugfixTests || [],
        userResponse: existingResp ? {
          selectedOptionIds: existingResp.selectedOptionIds,
          textAnswer: existingResp.textAnswer,
          codeAnswer: existingResp.codeAnswer,
          timeSpentSec: existingResp.timeSpentSec
        } : null
      };
    });

    return res.json({
      sessionId: session.id,
      status: session.status,
      endsAt: session.endsAt,
      questions: questionsList
    });
  } catch (error) {
    console.error('Get questions error:', error);
    return res.status(500).json({ error: 'Failed to retrieve questions' });
  }
}

/**
 * PUT /sessions/:id/answers/:questionId
 * Autosave candidate answer
 */
async function autosaveAnswer(req, res) {
  try {
    const { id, questionId } = req.params;
    const { selectedOptionIds, textAnswer, codeAnswer, timeSpentSec } = req.body;

    const session = await TestSession.findByPk(id);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    if (session.status !== 'IN_PROGRESS') {
      return res.status(400).json({ error: 'Session is not in progress' });
    }

    if (session.endsAt && new Date() > new Date(session.endsAt)) {
      session.status = 'EXPIRED';
      await session.save();
      return res.status(403).json({ error: 'Time expired' });
    }

    const [response] = await Response.findOrCreate({
      where: { sessionId: id, questionId: Number(questionId) },
      defaults: {
        sessionId: id,
        questionId: Number(questionId),
        selectedOptionIds,
        textAnswer,
        codeAnswer,
        timeSpentSec: timeSpentSec || 0
      }
    });

    if (selectedOptionIds !== undefined) response.selectedOptionIds = selectedOptionIds;
    if (textAnswer !== undefined) response.textAnswer = textAnswer;
    if (codeAnswer !== undefined) response.codeAnswer = codeAnswer;
    if (timeSpentSec !== undefined) response.timeSpentSec = timeSpentSec;
    response.answeredAt = new Date();
    await response.save();

    return res.json({ success: true, savedAt: response.answeredAt });
  } catch (error) {
    console.error('Autosave error:', error);
    return res.status(500).json({ error: 'Failed to autosave answer' });
  }
}

/**
 * POST /sessions/:id/run-code
 * Interactive coding runner for candidate tests + telemetry tracking
 */
async function runCode(req, res) {
  try {
    const { id } = req.params;
    const { questionId, code } = req.body;

    if (!questionId || code === undefined) {
      return res.status(400).json({ error: 'questionId and code are required' });
    }

    const session = await TestSession.findByPk(id);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    // Fetch visible test cases only for this trial run
    const visibleTests = await BugfixTest.findAll({
      where: { questionId, isHidden: false }
    });

    const runResult = await runCodeInSandbox(code, visibleTests);

    // Update coding telemetry
    const [telemetry] = await CodingTelemetry.findOrCreate({
      where: { sessionId: id, questionId: Number(questionId) },
      defaults: {
        sessionId: id,
        questionId: Number(questionId),
        runCount: 0,
        syntaxErrorsCount: 0,
        testPassProgression: [],
        codeSnapshots: []
      }
    });

    telemetry.runCount = (telemetry.runCount || 0) + 1;
    const hasError = runResult.testResults.some(t => !!t.error);
    if (hasError) {
      telemetry.syntaxErrorsCount = (telemetry.syntaxErrorsCount || 0) + 1;
    }

    const progression = Array.isArray(telemetry.testPassProgression) ? [...telemetry.testPassProgression] : [];
    progression.push({
      timestamp: new Date().toISOString(),
      passedCount: runResult.passedCount,
      totalCount: runResult.totalTests,
      hasError
    });
    telemetry.testPassProgression = progression;

    const snapshots = Array.isArray(telemetry.codeSnapshots) ? [...telemetry.codeSnapshots] : [];
    if (snapshots.length < 20) {
      snapshots.push({
        timestamp: new Date().toISOString(),
        codeSnippet: code.slice(0, 1000)
      });
      telemetry.codeSnapshots = snapshots;
    }

    await telemetry.save();

    return res.json(runResult);
  } catch (error) {
    console.error('Run code error:', error);
    return res.status(500).json({ error: error.message || 'Execution failed' });
  }
}

/**
 * POST /sessions/:id/telemetry/:questionId
 * Candidate typing timing, idle thinking time, keystroke and backspace tracking
 */
async function recordTelemetry(req, res) {
  try {
    const { id, questionId } = req.params;
    const {
      timeToFirstKeystrokeMs,
      activeTypingMs,
      idleThinkingMs,
      keystrokeDelta,
      backspaceDelta,
      pasteDetected
    } = req.body;

    const [telemetry] = await CodingTelemetry.findOrCreate({
      where: { sessionId: id, questionId: Number(questionId) },
      defaults: {
        sessionId: id,
        questionId: Number(questionId),
        timeToFirstKeystrokeMs: timeToFirstKeystrokeMs || 0,
        activeTypingMs: activeTypingMs || 0,
        idleThinkingMs: idleThinkingMs || 0,
        totalKeystrokes: keystrokeDelta || 0,
        backspaceCount: backspaceDelta || 0,
        pasteCount: pasteDetected ? 1 : 0
      }
    });

    if (timeToFirstKeystrokeMs && !telemetry.timeToFirstKeystrokeMs) {
      telemetry.timeToFirstKeystrokeMs = timeToFirstKeystrokeMs;
    }
    if (activeTypingMs) telemetry.activeTypingMs += activeTypingMs;
    if (idleThinkingMs) telemetry.idleThinkingMs += idleThinkingMs;
    if (keystrokeDelta) telemetry.totalKeystrokes += keystrokeDelta;
    if (backspaceDelta) telemetry.backspaceCount += backspaceDelta;
    if (pasteDetected) telemetry.pasteCount += 1;

    await telemetry.save();
    return res.json({ success: true });
  } catch (error) {
    console.error('Telemetry error:', error);
    return res.status(500).json({ error: 'Failed to record telemetry' });
  }
}

/**
 * POST /sessions/:id/events
 * Log proctoring anti-cheat audit event
 */
async function logAuditEvent(req, res) {
  try {
    const { id } = req.params;
    const { eventType, meta } = req.body;

    const session = await TestSession.findByPk(id);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    if (eventType === 'TAB_BLUR' || eventType === 'WINDOW_HIDDEN') {
      session.tabSwitchCount = (session.tabSwitchCount || 0) + 1;
      await session.save();
    }

    await AuditEvent.create({
      sessionId: id,
      eventType: eventType || 'UNKNOWN_EVENT',
      meta: meta || {}
    });

    return res.json({ success: true, tabSwitchCount: session.tabSwitchCount });
  } catch (error) {
    console.error('Audit event error:', error);
    return res.status(500).json({ error: 'Failed to log event' });
  }
}

/**
 * POST /sessions/:id/submit
 * Finalize, grade all questions (including hidden tests), score sectors, compute role-fit
 */
async function submitSession(req, res) {
  try {
    const { id } = req.params;
    const session = await TestSession.findByPk(id, {
      include: [
        { model: Role, as: 'role' },
        { model: Stack, as: 'stack' }
      ]
    });

    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.status === 'SUBMITTED') {
      return res.status(400).json({ error: 'Session already submitted' });
    }

    // Mark as submitted
    session.status = 'SUBMITTED';
    session.submittedAt = new Date();
    await session.save();

    // Fetch all questions for this session
    const sessionQuestions = await SessionQuestion.findAll({
      where: { sessionId: id },
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

    // Fetch candidate's responses
    const responses = await Response.findAll({ where: { sessionId: id } });
    const responseMap = new Map(responses.map(r => [r.questionId, r]));

    const gradedItems = [];

    for (const sq of sessionQuestions) {
      const q = sq.question;
      const resp = responseMap.get(q.id) || {
        selectedOptionIds: [],
        textAnswer: '',
        codeAnswer: ''
      };

      let codeRunResult = null;
      if (q.type === 'BUGFIX' && resp.codeAnswer) {
        // Run all tests (both visible and hidden!)
        const allTests = q.bugfixTests || [];
        codeRunResult = await runCodeInSandbox(resp.codeAnswer, allTests);
      }

      const grade = gradeQuestion(q, resp, codeRunResult);

      // Persist earned points in response record
      if (responseMap.has(q.id)) {
        const respRecord = responseMap.get(q.id);
        respRecord.earnedPoints = grade.earnedPoints;
        respRecord.isCorrect = grade.isCorrect;
        await respRecord.save();
      } else {
        await Response.create({
          sessionId: id,
          questionId: q.id,
          earnedPoints: grade.earnedPoints,
          isCorrect: grade.isCorrect,
          selectedOptionIds: resp.selectedOptionIds,
          textAnswer: resp.textAnswer,
          codeAnswer: resp.codeAnswer
        });
      }

      // Update question metrics
      await Question.increment(
        {
          timesServed: 1,
          timesCorrect: grade.isCorrect ? 1 : 0
        },
        { where: { id: q.id } }
      );

      gradedItems.push({
        question: q,
        earnedPoints: grade.earnedPoints,
        maxPoints: grade.maxPoints,
        isCorrect: grade.isCorrect
      });
    }

    // Fetch all sectors and role profiles
    const sectors = await Sector.findAll();
    const roleProfiles = await RoleProfile.findAll();
    const roles = await Role.findAll();

    // Aggregate sector scores
    const sectorScores = aggregateSectors(gradedItems, sectors, roleProfiles);

    // Save sector analytics
    await CandidateSectorAnalytics.destroy({ where: { sessionId: id } });
    await CandidateSectorAnalytics.bulkCreate(
      sectorScores.map(ss => ({
        sessionId: id,
        sectorId: ss.sectorId,
        totalQuestions: ss.totalQuestions,
        correctCount: ss.correctCount,
        earnedPoints: ss.earnedPoints,
        maxPoints: ss.maxPoints,
        scorePercentage: ss.scorePercentage,
        tier: ss.tier
      }))
    );

    // Map profiles by roleId for role-fit engine
    const profileMap = new Map();
    for (const p of roleProfiles) {
      if (!profileMap.has(p.roleId)) profileMap.set(p.roleId, []);
      profileMap.get(p.roleId).push(p);
    }

    // Compute role-fit
    const fitOutcome = recommend(session.roleId, sectorScores, profileMap, roles);

    // Save recommendation
    await CandidateRecommendation.destroy({ where: { sessionId: id } });
    const rec = await CandidateRecommendation.create({
      sessionId: id,
      appliedRoleId: session.roleId,
      verdict: fitOutcome.verdict,
      level: fitOutcome.level,
      overallScore: fitOutcome.overallScore,
      alternatives: fitOutcome.alternatives,
      fitSummary: fitOutcome.fitSummary
    });

    return res.json({
      success: true,
      verdict: fitOutcome.verdict,
      level: fitOutcome.level,
      overallScore: fitOutcome.overallScore,
      sectors: sectorScores,
      alternatives: fitOutcome.alternatives
    });
  } catch (error) {
    console.error('Submit session error:', error);
    return res.status(500).json({ error: error.message || 'Submission failed' });
  }
}

/**
 * GET /sessions/:id/status
 */
async function getSessionStatus(req, res) {
  try {
    const { id } = req.params;
    const session = await TestSession.findByPk(id);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    let remainingSeconds = 0;
    if (session.endsAt) {
      const diff = new Date(session.endsAt).getTime() - Date.now();
      remainingSeconds = Math.max(0, Math.floor(diff / 1000));
      if (remainingSeconds === 0 && session.status === 'IN_PROGRESS') {
        session.status = 'EXPIRED';
        await session.save();
      }
    }

    const answeredCount = await Response.count({
      where: {
        sessionId: id,
        [Op.or]: [
          { selectedOptionIds: { [Op.ne]: null } },
          { textAnswer: { [Op.ne]: null } },
          { codeAnswer: { [Op.ne]: null } }
        ]
      }
    });

    const totalQuestions = await SessionQuestion.count({ where: { sessionId: id } });

    return res.json({
      id: session.id,
      status: session.status,
      remainingSeconds,
      answeredCount,
      totalQuestions,
      tabSwitchCount: session.tabSwitchCount
    });
  } catch (error) {
    console.error('Session status error:', error);
    return res.status(500).json({ error: 'Failed to retrieve status' });
  }
}

module.exports = {
  createSession,
  startSession,
  getSessionQuestions,
  autosaveAnswer,
  runCode,
  recordTelemetry,
  logAuditEvent,
  submitSession,
  getSessionStatus
};

