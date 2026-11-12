const vm = require('vm');

/**
 * Executes a candidate's JavaScript code against a set of unit test inputs and expected outputs.
 * Uses Node.js 'vm' in a sandbox with a timeout to prevent infinite loops and unauthorized access.
 */
async function runCodeInSandbox(userCode, tests, options = {}) {
  const timeoutMs = options.timeoutMs || 2500;
  const results = [];
  let totalPassed = 0;

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    const input = test.input !== undefined && test.input !== null ? test.input : '';
    const expected = test.expectedOutput !== undefined ? test.expectedOutput : test.expected;
    const isHidden = !!test.isHidden;

    const logs = [];
    const sandbox = {
      console: {
        log: (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
        error: (...args) => logs.push('[ERROR] ' + args.join(' ')),
        warn: (...args) => logs.push('[WARN] ' + args.join(' '))
      },
      setTimeout: () => { throw new Error('Async timers not permitted'); },
      setInterval: () => { throw new Error('Async timers not permitted'); }
    };

    const context = vm.createContext(sandbox);

    // Prepare harness script
    // Test input can be a function argument list e.g. "[1,2,3], 2" or scalar
    const wrapperScript = `
      "use strict";
      ${userCode}

      (function() {
        let fn = null;
        // Find the exported or declared top-level function
        if (typeof solution === 'function') {
          fn = solution;
        } else if (typeof main === 'function') {
          fn = main;
        } else {
          // Find first defined function
          const definedFns = Object.keys(this).filter(k => typeof this[k] === 'function' && k !== 'setTimeout' && k !== 'setInterval');
          if (definedFns.length > 0) {
            fn = this[definedFns[definedFns.length - 1]];
          }
        }

        if (!fn) {
          throw new Error('No function found in candidate code. Please declare a function or name it "solution"');
        }

        let inputArgs = [];
        try {
          // If input is formatted like "[1, 2, 3], 2", wrap in array to parse
          inputArgs = eval("[" + ${JSON.stringify(input)} + "]");
        } catch(e) {
          inputArgs = [${JSON.stringify(input)}];
        }

        const res = fn.apply(null, inputArgs);
        return typeof res === 'undefined' ? 'undefined' : JSON.stringify(res);
      })();
    `;

    const startTime = Date.now();
    let actualOutput = '';
    let passed = false;
    let error = null;

    try {
      const result = vm.runInContext(wrapperScript, context, {
        timeout: timeoutMs
      });
      actualOutput = String(result);

      // Compare actual vs expected
      // Normalize JSON / strings for comparison
      const normExpected = String(expected).trim();
      const normActual = actualOutput.trim();

      if (normActual === normExpected) {
        passed = true;
      } else {
        // Try parsing JSON equivalence
        try {
          if (JSON.stringify(JSON.parse(normActual)) === JSON.stringify(JSON.parse(normExpected))) {
            passed = true;
          }
        } catch (_) {}
      }
    } catch (err) {
      error = err.message || String(err);
      actualOutput = error;
    }

    const duration = Date.now() - startTime;
    if (passed) totalPassed++;

    results.push({
      testIndex: i + 1,
      input: isHidden ? '[Hidden Test Input]' : input,
      expected: isHidden ? '[Hidden]' : expected,
      actual: isHidden && !passed ? 'Test failed on hidden case' : actualOutput,
      passed,
      isHidden,
      durationMs: duration,
      error: error,
      logs: isHidden ? [] : logs
    });
  }

  return {
    totalTests: tests.length,
    passedCount: totalPassed,
    allPassed: totalPassed === tests.length,
    testResults: results
  };
}

module.exports = {
  runCodeInSandbox
};

