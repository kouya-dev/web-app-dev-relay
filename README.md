# 🌟 【自由参加型】Webアプリ開発アドベントカレンダー用リポジトリ 2025

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![GitHub contributors](https://img.shields.io/github/contributors/OWNER/web-app-dev-relay)](https://github.com/OWNER/web-app-dev-relay/graphs/contributors)
[![GitHub issues](https://img.shields.io/github/issues/OWNER/web-app-dev-relay)](https://github.com/OWNER/web-app-dev-relay/issues)

## 🚀 企画概要：ゼロから始める25日間の開発リレー

このリポジトリは、Qiita Advent Calendar 2025 の企画である **【自由参加型】Webアプリ開発アドベントカレンダー** の共同開発用リポジトリです。

**現時点で、アプリの「要件」「設計」「仕様」はすべて「無」です。**

カレンダーの参加者は、12月1日から25日までの担当日に、**「何を作るか」**を決めるプロセスも含め、自由にプロジェクトを進めることができます。

### 📌 コンセプト

1.  **自由参加型**: どんなスキルレベルの方でも、コードでも企画でも、自由に貢献できます。
2.  **過程を重視**: 完璧なコードや成功体験だけでなく、**試行錯誤の過程**や**設計の悩み**も立派な成果です。
3.  **1日完結**: 担当日は、1日で完結する作業（実装、仕様提案、環境整備など）に集中します。

---

## 🎯 Day 3: Next.js でローカル実行対応

このブランチ（`day3-nextjs-setup`）では、既存のビジュアルプログラミングエディタを **Next.js** で包装し、ローカル実行と Vercel へのデプロイに対応させました。

### ✨ 実装内容

- **Next.js 15 統合**: App Router を使用した最新の Next.js 構成
- **既存コードの活用**: JF6DEU さんが実装した複雑なプログラム変換エンジンをそのまま活用
- **ローカル実行対応**: `npm run dev` で `localhost:3000` で実行可能
- **Vercel デプロイ対応**: GitHub との連携で自動デプロイ可能
- **TypeScript 対応**: 型安全な開発環境

---

## 💻 セットアップ方法

### 前提条件

- Node.js 18.17 以上
- npm または yarn

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/your-username/web-app-dev-relay.git
cd web-app-dev-relay

# day3-nextjs-setup ブランチに切り替え
git checkout day3-nextjs-setup

# 依存関係をインストール
npm install
```

### ローカル実行

```bash
# 開発サーバーを起動
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開くと、ビジュアルプログラミングエディタが表示されます。

### ビルド

```bash
# 本番用にビルド
npm run build

# ビルド結果を実行
npm start
```

---

## 🚀 Vercel へのデプロイ

このプロジェクトは Vercel へのデプロイに対応しています。

### デプロイ手順

1. **GitHub にプッシュ**
   ```bash
   git push origin day3-nextjs-setup
   ```

2. **Vercel にログイン**
   - [Vercel](https://vercel.com) にアクセス
   - GitHub アカウントでログイン

3. **プロジェクトをインポート**
   - 「New Project」をクリック
   - このリポジトリを選択
   - 「Deploy」をクリック

4. **自動デプロイ**
   - 以降、`main` ブランチへのプッシュで自動的にデプロイされます

---

## 📁 プロジェクト構成

```
web-app-dev-relay/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # ルートレイアウト
│   ├── page.tsx           # メインページ
│   └── globals.css        # グローバルスタイル
├── public/                # 静的ファイル
│   ├── css/              # スタイルシート
│   ├── js/               # JavaScript
│   └── ...
├── web/                   # 既存の静的ファイル（互換性のため保持）
├── next.config.js        # Next.js 設定
├── tsconfig.json         # TypeScript 設定
├── package.json          # 依存関係
└── README.md             # このファイル
```

---

## 🔧 開発ガイド

### 既存コードの活用

`web/js/main.js` に実装されている複雑なプログラム変換エンジンは、`app/page.tsx` で動的にロードされています。

```typescript
useEffect(() => {
  const script = document.createElement('script');
  script.src = '/js/main.js';
  script.async = true;
  document.body.appendChild(script);
}, []);
```

### スタイルの追加

- グローバルスタイル: `app/globals.css`
- コンポーネント固有のスタイル: JSX の `<style jsx>` タグを使用

### 次のステップ

- [ ] React コンポーネント化（段階的に）
- [ ] エディタ機能の拡張
- [ ] テストの追加
- [ ] パフォーマンス最適化

---

## 💻 参加方法（非常に簡単です！）

私たちは、**フォーク（Fork）**を通じた貢献を歓迎します。コラボレーター招待を待つ必要はありません。

### ステップ 1: リポジトリをフォークする

GitHubのページ上部にある **`Fork`** ボタンをクリックし、ご自身のGitHubアカウントにリポジトリをコピーしてください。

### ステップ 2: ローカルで作業を開始する

フォークしたリポジトリをローカルにクローンし、作業用のブランチを作成します。

```bash
# フォークしたリポジトリのURLを使用
git clone [あなたのフォークしたリポジトリURL]
cd web-app-dev-relay
git checkout -b feature/my-advent-task
