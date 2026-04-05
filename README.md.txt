# Task Parser

自然文のタスク入力を、固定JSONに変換する練習用ツール。

## Input
日本語の自然文。1文でも複数文でもよい。

## Output
- title: タスクの短い要約
- dueDate: YYYY-MM-DD。わからなければ null
- tags: タスク内容を表す短いタグ
- category: work / personal / shopping / health / other

## Rules
- 日付が明確でなければ dueDate は null
- title は短く具体的にする
- tags は 1〜3 個
- category は必ず1つ

## Judgment Policy
- 曖昧な日付表現は dueDate を null にする
- 時刻は今回のスキーマでは保持しない
- 情報が少ない入力でも、最低限 title と category は返す
- 推測しすぎず、わからないものは null または控えめなタグにする
- title はできるだけ動詞を含む自然なタスク表現にする
- tags は具体物だけでなく、必要に応じて抽象タグ（例: 買い物, 食料, 書類）を使ってよい

## Findings
- 相対日付は基準日を与えると比較的安定する
- 曖昧な表現には dueDate を null で返せた
- 時刻はスキーマにないため無視できた
- tags の粒度はまだ揺れるので、後でルールを追加する余地がある
- title の表現も「買い物」/「買い物をする」の揺れがある

