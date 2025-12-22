// 便利な関数を定義
let d = document;
function gi(id){
    return d.getElementById(id);
}
function gc(className){
    return d.getElementsByClassName(className);
}
// プログラムの値を定義
let programValue = [];
let variableList = [];

function generateRows(direction, ...textAndOther){
    let outputValue = null;
    let error = 0;
    // error=1のときはvalはstring, それ以外はdirによって変わる
    if (direction == "I2R"){
        // 入力arrayから行コードへ
        let nestValue = 0;
        // これはネストの幅。+1か-1か0。
        let varName = null;
        // (忘れてた)変数名を空っぽに。
        let programName = textAndOther[0];
        let programArray = textAndOther[1];
        function inQuotes(val){
            let inQuotes = false;
            val = val.split("");
            for (let i = 0; i < val.length; i++) {
                const c = val[i];
                if (c === '"') {
                    // 次が "" の場合はエスケープとしてスキップ
                    if (val[i + 1] === '"') {
                        i++; // スキップ
                        continue;
                    }
                    inQuotes = !inQuotes; // 状態を切り替え
                }
            }
            return inQuotes;
        }
        function VariablesToSplit(val){
            // 振り分けはprintとほぼ一緒
            // これを切り出して変数か文字か数字かに分ける
            // ただ、少し変えなければならない。
            let printForms = val.trim().split(/([+\-*/])(?=(?:[^"]*"[^"]*")*[^"]*$)/);
            let tempArr = [];
            printForms.forEach(form => {
                // 最初にスペースがあったら切る
                form = form.trim();
                if (typeof form == "number"){
                    // 数字だった
                    // 一時保存のarrに追加
                    tempArr.push({
                        type: "number",
                        value: form
                    });
                } else if(typeof form == "string" && /^".*"$/.test(form)){
                    // ダブルクォーテーションで囲まれていた。
                    // pushするときにダブルクォーテーションを外す
                    tempArr.push({
                        type: "text",
                        value: form.replaceAll("\"", "")
                    });
                } else if(/^[+\-*/]$/.test(form)){
                    // 演算子だった。
                    tempArr.push({
                        type: "enzan",
                        value: form
                    });
                }else if(typeof form == "string" && /^\(.*\)の長さ$/.test(form)){
                    // なんと、配列の長さを求める関数があるみたい。
                    // (hairetu)の長さ とか書かれてるかも。
                    tempArr.push({
                        type: "arrayLength",
                        // ちょっとトリック。
                        // いらないものを消去するだけだけど。
                        value: form.replace("(", "").replace(")の長さ", "")
                    });
                } else if(typeof form == "string"){
                    // あとは...ないよね...
                    tempArr.push({
                        type: "var",
                        value: form
                    })
                }
            });
            return tempArr;
        }
        switch(programName){
            case "print":
                // まずは整合性をチェック
                // inQuotesがtrueでダメ(クオートの中), falseでOK(クォートの外)
                if (inQuotes(programArray[0])){
                    error = 1;
                    outputValue = "「\"」が閉じていません。忘れ物をしています。";
                    break;
                }
                // programArray[0]に文字が入る
                // これを切り出して変数か文字か数字かに分ける
                let printForms = programArray[0].split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);
                var tempArr = [];
                printForms.forEach(form => {
                    // スペースがあったら切る
                    // form = form.trim();
                    // if (typeof form == "number"){
                    //     // 数字だった
                    //     // 一時保存のarrに追加
                    //     tempArr.push({
                    //         type: "text",
                    //         value: form.toString()
                    //     });
                    // } else if(typeof form == "string" && /^".*"$/.test(form)){
                    //     // ダブルクォーテーションで囲まれていた。
                    //     // pushするときにダブルクォーテーションを外す
                    //     tempArr.push({
                    //         type: "text",
                    //         value: form.replaceAll("\"", "")
                    //     });
                    // } else if(typeof form == "string"){
                    //     // 囲まれていなかった。
                    //     tempArr.push({
                    //         type: "var",
                    //         value: VariablesToSplit(form)
                    //     })
                    // }
                    // 結局はvarと同じなんだから、共通化。
                    tempArr.push(VariablesToSplit(form));
                });
                // 最後に書き出し
                outputValue = tempArr;
                break;
            
            case "variable":
                // 0が変数名、1が変数値
                // まずは整合性をチェック
                // inQuotesがtrueでダメ(クオートの中), falseでOK(クォートの外)
                if (inQuotes(programArray[1])){
                    error = 1;
                    outputValue = "「\"」が閉じていません。忘れ物をしています。";
                    break;
                }
                // 変数名を定義
                varName = programArray[0];
                // 1を用いて中間コードを作る
                let t = VariablesToSplit(programArray[1]);
                // 最後に書き出し
                outputValue = t;
                break;
            
            case "array":
                // 0が変数名、1が変数値
                if (inQuotes(programArray[1])){
                    error = 1;
                    outputValue = "「\"」が閉じていません。忘れ物をしています。";
                    break;
                }
                // 変数名を定義
                varName = programArray[0];
                let ta = programArray[1].split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(arr => VariablesToSplit(arr));
                outputValue = ta;
                break;
            
            case "if":
                // inputは0のみ
                // 条件式だけ
                // つまりそのままvar = varのようなやつにする
                // ネストは1増えるので、
                nestValue = 1;
                // とする。
                if (inQuotes(programArray[0])){
                    error = 1;
                    outputValue = "「\"」が閉じていません。忘れ物をしています。";
                    break;
                }
                let ifouttemp = [];
                let siki = programArray[0].trim().split(/\s*(\band\b|\bor\b|!(?!\=))\s*(?=(?:[^"]*"[^"]*")*[^"]*$)/);
                siki.forEach((c) => {
                    if (c == "and"){
                        ifouttemp.push({
                            type: "and"
                        });
                    } else if(c == "or"){
                        ifouttemp.push({
                            type: "or"
                        });
                    } else if(c == "!"){
                        ifouttemp.push({
                            type: "not"
                        });
                    } else if(c != "" && /==|!=|<=|>=|<|>/.test(c)) {
                        let sikienzan = c.split(/(==|!=|<=|>=|<|>)/);
                        // sikienzanの0が比較元、1が演算子、2が比較先
                        ifouttemp.push({
                            type: "siki",
                            oneArg: VariablesToSplit(sikienzan[0]),
                            Value: sikienzan[1],
                            twoArg: VariablesToSplit(sikienzan[2])
                        });
                    }
                });
                outputValue = ifouttemp;
                break;
            case "for":
                // inputはvariableName,fromValue,endValue,stepVal,forTypeの5つ。
                // ネストはひとつ増えるので、
                nestValue = 1;
                // とする。
                if (typeof programArray[0] != "string" || inQuotes(programArray[1]) || inQuotes(programArray[2]) || inQuotes(programArray[3])){
                    error = 1;
                    outputValue = "「\"」が閉じていません。忘れ物をしています。";
                    break;
                }
                outputValue = [{
                    variableName: programArray[0],
                    fromValue: VariablesToSplit(programArray[1]),
                    endValue: VariablesToSplit(programArray[2]),
                    stepVal: VariablesToSplit(programArray[3]),
                    forType: programArray[4]
                }];
                break;
            case "ifElse":
                // なくていい...が、ネストだけ
                nestValue = 1;
                outputValue = {};
                break;
            case "endLoop":
                // これもなくていい...が、こっちはネストが下がるので-1する。
                nestValue = -1;
                outputValue = {};
                break;
            case "while":
                // ifからコピペ
                // inputは0のみ
                // 条件式だけ
                // つまりそのままvar = varのようなやつにする
                // もちろんネストも。
                nestValue = 1;
                if (inQuotes(programArray[0])){
                    error = 1;
                    outputValue = "「\"」が閉じていません。忘れ物をしています。";
                    break;
                }
                let whileouttemp = [];
                let whilesiki = programArray[0].trim().split(/\s*(\band\b|\bor\b|!(?!\=))\s*(?=(?:[^"]*"[^"]*")*[^"]*$)/);
                whilesiki.forEach((c) => {
                    if (c == "and"){
                        whileouttemp.push({
                            type: "and"
                        });
                    } else if(c == "or"){
                        whileouttemp.push({
                            type: "or"
                        });
                    } else if(c == "!"){
                        whileouttemp.push({
                            type: "not"
                        });
                    } else if(c != "" && /==|!=|<=|>=|<|>/.test(c)) {
                        let sikienzan = c.split(/(==|!=|<=|>=|<|>)/);
                        // sikienzanの0が比較元、1が演算子、2が比較先
                        whileouttemp.push({
                            type: "siki",
                            oneArg: VariablesToSplit(sikienzan[0]),
                            Value: sikienzan[1],
                            twoArg: VariablesToSplit(sikienzan[2])
                        });
                    }
                });
                outputValue = whileouttemp;
                break;
            }
            if (outputValue == null){
                error = 1;
                outputValue = "変換できませんでした。";
            }
            // エラー処理
            if (error == 1){
                return [error, outputValue];
            }
            // 忘れてた、変数の名前を定義しないと。
            if (varName != null){
                // 定義されてたら書く
                return [error, {
                    name: programName,
                    varName: varName,
                    innerVars: outputValue,
                    nestValue: nestValue
                }];
            } else {
                // 定義されていないなら書かない
                return [error, {
                    name: programName,
                    innerVars: outputValue,
                    nestValue: nestValue
                }];
            }
    } else if(direction == "R2W" || direction == "R2We"){
        // 行コードから人間用の文字へ
        // R2Weは編集用のものを含む
        // 基本的には逆をするだけで何ら難しいことはない...はず。
        let programArray = textAndOther[0];
        let kyoteRow = "";
        function splitToVariables(objArray){
            // 同一関数は全部まとめる
            // 文字にするだけなのでそのまま書く
            // 変換時の適当な変数も用意。
            let objTemp = "";
            // 文字を全部ここに集める。
            objArray.forEach((obj) => {
                // 判定するだけ
                // こっちの処理は簡単なのでswitchだけでOK
                // で、inputにするかどうかの変数も用意。
                switch(obj.type){
                    case "number":
                        // 数字はそのまま
                        objTemp += `&ensp;${obj.value}&ensp;`;
                        break;
                    case "text":
                        // 文字もほぼそのまま
                        objTemp += `&ensp;"${obj.value}"&ensp;`;
                        break;
                    case "enzan":
                        // これは記号をそのまま書くだけ。
                        objTemp += `&ensp;${obj.value}&ensp;`;
                        break;
                    case "arrayLength":
                        // 長さを表示
                        objTemp += `&ensp;(${obj.value})の長さ&ensp;`;
                        break;
                    case "var":
                        // 変数は何もなしでそのまま書く。
                        objTemp += `&ensp;${obj.value}&ensp;`;
                        break;
                    case "and":
                        // andは文字に
                        objTemp += "&ensp;and&ensp;";
                        break;
                    case "or":
                        // orも文字に
                        objTemp += "&ensp;or&ensp;";
                        break;
                    case "not":
                        // notは!に。スペースはつけない。
                        objTemp += "!";
                        break;
                    case "siki":
                        // 式はちょこっと特殊。
                        // 自分自身を呼んであげる。
                        objTemp += `&ensp;${splitToVariables(obj.oneArg)}&ensp;${obj.Value}&ensp;${splitToVariables(obj.twoArg)}&ensp;`;
                        break;
                }
            });
            // 出来上がりを出力。
            return objTemp;
        }
        switch(programArray.name){
            case "print":
                kyoteRow = "表示する(";
                // まずは取り出す。
                let kyoteRow2 = "";
                for (let m of programArray.innerVars){
                    kyoteRow2 += splitToVariables(m);
                    kyoteRow2 += ",";
                }
                kyoteRow2 = kyoteRow2.replace(/,$/, "");
                // 次に、編集可能だった時を考える。
                if (direction == "R2We"){
                    // どうやら編集可能にするようだ。
                    kyoteRow += `<input type="text" class="form-control" id=0 value=${kyoteRow2.replaceAll("&ensp;", " ").replaceAll("\"", "\\\"")}></input>`;
                } else {
                    // そのまま書ける。
                    kyoteRow += kyoteRow2;
                }
                kyoteRow += ")";
                break;
            case "variable":
                // なんとかイコールなんとか
                if (direction == "R2We"){
                    // 変数名も編集可能に
                    kyoteRow += `<input type="text" class="form-control" id=0 value="${programArray.varName}"></input>`;
                } else {
                    // もしくはそのまま
                    kyoteRow += programArray.varName;
                }
                // イコール
                kyoteRow += "&ensp;=&ensp;"
                // そして値
                if (direction == "R2We"){
                    // 値も編集可能に
                    kyoteRow += `<input type="text" class="form-control" id=1 value="${splitToVariables(programArray.innerVars).replaceAll("&ensp;", " ").replaceAll("\"", "\\\"")}"></input>`;
                } else {
                    // ...か、そのまま
                    kyoteRow += splitToVariables(programArray.innerVars);
                }
                // 変数値
                break;
            case "array":
                // なんとかイコール[なんとか]
                if (direction == "R2We"){
                    // 変数名も編集可能に
                    kyoteRow += `<input type="text" class="form-control" id=0 value="${programArray.varName}"></input>`;
                } else {
                    // もしくはそのまま
                    kyoteRow += programArray.varName;
                }
                kyoteRow += "&ensp;=&ensp;[";
                // まずは取り出す。
                let kyoteRow3 = "";
                for (let m of programArray.innerVars){
                    kyoteRow3 += splitToVariables(m);
                    kyoteRow3 += ",";
                }
                kyoteRow3 = kyoteRow3.replace(/,$/, "");
                // 次に、編集可能だった時を考える。
                if (direction == "R2We"){
                    // どうやら編集可能にするようだ。
                    kyoteRow += `<input type="text" class="form-control" id=1 value=${kyoteRow3.replaceAll("&ensp;", " ").replaceAll("\"", "\\\"")}></input>`;
                } else {
                    // そのまま書ける。
                    kyoteRow += kyoteRow3;
                }
                kyoteRow += "]";
                break;

            case "if":
                kyoteRow += "もし&ensp;";
                if (direction == "R2We"){
                    // どうやら編集可能に(ry
                    kyoteRow += `<input type="text" class="form-control" id=0 value="${splitToVariables(programArray.innerVars).replaceAll("&ensp;", " ").replaceAll("\"", "\\\"")}"></input>`;
                } else {
                    kyoteRow += splitToVariables(programArray.innerVars);
                }
                kyoteRow += "&ensp;ならば：";
                break;
            case "ifElse":
                // かんたんかんたーん
                kyoteRow += "そうでなければ：";
                break;
            case "for":
                // たいへんだー
                // 後回しにしちゃえ((
                // さて...作ろうか...
                // 増やすか減らすか
                let selectRow = "";
                if (programArray.innerVars[0].forType == "inc"){
                    selectRow = `
                        <option value="inc" selected>増やし</option>
                        <option value="dec">減らし</option>
                        `;
                } else {
                    selectRow = `
                        <option value="inc">増やし</option>
                        <option value="dec" selected>減らし</option>
                        `;
                }
                // variableName,(fromValue,endValue,stepVal,)forTypeのどれか
                if (direction == "R2We"){
                    // ...を定義した後、本文作成
                    kyoteRow += `
                        変数&emsp;
                        <input type="text" class="form-control" id=0 value="${programArray.innerVars[0].variableName}"></input>
                        &ensp;を&ensp;
                        <input type="text" class="form-control" id=1 value="${splitToVariables(programArray.innerVars[0].fromValue).replaceAll("&ensp;", " ").replaceAll("\"", "\\\"")}"></input>
                        &ensp;から&ensp;
                        <input type="text" class="form-control" id=2 value="${splitToVariables(programArray.innerVars[0].endValue).replaceAll("&ensp;", " ").replaceAll("\"", "\\\"")}"></input>
                        &ensp;まで&ensp;
                        <input type="text" class="form-control" id=3 value="${splitToVariables(programArray.innerVars[0].stepVal).replaceAll("&ensp;", " ").replaceAll("\"", "\\\"")}"></input>
                        &ensp;ずつ&ensp;
                        <select class="form-select">
                            ${selectRow}
                        </select>
                        ながら&ensp;繰り返す：
                        `;
                    // ふー、やっとできた
                } else {
                    kyoteRow += `
                        変数&ensp;
                        ${programArray.innerVars[0].variableName}
                        &ensp;を&ensp;
                        ${splitToVariables(programArray.innerVars[0].fromValue)}
                        &ensp;から&ensp;
                        ${splitToVariables(programArray.innerVars[0].endValue)}
                        &ensp;まで&ensp;
                        ${splitToVariables(programArray.innerVars[0].stepVal)}
                        &ensp;ずつ&ensp;
                        ${(programArray.innerVars[0].forType == "inc") ? "増やし":"減らし"}
                        ながら&ensp;繰り返す：
                        `;
                }
                break;
            case "while":
                // ifコピペ
                if (direction == "R2We"){
                    // どうやら編集可(ry
                    kyoteRow += `<input type="text" class="form-control" id=0 value="${splitToVariables(programArray.innerVars).replaceAll("&ensp;", " ").replaceAll("\"", "\\\"")}"></input>`;
                } else {
                    kyoteRow += splitToVariables(programArray.innerVars);
                }
                kyoteRow += "&ensp;になるまで繰り返す：";
                break;
            case "endLoop":
                // かんたーん
                kyoteRow += "↩️";
                break;
        }
        if (kyoteRow == null){
            error = 1;
            kyoteRow = "変換できませんでした。";
        }
        return [error, kyoteRow];
    }
}

function getButton(whyButtonPress){
    let resultArray = [];
    // print, variable, array, if,
    // ifElse, for, while, endLoop
    // のどれか
    switch(whyButtonPress){
        case "print":
            resultArray.push(gi("printInput").value);
            break;
        case "variable":
            resultArray.push(gi("variableInput1").value);
            resultArray.push(gi("variableInput2").value);
            break;
        case "array":
            resultArray.push(gi("arrayInput1").value);
            resultArray.push(gi("arrayInput2").value);
            break;
        case "if":
            resultArray.push(gi("ifInput").value);
            break;
        case "ifElse":
            break;
        case "for":
            resultArray.push(gi("forInput1").value);
            resultArray.push(gi("forInput2").value);
            resultArray.push(gi("forInput3").value);
            resultArray.push(gi("forInput4").value);
            resultArray.push(gi("forInput5").value);
            break;
        case "while":
            resultArray.push(gi("whileInput").value);
            break;
        case "endLoop":
            break;
    }
    // とりあえず変換して元に戻すのをするだけ。
    // 同時に両方チェックできる
    // まず作る
    try{
    let converted = generateRows("I2R", whyButtonPress, resultArray);
    if (converted[0] == 1){
        // エラー出てた。
        alert("0番エラー"+converted[1]);
        return;
    }
    let newconverted = generateRows("R2W", converted[1]);
    if (newconverted[0] == 1){
        // エラー出てた。
        alert("1番エラー"+newconverted[1]);
        return;
    } else {
        // エラー出てない
        alert(newconverted[1].replaceAll(" ", "").replaceAll("&ensp;", " ").replaceAll("\n", ""));
        return;
    }
    } catch(e){
        alert(e.toString());
    }
}
