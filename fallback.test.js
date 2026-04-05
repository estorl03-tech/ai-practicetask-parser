const { buildFallbackResult } = require("./fallback");

const testCases = [
  {
    input: "買い物",
    expected: {
      title: "買い物をする",
      dueDate: null,
      tags: ["買い物"],
      category: "shopping"
    }
  },
  {
    input: "そのうち役所の手続き",
    expected: {
      title: "役所の手続きをする",
      dueDate: null,
      tags: ["手続き"],
      category: "personal"
    }
  },
  {
    input: "夕方スーパー",
    expected: {
      title: "スーパーに行く",
      dueDate: null,
      tags: ["買い物"],
      category: "shopping"
    }
  }
];

function isEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

let passedCount = 0;

for (const testCase of testCases) {
  const actual = buildFallbackResult(testCase.input);
  const passed = isEqual(actual, testCase.expected);

  if (passed) {
    passedCount += 1;
    console.log("PASS", testCase.input);
  } else {
    console.log("FAIL", testCase.input);
    console.log("expected:", testCase.expected);
    console.log("actual:", actual);
  }
}

console.log(`${passedCount}/${testCases.length} tests passed`);
