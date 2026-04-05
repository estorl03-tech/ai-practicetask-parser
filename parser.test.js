const { parseTask } = require("./parser");

const successCases = [
  {
    input: "牛乳と卵を買う",
    expected: {
      title: "牛乳と卵を買う",
      dueDate: null,
      tags: ["買い物", "食料"],
      category: "shopping"
    }
  },
  {
    input: "会議の議事録まとめる",
    expected: {
      title: "会議の議事録をまとめる",
      dueDate: null,
      tags: ["会議", "議事録"],
      category: "work"
    }
  },
  {
    input: "明日までに請求書を送る",
    expected: {
      title: "請求書を送る",
      dueDate: "2026-04-04",
      tags: ["請求書", "送付"],
      category: "work"
    }
  },
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
    input: "夕方スーパー",
    expected: {
      title: "スーパーに行く",
      dueDate: null,
      tags: ["買い物"],
      category: "shopping"
    }
  },
  {
    input: "明後日ジム行く",
    expected: {
      title: "ジムに行く",
      dueDate: "2026-04-05",
      tags: ["ジム","運動"],
      category: "health"
    }
  }
];

const errorCases = [
  {
    input: "強制エラー そのうち役所の手続き",
    expectedMessage: "forced parser error"
  }
];

function isEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

let passedCount = 0;
let totalCount = 0;

for (const testCase of successCases) {
  totalCount += 1;

  const actual = parseTask(testCase.input);
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

for (const testCase of errorCases) {
  totalCount += 1;

  try {
    parseTask(testCase.input);
    console.log("FAIL", testCase.input);
    console.log("expected error:", testCase.expectedMessage);
    console.log("actual: no error");
  } catch (error) {
    if (error.message === testCase.expectedMessage) {
      passedCount += 1;
      console.log("PASS", testCase.input);
    } else {
      console.log("FAIL", testCase.input);
      console.log("expected error:", testCase.expectedMessage);
      console.log("actual error:", error.message);
    }
  }
}

console.log(`${passedCount}/${totalCount} tests passed`);
