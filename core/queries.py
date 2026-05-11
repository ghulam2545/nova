GET_SCHEMA_QUERY = """
                   SELECT schema_name
                   FROM information_schema.schemata
                   WHERE schema_name NOT IN ('information_schema')
                   ORDER BY schema_name;
                   """
