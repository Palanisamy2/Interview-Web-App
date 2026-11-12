/**
 * Scoring Engine for Candidate Skill Assessment Platform
 * Implements Section 3.1 & 3.2 of Specification
 */

/**
 * Grade a single question response
 * @param {Object} question - The question with options, tests, and expected output
 * @param {Object} response - The candidate's response
 * @param {Object} [codeRunResult] - Pre-evaluated unit tests for BUGFIX
 */
function gradeQuestion(question, response, codeRunResult = null) {
  const points = Number(question.points) || 1;
  let earnedPoints = 0;
  let isCorrect = false;

  switch (question.type) {
    case 'MCQ_SINGLE': {
      const selectedId = Array.isArray(response.selectedOptionIds) && response.selectedOptionIds.length > 0 
        ? response.selectedOptionIds[0] 
        : null;

      const correctOption = question.options?.find(opt => opt.isCorrect);
      if (correctOption && selectedId === correctOption.id) {
        earnedPoints = points;
        isCorrect = true;
      } else {
        earnedPoints = 0;
        isCorrect = false;
      }
      break;
    }

    case 'MCQ_MULTI': {
      const selected = new Set(response.selectedOptionIds || []);
      const correctOptionIds = question.options?.filter(opt => opt.isCorrect).map(opt => opt.id) || [];
      const totalCorrect = correctOptionIds.length;

      if (totalCorrect === 0) {
        earnedPoints = 0;
        isCorrect = false;
        break;
      }

      let correctSelected = 0;
      let wrongSelected = 0;

      selected.forEach(id => {
        if (correctOptionIds.includes(id)) {
          correctSelected++;
        } else {
          wrongSelected++;
        }
      });

      // Partial credit = (correct selected - wrong selected) / total correct, min 0
      const fraction = Math.max(0, (correctSelected - wrongSelected) / totalCorrect);
      earnedPoints = Number((points * fraction).toFixed(2));
      isCorrect = correctSelected === totalCorrect && wrongSelected === 0;
      break;
    }

    case 'OUTPUT': {
      const candidateAns = (response.textAnswer || '').trim().toLowerCase();
      const expected = (question.expectedOutput || '').trim().toLowerCase();

      // Normalize string spaces/quotes
      const cleanCand = candidateAns.replace(/\s+/g, ' ');
      const cleanExp = expected.replace(/\s+/g, ' ');

      if (cleanCand && cleanCand === cleanExp) {
        earnedPoints = points;
        isCorrect = true;
      } else {
        earnedPoints = 0;
        isCorrect = false;
      }
      break;
    }

    case 'BUGFIX': {
      if (codeRunResult && codeRunResult.totalTests > 0) {
        const passRatio = codeRunResult.passedCount / codeRunResult.totalTests;
        earnedPoints = Number((points * passRatio).toFixed(2));
        isCorrect = passRatio === 1;
      } else {
        earnedPoints = 0;
        isCorrect = false;
      }
      break;
    }

    default:
      earnedPoints = 0;
      isCorrect = false;
  }

  return {
    earnedPoints,
    isCorrect,
    maxPoints: points
  };
}

/**
 * Aggregate sector scores and tier classifications
 * Section 3.2 & 3.3
 */
function aggregateSectors(gradedResponses, sectors, roleProfiles = []) {
  // Group responses by sector
  const sectorMap = new Map();

  for (const s of sectors) {
    sectorMap.set(s.id, {
      sectorId: s.id,
      code: s.code,
      name: s.name,
      totalQuestions: 0,
      correctCount: 0,
      earnedPoints: 0,
      maxPoints: 0,
      scorePercentage: 0,
      tier: 'LOW'
    });
  }

  for (const item of gradedResponses) {
    const sId = item.question.sectorId;
    let sec = sectorMap.get(sId);
    if (!sec) {
      sec = {
        sectorId: sId,
        code: item.question.sector?.code || 'unknown',
        name: item.question.sector?.name || 'Unknown',
        totalQuestions: 0,
        correctCount: 0,
        earnedPoints: 0,
        maxPoints: 0,
        scorePercentage: 0,
        tier: 'LOW'
      };
      sectorMap.set(sId, sec);
    }

    sec.totalQuestions++;
    if (item.isCorrect) sec.correctCount++;
    sec.earnedPoints += Number(item.earnedPoints);
    sec.maxPoints += Number(item.maxPoints);
  }

  const results = [];
  for (const sec of sectorMap.values()) {
    if (sec.totalQuestions === 0) continue;

    const pct = sec.maxPoints > 0 ? Number(((sec.earnedPoints / sec.maxPoints) * 100).toFixed(2)) : 0;
    sec.scorePercentage = pct;

    // Check custom cutoffs in role_profiles or defaults
    const profile = roleProfiles.find(rp => rp.sectorId === sec.sectorId);
    const strongCutoff = profile?.strongCutoff ?? 75;
    const mediumCutoff = profile?.mediumCutoff ?? 50;

    if (sec.totalQuestions < 5) {
      sec.tier = 'INSUFFICIENT_DATA';
    } else if (pct >= strongCutoff) {
      sec.tier = 'STRONG';
    } else if (pct >= mediumCutoff) {
      sec.tier = 'MEDIUM';
    } else {
      sec.tier = 'LOW';
    }

    results.push(sec);
  }

  return results;
}

module.exports = {
  gradeQuestion,
  aggregateSectors
};

