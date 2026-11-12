const { Question, QuestionOption, BugfixSpec, BugfixTest, Sector, Stack } = require('../models');

async function listQuestions(req, res) {
  try {
    const { sectorId, stackId, difficulty, type, status } = req.query;
    const where = {};
    if (sectorId) where.sectorId = sectorId;
    if (stackId) where.stackId = stackId;
    if (difficulty) where.difficulty = difficulty;
    if (type) where.type = type;
    if (status) where.status = status;

    const questions = await Question.findAll({
      where,
      include: [
        { model: Sector, as: 'sector' },
        { model: Stack, as: 'stack' },
        { model: QuestionOption, as: 'options' },
        { model: BugfixSpec, as: 'bugfixSpec' },
        { model: BugfixTest, as: 'bugfixTests' }
      ],
      order: [['created_at', 'DESC']]
    });

    return res.json(questions);
  } catch (error) {
    console.error('List questions error:', error);
    return res.status(500).json({ error: 'Failed to list questions' });
  }
}

/**
 * Bulk import questions matching Section 6.2 format
 */
async function importQuestions(req, res) {
  try {
    const questionsArray = Array.isArray(req.body) ? req.body : req.body.questions;
    if (!Array.isArray(questionsArray) || questionsArray.length === 0) {
      return res.status(400).json({ error: 'Expected an array of question objects' });
    }

    const sectors = await Sector.findAll();
    const sectorMap = new Map(sectors.map(s => [s.code.toLowerCase(), s.id]));

    const stacks = await Stack.findAll();
    const stackMap = new Map(stacks.map(s => [s.code.toLowerCase(), s.id]));

    const createdList = [];

    for (const item of questionsArray) {
      const sectorId = sectorMap.get((item.sector || '').toLowerCase()) || 1;
      const stackId = item.stack ? stackMap.get(item.stack.toLowerCase()) || null : null;

      const difficulty = (item.difficulty || 'MEDIUM').toUpperCase();
      const points = item.points || (difficulty === 'EASY' ? 1 : difficulty === 'HARD' ? 3 : 2);

      const q = await Question.create({
        type: item.type,
        sectorId,
        stackId,
        language: item.language || 'javascript',
        difficulty,
        points,
        title: item.title,
        body: item.body,
        explanation: item.explanation || null,
        tags: item.tags || [],
        expectedOutput: item.expected_output || item.expectedOutput || null,
        status: item.status || 'APPROVED'
      });

      // Handle options for MCQs
      if (Array.isArray(item.options)) {
        await QuestionOption.bulkCreate(
          item.options.map(opt => ({
            questionId: q.id,
            label: opt.label || 'A',
            text: opt.text,
            isCorrect: !!(opt.correct || opt.is_correct || opt.isCorrect)
          }))
        );
      }

      // Handle Bugfix specs & tests
      if (item.type === 'BUGFIX') {
        await BugfixSpec.create({
          questionId: q.id,
          language: item.language || 'javascript',
          starterCode: item.starter_code || item.starterCode || '',
          timeLimitMs: item.time_limit_ms || 2000,
          memoryLimitKb: item.memory_limit_kb || 128000
        });

        if (Array.isArray(item.tests)) {
          await BugfixTest.bulkCreate(
            item.tests.map(t => ({
              questionId: q.id,
              input: typeof t.input === 'object' ? JSON.stringify(t.input) : String(t.input),
              expectedOutput: typeof t.expected === 'object' ? JSON.stringify(t.expected) : String(t.expected || t.expectedOutput),
              isHidden: t.hidden !== undefined ? !!t.hidden : !!t.isHidden
            }))
          );
        }
      }

      createdList.push(q);
    }

    return res.status(201).json({
      success: true,
      count: createdList.length,
      message: `Successfully imported ${createdList.length} questions`
    });
  } catch (error) {
    console.error('Import questions error:', error);
    return res.status(500).json({ error: error.message || 'Import failed' });
  }
}

async function updateQuestionStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'DRAFT', 'IN_REVIEW', 'APPROVED', 'RETIRED'

    const question = await Question.findByPk(id);
    if (!question) return res.status(404).json({ error: 'Question not found' });

    question.status = status;
    await question.save();

    return res.json(question);
  } catch (error) {
    console.error('Update question status error:', error);
    return res.status(500).json({ error: 'Failed to update question status' });
  }
}

module.exports = {
  listQuestions,
  importQuestions,
  updateQuestionStatus
};

