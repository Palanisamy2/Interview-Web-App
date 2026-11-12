const bcrypt = require('bcryptjs');
const {
  sequelize,
  User,
  Role,
  Stack,
  Sector,
  RoleProfile,
  TestBlueprint,
  BlueprintRule,
  Question,
  QuestionOption,
  BugfixSpec,
  BugfixTest
} = require('../models');

async function seed() {
  console.log('--- Starting Database Seeder ---');
  await sequelize.sync({ force: false });

  // 1. Seed Admin User
  const existingAdmin = await User.findOne({ where: { email: 'admin@skillassessment.com' } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    await User.create({
      email: 'admin@skillassessment.com',
      passwordHash,
      role: 'ADMIN'
    });
    console.log('✓ Admin user created: admin@skillassessment.com / admin123');
  }

  // 2. Seed Sectors
  const sectorsData = [
    { code: 'frontend', name: 'Frontend & UI State', description: 'DOM, rendering, state management, UI performance' },
    { code: 'backend', name: 'Backend & Server Logic', description: 'APIs, async, auth, business rules' },
    { code: 'database', name: 'Database & Data Layer', description: 'Schema, indexing, queries, ORM' },
    { code: 'debugging', name: 'Debugging & Edge Cases', description: 'Bug-fix, boundary values, defensive coding' },
    { code: 'architecture', name: 'System Architecture & Scalability', description: 'Caching, patterns, concurrency, modularity' },
    { code: 'fundamentals', name: 'Language Fundamentals', description: 'JS/TS core concepts, async execution, closures' }
  ];

  for (const s of sectorsData) {
    await Sector.findOrCreate({ where: { code: s.code }, defaults: s });
  }
  console.log('✓ Sectors seeded');

  const sectorMap = new Map((await Sector.findAll()).map(s => [s.code, s.id]));

  // 3. Seed Roles
  const rolesData = [
    { code: 'frontend', name: 'Frontend Engineer' },
    { code: 'backend', name: 'Backend Engineer' },
    { code: 'fullstack', name: 'Full Stack Engineer' }
  ];

  for (const r of rolesData) {
    await Role.findOrCreate({ where: { code: r.code }, defaults: r });
  }
  console.log('✓ Roles seeded');

  const roleMap = new Map((await Role.findAll()).map(r => [r.code, r.id]));

  // 4. Seed Stacks
  const stacksData = [
    { roleId: roleMap.get('frontend'), code: 'react', name: 'React' },
    { roleId: roleMap.get('frontend'), code: 'nextjs', name: 'Next.js' },
    { roleId: roleMap.get('backend'), code: 'nodejs', name: 'Node.js' },
    { roleId: roleMap.get('fullstack'), code: 'mern', name: 'MERN Stack' }
  ];

  for (const st of stacksData) {
    await Stack.findOrCreate({ where: { roleId: st.roleId, code: st.code }, defaults: st });
  }
  console.log('✓ Stacks seeded');

  const stackMap = new Map((await Stack.findAll()).map(s => [`${s.roleId}_${s.code}`, s.id]));

  // 5. Seed Role Profiles (Weights & Cutoffs)
  const feRoleId = roleMap.get('frontend');
  const beRoleId = roleMap.get('backend');

  const feProfiles = [
    { roleId: feRoleId, sectorId: sectorMap.get('frontend'), weight: 0.40, strongCutoff: 75, mediumCutoff: 50, minAcceptable: 60, isMandatory: true },
    { roleId: feRoleId, sectorId: sectorMap.get('fundamentals'), weight: 0.20, strongCutoff: 70, mediumCutoff: 50, minAcceptable: 50, isMandatory: false },
    { roleId: feRoleId, sectorId: sectorMap.get('debugging'), weight: 0.20, strongCutoff: 70, mediumCutoff: 50, minAcceptable: 50, isMandatory: false },
    { roleId: feRoleId, sectorId: sectorMap.get('architecture'), weight: 0.10, strongCutoff: 60, mediumCutoff: 50, minAcceptable: 40, isMandatory: false },
    { roleId: feRoleId, sectorId: sectorMap.get('database'), weight: 0.10, strongCutoff: 60, mediumCutoff: 50, minAcceptable: 40, isMandatory: false }
  ];

  const beProfiles = [
    { roleId: beRoleId, sectorId: sectorMap.get('backend'), weight: 0.40, strongCutoff: 75, mediumCutoff: 50, minAcceptable: 60, isMandatory: true },
    { roleId: beRoleId, sectorId: sectorMap.get('database'), weight: 0.25, strongCutoff: 70, mediumCutoff: 50, minAcceptable: 50, isMandatory: true },
    { roleId: beRoleId, sectorId: sectorMap.get('fundamentals'), weight: 0.15, strongCutoff: 70, mediumCutoff: 50, minAcceptable: 50, isMandatory: false },
    { roleId: beRoleId, sectorId: sectorMap.get('debugging'), weight: 0.10, strongCutoff: 70, mediumCutoff: 50, minAcceptable: 50, isMandatory: false },
    { roleId: beRoleId, sectorId: sectorMap.get('architecture'), weight: 0.10, strongCutoff: 65, mediumCutoff: 50, minAcceptable: 45, isMandatory: false }
  ];

  for (const p of [...feProfiles, ...beProfiles]) {
    await RoleProfile.findOrCreate({
      where: { roleId: p.roleId, sectorId: p.sectorId },
      defaults: p
    });
  }
  console.log('✓ Role profiles seeded');

  // 6. Seed Blueprints
  const reactStackId = stackMap.get(`${feRoleId}_react`);
  const nodeStackId = stackMap.get(`${beRoleId}_nodejs`);

  const [feBlueprint] = await TestBlueprint.findOrCreate({
    where: { roleId: feRoleId, stackId: reactStackId },
    defaults: {
      roleId: feRoleId,
      stackId: reactStackId,
      name: 'Frontend Engineer (React) Assessment',
      durationMinutes: 45,
      isActive: true
    }
  });

  const [beBlueprint] = await TestBlueprint.findOrCreate({
    where: { roleId: beRoleId, stackId: nodeStackId },
    defaults: {
      roleId: beRoleId,
      stackId: nodeStackId,
      name: 'Backend Engineer (Node.js) Assessment',
      durationMinutes: 45,
      isActive: true
    }
  });

  // Blueprint rules for Frontend
  const feRules = [
    { blueprintId: feBlueprint.id, sectorId: sectorMap.get('frontend'), stackId: reactStackId, easyCount: 2, mediumCount: 2, hardCount: 1 },
    { blueprintId: feBlueprint.id, sectorId: sectorMap.get('fundamentals'), stackId: null, easyCount: 1, mediumCount: 1, hardCount: 1 },
    { blueprintId: feBlueprint.id, sectorId: sectorMap.get('debugging'), stackId: null, easyCount: 1, mediumCount: 1, hardCount: 1 },
    { blueprintId: feBlueprint.id, sectorId: sectorMap.get('architecture'), stackId: null, easyCount: 1, mediumCount: 1, hardCount: 0 }
  ];

  for (const r of feRules) {
    await BlueprintRule.findOrCreate({
      where: { blueprintId: r.blueprintId, sectorId: r.sectorId },
      defaults: r
    });
  }
  console.log('✓ Test blueprints & rules seeded');

  // 7. Seed Question Bank
  const count = await Question.count();
  if (count === 0) {
    console.log('Seeding Question Bank...');

    // React Single MCQ
    const q1 = await Question.create({
      type: 'MCQ_SINGLE',
      sectorId: sectorMap.get('frontend'),
      stackId: reactStackId,
      language: 'javascript',
      difficulty: 'MEDIUM',
      points: 2,
      title: 'useEffect Dependency Array Semantics',
      body: 'What happens if a `useEffect` hook is passed an empty dependency array `[]` in a React component?',
      explanation: 'An empty dependency array instructs React to execute the effect once after the component mounts and clean it up when unmounting.',
      tags: ['react', 'hooks', 'lifecycle'],
      status: 'APPROVED'
    });
    await QuestionOption.bulkCreate([
      { questionId: q1.id, label: 'A', text: 'It runs after every single render and state update.', isCorrect: false },
      { questionId: q1.id, label: 'B', text: 'It runs exactly once after the initial component mount.', isCorrect: true },
      { questionId: q1.id, label: 'C', text: 'It runs only when component props change.', isCorrect: false },
      { questionId: q1.id, label: 'D', text: 'It never runs.', isCorrect: false }
    ]);

    // React Multi MCQ
    const q2 = await Question.create({
      type: 'MCQ_MULTI',
      sectorId: sectorMap.get('frontend'),
      stackId: reactStackId,
      language: 'javascript',
      difficulty: 'HARD',
      points: 3,
      title: 'React Performance Optimization Techniques',
      body: 'Which of the following techniques prevent unnecessary child component re-renders in React? (Select all that apply)',
      explanation: 'React.memo memoizes the rendered output, while useCallback and useMemo maintain stable references across renders.',
      tags: ['react', 'performance', 'rendering'],
      status: 'APPROVED'
    });
    await QuestionOption.bulkCreate([
      { questionId: q2.id, label: 'A', text: 'Wrapping child components with React.memo()', isCorrect: true },
      { questionId: q2.id, label: 'B', text: 'Passing callbacks memoized with useCallback()', isCorrect: true },
      { questionId: q2.id, label: 'C', text: 'Defining inline objects and arrow functions directly in JSX props', isCorrect: false },
      { questionId: q2.id, label: 'D', text: 'Memoizing expensive calculations with useMemo()', isCorrect: true }
    ]);

    // JavaScript Fundamentals Single MCQ
    const q3 = await Question.create({
      type: 'MCQ_SINGLE',
      sectorId: sectorMap.get('fundamentals'),
      stackId: null,
      language: 'javascript',
      difficulty: 'EASY',
      points: 1,
      title: 'JavaScript Event Loop Microtask vs Macrotask',
      body: 'In modern JavaScript runtimes, which queue takes priority when the call stack clears?',
      explanation: 'The Microtask queue (Promises, queueMicrotask) is completely drained before processing items from the Macrotask (Callback/Timer) queue.',
      tags: ['javascript', 'event-loop', 'async'],
      status: 'APPROVED'
    });
    await QuestionOption.bulkCreate([
      { questionId: q3.id, label: 'A', text: 'Microtask queue (Promise callbacks, queueMicrotask)', isCorrect: true },
      { questionId: q3.id, label: 'B', text: 'Macrotask queue (setTimeout, setInterval)', isCorrect: false },
      { questionId: q3.id, label: 'C', text: 'Both are processed simultaneously in parallel threads', isCorrect: false },
      { questionId: q3.id, label: 'D', text: 'Whichever task was registered first regardless of queue', isCorrect: false }
    ]);

    // Output Prediction
    const q4 = await Question.create({
      type: 'OUTPUT',
      sectorId: sectorMap.get('fundamentals'),
      stackId: null,
      language: 'javascript',
      difficulty: 'MEDIUM',
      points: 2,
      title: 'Promise and Event Loop Output Prediction',
      body: `What will be printed to stdout when the following JavaScript snippet executes?
\`\`\`javascript
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');
\`\`\`
*(Enter the printed numbers separated by spaces, e.g. "1 2 3 4")*`,
      explanation: 'Synchronous logs 1 and 4 run first, then microtask 3, then macrotask 2. Result: 1 4 3 2.',
      expectedOutput: '1 4 3 2',
      tags: ['javascript', 'output', 'promises'],
      status: 'APPROVED'
    });

    // Bugfix 1 (Code Execution)
    const q5 = await Question.create({
      type: 'BUGFIX',
      sectorId: sectorMap.get('debugging'),
      stackId: null,
      language: 'javascript',
      difficulty: 'HARD',
      points: 3,
      title: 'Bugfix: Array Pagination Utility',
      body: `The following function is supposed to return a slice of \`items\` for the specified 1-indexed \`page\` and \`pageSize\`.
Currently it fails to handle boundary conditions and incorrect offsets.
Fix the function \`paginate(items, page, pageSize)\` so that it passes all test cases.`,
      tags: ['debugging', 'algorithms', 'arrays'],
      status: 'APPROVED'
    });
    await BugfixSpec.create({
      questionId: q5.id,
      language: 'javascript',
      starterCode: `function paginate(items, page, pageSize) {
  // Buggy implementation: fix offset and bounds
  const start = page * pageSize; 
  const end = start + pageSize;
  return items.slice(start, end);
}`,
      timeLimitMs: 2000,
      memoryLimitKb: 128000
    });
    await BugfixTest.bulkCreate([
      {
        questionId: q5.id,
        input: '[1, 2, 3, 4, 5, 6, 7], 1, 3',
        expectedOutput: '[1,2,3]',
        isHidden: false
      },
      {
        questionId: q5.id,
        input: '[1, 2, 3, 4, 5, 6, 7], 3, 3',
        expectedOutput: '[7]',
        isHidden: false
      },
      {
        questionId: q5.id,
        input: '[1, 2, 3], 4, 2',
        expectedOutput: '[]',
        isHidden: true
      },
      {
        questionId: q5.id,
        input: '[], 1, 5',
        expectedOutput: '[]',
        isHidden: true
      }
    ]);

    // Bugfix 2 (Code Execution)
    const q6 = await Question.create({
      type: 'BUGFIX',
      sectorId: sectorMap.get('debugging'),
      stackId: null,
      language: 'javascript',
      difficulty: 'MEDIUM',
      points: 2,
      title: 'Bugfix: Safe Property Extractor',
      body: `Fix the function \`getNested(obj, path, defaultValue)\` which extracts a nested value by dot notation path (e.g., \`"user.profile.age"\`). It should return \`defaultValue\` if any intermediate key does not exist or is null/undefined.`,
      tags: ['debugging', 'objects', 'defensive-coding'],
      status: 'APPROVED'
    });
    await BugfixSpec.create({
      questionId: q6.id,
      language: 'javascript',
      starterCode: `function getNested(obj, path, defaultValue) {
  const keys = path.split('.');
  let current = obj;
  for (let key of keys) {
    current = current[key]; // Causes error if current is null or undefined!
  }
  return current;
}`,
      timeLimitMs: 2000,
      memoryLimitKb: 128000
    });
    await BugfixTest.bulkCreate([
      {
        questionId: q6.id,
        input: '{ a: { b: 42 } }, "a.b", null',
        expectedOutput: '42',
        isHidden: false
      },
      {
        questionId: q6.id,
        input: '{ a: null }, "a.b.c", "default"',
        expectedOutput: '"default"',
        isHidden: false
      },
      {
        questionId: q6.id,
        input: '{}, "x.y.z", 0',
        expectedOutput: '0',
        isHidden: true
      }
    ]);

    // Architecture Single MCQ
    const q7 = await Question.create({
      type: 'MCQ_SINGLE',
      sectorId: sectorMap.get('architecture'),
      stackId: null,
      language: 'javascript',
      difficulty: 'MEDIUM',
      points: 2,
      title: 'Database Connection Pool Exhaustion',
      body: 'Under high traffic spikes, an Express API begins failing with "Connection timeout from pool". What is the most effective immediate architectural remedy?',
      explanation: 'Introducing queueing/rate-limiting or using an external connection pooler (e.g. PgBouncer) prevents overwhelming database worker threads.',
      tags: ['architecture', 'database', 'scalability'],
      status: 'APPROVED'
    });
    await QuestionOption.bulkCreate([
      { questionId: q7.id, label: 'A', text: 'Increase max pool size indefinitely on each API server container.', isCorrect: false },
      { questionId: q7.id, label: 'B', text: 'Use a connection pooler like PgBouncer and enforce API request timeouts and queues.', isCorrect: true },
      { questionId: q7.id, label: 'C', text: 'Switch database from PostgreSQL to file-based storage.', isCorrect: false },
      { questionId: q7.id, label: 'D', text: 'Disable database transactions entirely.', isCorrect: false }
    ]);

    // Database Single MCQ
    const q8 = await Question.create({
      type: 'MCQ_SINGLE',
      sectorId: sectorMap.get('database'),
      stackId: null,
      language: 'sql',
      difficulty: 'EASY',
      points: 1,
      title: 'SQL Indexing B-Tree Suitability',
      body: 'Which of the following query operations benefits the MOST from a standard B-Tree index on a PostgreSQL column?',
      explanation: 'B-Tree indexes are optimized for equality (=) and range queries (<, <=, >, >=, BETWEEN).',
      tags: ['database', 'postgresql', 'indexes'],
      status: 'APPROVED'
    });
    await QuestionOption.bulkCreate([
      { questionId: q8.id, label: 'A', text: 'Range and equality lookups (e.g., WHERE age BETWEEN 20 AND 30)', isCorrect: true },
      { questionId: q8.id, label: 'B', text: 'Full wildcard substring matches (e.g., WHERE name LIKE "%smith%")', isCorrect: false },
      { questionId: q8.id, label: 'C', text: 'Generating UUID v4 random values', isCorrect: false },
      { questionId: q8.id, label: 'D', text: 'SELECT * FROM table without a WHERE clause', isCorrect: false }
    ]);

    // Backend Node.js Single MCQ
    const q9 = await Question.create({
      type: 'MCQ_SINGLE',
      sectorId: sectorMap.get('backend'),
      stackId: nodeStackId,
      language: 'javascript',
      difficulty: 'MEDIUM',
      points: 2,
      title: 'Express Error Handling Middleware Signature',
      body: 'In Express.js, what is the required function signature for error-handling middleware?',
      explanation: 'Express detects error middleware by checking `fn.length === 4`, requiring `(err, req, res, next)`.',
      tags: ['nodejs', 'express', 'middleware'],
      status: 'APPROVED'
    });
    await QuestionOption.bulkCreate([
      { questionId: q9.id, label: 'A', text: '(req, res, next)', isCorrect: false },
      { questionId: q9.id, label: 'B', text: '(err, req, res, next)', isCorrect: true },
      { questionId: q9.id, label: 'C', text: '(err, res)', isCorrect: false },
      { questionId: q9.id, label: 'D', text: '(error, callback)', isCorrect: false }
    ]);

    console.log('✓ Questions seeded successfully');
  }

  console.log('--- Database Seeding Complete ---');
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Seeding error:', err);
      process.exit(1);
    });
}

module.exports = seed;

