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

      {/* ヘッダー */}
      <div className="header">
        <div className="container">
          {/* サイトロゴ */}
          <div className="siteLogo">
            <span>NaN!</span>
          </div>
          {/* メニュー */}
          <div className="menu">
            {/* ToDo: メニュー作り */}
          </div>
        </div>
      </div>

      {/* ここからメインコンテンツ */}
      <div className="con1">
        <div className="con2">
          <div className="con3">
            <div id="codeEditor" style={{ width: '100%', height: '100%' }}></div>
          </div>
          <hr />
          <div className="inputs">
            <label htmlFor="printValues" className="form-label">
              表示
            </label>
            <div className="input-group mb-3">
              <span className="input-group-text">表示する (</span>
              <input
                type="text"
                className="form-control"
                placeholder="値"
                aria-label="printValues"
                id="printInput"
              />
              <span className="input-group-text">)</span>
              <button
                className="btn btn-secondary"
                type="button"
                id="button-addon2"
                onClick={() => {
                  if (typeof window !== 'undefined' && (window as any).getButton) {
                    (window as any).getButton('print');
                  }
                }}
              >
                追加
              </button>
            </div>
            <div className="form-text" id="basic-addon4">
              複数を一行で出力するにはカンマ区切りで書きます。文字はダブルクォーテーション(")で括ります。
            </div>
            <hr />
            <label htmlFor="variableName" className="form-label">
              変数
            </label>
            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="変数名"
                aria-label="variableName"
                id="variableInput1"
              />
              <span className="input-group-text">=</span>
              <input
                type="text"
                className="form-control"
                placeholder="値"
                aria-label="vairableValue"
                id="variableInput2"
              />
              <button
                className="btn btn-secondary"
                type="button"
                id="button-addon2"
                onClick={() => {
                  if (typeof window !== 'undefined' && (window as any).getButton) {
                    (window as any).getButton('variable');
                  }
                }}
              >
                追加
              </button>
            </div>
            <div className="form-text" id="basic-addon4">
              変数を入力します。例えば、A = 1のような感じです。文字はダブルクォーテーション(")で括ります。
            </div>
            <hr />
            <label htmlFor="variableArrayName" className="form-label">
              配列
            </label>
            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="変数名"
                aria-label="variableArrayName"
                id="arrayInput1"
              />
              <span className="input-group-text">=[</span>
              <input
                type="text"
                className="form-control"
                placeholder="値"
                aria-label="variableValueName"
                id="arrayInput2"
              />
              <span className="input-group-text">]</span>
              <button
                className="btn btn-secondary"
                type="button"
                id="button-addon2"
                onClick={() => {
                  if (typeof window !== 'undefined' && (window as any).getButton) {
                    (window as any).getButton('array');
                  }
                }}
              >
                追加
              </button>
            </div>
            <div className="form-text" id="basic-addon4">
              配列を入力します。例えば、A = [1,2,3]のような感じです。
              <br />
              配列の長さは「(変数の名前)の長さ」で求められます。
            </div>
            <hr />
            <label htmlFor="ifBlock" className="form-label">
              演算
            </label>
            <div className="input-group mb-3">
              <span className="input-group-text">もし</span>
              <input
                type="text"
                className="form-control"
                placeholder="条件式"
                aria-label="ifBlock"
                id="ifInput"
              />
              <span className="input-group-text">ならば：</span>
              <button
                className="btn btn-secondary"
                type="button"
                id="button-addon2"
                onClick={() => {
                  if (typeof window !== 'undefined' && (window as any).getButton) {
                    (window as any).getButton('if');
                  }
                }}
              >
                追加
              </button>
            </div>
            <div className="form-text" id="basic-addon4">
              条件式を入力します。and,orが使えます。スペース区切りです。
            </div>
            <hr />
            <label htmlFor="forBlock" className="form-label">
              繰り返し
            </label>
            <div className="input-group mb-3">
              <span className="input-group-text">変数</span>
              <input
                type="text"
                className="form-control"
                placeholder="変数名"
                aria-label="forBlock"
                id="forInput1"
              />
              <span className="input-group-text">を</span>
              <input
                type="text"
                className="form-control"
                placeholder="最小値"
                aria-label="forBlockMin"
                id="forInput2"
              />
              <span className="input-group-text">から</span>
              <input
                type="text"
                className="form-control"
                placeholder="最大値"
                aria-label="forBlockMax"
                id="forInput3"
              />
              <span className="input-group-text">まで</span>
              <input
                type="number"
                className="form-control"
                placeholder="値"
                aria-label="forBlockInc"
                id="forInput4"
              />
              <span className="input-group-text">ずつ</span>
              <select className="form-select" id="forInput5">
                <option value="inc" defaultChecked>
                  増やし
                </option>
                <option value="dec">減らし</option>
              </select>
              <span className="input-group-text">ながら繰り返す：</span>
              <button
                className="btn btn-secondary"
                type="button"
                id="button-addon2"
                onClick={() => {
                  if (typeof window !== 'undefined' && (window as any).getButton) {
                    (window as any).getButton('for');
                  }
                }}
              >
                追加
              </button>
            </div>
            <div className="form-text" id="basic-addon4">
              繰り返しの式を入力します。iを1から3まで増やしながら〜のようにします。
            </div>
            <hr />
            <label htmlFor="whileBlock" className="form-label">
              〜まで繰り返す
            </label>
            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="条件式"
                aria-label="whileBlock"
                id="whileInput"
              />
              <span className="input-group-text">になるまで繰り返す：</span>
              <button
                className="btn btn-secondary"
                type="button"
                id="button-addon2"
                onClick={() => {
                  if (typeof window !== 'undefined' && (window as any).getButton) {
                    (window as any).getButton('while');
                  }
                }}
              >
                追加
              </button>
            </div>
            <div className="form-text" id="basic-addon4">
              繰り返しの式を入力します。条件式がTRUEになるまで繰り返します。
            </div>
            <hr />
            <label className="form-label" htmlFor="outLoop">
              ループ抜け※この文は表示されません。
            </label>
            <div className="input-group mb-3">
              <span className="input-group-text">↩️</span>
              <span className="input-group-text">で一つ左につめる</span>
              <button
                className="btn btn-secondary"
                type="button"
                id="button-addon2"
                onClick={() => {
                  if (typeof window !== 'undefined' && (window as any).getButton) {
                    (window as any).getButton('endLoop');
                  }
                }}
              >
                追加
              </button>
            </div>
            <div className="form-text" id="basic-addon4">
              記号を表示し、左にずらします。ループやIFを抜ける時に使用します。
            </div>
            <hr />
            <label className="form-label">そうでなければ</label>
            <div className="input-group mb-3">
              <span className="input-group-text">そうでなければ：</span>
              <button
                className="btn btn-secondary"
                type="button"
                id="button-addon2"
                onClick={() => {
                  if (typeof window !== 'undefined' && (window as any).getButton) {
                    (window as any).getButton('ifElse');
                  }
                }}
              >
                追加
              </button>
            </div>
            <div className="form-text" id="basic-addon4">
              IFの時、式に当てはまらない場合に実行されます。
            </div>
          </div>
          <hr />
          <div className="allSet">
            <span>
              以下は全体設定です。
              <br />
              必要に応じて設定してください。
              <br />
            </span>
            <hr />
            <label htmlFor="stepMs" className="form-label">
              待機時間
            </label>
            <div className="input-group mb-3">
              <span className="input-group-text">一行ごとに</span>
              <input
                type="number"
                className="form-control"
                placeholder="数字"
                aria-label="stepMs"
              />
              <span className="input-group-text">ミリ秒</span>
              <span className="input-group-text">待つ</span>
            </div>
            <div className="form-text" id="basic-addon4">
              一行ごとの待機時間です。
              <br />
              1ミリ秒は0.001秒のことです。
              <br />
              1秒は1000ミリ秒のことです。
              <br />
              ミリ秒に1000をかけると秒に、秒を1000でわるとミリ秒になります。
              <br />
              10から2000ぐらいでちょうどいいはずです。
            </div>
            <hr />
            <label htmlFor="viewVariables" className="form-label">
              変数表示
            </label>
            <div className="input-group mb-3">
              <span className="input-group-text">変数の内容を</span>
              <select className="form-select" aria-label="viewVariables">
                <option value="view1">一行ごとに表示する</option>
                <option value="viewLast">最後に表示する</option>
                <option value="nonView" defaultChecked>
                  表示しない
                </option>
              </select>
            </div>
            <div className="form-text" id="basic-addon4">
              変数の内容を表示します。
              <br />
              表示は上に出てきますが、あまり変数が多いと読むのに疲れるので気をつけてください。
            </div>
            <hr />
          </div>
        </div>
      </div>

      <style jsx>{`
        .con1 {
          width: 100vw;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        .con2 {
          width: 90vw;
          display: flex;
          flex-direction: column;
          justify-content: center;
          border: 1px solid #ccc;
          padding: 1.75rem 1rem;
        }
        .con3 {
          height: 80vh;
          width: 100%;
          border: 1px solid #eee;
        }
      `}</style>
    </>
  );
}
