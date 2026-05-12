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

GET_TABLE_DDL_QUERY = """
                      SELECT 'CREATE TABLE ' || n.nspname || '.' || c.relname || ' (\n' ||
                             string_agg(
                                     '    ' ||
                                     a.attname || ' ' ||
                                     pg_catalog.format_type(a.atttypid, a.atttypmod) ||
                                     CASE
                                         WHEN a.attnotnull THEN ' NOT NULL'
                                         ELSE ''
                                         END ||
                                     CASE
                                         WHEN ad.adbin IS NOT NULL
                                             THEN ' DEFAULT ' || pg_get_expr(ad.adbin, ad.adrelid)
                                         ELSE ''
                                         END,
                                     E',\n'
        ORDER BY a.attnum
                             ) ||
                             E '\n);' AS ddl
                      FROM pg_class c
                               JOIN pg_namespace n
                                    ON n.oid = c.relnamespace
                               JOIN pg_attribute a
                                    ON a.attrelid = c.oid
                               LEFT JOIN pg_attrdef ad
                                         ON ad.adrelid = a.attrelid
                                             AND ad.adnum = a.attnum
                      WHERE n.nspname = %s
                        AND c.relname = %s
                        AND a.attnum > 0
                        AND NOT a.attisdropped
                      GROUP BY n.nspname, c.relname;
                      """

GET_TABLE_CONSTRAINTS_QUERY = """
                              SELECT tc.constraint_name,
                                     tc.constraint_type,
                                     kcu.column_name,
                                     ccu.table_schema AS foreign_table_schema,
                                     ccu.table_name   AS foreign_table_name,
                                     ccu.column_name  AS foreign_column_name,
                                     chk.check_clause
                              FROM information_schema.table_constraints AS tc
                                       JOIN information_schema.key_column_usage AS kcu
                                            ON tc.constraint_name = kcu.constraint_name
                                                AND tc.table_schema = kcu.table_schema
                                       LEFT JOIN information_schema.constraint_column_usage AS ccu
                                                 ON kcu.constraint_name = ccu.constraint_name
                                       LEFT JOIN information_schema.check_constraints AS chk
                                                 ON tc.constraint_name = chk.constraint_name
                              WHERE tc.table_schema = %s
                                AND tc.table_name = %s;
                              """

GET_TABLE_INDEXES_QUERY = """
                          SELECT indexname AS index_name,
                                 indexdef  AS index_definition
                          FROM pg_indexes
                          WHERE schemaname = %s
                            AND tablename = %s;
                          """

GET_FUNCTIONS_QUERY = """
                      SELECT routine_name,
                             routine_type,
                             data_type AS return_type
                      FROM information_schema.routines
                      WHERE routine_schema = %s
                        AND routine_type IN ('FUNCTION', 'PROCEDURE');
                      """
