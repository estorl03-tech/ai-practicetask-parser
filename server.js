require("dotenv").config();

const express = require("express");
const rateLimit = require("express-rate-limit");
const { isAIConfigured, parseTaskWithAI } = require("./aiClient");
const { parseTask, inferDueDateForText } = require("./parser");
const { buildFallbackResult } = require("./fallback");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const JSON_LIMIT = process.env.JSON_LIMIT || "16kb";
const MAX_INPUT_LENGTH = Number(process.env.MAX_INPUT_LENGTH || 150);
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 10 * 60 * 1000);
const RATE_LIMIT_MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX_REQUESTS || 5);

app.use(express.json({ limit: JSON_LIMIT }));
app.use(express.static("public"));

const parseTaskLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    result: null,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "アクセスが多すぎます。しばらく待ってから再試行してください。"
    },
    meta: {
      usedFallback: false
    }
  }
});

app.post("/parse-task", parseTaskLimiter, async (req, res) => {
  const { text } = req.body ?? {};

  const textLength = typeof text === "string" ? text.trim().length : null;

  console.log("[request]", { hasText: typeof text === "string", textLength });

  if (typeof text !== "string" || text.trim() === "") {
    console.log("[error]", {
      code: "INVALID_INPUT",
      message: "text は空でない文字列である必要があります。",
      textLength
    });

    return res.status(400).json({
      ok: false,
      result: null,
      error: {
        code: "INVALID_INPUT",
        message: "text は空でない文字列である必要があります。"
      },
      meta: {
        usedFallback: false
      }
    });
  }

  if (textLength > MAX_INPUT_LENGTH) {
    console.log("[error]", {
      code: "INPUT_TOO_LONG",
      message: `text は ${MAX_INPUT_LENGTH} 文字以内である必要があります。`,
      textLength
    });

    return res.status(400).json({
      ok: false,
      result: null,
      error: {
        code: "INPUT_TOO_LONG",
        message: `text は ${MAX_INPUT_LENGTH} 文字以内である必要があります。`
      },
      meta: {
        usedFallback: false
      }
    });
  }

  const aiConfigured = isAIConfigured();

  if (aiConfigured) {
    try {
      const aiResult = await parseTaskWithAI(text);
      const inferredDueDate = inferDueDateForText(text);
      const result = inferredDueDate
        ? {
            ...aiResult,
            dueDate: inferredDueDate
          }
        : aiResult;

      console.log("[result]", {
        source: "openai",
        usedFallback: false,
        category: result.category,
        title: result.title,
        dueDate: result.dueDate,
        textLength
      });

      return res.status(200).json({
        ok: true,
        result,
        error: null,
        meta: {
          usedFallback: false,
          source: "openai"
        }
      });
    } catch (error) {
      console.log("[ai-error]", {
        name: error.name,
        message: error.message,
        textLength
      });
    }
  }

  try {
    const result = parseTask(text);

    console.log("[result]", {
      source: "rule_based",
      usedFallback: aiConfigured,
      category: result.category,
      title: result.title,
      textLength
    });

    return res.status(200).json({
      ok: true,
      result,
      error: null,
      meta: {
        usedFallback: aiConfigured,
        source: "rule_based"
      }
    });
  } catch (error) {
    const fallbackResult = buildFallbackResult(text);

    console.log("[result]", {
      source: "fallback",
      usedFallback: true,
      category: fallbackResult.category,
      title: fallbackResult.title,
      textLength
    });

    return res.status(200).json({
      ok: true,
      result: fallbackResult,
      error: null,
      meta: {
        usedFallback: true,
        source: "fallback"
      }
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
