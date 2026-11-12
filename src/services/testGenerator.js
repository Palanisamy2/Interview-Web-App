const { Question, QuestionOption, BlueprintRule, SessionQuestion, TestSession } = require('../models');
const { Op } = require('sequelize');

/**
 * Weighted random sample without replacement
 */
function weightedSample(items, count, weightFn) {
  if (items.length <= count) {
    return [...items];
  }

  const pool = [...items];
  const chosen = [];

  for (let i = 0; i < count; i++) {
    const weights = pool.map(weightFn);
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let rand = Math.random() * totalWeight;

    let selectedIndex = 0;
    for (let j = 0; j < pool.length; j++) {
      rand -= weights[j];
      if (rand <= 0) {
        selectedIndex = j;
        break;
      }
    }

    chosen.push(pool[selectedIndex]);
    pool.splice(selectedIndex, 1);
  }

  return chosen;
}

/**
 * Fisher-Yates array shuffle
 */
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Build test questions for a blueprint and candidate
 */
async function buildTest(blueprintId, candidateId) {
  const rules = await BlueprintRule.findAll({
    where: { blueprintId }
  });

  if (!rules || rules.length === 0) {
    throw new Error(`No blueprint rules found for blueprint ID ${blueprintId}`);
  }

  // Find previous question IDs seen by this candidate to avoid repeats
  const previousSessions = await TestSession.findAll({
    where: { candidateId },
    attributes: ['id']
  });

  let previousQuestionIds = [];
  if (previousSessions.length > 0) {
    const sessionIds = previousSessions.map(s => s.id);
    const prevSessionQuestions = await SessionQuestion.findAll({
      where: { sessionId: { [Op.in]: sessionIds } },
      attributes: ['questionId']
    });
    previousQuestionIds = prevSessionQuestions.map(sq => sq.questionId);
  }

  const pickedQuestionIds = [];

  for (const rule of rules) {
    const levelCounts = [
      { level: 'EASY', count: rule.easyCount || 0 },
      { level: 'MEDIUM', count: rule.mediumCount || 0 },
      { level: 'HARD', count: rule.hardCount || 0 }
    ];

    for (const { level, count } of levelCounts) {
      if (!count || count <= 0) continue;

      const whereClause = {
        sectorId: rule.sectorId,
        difficulty: level,
        status: 'APPROVED',
        id: {
          [Op.notIn]: [...pickedQuestionIds, ...previousQuestionIds]
        }
      };

      if (rule.stackId) {
        whereClause[Op.or] = [
          { stackId: rule.stackId },
          { stackId: null } // allow shared pool fallback
        ];
      }

      if (rule.language) {
        whereClause.language = rule.language;
      }

      let pool = await Question.findAll({
        where: whereClause,
        attributes: ['id', 'timesServed']
      });

      // If pool is insufficient after excluding previous candidate encounters, relax previous exclusion
      if (pool.length < count && previousQuestionIds.length > 0) {
        delete whereClause.id;
        whereClause.id = { [Op.notIn]: pickedQuestionIds };
        pool = await Question.findAll({
          where: whereClause,
          attributes: ['id', 'timesServed']
        });
      }

      if (pool.length < count) {
        throw new Error(
          `Insufficient questions for sector ID ${rule.sectorId}, difficulty ${level}. Requested ${count}, available ${pool.length}.`
        );
      }

      // Prefer less-served questions: weight = 1 / (1 + timesServed)
      const chosen = weightedSample(pool, count, q => 1 / (1 + (q.timesServed || 0)));
      pickedQuestionIds.push(...chosen.map(q => q.id));
    }
  }

  // Shuffle final question order
  const shuffledIds = shuffle(pickedQuestionIds);

  // Retrieve full question details with options for option shuffling
  const questions = await Question.findAll({
    where: { id: { [Op.in]: shuffledIds } },
    include: [{ model: QuestionOption, as: 'options' }]
  });

  const questionMap = new Map(questions.map(q => [q.id, q]));

  // Build ordered session question entries with shuffled options
  const sessionQuestionEntries = shuffledIds.map((qid, idx) => {
    const q = questionMap.get(qid);
    let optionOrder = null;
    if (q && q.options && q.options.length > 0) {
      const optIds = q.options.map(o => o.id);
      optionOrder = shuffle(optIds);
    }
    return {
      questionId: qid,
      position: idx + 1,
      optionOrder
    };
  });

  return sessionQuestionEntries;
}

module.exports = {
  weightedSample,
  shuffle,
  buildTest
};

