---
title: "6日目：DNCL実行エンジンの実装とUIとの連携"
emoji: "🚀"
type: "tech"
topics: ["react", "typescript", "nextjs", "interpreter"]
published: true
---

## はじめに

Webアプリ開発リレーアドベントカレンダーの最終日前日、6日目です。前回（[5日目](https.zenn.dev)）までに、UIを安全なReactコンポーネントへとリファクタリングし、視覚的なプログラミングエディタの堅牢な基盤を築きました。

今回は、このプロジェクトの核心的目標である「**共通テストを実行する**」を実現するため、これまで組み立ててきた視覚的なプログラム（`RowData`）を解釈し、実際に動作させる「実行エンジン（Interpreter）」をTypeScriptで実装した過程を紹介します。

## 実行エンジンのアーキテクチャ

実行機能の心臓部として、新しく `app/lib/interpreter.ts` を作成しました。ここに `Interpreter` クラスを定義し、プログラムの実行に関する全てのロジックを集約させました。

`Interpreter` クラスの主な責務は以下の通りです。

1.  **状態管理**: プログラムの実行状態（変数、配列、現在の実行行）を一元管理します。
2.  **式の評価**: `x + 1` のような数式や `y > 10` のような条件式を評価し、具体的な値や真偽値に変換します。
3.  **命令の実行**: `RowData` の配列を一行ずつ解釈し、`表示する`、`変数代入`、`もし`、`繰り返し` などの命令を実行します。
4.  **制御フローの管理**: `if` 文による分岐や `for`, `while` ループによるジャンプ（実行行の移動）を制御します。

```typescript:app/lib/interpreter.ts
export class Interpreter {
    private state: {
        variables: Map<string, any>;
        arrays: Map<string, any[]>;
    };
    private program: RowData[];
    private programCounter: number;
    // ...

    constructor(program: RowData[]) {
        this.program = program;
        this.state = { variables: new Map(), arrays: new Map() };
        this.programCounter = 0;
        // ...
    }

    public async execute(onStep: (pc: number, state: ProgramState) => void, stepDelay: number): Promise<ExecutionResult> {
        while (this.programCounter < this.program.length) {
            // 現在の行の命令を解釈・実行する
            // ...
            this.programCounter++;
        }
        // ...
    }
}
```

## 式の評価と制御フロー

プログラムを実行するには、まず `1 + 変数A` のような式を計算できる必要があります。そのために、`Token` の配列を受け取り、四則演算の優先順位（乗除算が先）を考慮して計算結果を返す `evaluateTokens` ヘルパー関数を実装しました。

```typescript:app/lib/interpreter.ts (抜粋)
private evaluateTokens(tokens: Token[]): any {
    if (!tokens || tokens.length === 0) return undefined;
    if (tokens.length === 1) return this.getValue(tokens[0]); // 変数やリテラルを解決

    const values: any[] = [];
    const ops: string[] = [];
    // ...
    // まず乗算・除算を先に処理し...
    // ...
    // 次に加算・減算を処理する
    // ...
    return result;
}
```

`if` や `while` のような制御フローは、単に一行ずつ進むだけでは実現できません。例えば `if` の条件が偽だった場合、対応する `else` やブロックの終わり（`endLoop`）までジャンプする必要があります。

このジャンプを実現するため、`nestValue` を頼りに対応するブロックの終点を探す `findMatchingEnd` のようなヘルパー関数を用意しました。また、`for` や `while` のネストしたループに対応するため、ループの開始地点をスタックで管理する `loopStack` という仕組みも導入しています。

```typescript:app/lib/interpreter.ts (抜粋)
// `execute` メソッド内の switch 文
switch (currentRow.name) {
    case 'if':
        const ifCondition = await this.evaluateCondition(currentRow.innerVars as Expression[]);
        if (!ifCondition) {
            // 条件が偽なら、対応する else か end までジャンプ
            const nextBlock = this.findMatchingElseOrEnd(this.programCounter);
            if (nextBlock) {
                this.programCounter = nextBlock.index - 1;
            }
        }
        break;
    // ...
}
```

## UIと実行エンジンの連携

実行エンジンが完成したら、次はその動きをユーザーに見せるためのUIとの連携です。

### 実行ボタンとアウトプットパネル

まず `app/page.tsx` に「実行」ボタンと、プログラムの実行結果（`表示する`の内容）、エラー、そして変数の状態をリアルタイムで表示する「アウトプットパネル」を追加しました。

### 実行過程の可視化

プログラムの実行は一瞬で終わってしまいますが、教育的な目的のためには、どの行が実行されているかを視覚的に追跡できることが重要です。

これを実現するために、`Interpreter` の `execute` メソッドは、一行処理を進めるごとに `onStep` というコールバック関数を呼び出すように設計しました。

```tsx:app/page.tsx (抜粋)
const handleRun = async () => {
    setIsRunning(true);
    // ...
    const interpreter = new Interpreter(rows);

    // 1ステップ進むごとに呼ばれるコールバック
    const onStep = (pc: number, state: ProgramState) => {
        setCurrentStep(pc); // 現在の実行行をstateに保存
        setVariables(new Map(state.variables)); // 変数・配列の状態を更新
        setArrays(new Map(state.arrays));
    };

    // onStep を渡して実行を開始
    const result = await interpreter.execute(onStep, stepDelay);
    // ...
    setIsRunning(false);
};
```

Reactコンポーネント側では、`onStep` から受け取った行番号 (`pc`) を `currentStep` というstateに保持します。そして、各行を描画する際に `currentStep` とその行のインデックスを比較し、一致すれば背景色を変えることで「実行中の行のハイライト」を実現しています。

```tsx:app/page.tsx (抜粋)
{rowsWithNesting.map((row, index) => (
  <div
    key={index}
    style={{
      // ...
      backgroundColor: currentStep === index ? '#d4edda' : 'transparent', // ハイライト処理
    }}
  >
    {/* ... */}
  </div>
))}
```

## まとめ

今回の実装により、ついに視覚的なエディタで組み立てたプログラムを実際に実行し、その過程をステップ実行で追いかけることが可能になりました。これにより、「共通テストの実行環境」という当初の目標が達成できました。

見た目上のUIはこれまでと大きく変わりませんが、その裏側ではプログラムを解釈し、状態を管理し、UIと通信する複雑なエンジンが動いています。このアドベントカレンダーを通じて、単なるUIの構築から一歩踏み出し、アプリケーションに「知性」を吹き込む過程をお見せできたことを嬉しく思います。

これで私の担当は終わりです。最終日、また別の方にバトンを渡します！お楽しみに！
