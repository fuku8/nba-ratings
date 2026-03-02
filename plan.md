# NBA Net Rating Visualizer — Next.js 移行計画

## 1. 現行Streamlitアプリの評価

### 概要
- **フレームワーク**: Streamlit (Python)
- **データソース**: Basketball Reference（Webスクレイピング、pandas.read_html）
- **データ更新**: GitHub Actions で毎日自動取得 → CSV保存
- **デプロイ**: Streamlit Cloud

### 機能一覧
| ページ | 内容 |
|--------|------|
| チームレーティング | 全30チームの ORtg / DRtg / NRtg をソート可能なテーブルで表示 |
| チーム別選手 | チーム選択 → 所属選手の OWS / DWS / WS / GP を表示 |
| 選手検索 | 名前で部分一致検索（複数名対応） |
| 全選手レーティング | 全選手一覧（最低20試合出場フィルタ付き） |

### 評価
| 項目 | 評価 |
|------|------|
| データ鮮度 | △ 1日1回更新（十分だがリアルタイム性なし） |
| UI/UX | △ Streamlit標準テーブル、グラフなし、モバイル非最適化 |
| パフォーマンス | △ 全選手ページは読み込み遅延あり |
| 指標の適切さ | △ チームはNRtg（良い）、選手はWin Shares（NRtgではない） |
| スケーラビリティ | × Streamlit Cloud依存、カスタマイズ制限あり |

### 改善ポイント
1. **選手の指標**: 現行は Win Shares だが、Net Rating（個人）を表示すべき
2. **ビジュアル**: チャート/グラフがない → 散布図やバーチャートで視覚化
3. **モバイル対応**: レスポンシブデザイン
4. **インタラクション**: フィルタ、比較機能、ツールチップ

---

## 2. データソース / API の検討

### 選手 Net Rating を取得できるAPI

| API | 選手NRtg | チームNRtg | 無料枠 | 備考 |
|-----|----------|-----------|--------|------|
| **Basketball Reference (スクレイピング)** | ✅ (advanced stats) | ✅ | 無料 | 現行方式。fragileだが安定実績あり |
| **nba_api (stats.nba.com)** | ✅ | ✅ | 無料 | クラウドホスティングからブロックされる場合あり |
| **BallDontLie API** | ✅ (v1 advanced) | ✅ | 有料($9.99/月〜) | `net_rating`, `offensive_rating`, `defensive_rating` あり |
| **stats.nba.com 直接アクセス** | ✅ | ✅ | 無料 | レート制限あり、CORSブロックあり（サーバーサイド必須） |
| **SportsDataIO** | ✅ | ✅ | 有料 | エンタープライズ向け |

### 推奨: stats.nba.com API（サーバーサイド）+ Basketball Reference フォールバック

**理由**:
- **stats.nba.com** は最も正確で公式なデータ。選手の Net Rating を直接取得可能
  - エンドポイント例: `leaguedashplayerstats` (NetRating パラメータ)
  - `leaguedashteamstats` でチーム Net Rating も取得可能
- Next.js の API Routes / Server Actions からアクセスすれば CORS 問題を回避
- **無料**で利用可能
- フォールバックとして Basketball Reference スクレイピングを維持

**主要エンドポイント**:
```
# チームレーティング
GET https://stats.nba.com/stats/leaguedashteamstats
  ?Season=2025-26&MeasureType=Advanced&PerMode=PerGame

# 選手レーティング（Net Rating含む）
GET https://stats.nba.com/stats/leaguedashplayerstats
  ?Season=2025-26&MeasureType=Advanced&PerMode=PerGame

# 返却フィールド: NET_RATING, OFF_RATING, DEF_RATING, PACE, PIE 等
```

**代替案（有料でもOKな場合）**: BallDontLie API ($9.99/月)
- REST API で設計がクリーン
- TypeScript SDK あり (`@balldontlie/sdk`)
- `net_rating`, `offensive_rating`, `defensive_rating` を直接取得可能

---

## 3. Next.js アプリ設計

### 技術スタック

| レイヤー | 技術 |
|----------|------|
| フレームワーク | **Next.js 15** (App Router) |
| 言語 | **TypeScript** |
| スタイリング | **Tailwind CSS v4** |
| UIコンポーネント | **shadcn/ui** (Table, Card, Tabs, Select, Input 等) |
| チャート | **Recharts** (散布図、バーチャート) |
| データフェッチ | Next.js Server Actions + fetch (stats.nba.com) |
| キャッシュ | Next.js ISR (Incremental Static Regeneration) / revalidate |
| デプロイ | **Vercel** |

### ディレクトリ構成

```
nba-ratin/
├── app/
│   ├── layout.tsx              # ルートレイアウト（ナビゲーション、テーマ）
│   ├── page.tsx                # トップ（チームレーティング）
│   ├── players/
│   │   └── page.tsx            # 全選手レーティング
│   ├── team/
│   │   └── [teamId]/
│   │       └── page.tsx        # チーム別選手
│   ├── search/
│   │   └── page.tsx            # 選手検索
│   └── compare/
│       └── page.tsx            # 【新機能】選手/チーム比較
├── components/
│   ├── ui/                     # shadcn/ui コンポーネント
│   ├── team-ratings-table.tsx  # チームレーティングテーブル
│   ├── player-ratings-table.tsx# 選手レーティングテーブル
│   ├── rating-scatter-chart.tsx# ORtg vs DRtg 散布図
│   ├── rating-bar-chart.tsx    # NRtg バーチャート
│   ├── player-search.tsx       # 選手検索フォーム
│   ├── navigation.tsx          # ナビゲーションバー
│   ├── sort-controls.tsx       # ソートコントロール
│   └── metric-legend.tsx       # 指標説明
├── lib/
│   ├── nba-api.ts              # stats.nba.com API クライアント
│   ├── basketball-ref.ts       # Basketball Reference フォールバック
│   ├── types.ts                # TypeScript 型定義
│   └── utils.ts                # ユーティリティ
├── public/
│   └── nba-logos/              # チームロゴ（任意）
├── tailwind.config.ts
├── next.config.ts
├── package.json
└── tsconfig.json
```

### ページ詳細設計

#### 1. チームレーティング (`/`)
- 全30チームの **ORtg / DRtg / NRtg** をテーブル表示
- **散布図**: X軸=ORtg, Y軸=DRtg（右下が最強チーム）
- **バーチャート**: NRtg のランキング
- ソート可能（列ヘッダークリック）
- ISR: 1時間ごとに再検証 (`revalidate: 3600`)

#### 2. チーム別選手 (`/team/[teamId]`)
- チーム選択ドロップダウン or URL直接アクセス
- **選手の Net Rating** (OFF_RATING / DEF_RATING / NET_RATING) を表示
- 出場時間、GP でフィルタ可能
- チーム全体のレーティングサマリーカード

#### 3. 全選手レーティング (`/players`)
- 全選手の Net Rating テーブル
- ページネーション対応（仮想スクロール or ページ分割）
- フィルタ: ポジション、最低出場試合数、チーム
- ソート: 任意の列

#### 4. 選手検索 (`/search`)
- リアルタイムインクリメンタル検索
- デバウンス付き（300ms）
- 検索結果に選手のチーム、ポジション、主要指標を表示

#### 5. 【新機能】比較 (`/compare`)
- 最大4選手/チームを選択して並列比較
- レーダーチャートで視覚的に比較
- URLパラメータで共有可能

### データフロー

```
stats.nba.com API
       ↓
  Next.js API Route / Server Component (サーバーサイド)
       ↓
  ISR キャッシュ (1時間)
       ↓
  React Server Components → クライアント描画
```

### キャッシュ戦略
- **ISR (revalidate: 3600)**: 1時間ごとにバックグラウンドで再フェッチ
- **stats.nba.com がダウン時**: Basketball Reference スクレイピングにフォールバック
- **Edge Runtime**: 不使用（stats.nba.com へのアクセスにNode.js runtime必要）

---

## 4. 実装ステップ

### Phase 1: プロジェクトセットアップ（基盤）
1. Next.js 15 プロジェクト作成 (`create-next-app`)
2. Tailwind CSS, shadcn/ui セットアップ
3. TypeScript 型定義作成
4. stats.nba.com API クライアント実装

### Phase 2: コア機能
5. チームレーティングページ（テーブル + 散布図）
6. 全選手レーティングページ（テーブル + ページネーション）
7. チーム別選手ページ
8. ナビゲーション

### Phase 3: 追加機能
9. 選手検索（インクリメンタルサーチ）
10. チャート追加（NRtg バーチャート）
11. 比較ページ
12. モバイルレスポンシブ最適化

### Phase 4: 仕上げ
13. エラーハンドリング（フォールバック）
14. ローディングUI (Suspense / Skeleton)
15. メタデータ / OGP
16. Vercel デプロイ

---

## 5. 現行アプリとの差分まとめ

| 項目 | 現行 (Streamlit) | 新規 (Next.js) |
|------|-------------------|----------------|
| フレームワーク | Streamlit (Python) | Next.js 15 (TypeScript) |
| データソース | Basketball Reference スクレイピング | stats.nba.com API（直接） |
| 選手指標 | Win Shares (OWS/DWS/WS) | **Net Rating (ORtg/DRtg/NRtg)** |
| チャート | なし | 散布図、バーチャート、レーダーチャート |
| モバイル対応 | 限定的 | フルレスポンシブ |
| 検索 | フォーム送信型 | リアルタイムインクリメンタル |
| 比較機能 | なし | あり |
| キャッシュ | CSV ファイル | ISR (1時間) |
| デプロイ | Streamlit Cloud | Vercel |
| パフォーマンス | 遅い（全データ毎回読み込み） | 高速（ISR + Server Components） |
