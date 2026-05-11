GET_SCHEMA_QUERY = """
                   SELECT schema_name
                   FROM information_schema.schemata
                   WHERE schema_name NOT IN ('information_schema')
                   ORDER BY schema_name;
                   """

GET_TABLES_QUERY = """
                SELECT table_name, table_type
                FROM information_schema.tables
                WHERE table_schema = %s
                ORDER BY table_name;
                """