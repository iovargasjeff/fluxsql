"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSQL = parseSQL;
exports.parseJSON = parseJSON;
exports.toMermaid = toMermaid;
const postgresql_1 = require("./dialects/postgresql");
const mysql_1 = require("./dialects/mysql");
const sqlserver_1 = require("./dialects/sqlserver");
const layout_1 = require("./utils/layout");
__exportStar(require("./types"), exports);
function parseSQL(ddl, dialect = 'postgresql') {
    try {
        if (!ddl || typeof ddl !== 'string' || ddl.trim() === '') {
            return { nodes: [], edges: [], errors: [] };
        }
        if (dialect === 'postgresql') {
            return (0, postgresql_1.parsePostgreSQL)(ddl);
        }
        else if (dialect === 'mysql') {
            return (0, mysql_1.parseMySQL)(ddl);
        }
        else if (dialect === 'sqlserver') {
            return (0, sqlserver_1.parseSQLServer)(ddl);
        }
        return {
            nodes: [],
            edges: [],
            errors: [{ message: `Dialecto ${dialect} no implementado` }]
        };
    }
    catch (err) {
        return {
            nodes: [],
            edges: [],
            errors: [{ message: err instanceof Error ? err.message : 'Error desconocido' }]
        };
    }
}
function parseJSON(jsonString) {
    try {
        const parsed = JSON.parse(jsonString);
        if (!parsed || typeof parsed !== 'object') {
            return { nodes: [], edges: [], errors: [{ message: 'El JSON debe ser un objeto' }] };
        }
        return processJsonObject(parsed);
    }
    catch (err) {
        return {
            nodes: [],
            edges: [],
            errors: [{ message: err instanceof Error ? err.message : 'JSON inválido' }]
        };
    }
}
function processJsonObject(obj) {
    const nodes = [];
    const edges = [];
    const isJsonSchema = obj.$schema !== undefined || obj.properties !== undefined;
    if (isJsonSchema) {
        return processJsonSchema(obj);
    }
    const entries = Object.entries(obj);
    const positions = (0, layout_1.calculateLayout)(entries.length);
    entries.forEach(([collectionName, fields], index) => {
        const columns = [];
        if (typeof fields === 'object' && fields !== null) {
            Object.entries(fields).forEach(([fieldName, fieldType]) => {
                let typeStr = 'UNKNOWN';
                let isForeignKey = false;
                if (typeof fieldType === 'string') {
                    typeStr = fieldType.toUpperCase();
                }
                else if (typeof fieldType === 'object' && fieldType !== null) {
                    typeStr = 'OBJECT';
                }
                else {
                    typeStr = String(typeof fieldType).toUpperCase();
                }
                columns.push({
                    name: fieldName,
                    type: typeStr,
                    isPrimaryKey: fieldName === '_id' || fieldName === 'id',
                    isForeignKey: isForeignKey,
                });
            });
        }
        nodes.push({
            id: collectionName.toLowerCase(),
            type: 'tableNode',
            position: positions[index] ?? { x: 0, y: 0 },
            data: { tableName: collectionName, columns }
        });
    });
    return { nodes, edges, errors: [] };
}
function processJsonSchema(obj) {
    const nodes = [];
    const edges = [];
    const title = typeof obj.title === 'string' ? obj.title : 'Root';
    const properties = obj.properties || {};
    const positions = (0, layout_1.calculateLayout)(1);
    const columns = [];
    Object.entries(properties).forEach(([fieldName, fieldSchema]) => {
        let typeStr = 'UNKNOWN';
        if (fieldSchema && typeof fieldSchema === 'object' && 'type' in fieldSchema) {
            typeStr = String(fieldSchema.type).toUpperCase();
        }
        columns.push({
            name: fieldName,
            type: typeStr,
            isPrimaryKey: fieldName === '_id' || fieldName === 'id',
            isForeignKey: false,
        });
    });
    nodes.push({
        id: title.toLowerCase(),
        type: 'tableNode',
        position: positions[0] ?? { x: 0, y: 0 },
        data: { tableName: title, columns }
    });
    return { nodes, edges, errors: [] };
}
function toMermaid(nodes, edges) {
    if (nodes.length === 0) {
        return { code: 'erDiagram\n', isEmpty: true };
    }
    let code = 'erDiagram\n';
    // Print tables and columns
    nodes.forEach((node) => {
        const tableName = node.data.tableName.replace(/\s+/g, '_');
        code += `  ${tableName} {\n`;
        node.data.columns.forEach((col) => {
            let suffix = '';
            if (col.isPrimaryKey)
                suffix = ' PK';
            else if (col.isForeignKey)
                suffix = ' FK';
            // Sanitizamos el tipo y nombre reemplazando espacios
            const colType = col.type.replace(/\s+/g, '_');
            const colName = col.name.replace(/\s+/g, '_');
            code += `    ${colType} ${colName}${suffix}\n`;
        });
        code += `  }\n`;
    });
    // Print relationships
    const uniqueEdges = new Set();
    edges.forEach((edge) => {
        const sourceNode = nodes.find((n) => n.id === edge.source);
        const targetNode = nodes.find((n) => n.id === edge.target);
        const sourceTable = (sourceNode?.data.tableName ?? edge.source).replace(/\s+/g, '_');
        const targetTable = (targetNode?.data.tableName ?? edge.target).replace(/\s+/g, '_');
        const key = `${sourceTable}-${targetTable}`;
        if (!uniqueEdges.has(key)) {
            uniqueEdges.add(key);
            code += `  ${sourceTable} ||--o{ ${targetTable} : "FK"\n`;
        }
    });
    return { code, isEmpty: false };
}
