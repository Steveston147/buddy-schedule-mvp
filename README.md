# Buddy Schedule MVP (StackBlitz JSON版)

StackBlitz / WebContainer で Prisma のエンジンDLが失敗しやすいため、
このブランチ/ZIPは **JSON永続化**（`.data/db.json`）で動くMVPです。

## セットアップ
1. `.env.example` をコピーして `.env` を作成
2. `npm install`
3. `npm run dev`

Seeded admin:
- `admin@example.com` / `admin1234`（`.env` で変更可）

## ルート
- `/login`
- `/admin` (adminのみ)
- `/buddy` (buddyのみ)

## 永続化
- `.data/db.json` に保存（Git管理しない）
