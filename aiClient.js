const OpenAI = require("openai");

const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5.4-nano";
const OPENAI_TIMEOUT_MS = Number(process.env.OPENAI_TIMEOUT_MS || 8000);

const TASK_RESULT_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    dueDate: { type: ["string", "null"] },
    tags: {
      type: "array",
      items: { type: "string" }
    },
    category: {
      type: "string",
      enum: ["work", "personal", "shopping", "health", "other"]
    }
  },
  required: ["title", "dueDate", "tags", "category"],
  additionalProperties: false
};

let client = null;

function isAIConfigured() {
  return Boolean(process.env.OPENAI_API_KEY);
}

function getClient() {
  if (!isAIConfigured()) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  if (!client) {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  return client;
}

function validateAIResult(result) {
  if (!result || typeof result !== "object") {
    throw new Error("AI result must be an object");
  }

  if (typeof result.title !== "string" || result.title.trim() === "") {
    throw new Error("AI result title is invalid");
  }

  if (result.dueDate !== null && typeof result.dueDate !== "string") {
    throw new Error("AI result dueDate is invalid");
  }

  if (!Array.isArray(result.tags) || result.tags.length === 0 || result.tags.length > 3) {
    throw new Error("AI result tags are invalid");
  }

  if (!result.tags.every((tag) => typeof tag === "string" && tag.trim() !== "")) {
    throw new Error("AI result tags contain invalid values");
  }

  if (!["work", "personal", "shopping", "health", "other"].includes(result.category)) {
    throw new Error("AI result category is invalid");
  }

  return {
    title: result.title.trim(),
    dueDate: result.dueDate,
    tags: result.tags.map((tag) => tag.trim()),
    category: result.category
  };
}

function getTodayString() {
  return new Date().toISOString().slice(0, 10);
}

async function parseTaskWithAI(text) {
  const openai = getClient();
  const today = getTodayString();

  const response = await openai.responses.create(
    {
      model: OPENAI_MODEL,
      instructions: [
        "You are a task parsing assistant.",
        "Convert one Japanese natural-language task into structured JSON.",
        "Return only data that matches the provided schema.",
        `Today is ${today}.`,
        "Keep title short, natural, and focused on the main action.",
        "Prefer natural Japanese verb phrases such as '〜する', '〜に行く', or '〜を買う' when possible.",
        "Avoid unnatural noun-stacked titles.",
        "Do not force context words like route, time of day, or situation into the title unless they are essential to the task itself.",
        "Use relative dates like 明日, 明後日, 3日後, 来週火曜, and 金曜 based on today's date.",
        "If a date is unclear or ambiguous, set dueDate to null.",
        "Ignore times because the schema does not support them.",
        "tags must contain 1 to 3 short keywords.",
        "Do not over-infer missing details."
      ].join(" "),
      input: text,
      text: {
        format: {
          type: "json_schema",
          name: "task_result",
          strict: true,
          schema: TASK_RESULT_SCHEMA
        }
      }
    },
    {
      signal: AbortSignal.timeout(OPENAI_TIMEOUT_MS)
    }
  );

  if (!response.output_text) {
    throw new Error("AI response did not contain output_text");
  }

  const parsed = JSON.parse(response.output_text);
  return validateAIResult(parsed);
}

module.exports = {
  isAIConfigured,
  parseTaskWithAI
};
