import { ParseResult } from './types'
import { parsePostgreSQL } from './dialects/postgresql'

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
    }

    // Fallback para otros dialectos no implementados todavía
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
