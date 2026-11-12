const { describe, it } = require('node:test');
const assert = require('node:assert');
const { gradeQuestion, aggregateSectors } = require('../src/services/scoringEngine');
const { fitForRole, levelFor, recommend, tier } = require('../src/services/roleFitEngine');

describe('Scoring & Role-Fit Engine Unit Tests', () => {
  it('MCQ_SINGLE: grades 100% for correct option and 0 for incorrect', () => {
    const question = {
      id: 1,
      type: 'MCQ_SINGLE',
      points: 2,
      options: [
        { id: 10, label: 'A', isCorrect: false },
        { id: 11, label: 'B', isCorrect: true }
      ]
    };

    const resCorrect = gradeQuestion(question, { selectedOptionIds: [11] });
    assert.strictEqual(resCorrect.earnedPoints, 2);
    assert.strictEqual(resCorrect.isCorrect, true);

    const resWrong = gradeQuestion(question, { selectedOptionIds: [10] });
    assert.strictEqual(resWrong.earnedPoints, 0);
    assert.strictEqual(resWrong.isCorrect, false);
  });

  it('MCQ_MULTI: awards partial credit: (correct - wrong) / totalCorrect', () => {
    const question = {
      id: 2,
      type: 'MCQ_MULTI',
      points: 4,
      options: [
        { id: 1, isCorrect: true },
        { id: 2, isCorrect: true },
        { id: 3, isCorrect: false }
      ]
    };

    // Selecting 1 correct and 0 wrong -> fraction = 1/2 = 0.5 -> 2 points
    const resPartial = gradeQuestion(question, { selectedOptionIds: [1] });
    assert.strictEqual(resPartial.earnedPoints, 2);
    assert.strictEqual(resPartial.isCorrect, false);

    // Selecting 2 correct and 0 wrong -> full marks
    const resFull = gradeQuestion(question, { selectedOptionIds: [1, 2] });
    assert.strictEqual(resFull.earnedPoints, 4);
    assert.strictEqual(resFull.isCorrect, true);

    // Selecting 1 correct and 1 wrong -> fraction = (1 - 1)/2 = 0 -> 0 points
    const resPenalty = gradeQuestion(question, { selectedOptionIds: [1, 3] });
    assert.strictEqual(resPenalty.earnedPoints, 0);
  });

  it('OUTPUT: matches normalized string output', () => {
    const question = {
      id: 3,
      type: 'OUTPUT',
      points: 2,
      expectedOutput: '[1, 2, 3]'
    };

    const res = gradeQuestion(question, { textAnswer: ' [1,   2,  3] ' });
    assert.strictEqual(res.isCorrect, true);
    assert.strictEqual(res.earnedPoints, 2);
  });

  it('BUGFIX: awards points proportional to passed unit tests', () => {
    const question = {
      id: 4,
      type: 'BUGFIX',
      points: 4
    };

    const codeRunResult = {
      totalTests: 4,
      passedCount: 3
    };

    const res = gradeQuestion(question, {}, codeRunResult);
    assert.strictEqual(res.earnedPoints, 3);
    assert.strictEqual(res.isCorrect, false);
  });

  it('Sector score: returns INSUFFICIENT_DATA if fewer than 5 questions', () => {
    const sectors = [{ id: 1, code: 'frontend', name: 'Frontend' }];
    const graded = [
      { question: { sectorId: 1 }, earnedPoints: 2, maxPoints: 2, isCorrect: true },
      { question: { sectorId: 1 }, earnedPoints: 2, maxPoints: 2, isCorrect: true },
      { question: { sectorId: 1 }, earnedPoints: 2, maxPoints: 2, isCorrect: true },
      { question: { sectorId: 1 }, earnedPoints: 2, maxPoints: 2, isCorrect: true }
    ]; // only 4 questions

    const agg = aggregateSectors(graded, sectors);
    assert.strictEqual(agg[0].tier, 'INSUFFICIENT_DATA');
  });

  it('Sector score boundaries: 75 is STRONG, 50 is MEDIUM, 49.99 is LOW', () => {
    assert.strictEqual(tier(75), 'STRONG');
    assert.strictEqual(tier(50), 'MEDIUM');
    assert.strictEqual(tier(49.99), 'LOW');
  });

  it('Role-Fit: Mandatory sector failure results in BORDERLINE verdict', () => {
    const profile = [
      { sectorId: 1, weight: 0.5, strongCutoff: 75, minAcceptable: 60, isMandatory: true },
      { sectorId: 2, weight: 0.5, strongCutoff: 70, minAcceptable: 50, isMandatory: false }
    ];

    // Sector 1 scored 50 (below min 60) -> 1 hard fail
    const scores = [
      { sectorId: 1, scorePercentage: 50 },
      { sectorId: 2, scorePercentage: 90 }
    ];

    const roles = [{ id: 101, name: 'Frontend Engineer', code: 'frontend' }];
    const allProfiles = new Map([[101, profile]]);

    const outcome = recommend(101, scores, allProfiles, roles);
    assert.strictEqual(outcome.applied.hardFails, 1);
    assert.strictEqual(outcome.verdict, 'BORDERLINE');
  });

  it('Role-Fit: Suggests alternate role when candidate meets criteria', () => {
    const feProfile = [
      { sectorId: 1, weight: 0.8, strongCutoff: 75, minAcceptable: 60, isMandatory: true }
    ];
    const beProfile = [
      { sectorId: 2, weight: 0.8, strongCutoff: 70, minAcceptable: 50, isMandatory: false }
    ];

    const scores = [
      { sectorId: 1, scorePercentage: 40 }, // failed FE
      { sectorId: 2, scorePercentage: 85 }  // strong in BE
    ];

    const roles = [
      { id: 1, name: 'Frontend Engineer' },
      { id: 2, name: 'Backend Engineer' }
    ];
    const allProfiles = new Map([
      [1, feProfile],
      [2, beProfile]
    ]);

    const outcome = recommend(1, scores, allProfiles, roles);
    assert.strictEqual(outcome.verdict, 'BORDERLINE'); // failed mandatory in FE
    assert.strictEqual(outcome.alternatives.length, 1);
    assert.strictEqual(outcome.alternatives[0].roleId, 2);
  });
});

