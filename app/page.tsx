'use client';

import { useEffect, useState } from 'react';
import { generateRows, RowData, RenderSegment } from './lib/visual-editor';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../public/css/reset.css';
import '../public/css/header.css';


export default function Home() {
  const [rows, setRows] = useState<RowData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const addRow = (programName: string, programArray: any[]) => {
    const [errorCode, result] = generateRows("I2R", programName, programArray);
    if (errorCode === 1) {
      setError(result as string);
    } else {
      setRows([...rows, result as RowData]);
      setError(null);
    }
  };

  useEffect(() => {
    // Dynamically import Bootstrap JS for client-side usage
    import('bootstrap/dist/js/bootstrap.bundle.min.js');
  }, []);

  // Calculate cumulative nesting level for rendering
  const rowsWithNesting = rows.reduce((acc, row) => {
    const previousNest = acc.length > 0 ? acc[acc.length - 1].cumulativeNest : 0;
    const nestChange = row.nestValue;
    let currentAbsoluteNest = previousNest;

    if (nestChange < 0) {
        currentAbsoluteNest = Math.max(0, previousNest + nestChange);
    }

    const newRow = {
        ...row,
        nestLevel: currentAbsoluteNest,
        cumulativeNest: nestChange > 0 ? previousNest + nestChange : currentAbsoluteNest
    };

    acc.push(newRow);
    return acc;
  }, [] as (RowData & { nestLevel: number, cumulativeNest: number })[]);


  return (
    <>
      {/* ヘッダー */}
      <div className="header">
        <div className="container">
          {/* サイトロゴ */}
          <div className="siteLogo">
            <span>Visual Programming Editor</span>
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
            <div id="codeEditor" style={{ width: '100%', height: '100%' }}>
              {error && <div className="alert alert-danger">{error}</div>}
              {rowsWithNesting.map((row, index) => {
                const [errorCode, segments] = generateRows("R2S", row) as [number, RenderSegment[]];
                if (errorCode === 1) {
                  return <div key={index} className="alert alert-warning"><code>{(segments[0] as any).content}</code></div>;
                }
                return (
                  <div
                    key={index}
                    style={{ marginLeft: `${row.nestLevel * 20}px` }}
                    className="d-flex align-items-center mb-1"
                  >
                    {segments.map((segment, segIndex) => {
                        switch (segment.type) {
                            case 'text':
                                return <span key={segIndex} style={{ whiteSpace: 'pre' }}>{segment.content}</span>;
                            case 'input':
                                return (
                                    <input
                                        key={segIndex}
                                        type="text"
                                        className="form-control form-control-sm mx-1"
                                        style={{ width: 'auto', display: 'inline-block' }}
                                        defaultValue={segment.value}
                                    />
                                );
                            case 'select':
                                return (
                                    <select
                                        key={segIndex}
                                        className="form-select form-select-sm mx-1"
                                        style={{ width: 'auto', display: 'inline-block' }}
                                        defaultValue={segment.selectedValue}
                                    >
                                        {segment.options.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                );
                            default:
                                return null;
                        }
                    })}
                  </div>
                );
              })}
            </div>
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
                onClick={() => {
                  const input = document.getElementById('printInput') as HTMLInputElement;
                  addRow('print', [input.value]);
                }}
              >
                追加
              </button>
            </div>
            <div className="form-text" id="basic-addon4">
              複数を一行で出力するにはカンマ区切りで書きます。文字はダブルクォーテーション(&quot;)で括ります。
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
                onClick={() => {
                  const input1 = document.getElementById('variableInput1') as HTMLInputElement;
                  const input2 = document.getElementById('variableInput2') as HTMLInputElement;
                  addRow('variable', [input1.value, input2.value]);
                }}
              >
                追加
              </button>
            </div>
            <div className="form-text" id="basic-addon4">
              変数を入力します。例えば、A = 1のような感じです。文字はダブルクォーテーション(&quot;)で括ります。
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
                onClick={() => {
                  const input1 = document.getElementById('arrayInput1') as HTMLInputElement;
                  const input2 = document.getElementById('arrayInput2') as HTMLInputElement;
                  addRow('array', [input1.value, input2.value]);
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
                onClick={() => {
                    const input = document.getElementById('ifInput') as HTMLInputElement;
                    addRow('if', [input.value]);
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
                <option value="inc" >
                  増やし
                </option>
                <option value="dec">減らし</option>
              </select>
              <span className="input-group-text">ながら繰り返す：</span>
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => {
                  const input1 = document.getElementById('forInput1') as HTMLInputElement;
                  const input2 = document.getElementById('forInput2') as HTMLInputElement;
                  const input3 = document.getElementById('forInput3') as HTMLInputElement;
                  const input4 = document.getElementById('forInput4') as HTMLInputElement;
                  const input5 = document.getElementById('forInput5') as HTMLSelectElement;
                  addRow('for', [input1.value, input2.value, input3.value, input4.value, input5.value]);
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
                onClick={() => {
                  const input = document.getElementById('whileInput') as HTMLInputElement;
                  addRow('while', [input.value]);
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
                onClick={() => addRow('endLoop', [])}
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
                onClick={() => addRow('ifElse', [])}
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
                <option value="nonView" >
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
