import { ParseResult } from './types'
import { parsePostgreSQL } from './dialects/postgresql'
import { parseMySQL } from './dialects/mysql'
import { parseSQLServer } from './dialects/sqlserver'

export * from './types'

export function parseSQL(
  ddl: string,
  dialect: 'postgresql' | 'mysql' | 'sqlserver' = 'postgresql'
): ParseResult {
  try {
    if (!ddl || typeof ddl !== 'string' || ddl.trim() === '') {
      return { nodes: [], edges: [], errors: [] }
    }

    if (dialect === 'postgresql') {
      return parsePostgreSQL(ddl)
    } else if (dialect === 'mysql') {
      return parseMySQL(ddl)
    } else if (dialect === 'sqlserver') {
      return parseSQLServer(ddl)
    }

    return {
      nodes: [],
      edges: [],
      errors: [{ message: `Dialecto ${dialect} no implementado` }]
    }
  } catch (err) {
    return {
      nodes: [],
      edges: [],
      errors: [{ message: err instanceof Error ? err.message : 'Error desconocido' }]
    }
  }
}

export function parseJSON(jsonSchema: string): ParseResult {
  return {
    nodes: [],
    edges: [],
    errors: []
  }
}
