import { ParseResult, FlowNode, FlowEdge } from './types';
export * from './types';
export declare function parseSQL(ddl: string, dialect?: 'postgresql' | 'mysql' | 'sqlserver'): ParseResult;
export declare function parseJSON(jsonString: string): ParseResult;
export interface MermaidResult {
    code: string;
    isEmpty: boolean;
}
export declare function toMermaid(nodes: FlowNode[], edges: FlowEdge[]): MermaidResult;
