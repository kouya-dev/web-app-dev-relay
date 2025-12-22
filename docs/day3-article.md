# 【Advent Calendar Day 3】Next.js でビジュアルプログラミングエディタをローカル実行できるようにした

こんにちは！Advent Calendar 3日目の担当者です。

このプロジェクトは、Qiita Advent Calendar 2025 の企画「【自由参加型】Webアプリ開発アドベントカレンダー」の一環です。Day 2 までに実装されたビジュアルプログラミングエディタを、**Next.js で包装してローカル実行できるようにする**というのが今日のテーマです。

## 📋 背景

Day 2 までに、JF6DEU さんが素晴らしいビジュアルプログラミングエディタを実装してくれました。このエディタは、以下の機能を持つ複雑な JavaScript アプリケーションです：

- **プログラム変換エンジン**: 日本語で書かれた命令を内部形式に変換
- **複数の制御構文**: print、変数、配列、if/else、for、while ループなど
- **リアルタイムプレビュー**: ユーザーが入力した内容をリアルタイムで処理

しかし、当初は静的な HTML/CSS/JS ファイルのみで、以下の課題がありました：

- ローカルで実行するには、単純に HTML ファイルを開くだけ（開発効率が低い）
- ホットリロード機能がない
- デプロイが手動
- 今後の拡張が難しい

## 🎯 今日の目標

1. **Next.js で包装**: 既存のコードを活かしながら、Next.js の恩恵を受ける
2. **ローカル実行対応**: `npm run dev` で開発サーバーを起動
3. **Vercel デプロイ対応**: ワンクリックでデプロイ可能に
4. **ドキュメント整備**: 次の参加者が引き継ぎやすいように

## 🚀 実装内容

### 1. Next.js プロジェクトの初期化

```bash
npm install next@latest react react-dom
```

`package.json` を更新して、Next.js のスクリプトを追加：

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

### 2. App Router の構成

Next.js 15 の App Router を使用して、以下のファイル構成を作成：

```
app/
├── layout.tsx      # ルートレイアウト
├── page.tsx        # メインページ
└── globals.css     # グローバルスタイル
```

**app/layout.tsx**:
```typescript
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Web App Dev Relay - ビジュアルプログラミングエディタ",
  description: "Advent Calendar 2025 - Web App Dev Relay プロジェクト",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
```

### 3. 既存コードの活用

ここが重要なポイントです。既存の複雑な JavaScript コードを、React コンポーネント化するのではなく、**そのまま活用**することにしました。

**app/page.tsx** では、`useEffect` フックを使って既存の JavaScript を動的にロード：

```typescript
'use client';

import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // 既存のJavaScriptコードを動的にロード
    const script = document.createElement('script');
    script.src = '/js/main.js';
    script.async = true;
    document.body.appendChild(script);

    // Bootstrap JSをロード
    const bootstrapScript = document.createElement('script');
    bootstrapScript.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js';
    bootstrapScript.crossOrigin = 'anonymous';
    bootstrapScript.async = true;
    document.body.appendChild(bootstrapScript);

    return () => {
      // クリーンアップ
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      if (bootstrapScript.parentNode) {
        bootstrapScript.parentNode.removeChild(bootstrapScript);
      }
    };
  }, []);

  return (
    <>
      {/* Bootstrap CSS */}
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
        rel="stylesheet"
        crossOrigin="anonymous"
      />
      
      {/* 既存のCSS */}
      <link rel="stylesheet" href="/css/reset.css" />
      <link rel="stylesheet" href="/css/header.css" />

      {/* ここにUIを配置 */}
      {/* ... */}
    </>
  );
}
```

### 4. 静的ファイルの配置

既存の CSS と JavaScript ファイルを `public/` ディレクトリに配置：

```
public/
├── css/
│   ├── header.css
│   └── reset.css
└── js/
    └── main.js
```

### 5. TypeScript 設定

`tsconfig.json` を設定して、型安全な開発環境を構築：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "react-jsx"
  }
}
```

### 6. Next.js 設定

`next.config.js` で基本的な設定：

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = nextConfig
```

## 💻 使い方

### セットアップ

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
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開くと、ビジュアルプログラミングエディタが表示されます。

### ビルド

```bash
npm run build
npm start
```

## 🚀 Vercel へのデプロイ

このプロジェクトは Vercel へのデプロイに完全対応しています。

1. GitHub にプッシュ
2. Vercel にログイン
3. 「New Project」からこのリポジトリを選択
4. 「Deploy」をクリック

以降、`main` ブランチへのプッシュで自動的にデプロイされます。

## 🤔 設計の考え方

### なぜ React コンポーネント化しなかったのか？

既存の JavaScript コードは非常に複雑で、以下の理由から React コンポーネント化を避けました：

1. **既存コードの尊重**: JF6DEU さんが実装した複雑なロジックをそのまま活用
2. **段階的な改善**: 今後、必要に応じて段階的に React コンポーネント化可能
3. **開発効率**: 今すぐ Next.js の恩恵（ホットリロード、デプロイ）を受けられる

### 今後の拡張方針

- **Phase 1（現在）**: 既存コードを活かしながら Next.js で包装
- **Phase 2**: UI パーツを React コンポーネント化
- **Phase 3**: ビジネスロジックを TypeScript で再実装
- **Phase 4**: テストの追加、パフォーマンス最適化

## 📚 学んだこと

### 1. 既存コードの活用の重要性

完璧な再実装よりも、既存の動作するコードを活かしながら段階的に改善することの方が、実務では重要です。

### 2. Next.js の柔軟性

Next.js は、完全な React アプリケーションだけでなく、既存の JavaScript コードを包装するのにも使えます。

### 3. 開発効率の向上

ホットリロード、自動ビルド、デプロイの自動化など、Next.js を使うことで開発効率が大幅に向上します。

## 🎁 次の参加者へ

このプロジェクトは、以下の点で拡張可能です：

- **UI の改善**: Bootstrap から Tailwind CSS への移行
- **機能の追加**: 新しい制御構文の追加
- **パフォーマンス**: エディタのパフォーマンス最適化
- **テスト**: ユニットテストの追加

ぜひ、このプロジェクトを引き継いで、さらに素晴らしいものにしてください！

## 📝 まとめ

Day 3 では、既存のビジュアルプログラミングエディタを Next.js で包装し、ローカル実行と Vercel デプロイに対応させました。

- ✅ ローカル実行対応（`npm run dev`）
- ✅ Vercel デプロイ対応
- ✅ TypeScript 対応
- ✅ 既存コードの活用
- ✅ ドキュメント整備

このプロジェクトが、今後の開発の基盤となることを願っています。

---

**参考リンク:**
- [Next.js 公式ドキュメント](https://nextjs.org/docs)
- [Vercel デプロイガイド](https://vercel.com/docs)
- [Qiita Advent Calendar 2025 - Web App Dev Relay](https://qiita.com/advent-calendar/2025/web-app-dev-relay)

**作成日**: 2025年12月22日
