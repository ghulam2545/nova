import psycopg2
from psycopg2.extras import RealDictCursor
import os
from core.queries import *
from dotenv import load_dotenv

load_dotenv()

DATABASE_CONFIG = {
    "dbname": os.getenv("DATABASE_NAME", "master"),
    "user": os.getenv("DATABASE_USER", "postgres"),
    "password": os.getenv("DATABASE_PASSWORD", ""),
    "host": os.getenv("DATABASE_HOST", "localhost"),
    "port": os.getenv("DATABASE_PORT", "5432"),
}

class DatabaseManager:
    def __init__(self):
        self.config = DATABASE_CONFIG
        self.conn_params = self.config

    def get_connection(self):
        return psycopg2.connect(**self.conn_params)

    def fetch_all(self, query, params=None):
        with self.get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(query, params)
                rows = cur.fetchall()
                return rows

    def fetch_one(self, query, params=None):
        with self.get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(query, params)
                return cur.fetchone()

    def get_schemas(self):
        query = GET_SCHEMA_QUERY
        return self.fetch_all(query)

    def get_tables(self, schema_name):
        query = GET_TABLES_QUERY
        return self.fetch_all(query, (schema_name,))

    def get_table_ddl(self, schema_name, table_name):
        query = GET_TABLE_DDL_QUERY
        return self.fetch_one(query, (schema_name, table_name))

    def get_extensions(self):
        query = GET_EXTENSIONS_QUERY
        return self.fetch_all(query)

    def get_tables_constraints(self, schema_name, table_name):
        query = GET_TABLE_CONSTRAINTS_QUERY
        return self.fetch_all(query, (schema_name, table_name))
