GET_SCHEMA_QUERY = """
                   SELECT schema_name
                   FROM information_schema.schemata
                   WHERE schema_name NOT IN ('information_schema', 'pg_catalog')
                   ORDER BY schema_name;
                   """

GET_TABLES_QUERY = """
                   SELECT table_name, table_type
                   FROM information_schema.tables
                   WHERE table_schema = %s
                   ORDER BY table_name;
                   """

GET_EXTENSIONS_QUERY = """
                       SELECT extname    AS extension_name,
                              extversion AS version,
                              nspname    AS schema_name
                       FROM pg_extension e
                                JOIN pg_namespace n ON n.oid = e.extnamespace
                       ORDER BY extname;
                       """
