import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'

const dbPath = process.env.DATABASE_PATH || './local.db'
const db = drizzle(new Database(dbPath), { schema })

export { db, schema }
