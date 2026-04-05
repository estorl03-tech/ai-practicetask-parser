# Day 6 Findings

## What improved
- 固定レスポンスをやめて、入力内容に応じて返し分けできるようになった
- 明日という相対表現を dueDate に変換できた
- shopping / health / work / personal の簡易分類ができるようになった
- title を一部の入力で自然な表現に整形できた
- tags を入力に応じて返し分けできるようになった

## Current limitations
- 日付判定は「明日」しか対応していない
- category 判定はキーワード一致だけなので雑
- title 整形は個別ルール依存
- tags の粒度はまだ不安定

## Next step
- ルールベース処理を別ファイルに分離する
- テスト入力を増やしてズレを確認する
- fallback の挙動をコードに反映する
