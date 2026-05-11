import psycopg2
from psycopg2.extras import RealDictCursor
import os
from core.queries import GET_SCHEMA_QUERY


class DatabaseManager:
    def __init__(self):
        self.conn_params = {
            "dbname": os.getenv("DATABASE_NAME", "master"),
            "user": os.getenv("DATABASE_USER", "postgres"),
            "password": os.getenv("DATABASE_PASSWORD", "ghulam"),
            "host": os.getenv("DATABASE_HOST", "localhost"),
            "port": os.getenv("DATABASE_PORT", "5432")
        }

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
