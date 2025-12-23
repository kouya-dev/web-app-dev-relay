---
title: "5日目：XSS脆弱性の修正とReactコンポーネントへのリファクタリング"
emoji: "🛡️"
type: "tech"
topics: ["react", "typescript", "nextjs", "security"]
published: true
---

## はじめに

Webアプリ開発リレーアドベントカレンダーの5日目です。前回（[4日目](https://qiita.com/advent-calendar/2025/web-app-dev-relay/day3-article)）までに、ビジュアルプログラミングエディタの基本的なUIと、プログラムの行をJSONとして管理する仕組みを構築しました。

しかし、前回の実装には深刻なセキュリティ脆弱性と、Reactのベストプラクティスから外れた部分がありました。今回は、これらの問題を修正し、より安全で保守性の高いコードベースへとリファクタリングした過程を紹介します。

## 抱えていた問題

主な問題は、Reactコンポーネント内で`dangerouslySetInnerHTML`を使用してHTML文字列を直接DOMに挿入していた点です。

```tsx:app/page.tsx (修正前)
// ...
return <div key={index} dangerouslySetInnerHTML={{ __html: html as string }} />;
// ...
```

このアプローチには2つの大きな欠点がありました。

1.  **XSS（クロスサイトスクリプティング）脆弱性**: ユーザーが入力した値が適切にエスケープ処理されないままHTMLとしてレンダリングされるため、悪意のあるスクリプトを埋め込むことが可能でした。これは非常に危険なセキュリティホールです。
2.  **Reactの思想との乖離**: `dangerouslySetInnerHTML`はその名の通り危険なプロパティであり、Reactの宣言的なUI構築の恩恵を損ないます。今回のように、HTMLエンティティ（例：`&quot;`）が正しく表示されないなど、予期せぬレンダリングの問題も引き起こしていました。

## リファクタリングの方針

これらの問題を解決するため、以下の2つを大きな柱としてリファクタリングを行いました。

1.  **コアロジックの分離とTypeScript化**: `public/js/main.js`に混在していたDOM操作とプログラム変換ロジックを分離し、変換ロジックを`app/lib/visual-editor.ts`という新しいモジュールに切り出しました。これにより、ロジックが再利用可能になり、TypeScriptによる型安全の恩恵を受けられるようになりました。
2.  **コンポーネントベースのレンダリングへの移行**: `dangerouslySetInnerHTML`を完全に排除し、Reactコンポーネントを使ってUIを構築するように変更しました。

## 実装の詳細

### 1. コアロジックのTypeScriptモジュール化

まず、プログラムの行データとUIの表現を変換するロジックを`app/lib/visual-editor.ts`にまとめました。ここでは、`RowData`や`Token`といったインターフェースを定義し、データの構造を明確にしています。

```typescript:app/lib/visual-editor.ts
export interface Token {
    type: 'number' | 'text' | 'enzan' | 'arrayLength' | 'var';
    value: string | number;
}

export interface RowData {
    name: string;
    varName?: string;
    innerVars: Token[][] | Token[] | Expression[] | ForLoopData[] | {};
    nestValue: number;
}

// ...
```

### 2. コンポーネントベースのレンダリング

リファクタリングの核心部分です。以前は`generateRows`関数がHTML文字列を返していましたが、これを変更し、UIの構造を示すオブジェクトの配列（`RenderSegment[]`）を返すようにしました。

```typescript:app/lib/visual-editor.ts
export type RenderSegment =
  | { type: 'text'; content: string }
  | { type: 'input'; id: number; value: string }
  | { type: 'select'; options: { value: string; label: string }[]; selectedValue: string };

// ...

function handleR2S(programArray: RowData, isEditable: boolean): [number, RenderSegment[]] {
  const segments: RenderSegment[] = [];
  // ...
  switch (programArray.name) {
    case "print":
      const printContent = // ...
      segments.push({ type: 'text', content: '表示する(' });
      segments.push({ type: 'input', id: 0, value: printContent });
      segments.push({ type: 'text', content: ')' });
      break;
    // ...
  }
  return [0, segments];
}
```

そして、`app/page.tsx`では、この`RenderSegment`の配列を受け取り、`map`メソッドで実際のReactコンポーネント（`<span>`, `<input>`, `<select>`）に変換してレンダリングします。

```tsx:app/page.tsx (修正後)
// ...
return (
  <div
    key={index}
    style={{ marginLeft: `${row.nestLevel * 20}px` }}
    className="d-flex align-items-center mb-1"
  >
    {segments.map((segment, segIndex) => {
        switch (segment.type) {
            case 'text':
                return <span key={segIndex}>{segment.content}</span>;
            case 'input':
                return <input key={segIndex} type="text" defaultValue={segment.value} />;
            // ...
        }
    })}
  </div>
);
// ...
```

この変更により、`dangerouslySetInnerHTML`は不要になり、Reactが自動的にすべての値を安全にエスケープ処理してくれるため、XSS脆弱性が解消されました。

## まとめ

今回のリファクタリングにより、アプリケーションは以下の点で大きく改善されました。

-   **セキュリティの向上**: XSS脆弱性を根本的に解消。
-   **保守性の向上**: コアロジックを分離し、TypeScriptで型付けしたことで、コードの見通しが良くなり、将来の機能追加が容易になりました。
-   **堅牢性の向上**: Reactのベストプラクティスに従うことで、予期せぬレンダリングの問題が起こりにくくなりました。

見た目の変化は少ないですが、アプリケーションの内部品質を大きく高める重要なステップとなりました。次回は、この新しい基盤の上に、さらに機能を追加していく予定です。お楽しみに！
