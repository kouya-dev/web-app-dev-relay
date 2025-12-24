export interface Token {
    type: 'number' | 'text' | 'enzan' | 'arrayLength' | 'var';
    value: string | number;
}

export type Expression =
    | { type: 'and' }
    | { type: 'or' }
    | { type: 'not' }
    | { type: 'siki', oneArg: Token[], Value: string, twoArg: Token[] };

export interface ForLoopData {
    variableName: string;
    fromValue: Token[];
    endValue: Token[];
    stepVal: Token[];
    forType: 'inc' | 'dec';
}

export interface RowData {
    name: string;
    varName?: string;
    innerVars: Token[][] | Token[] | Expression[] | ForLoopData[] | {};
    nestValue: number;
}

// --- New Structured Render Types ---
export type RenderSegment =
  | { type: 'text'; content: string }
  | { type: 'input'; id: number; value: string }
  | { type: 'select'; options: { value: string; label: string }[]; selectedValue: string };

export type GenerateRowsResult = [number, RowData | string | RenderSegment[]];

// --- Private Helper Functions ---
function inQuotes(val: string): boolean {
    let inQuotes = false;
    val = val || ""; // Handle null/undefined input
    const chars = val.split("");
    for (let i = 0; i < chars.length; i++) {
        const c = chars[i];
        if (c === '"') {
            if (chars[i + 1] === '"') {
                i++;
                continue;
            }
            inQuotes = !inQuotes;
        }
    }
    return inQuotes;
}

function variablesToSplit(val: string): Token[] {
    if (typeof val !== 'string') return [];
    const parts = val.trim().split(/([+\-*/])(?=(?:[^"]*"[^"]*")*[^"]*$)/);
    const tempArr: Token[] = [];
    parts.forEach(form => {
        form = form.trim();
        if (form === "") return;

        if (!isNaN(Number(form)) && form !== "") {
            tempArr.push({ type: "number", value: Number(form) });
        } else if (/^".*"$/.test(form)) {
            tempArr.push({ type: "text", value: form.slice(1, -1).replace(/""/g, '"') });
        } else if (/^[+\-*/]$/.test(form)) {
            tempArr.push({ type: "enzan", value: form });
        } else if (/^\(.*\)の長さ$/.test(form)) {
            tempArr.push({ type: "arrayLength", value: form.replace("(", "").replace(")の長さ", "") });
        } else {
            tempArr.push({ type: "var", value: form });
        }
    });
    return tempArr;
}

function parseSiki(siki: string): Expression[] {
    const outtemp: Expression[] = [];
    if (typeof siki !== 'string') return outtemp;

    const parts = siki.trim().split(/\s*(\band\b|\bor\b|!(?!\=))\s*(?=(?:[^"]*"[^"]*")*[^"]*$)/);
    parts.forEach((c) => {
        c = c ? c.trim() : "";
        if (c === "and") {
            outtemp.push({ type: "and" });
        } else if (c === "or") {
            outtemp.push({ type: "or" });
        } else if (c === "!") {
            outtemp.push({ type: "not" });
        } else if (c && /==|!=|<=|>=|<|>/.test(c)) {
            const sikienzan = c.split(/(==|!=|<=|>=|<|>)/);
            outtemp.push({
                type: "siki",
                oneArg: variablesToSplit(sikienzan[0]),
                Value: sikienzan[1],
                twoArg: variablesToSplit(sikienzan[2])
            });
        }
    });
    return outtemp;
}


// --- I2R (Input to RowData) Logic ---
function handleI2R(programName: string, programArray: any[]): GenerateRowsResult {
    let outputValue: RowData['innerVars'] | null = null;
    let nestValue = 0;
    let varName: string | undefined = undefined;

    switch (programName) {
        case "print":
            if (inQuotes(programArray[0])) return [1, "「\"」が閉じていません。"];
            outputValue = programArray[0].split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map((s: string) => variablesToSplit(s));
            break;

        case "variable":
            if (inQuotes(programArray[1])) return [1, "「\"」が閉じていません。"];
            varName = programArray[0];
            outputValue = variablesToSplit(programArray[1]);
            break;

        case "array":
            if (inQuotes(programArray[1])) return [1, "「\"」が閉じていません。"];
            varName = programArray[0];
            outputValue = programArray[1].split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map((s: string) => variablesToSplit(s));
            break;

        case "if":
        case "while":
            nestValue = 1;
            if (inQuotes(programArray[0])) return [1, "「\"」が閉じていません。"];
            outputValue = parseSiki(programArray[0]);
            break;

        case "for":
            nestValue = 1;
            if (typeof programArray[0] !== "string" || inQuotes(programArray[1]) || inQuotes(programArray[2]) || inQuotes(programArray[3])) {
                return [1, "「\"」が閉じていません、または変数名が不正です。"];
            }
            outputValue = [{
                variableName: programArray[0],
                fromValue: variablesToSplit(programArray[1]),
                endValue: variablesToSplit(programArray[2]),
                stepVal: variablesToSplit(programArray[3]),
                forType: programArray[4]
            }];
            break;

        case "ifElse":
            nestValue = 1;
            outputValue = {};
            break;

        case "endLoop":
            nestValue = -1;
            outputValue = {};
            break;

        default:
             return [1, "変換できませんでした。"];
    }

    if (outputValue === null) {
        return [1, "変換できませんでした。"];
    }

    const rowData: RowData = {
        name: programName,
        innerVars: outputValue,
        nestValue,
    };
    if (varName) {
        rowData.varName = varName;
    }
    return [0, rowData];
}

// --- R2S (RowData to Structured) Logic ---
function splitToVariablesString(objArray: (Token | Expression)[]): string {
    let objTemp = "";
    if (!Array.isArray(objArray)) return "";

    objArray.forEach((obj) => {
        if (!obj || !obj.type) return;

        switch (obj.type) {
            case "number": objTemp += ` ${obj.value} `; break;
            case "text": objTemp += ` "${(obj.value as string).replace(/"/g, '""')}" `; break;
            case "enzan": objTemp += ` ${obj.value} `; break;
            case "arrayLength": objTemp += ` (${obj.value})の長さ `; break;
            case "var": objTemp += ` ${obj.value} `; break;
            case "and": objTemp += " and "; break;
            case "or": objTemp += " or "; break;
            case "not": objTemp += "!"; break;
            case "siki":
                const siki = obj as Expression & { type: 'siki' };
                objTemp += ` ${splitToVariablesString(siki.oneArg)} ${siki.Value} ${splitToVariablesString(siki.twoArg)} `;
                break;
        }
    });
    return objTemp.trim().replace(/\s+/g, ' ');
}


function handleR2S(programArray: RowData, isEditable: boolean): [number, RenderSegment[]] {
    const segments: RenderSegment[] = [];

    const createSelect = (selectedValue: 'inc' | 'dec'): RenderSegment => ({
        type: 'select',
        selectedValue,
        options: [
            { value: 'inc', label: '増やし' },
            { value: 'dec', label: '減らし' }
        ]
    });

    switch (programArray.name) {
        case "print":
            const printContent = (programArray.innerVars as Token[][]).map(m => splitToVariablesString(m)).join(',');
            segments.push({ type: 'text', content: '表示する(' });
            if (isEditable) segments.push({ type: 'input', id: 0, value: printContent });
            else segments.push({ type: 'text', content: printContent });
            segments.push({ type: 'text', content: ')' });
            break;

        case "variable":
            const varName = programArray.varName || "";
            const varContent = splitToVariablesString(programArray.innerVars as Token[]);
            if (isEditable) segments.push({ type: 'input', id: 0, value: varName });
            else segments.push({ type: 'text', content: varName });
            segments.push({ type: 'text', content: ' = ' });
            if (isEditable) segments.push({ type: 'input', id: 1, value: varContent });
            else segments.push({ type: 'text', content: varContent });
            break;

        case "array":
            const arrayName = programArray.varName || "";
            const arrayContent = (programArray.innerVars as Token[][]).map(m => splitToVariablesString(m)).join(',');
            if (isEditable) segments.push({ type: 'input', id: 0, value: arrayName });
            else segments.push({ type: 'text', content: arrayName });
            segments.push({ type: 'text', content: ' = [' });
            if (isEditable) segments.push({ type: 'input', id: 1, value: arrayContent });
            else segments.push({ type: 'text', content: arrayContent });
            segments.push({ type: 'text', content: ']' });
            break;

        case "if":
            const ifContent = splitToVariablesString(programArray.innerVars as Expression[]);
            segments.push({ type: 'text', content: 'もし ' });
            if (isEditable) segments.push({ type: 'input', id: 0, value: ifContent });
            else segments.push({ type: 'text', content: ifContent });
            segments.push({ type: 'text', content: ' ならば：' });
            break;

        case "while":
            const whileContent = splitToVariablesString(programArray.innerVars as Expression[]);
            if (isEditable) segments.push({ type: 'input', id: 0, value: whileContent });
            else segments.push({ type: 'text', content: whileContent });
            segments.push({ type: 'text', content: ' になるまで繰り返す：' });
            break;

        case "for":
            const forData = (programArray.innerVars as ForLoopData[])[0];
            segments.push({ type: 'text', content: '変数 ' });
            if (isEditable) {
                segments.push({ type: 'input', id: 0, value: forData.variableName });
                segments.push({ type: 'text', content: ' を ' });
                segments.push({ type: 'input', id: 1, value: splitToVariablesString(forData.fromValue) });
                segments.push({ type: 'text', content: ' から ' });
                segments.push({ type: 'input', id: 2, value: splitToVariablesString(forData.endValue) });
                segments.push({ type: 'text', content: ' まで ' });
                segments.push({ type: 'input', id: 3, value: splitToVariablesString(forData.stepVal) });
                segments.push({ type: 'text', content: ' ずつ ' });
                segments.push(createSelect(forData.forType));
                segments.push({ type: 'text', content: ' ながら繰り返す：' });
            } else {
                segments.push({ type: 'text', content: forData.variableName });
                segments.push({ type: 'text', content: ' を ' });
                segments.push({ type: 'text', content: splitToVariablesString(forData.fromValue) });
                segments.push({ type: 'text', content: ' から ' });
                segments.push({ type: 'text', content: splitToVariablesString(forData.endValue) });
                segments.push({ type: 'text', content: ' まで ' });
                segments.push({ type: 'text', content: splitToVariablesString(forData.stepVal) });
                segments.push({ type: 'text', content: ' ずつ ' });
                segments.push({ type: 'text', content: forData.forType === 'inc' ? '増やし' : '減らし' });
                segments.push({ type: 'text', content: ' ながら繰り返す：' });
            }
            break;

        case "ifElse":
            segments.push({ type: 'text', content: 'そうでなければ：' });
            break;

        case "endLoop":
            segments.push({ type: 'text', content: '↩️' });
            break;

        default:
            return [1, [{ type: 'text', content: '変換できませんでした。' }]];
    }
    return [0, segments];
}


// --- Main Exported Function ---
export function generateRows(direction: string, ...textAndOther: any[]): GenerateRowsResult {
    try {
        if (direction === "I2R") {
            const [programName, programArray] = textAndOther;
            return handleI2R(programName, programArray);
        }

        if (direction === "R2S" || direction === "R2Se") {
            const [programData] = textAndOther;
            return handleR2S(programData, direction === "R2Se");
        }
    } catch (e) {
        if (e instanceof Error) {
            console.error(e.message);
            return [1, `予期せぬエラーが発生しました: ${e.message}`];
        }
        return [1, "予期せぬエラーが発生しました。"];
    }

    return [1, "無効な direction です。"];
}
