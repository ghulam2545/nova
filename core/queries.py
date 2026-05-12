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

GET_INBOUND_DEPENDENCY_QUERY = """
                               SELECT tc.table_schema,
                                      tc.table_name
                               FROM information_schema.table_constraints AS tc
                                        JOIN information_schema.key_column_usage AS kcu
                                             ON tc.constraint_name = kcu.constraint_name
                                                 AND tc.table_schema = kcu.table_schema
                                        JOIN information_schema.constraint_column_usage AS ccu
                                             ON kcu.constraint_name = ccu.constraint_name
                               WHERE ccu.table_schema = %s
                                 AND ccu.table_name = %s
                                 AND tc.constraint_type = 'FOREIGN KEY';
                               """

GET_OUTBOUND_DEPENDENCY_QUERY = """
                                SELECT ccu.table_schema,
                                       ccu.table_name
                                FROM information_schema.table_constraints AS tc
                                         JOIN information_schema.key_column_usage AS kcu
                                              ON tc.constraint_name = kcu.constraint_name
                                                  AND tc.table_schema = kcu.table_schema
                                         JOIN information_schema.constraint_column_usage AS ccu
                                              ON kcu.constraint_name = ccu.constraint_name
                                WHERE tc.table_schema = %s
                                  AND tc.table_name = %s
                                  AND tc.constraint_type = 'FOREIGN KEY';
                                """

GET_TABLE_SIZES_QUERY = """SELECT t.table_schema,
                                  t.table_name,
                                  pg_size_pretty(
                                          pg_total_relation_size(
                                                  quote_ident(t.table_schema) || '.' || quote_ident(t.table_name)
                                          )
                                  ) AS total_size,
                                  pg_size_pretty(
                                          pg_relation_size(
                                                  quote_ident(t.table_schema) || '.' || quote_ident(t.table_name)
                                          )
                                  ) AS table_size,
                                  pg_size_pretty(
                                          pg_total_relation_size(
                                                  quote_ident(t.table_schema) || '.' || quote_ident(t.table_name)
                                          ) - pg_relation_size(
                                                  quote_ident(t.table_schema) || '.' || quote_ident(t.table_name)
                                              )
                                  ) AS indexes_size
                           FROM information_schema.tables t
                           WHERE t.table_schema = %s
                             AND t.table_name = %s;
                        """

GET_TABLE_STATS_QUERY = """
                        SELECT n.nspname                   AS schema_name,
                               c.relname                   AS table_name,
                               c.relkind                   AS table_type,
                               pg_size_pretty(
                                       pg_relation_size(
                                               quote_ident(n.nspname) || '.' || quote_ident(c.relname)
                                       )
                               )                           AS table_size,
                               pg_size_pretty(
                                       pg_indexes_size(
                                               quote_ident(n.nspname) || '.' || quote_ident(c.relname)
                                       )
                               )                           AS indexes_size,
                               pg_size_pretty(
                                       pg_total_relation_size(
                                               quote_ident(n.nspname) || '.' || quote_ident(c.relname)
                                       )
                               )                           AS total_size,
                               obj_description(c.oid)      AS table_comment,
                               pg_get_userbyid(c.relowner) AS owner_name
                        FROM pg_class c
                                 JOIN pg_namespace n
                                      ON n.oid = c.relnamespace

                        WHERE n.nspname = %s
                          AND c.relname = %s;
                        """

GET_ROLES_QUERY = """
                  SELECT r.rolname                             AS role_name,
                         r.rolsuper                            AS is_superuser,
                         r.rolinherit                          AS can_inherit,
                         r.rolcreaterole                       AS can_create_role,
                         r.rolcreatedb                         AS can_create_db,
                         r.rolcanlogin                         AS can_login,
                         r.rolreplication                      AS replication_role,
                         r.rolbypassrls                        AS bypass_row_level_security,
                         r.rolconnlimit                        AS connection_limit,
                         r.rolvaliduntil                       AS password_expiry,
                         shobj_description(r.oid, 'pg_authid') AS comment
                  FROM pg_roles r
                  ORDER BY r.rolname;
                  """

GET_TABLE_GRANTS_QUERY = """
                         SELECT grantee,
                                privilege_type,
                                is_grantable
                         FROM information_schema.table_privileges
                         WHERE table_schema = %s
                           AND table_name = %s
                         ORDER BY grantee, privilege_type;
                         """

GET_ENUMS_FROM_SCHEMA_QUERY = """
                              SELECT n.nspname       AS schema_name,
                                     t.typname       AS enum_name,
                                     e.enumlabel     AS enum_value,
                                     e.enumsortorder AS sort_order
                              FROM pg_type t
                                       JOIN pg_enum e
                                            ON t.oid = e.enumtypid
                                       JOIN pg_namespace n
                                            ON n.oid = t.typnamespace
                              WHERE n.nspname = %s
                              ORDER BY t.typname, e.enumsortorder;
                              """

GET_TABLE_RELATIONSHIPS_QUERY = """
                                SELECT tc.constraint_name,
                                       tc.table_schema,
                                       tc.table_name,
                                       kcu.column_name,
                                       ccu.table_schema AS foreign_table_schema,
                                       ccu.table_name   AS foreign_table_name,
                                       ccu.column_name  AS foreign_column_name,
                                       rc.update_rule,
                                       rc.delete_rule,
                                       tc.constraint_type
                                FROM information_schema.table_constraints tc
                                         JOIN information_schema.key_column_usage kcu
                                              ON tc.constraint_name = kcu.constraint_name
                                                  AND tc.table_schema = kcu.table_schema
                                         JOIN information_schema.constraint_column_usage ccu
                                              ON ccu.constraint_name = tc.constraint_name
                                                  AND ccu.table_schema = tc.table_schema
                                         LEFT JOIN information_schema.referential_constraints rc
                                                   ON rc.constraint_name = tc.constraint_name
                                                       AND rc.constraint_schema = tc.table_schema
                                WHERE tc.constraint_type = 'FOREIGN KEY'
                                  AND tc.table_schema = %s
                                  AND tc.table_name = %s
                                ORDER BY tc.constraint_name, kcu.ordinal_position;
                                """
