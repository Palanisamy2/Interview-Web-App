/**
 * Role-Fit Engine
 * Implements Section 3.5 & 3.6 of Specification
 */

function tier(pct, strong = 75, medium = 50) {
  if (pct >= strong) return 'STRONG';
  if (pct >= medium) return 'MEDIUM';
  return 'LOW';
}

function fitForRole(scores, profile) {
  let weighted = 0;
  let totalWeight = 0;
  let hardFails = 0;

  for (const p of profile) {
    const s = scores.find(x => x.sectorId === p.sectorId);
    const pct = s ? Number(s.scorePercentage || s.pct || 0) : 0;
    const boundedPct = Math.min(pct, 100);
    const weight = Number(p.weight);

    weighted += boundedPct * weight;
    totalWeight += weight;

    if (p.isMandatory && pct < Number(p.minAcceptable)) {
      hardFails++;
    }
  }

  const fit = totalWeight ? Number((weighted / totalWeight).toFixed(2)) : 0;
  return { fit, hardFails };
}

function levelFor(fit) {
  if (fit >= 85) return 'Senior / Independent';
  if (fit >= 70) return 'Mid-Level';
  if (fit >= 55) return 'Junior (needs mentorship)';
  return 'Not recommended';
}

/**
 * Recommend role outcome & alternative roles
 * @param {number} appliedRoleId 
 * @param {Array} scores - [{ sectorId, scorePercentage }]
 * @param {Map<number, Array>|Object} allProfiles - Map or Object keyed by roleId to roleProfile array
 * @param {Array} roles - All role objects [{ id, name, code }]
 */
function recommend(appliedRoleId, scores, allProfiles, roles = []) {
  const profileEntries = allProfiles instanceof Map 
    ? [...allProfiles.entries()] 
    : Object.entries(allProfiles).map(([k, v]) => [Number(k), v]);

  const results = profileEntries.map(([roleId, profile]) => {
    const fitData = fitForRole(scores, profile);
    const roleObj = roles.find(r => r.id === roleId);
    return {
      roleId,
      roleName: roleObj ? roleObj.name : `Role #${roleId}`,
      ...fitData
    };
  });

  const applied = results.find(r => r.roleId === appliedRoleId) || {
    roleId: appliedRoleId,
    roleName: 'Applied Role',
    fit: 0,
    hardFails: 0
  };

  let verdict = 'NOT_RECOMMENDED';
  if (applied.hardFails >= 2) {
    verdict = 'NOT_RECOMMENDED';
  } else if (applied.hardFails === 1) {
    verdict = 'BORDERLINE';
  } else if (applied.fit >= 55) {
    verdict = 'RECOMMENDED';
  } else {
    verdict = 'NOT_RECOMMENDED';
  }

  const level = levelFor(applied.fit);

  const alternatives = results
    .filter(r => r.roleId !== appliedRoleId && r.hardFails === 0 && r.fit >= 65)
    .sort((a, b) => b.fit - a.fit);

  let fitSummary = `${applied.roleName}: ${verdict} (${applied.fit}% match, evaluated as ${level}).`;
  if (applied.hardFails > 0) {
    fitSummary += ` Note: Candidate fell below minimum cutoff in ${applied.hardFails} mandatory sector(s).`;
  }
  if (alternatives.length > 0) {
    fitSummary += ` Alternative matches found: ${alternatives.map(a => `${a.roleName} (${a.fit}%)`).join(', ')}.`;
  }

  return {
    verdict,
    level,
    overallScore: applied.fit,
    applied,
    alternatives,
    fitSummary
  };
}

module.exports = {
  tier,
  fitForRole,
  levelFor,
  recommend
};

