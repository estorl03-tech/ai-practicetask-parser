const fs = require("fs");
const path = require("path");
const { parseTask } = require("./parser");

const examplesPath = path.join(__dirname, "examples.json");
const examples = JSON.parse(fs.readFileSync(examplesPath, "utf-8"));

function isEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

let passedCount = 0;

for (const example of examples) {
  const actual = parseTask(example.input);
  const passed = isEqual(actual, example.expected);

  if (passed) {
    passedCount += 1;
    console.log("PASS", example.input);
  } else {
    console.log("FAIL", example.input);
    console.log("expected:", example.expected);
    console.log("actual:", actual);
  }
}

console.log(`${passedCount}/${examples.length} examples passed`);
