// Simple in-memory database for testing clean architecture
// In production, this would be replaced with a real database connection

export interface InMemoryDB {
  users: Map<string, any>;
  files: Map<string, any>;
  folders: Map<string, any>;
  auditLogs: Map<string, any>;
  backups: Map<string, any>;
}

export const db: InMemoryDB = {
  users: new Map(),
  files: new Map(),
  folders: new Map(),
  auditLogs: new Map(),
  backups: new Map()
};

// Mock query function for compatibility
export const query = (sql: string, params?: any[]) => {
  console.log('Mock query:', sql, params);
  return Promise.resolve([]);
};

// Export a mock db object that looks like Drizzle
export const mockDb = {
  insert: (table: any) => ({
    values: (data: any) => ({
      returning: () => Promise.resolve([data])
    })
  }),
  select: () => ({
    from: (table: any) => ({
      where: (condition: any) => Promise.resolve([])
    })
  }),
  update: (table: any) => ({
    set: (data: any) => ({
      where: (condition: any) => ({
        returning: () => Promise.resolve([data])
      })
    })
  }),
  delete: (table: any) => ({
    where: (condition: any) => Promise.resolve()
  })
};
