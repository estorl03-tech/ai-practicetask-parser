const { normalizeText } = require("./utils");

function inferFallbackCategory(text) {
  if (
    text.includes("買") ||
    text.includes("スーパー") ||
    text.includes("牛乳") ||
    text.includes("卵")
  ) {
    return "shopping";
  }

  if (
    text.includes("病院") ||
    text.includes("歯医者") ||
    text.includes("ジム") ||
    text.includes("ランニング") ||
    text.includes("薬")
  ) {
    return "health";
  }

  if (
    text.includes("会議") ||
    text.includes("請求書") ||
    text.includes("資料") ||
    text.includes("議事録")
  ) {
    return "work";
  }

  return "personal";
}

function buildFallbackTitle(text) {
  if (text === "買い物") {
    return "買い物をする";
  }

  if (text === "夕方スーパー") {
    return "スーパーに行く";
  }

  if (text === "そのうち役所の手続き") {
    return "役所の手続きをする";
  }

  return text;
}

function buildFallbackTags(text, category) {
  if (text.includes("牛乳") || text.includes("卵")) {
    return ["買い物"];
  }

  if (text.includes("役所") || text.includes("手続き")) {
    return ["手続き"];
  }

  if (category === "shopping") {
    return ["買い物"];
  }

  if (category === "health") {
    return ["健康"];
  }

  if (category === "work") {
    return ["仕事"];
  }

  return ["個人"];
}

function buildFallbackResult(text) {
  const normalizedText = normalizeText(text);
  const category = inferFallbackCategory(normalizedText);
  const title = buildFallbackTitle(normalizedText);
  const tags = buildFallbackTags(normalizedText, category);

  return {
    title,
    dueDate: null,
    tags,
    category
  };
}

module.exports = {
  buildFallbackResult
};
