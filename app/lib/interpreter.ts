import { RowData, Token, Expression, ForLoopData } from './visual-editor';

// Type for storing variables and arrays
type ProgramState = {
    variables: Map<string, any>;
    arrays: Map<string, any[]>;
};

// Type for the execution result
type ExecutionResult = {
    output: string[];
    errors: string[];
    finalState: ProgramState;
};

export class Interpreter {
    private state: ProgramState;
    private program: RowData[];
    private programCounter: number;
    private output: string[];
    private errors: string[];
    private loopStack: { type: 'for' | 'while', start: number }[];

    constructor(program: RowData[]) {
        this.program = program;
        this.state = {
            variables: new Map(),
            arrays: new Map(),
        };
        this.programCounter = 0;
        this.output = [];
        this.errors = [];
        this.loopStack = [];
    }

    private findMatchingEnd(startIndex: number): number {
        let nestLevel = 1;
        for (let i = startIndex + 1; i < this.program.length; i++) {
            const row = this.program[i];
            if (row.nestValue > 0) {
                nestLevel++;
            } else if (row.nestValue < 0) {
                nestLevel--;
            }

            if (nestLevel === 0) {
                return i;
            }
        }
        return -1; // Not found
    }

    private findMatchingElseOrEnd(startIndex: number): { type: 'else' | 'end', index: number } | null {
        let nestLevel = 1;
        for (let i = startIndex + 1; i < this.program.length; i++) {
            const row = this.program[i];
             if (row.nestValue > 0) {
                nestLevel++;
            } else if (row.nestValue < 0) {
                nestLevel--;
            }

            if (nestLevel === 0) {
                 return { type: 'end', index: i };
            }

            if (nestLevel === 1 && row.name === 'ifElse') {
                return { type: 'else', index: i };
            }
        }
        return null; // Not found
    }

    public async execute(onStep: (pc: number, state: ProgramState) => void, stepDelay: number): Promise<ExecutionResult> {
        this.programCounter = 0;

        while (this.programCounter < this.program.length) {
            onStep(this.programCounter, this.state);
            const currentRow = this.program[this.programCounter];

            try {
                switch (currentRow.name) {
                    case 'print':
                        const printVars = currentRow.innerVars as Token[][];
                        const outputParts = printVars.map(tokens => {
                            const val = this.evaluateTokens(tokens);
                            return val === undefined ? "undefined" : val.toString();
                        });
                        this.output.push(outputParts.join(''));
                        break;

                    case 'variable':
                        const varName = currentRow.varName!;
                        const varValue = this.evaluateTokens(currentRow.innerVars as Token[]);
                        this.state.variables.set(varName, varValue);
                        break;

                    case 'array':
                        const arrayName = currentRow.varName!;
                        const arrayValues = (currentRow.innerVars as Token[][]).map(tokens => this.evaluateTokens(tokens));
                        this.state.arrays.set(arrayName, arrayValues);
                        break;

                    case 'if':
                        const ifCondition = await this.evaluateCondition(currentRow.innerVars as Expression[]);
                        if (!ifCondition) {
                            const nextBlock = this.findMatchingElseOrEnd(this.programCounter);
                            if (nextBlock) {
                                this.programCounter = nextBlock.index -1;
                            } else {
                                throw new Error("Missing corresponding 'else' or 'end' for 'if' block.");
                            }
                        }
                        break;

                    case 'while':
                        this.loopStack.push({ type: 'while', start: this.programCounter });
                        const whileCondition = await this.evaluateCondition(currentRow.innerVars as Expression[]);
                        if (!whileCondition) {
                             const endLoopIndex = this.findMatchingEnd(this.programCounter);
                             if (endLoopIndex !== -1) {
                                 this.programCounter = endLoopIndex - 1;
                                 this.loopStack.pop();
                             } else {
                                 throw new Error("Missing corresponding 'endLoop' for 'while' block.");
                             }
                        }
                        break;

                    case 'for':
                        const forData = (currentRow.innerVars as ForLoopData[])[0];
                        const from = this.evaluateTokens(forData.fromValue);
                        const to = this.evaluateTokens(forData.endValue);

                        if (!this.state.variables.has(forData.variableName)) {
                             this.state.variables.set(forData.variableName, from);
                             this.loopStack.push({ type: 'for', start: this.programCounter });
                        }

                        const currentValue = this.state.variables.get(forData.variableName);

                        let loopContinue = false;
                        if (forData.forType === 'inc') {
                            loopContinue = currentValue <= to;
                        } else {
                            loopContinue = currentValue >= to;
                        }

                        if (!loopContinue) {
                            const endLoopIndex = this.findMatchingEnd(this.programCounter);
                            if (endLoopIndex !== -1) {
                                this.programCounter = endLoopIndex - 1;
                                this.state.variables.delete(forData.variableName);
                                this.loopStack.pop();
                            } else {
                                throw new Error("Missing corresponding 'endLoop' for 'for' block.");
                            }
                        }
                        break;

                    case 'ifElse':
                        const endIfIndex = this.findMatchingEnd(this.programCounter);
                        if (endIfIndex !== -1) {
                            this.programCounter = endIfIndex;
                        } else {
                            throw new Error("Missing corresponding 'end' for 'else' block.");
                        }
                        break;

                    case 'endLoop':
                        if (this.loopStack.length === 0) break;

                        const lastLoop = this.loopStack[this.loopStack.length - 1];
                        if (lastLoop.type === 'while') {
                            this.programCounter = lastLoop.start - 1;
                        } else if (lastLoop.type === 'for') {
                            const forRow = this.program[lastLoop.start];
                            const forData = (forRow.innerVars as ForLoopData[])[0];
                            const step = this.evaluateTokens(forData.stepVal);
                            let currentValue = this.state.variables.get(forData.variableName);

                            if (forData.forType === 'inc') {
                                currentValue += step;
                            } else {
                                currentValue -= step;
                            }
                            this.state.variables.set(forData.variableName, currentValue);
                            this.programCounter = lastLoop.start - 1;
                        }
                        break;
                }
            } catch (e: any) {
                this.errors.push(`Runtime Error at line ${this.programCounter + 1}: ${e.message}`);
                onStep(-1, this.state);
                return {
                    output: this.output,
                    errors: this.errors,
                    finalState: this.state,
                };
            }

            this.programCounter++;

            if (stepDelay > 0) {
                await new Promise(resolve => setTimeout(resolve, stepDelay));
            }
        }

        onStep(-1, this.state);
        return {
            output: this.output,
            errors: this.errors,
            finalState: this.state,
        };
    }

    private getValue(token: Token): any {
        switch (token.type) {
            case 'number':
            case 'text':
                return token.value;
            case 'var':
                if (this.state.variables.has(token.value as string)) {
                    return this.state.variables.get(token.value as string);
                }
                this.errors.push(`Error: Variable '${token.value}' is not defined.`);
                throw new Error(`Variable '${token.value}' is not defined.`);
            case 'arrayLength':
                 if (this.state.arrays.has(token.value as string)) {
                    return this.state.arrays.get(token.value as string)!.length;
                }
                this.errors.push(`Error: Array '${token.value}' is not defined.`);
                throw new Error(`Array '${token.value}' is not defined.`);
            default:
                this.errors.push(`Error: Unknown token type for getValue: ${token.type}`);
                throw new Error(`Unknown token type for getValue: ${token.type}`);
        }
    }

    private evaluateTokens(tokens: Token[]): any {
        if (!tokens || tokens.length === 0) {
            return undefined;
        }

        if (tokens.length === 1) {
            const value = this.getValue(tokens[0]);
            if (typeof value === 'string' && !isNaN(Number(value)) && value.trim() !== '') {
                return Number(value);
            }
            return value;
        }

        const values: any[] = [];
        const ops: string[] = [];

        tokens.forEach(token => {
            if (token.type === 'enzan') {
                ops.push(token.value as string);
            } else {
                values.push(this.getValue(token));
            }
        });

        const newValues: any[] = [];
        const newOps: string[] = [];
        let currentVal = values[0];

        for (let i = 0; i < ops.length; i++) {
            const op = ops[i];
            const nextVal = values[i + 1];
            if (op === '*') {
                currentVal *= nextVal;
            } else if (op === '/') {
                if (nextVal === 0) {
                    this.errors.push("Error: Division by zero.");
                    throw new Error("Division by zero.");
                }
                currentVal /= nextVal;
            } else {
                newValues.push(currentVal);
                newOps.push(op);
                currentVal = nextVal;
            }
        }
        newValues.push(currentVal);

        let result = newValues[0];
        for (let i = 0; i < newOps.length; i++) {
            const op = newOps[i];
            const nextVal = newValues[i + 1];
            if (op === '+') {
                result += nextVal;
            } else if (op === '-') {
                result -= nextVal;
            }
        }

        if (typeof result === 'string' && !isNaN(Number(result)) && result.trim() !== '') {
            return Number(result);
        }
        return result;
    }

    private async evaluateCondition(expressions: Expression[]): Promise<boolean> {
        if (!expressions || expressions.length === 0) {
            return true;
        }

        const evaluatedSikis = expressions.map(expr => {
            if (expr.type === 'siki') {
                const left = this.evaluateTokens(expr.oneArg);
                const right = this.evaluateTokens(expr.twoArg);
                switch (expr.Value) {
                    case '==': return (left == right);
                    case '!=': return (left != right);
                    case '<': return (left < right);
                    case '<=': return (left <= right);
                    case '>': return (left > right);
                    case '>=': return (left >= right);
                    default:
                        this.errors.push(`Error: Unknown comparison operator '${expr.Value}'`);
                        throw new Error(`Unknown comparison operator '${expr.Value}'`);
                }
            }
            return expr;
        });

        if (evaluatedSikis.length === 1 && typeof evaluatedSikis[0] === 'boolean') {
             return evaluatedSikis[0];
        }

        const afterAnd: (boolean | { type: 'or' })[] = [];
        let i = 0;
        while (i < evaluatedSikis.length) {
            const current = evaluatedSikis[i];
            if (typeof current === 'object' && current.type === 'and') {
                const left = afterAnd.pop() as boolean;
                const right = evaluatedSikis[i + 1] as boolean;
                afterAnd.push(left && right);
                i += 2;
            } else {
                afterAnd.push(current as any);
                i++;
            }
        }

        let finalResult = false;
        if (afterAnd.length > 0 && typeof afterAnd[0] === 'boolean'){
            finalResult = afterAnd[0];
        }

        for (let j = 1; j < afterAnd.length; j += 2) {
            const right = afterAnd[j + 1] as boolean;
            finalResult = finalResult || right;
        }

        return finalResult;
    }
}
