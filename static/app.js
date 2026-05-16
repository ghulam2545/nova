/* ── Config ─────────────────────────────── */
const API = 'http://localhost:8000';
let state = {schema: null, table: null, tableType: null};
let schemasData = [];

/* ── Init ────────────────────────────────── */
async function initApp() {
    await loadExplorer();
    await loadDashboard();
}

/* ── API helpers ─────────────────────────── */
async function apiFetch(path) {
    const r = await fetch(API + path);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
}

/* ── Explorer ────────────────────────────── */
async function loadExplorer() {
    const ex = document.getElementById('explorer');
    try {
        schemasData = await apiFetch('/schemas');
        renderExplorer(schemasData);
    } catch (e) {
        ex.innerHTML = `<div class="empty-state"><i class="fas fa-triangle-exclamation"></i>Could not load schemas</div>`;
    }
}

function renderExplorer(schemas) {
    const ex = document.getElementById('explorer');
    if (!schemas.length) {
        ex.innerHTML = `<div class="empty-state"><i class="fas fa-inbox"></i>No schemas found</div>`;
        return;
    }
    ex.innerHTML = schemas.map(s => {
        const name = s.schema_name;
        return `
        <div class="schema-block" data-schema="${name}">
            <div class="schema-row" onclick="toggleSchema('${name}')">
                <i class="fas fa-chevron-right schema-toggle"></i>
                <i class="fas fa-circle-nodes"></i>
                <span>${name}</span>
            </div>
            <div class="table-list" id="tl-${name}">
                <div style="padding:8px 14px 8px 30px;">
                    <div class="skel loading-line" style="width:70%;"></div>
                    <div class="skel loading-line" style="width:55%;"></div>
                </div>
            </div>
        </div>`;
    }).join('');
    // Auto-open first schema
    if (schemas.length) toggleSchema(schemas[0].schema_name);
}

async function toggleSchema(name) {
    const row = document.querySelector(`.schema-row[onclick="toggleSchema('${name}')"]`);
    const list = document.getElementById(`tl-${name}`);
    if (!row || !list) return;
    const isOpen = list.classList.contains('open');
    if (isOpen) {
        list.classList.remove('open');
        row.classList.remove('open');
        return;
    }
    row.classList.add('open');
    list.classList.add('open');
    if (list.dataset.loaded) return;
    try {
        const tables = await apiFetch(`/schemas/${name}/tables`);
        list.dataset.loaded = '1';
        list.innerHTML = tables.length
            ? tables.map(t => {
                const icon = t.table_type === 'VIEW' ? 'fa-eye' : 'fa-table';
                return `<div class="table-row" data-schema="${name}" data-table="${t.table_name}" data-type="${t.table_type}"
                        onclick="openTable('${name}','${t.table_name}','${t.table_type}')">
                    <i class="fas ${icon}"></i>
                    <span class="t-label">${t.table_name}</span>
                    <span class="ttype">${t.table_type === 'VIEW' ? 'VIEW' : ''}</span>
                </div>`;
            }).join('')
            : `<div class="empty-state" style="padding:10px 14px 10px 30px;font-size:11px;text-align:left;">No tables</div>`;
    } catch {
        list.innerHTML = `<div class="empty-state" style="padding:8px 30px;font-size:11px;">Error loading tables</div>`;
    }
}

function filterExplorer(q) {
    const lq = q.toLowerCase();
    document.querySelectorAll('.table-row').forEach(r => {
        const label = r.querySelector('.t-label')?.textContent.toLowerCase() || '';
        r.style.display = (!lq || label.includes(lq)) ? '' : 'none';
    });
    document.querySelectorAll('.schema-block').forEach(b => {
        const hasVisible = [...b.querySelectorAll('.table-row')].some(r => r.style.display !== 'none');
        b.style.display = (!lq || hasVisible) ? '' : 'none';
    });
}

/* ── Dashboard ───────────────────────────── */
async function loadDashboard() {
    try {
        const [schemas, exts, roles] = await Promise.all([
            apiFetch('/schemas'),
            apiFetch('/extensions'),
            apiFetch('/roles')
        ]);

        // Count tables across all schemas
        let tableCount = 0, viewCount = 0, funcCount = 0;
        for (const s of schemas) {
            try {
                const tables = await apiFetch(`/schemas/${s.schema_name}/tables`);
                tables.forEach(t => {
                    if (t.table_type === 'VIEW') viewCount++; else tableCount++;
                });
                const funcs = await apiFetch(`/schemas/${s.schema_name}/functions`);
                funcCount += funcs.length;
            } catch {
            }
        }

        document.getElementById('stats-grid').innerHTML = `
            <div class="stat-card hi">
                <div class="stat-label">Schemas</div>
                <div class="stat-val">${schemas.length}</div>
                <div class="stat-meta">namespaces</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Tables</div>
                <div class="stat-val">${tableCount}</div>
                <div class="stat-meta">base tables</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Views</div>
                <div class="stat-val">${viewCount}</div>
                <div class="stat-meta">virtual tables</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Functions</div>
                <div class="stat-val">${funcCount}</div>
                <div class="stat-meta">routines</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Roles</div>
                <div class="stat-val">${roles.length}</div>
                <div class="stat-meta">db roles</div>
            </div>`;

        document.getElementById('dash-sub').textContent =
            `${schemas.length} schema${schemas.length !== 1 ? 's' : ''} · ${tableCount} tables · ${exts.length} extensions`;

        // Extensions
        document.getElementById('ext-card').querySelector('.info-card-body').innerHTML =
            exts.length ? `<table class="mini-table">
                <thead><tr><th>Extension</th><th>Version</th><th>Schema</th></tr></thead>
                <tbody>${exts.map(e => `<tr>
                    <td class="mono">${esc(e.extension_name)}</td>
                    <td class="mono">${esc(e.version)}</td>
                    <td class="mono">${esc(e.schema_name)}</td>
                </tr>`).join('')}</tbody>
            </table>` : emptyState('No extensions installed');

        // Roles
        document.getElementById('roles-card').querySelector('.info-card-body').innerHTML =
            roles.length ? `<table class="mini-table">
                <thead><tr><th>Role</th><th>Login</th><th>Superuser</th><th>Exp</th></tr></thead>
                <tbody>${roles.map(r => `<tr>
                    <td class="mono">${esc(r.role_name)}</td>
                    <td>${r.can_login ? pill('YES', 'pill-green') : pill('NO', 'pill-gray')}</td>
                    <td>${r.is_superuser ? pill('YES', 'pill-amber') : pill('NO', 'pill-gray')}</td>
                    <td class="mono" style="font-size:10px;">${esc(r.password_expiry || '—')}</td>
                </tr>`).join('')}</tbody>
            </table>` : emptyState('No roles found');

    } catch (e) {
        document.getElementById('stats-grid').innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><i class="fas fa-triangle-exclamation"></i>Failed to load dashboard. Is the backend running?</div>`;
    }
}

/* ── Table detail ────────────────────────── */
async function openTable(schema, table, type) {
    state = {schema, table, tableType: type};

    // Sidebar highlight
    document.querySelectorAll('.table-row').forEach(r => r.classList.remove('active'));
    const row = document.querySelector(`.table-row[data-schema="${schema}"][data-table="${table}"]`);
    if (row) row.classList.add('active');

    // Show detail view
    document.getElementById('view-dashboard').style.display = 'none';
    document.getElementById('view-detail').style.display = 'block';

    // Breadcrumb
    document.getElementById('breadcrumbs').innerHTML =
        `<span style="cursor:pointer;color:var(--accent);" onclick="showDashboard()">Dashboard</span>
         <span class="bc-sep"><i class="fas fa-chevron-right"></i></span>
         <span style="color:var(--muted);">${esc(schema)}</span>
         <span class="bc-sep"><i class="fas fa-chevron-right"></i></span>
         <span class="bc-cur">${esc(table)}</span>`;

    document.getElementById('det-name').textContent = table;
    document.getElementById('det-type').textContent = type;
    document.getElementById('ddl-label').textContent = `${schema}.${table}`;
    document.getElementById('det-meta').innerHTML = `
        <span class="detail-meta-item"><i class="fas fa-circle-nodes"></i> Schema: <strong>${esc(schema)}</strong></span>
        <span class="detail-meta-item"><i class="fas fa-tag"></i> Type: <strong>${esc(type)}</strong></span>`;

    // Activate first tab
    activateTab('tab-ddl');

    // Load all tabs in background
    loadDDL(schema, table);
    loadColumns(schema, table)
    loadConstraints(schema, table);
    loadIndexes(schema, table);
    loadRelationships(schema, table);
    loadSize(schema, table);
    loadStats(schema, table);
    loadGrants(schema, table);
    loadDeps(schema, table);
}

function showDashboard() {
    document.getElementById('view-dashboard').style.display = '';
    document.getElementById('view-detail').style.display = 'none';
    document.getElementById('breadcrumbs').innerHTML = `<span class="bc-cur">Dashboard</span>`;
    document.querySelectorAll('.table-row').forEach(r => r.classList.remove('active'));
}

/* Tab switching */
function activateTab(id) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === id));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.toggle('active', p.id === id));
}

document.addEventListener('click', e => {
    if (e.target.closest('.tab-btn')) {
        const btn = e.target.closest('.tab-btn');
        activateTab(btn.dataset.tab);
    }
});

/* DDL */
async function loadDDL(schema, table) {
    const el = document.getElementById('ddl-content');
    el.textContent = 'Loading…';
    try {
        const data = await apiFetch(`/schemas/${schema}/tables/${table}/ddl`);
        const ddl = data?.ddl || JSON.stringify(data, null, 2);
        el.innerHTML = highlightSQL(esc(ddl));
    } catch {
        el.textContent = 'Could not load DDL.';
    }
}

/* Columns */
async function loadColumns(schema, table) {
    const tbody = document.getElementById('tb-cols');
    const cnt = document.getElementById('cnt-cols');
    try {
        const rows = await apiFetch(`/schemas/${schema}/tables/${table}`);
        cnt.textContent = `· ${rows.length} column${rows.length !== 1 ? 's' : ''}`;
        tbody.innerHTML = rows.length ? rows.map(col => `
            <tr>
                <td class="mono">${esc(col.column_name)}</td>
                <td><span class="pill">${esc(col.data_type)}</span></td>
                <td> ${col.is_nullable === 'YES'
            ? '<span class="pill pill-ok">YES</span>'
            : '<span class="pill pill-danger">NO</span>'
        }
                </td>
                <td class="mono" style="font-size:11px;"> ${esc(col.column_default || '-')}</td>
                <td> ${col.character_maximum_length ?? '-'}</td>
                <td> ${col.numeric_precision ?? '-'}</td>
                <td> ${col.numeric_scale ?? '-'}</td>
            </tr>
        `).join('') : emptyRow(7);
    } catch {
        tbody.innerHTML = errorRow(7);
    }
}

/* Constraints */
async function loadConstraints(schema, table) {
    const tbody = document.getElementById('tb-constraints');
    const cnt = document.getElementById('cnt-constraints');
    try {
        const rows = await apiFetch(`/schemas/${schema}/tables/${table}/constraints`);
        cnt.textContent = `· ${rows.length} row${rows.length !== 1 ? 's' : ''}`;
        tbody.innerHTML = rows.length ? rows.map(r => `<tr>
            <td class="mono">${esc(r.constraint_name)}</td>
            <td>${constraintPill(r.constraint_type)}</td>
            <td class="mono">${esc(r.column_name || '—')}</td>
            <td class="mono">${esc(r.foreign_table_name || '—')}</td>
            <td class="mono">${esc(r.foreign_column_name || '—')}</td>
            <td class="mono" style="font-size:10px;">${esc(r.check_clause || '—')}</td>
        </tr>`).join('') : emptyRow(6);
    } catch {
        tbody.innerHTML = errorRow(6);
    }
}

/* Indexes */
async function loadIndexes(schema, table) {
    const tbody = document.getElementById('tb-indexes');
    const cnt = document.getElementById('cnt-indexes');
    try {
        const rows = await apiFetch(`/schemas/${schema}/tables/${table}/indexes`);
        cnt.textContent = `· ${rows.length} row${rows.length !== 1 ? 's' : ''}`;
        tbody.innerHTML = rows.length ? rows.map(r => `<tr>
            <td class="mono">${esc(r.index_name)}</td>
            <td class="mono overflow" style="max-width:420px;font-size:11px;">${esc(r.index_definition)}</td>
        </tr>`).join('') : emptyRow(2);
    } catch {
        tbody.innerHTML = errorRow(2);
    }
}

/* Relationships */
async function loadRelationships(schema, table) {
    const tbody = document.getElementById('tb-rels');
    const cnt = document.getElementById('cnt-rels');
    try {
        const rows = await apiFetch(`/schemas/${schema}/tables/${table}/relationships`);
        cnt.textContent = `· ${rows.length} row${rows.length !== 1 ? 's' : ''}`;
        tbody.innerHTML = rows.length ? rows.map(r => `<tr>
            <td class="mono" style="font-size:11px;">${esc(r.constraint_name)}</td>
            <td class="mono">${esc(r.column_name)}</td>
            <td class="mono"><span style="color:var(--muted);font-size:10px;">${esc(r.foreign_table_schema)}.</span>${esc(r.foreign_table_name)}</td>
            <td class="mono">${esc(r.foreign_column_name)}</td>
            <td>${rulePill(r.update_rule)}</td>
            <td>${rulePill(r.delete_rule)}</td>
        </tr>`).join('') : emptyRow(6);
    } catch {
        tbody.innerHTML = errorRow(6);
    }
}

/* Size */
async function loadSize(schema, table) {
    const el = document.getElementById('size-content');
    try {
        const rows = await apiFetch(`/schemas/${schema}/tables/${table}/size`);
        const r = rows[0] || {};
        el.innerHTML = `<div class="stats-detail-grid">
            ${kvCard('Table Size', [
            ['Schema', r.table_schema || '—'],
            ['Table', r.table_name || '—'],
            ['Table Size', r.table_size || '—'],
            ['Indexes Size', r.indexes_size || '—'],
            ['Total Size', r.total_size || '—'],
        ], 'fas fa-weight-hanging')}
        </div>`;
    } catch {
        el.innerHTML = `<div class="empty-state"><i class="fas fa-triangle-exclamation"></i>Could not load size info.</div>`;
    }
}

/* Stats */
async function loadStats(schema, table) {
    const el = document.getElementById('stats-content');
    try {
        const rows = await apiFetch(`/schemas/${schema}/tables/${table}/stats`);
        const r = rows[0] || {};
        const typeMap = {r: 'Table', v: 'View', m: 'Materialized View', i: 'Index', S: 'Sequence'};
        el.innerHTML = `<div class="stats-detail-grid">
            ${kvCard('Table Stats', [
            ['Schema', r.schema_name || '—'],
            ['Table', r.table_name || '—'],
            ['Type', typeMap[r.table_type] || r.table_type || '—'],
            ['Owner', r.owner_name || '—'],
            ['Table Size', r.table_size || '—'],
            ['Indexes Size', r.indexes_size || '—'],
            ['Total Size', r.total_size || '—'],
            ['Comment', r.table_comment || '—'],
        ], 'fas fa-chart-bar')}
        </div>`;
    } catch {
        el.innerHTML = `<div class="empty-state"><i class="fas fa-triangle-exclamation"></i>Could not load stats.</div>`;
    }
}

/* Grants */
async function loadGrants(schema, table) {
    const tbody = document.getElementById('tb-grants');
    const cnt = document.getElementById('cnt-grants');
    try {
        const rows = await apiFetch(`/schemas/${schema}/tables/${table}/grants`);
        cnt.textContent = `· ${rows.length} row${rows.length !== 1 ? 's' : ''}`;
        tbody.innerHTML = rows.length ? rows.map(r => `<tr>
            <td class="mono">${esc(r.grantee)}</td>
            <td>${pill(esc(r.privilege_type), 'pill-blue')}</td>
            <td>${r.is_grantable === 'YES' ? pill('YES', 'pill-green') : pill('NO', 'pill-gray')}</td>
        </tr>`).join('') : emptyRow(3);
    } catch {
        tbody.innerHTML = errorRow(3);
    }
}

/* Dependencies */
async function loadDeps(schema, table) {
    const inEl = document.getElementById('tb-deps-in');
    const outEl = document.getElementById('tb-deps-out');
    try {
        const data = await apiFetch(`/schemas/${schema}/tables/${table}/dependencies`);
        const inbound = data.inbound || [];
        const outbound = data.outbound || [];
        inEl.innerHTML = inbound.length ? inbound.map(r => `<tr>
            <td class="mono" style="font-size:11px;">${esc(r.table_schema)}</td>
            <td class="mono">${esc(r.table_name)}</td>
        </tr>`).join('') : emptyRow(2, 'No inbound dependencies');
        outEl.innerHTML = outbound.length ? outbound.map(r => `<tr>
            <td class="mono" style="font-size:11px;">${esc(r.table_schema)}</td>
            <td class="mono">${esc(r.table_name)}</td>
        </tr>`).join('') : emptyRow(2, 'No outbound dependencies');
    } catch {
        inEl.innerHTML = errorRow(2);
        outEl.innerHTML = errorRow(2);
    }
}

/* ── Connection modal ────────────────────── */
function openConnModal() {
    document.getElementById('conn-overlay').classList.add('open');
}

function closeConnModal() {
    document.getElementById('conn-overlay').classList.remove('open');
}

function saveConn() {
    const host = document.getElementById('f-host').value;
    const db = document.getElementById('f-db').value;
    document.getElementById('footer-conn').textContent = `${host}/${db}`;
    closeConnModal();
    showToast('Connection saved — reload to apply');
}

document.getElementById('conn-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeConnModal();
});

/* ── Query panel ─────────────────────────── */
function openQueryPanel() {
    document.getElementById('query-overlay').classList.add('open');
}

function closeQueryPanel() {
    document.getElementById('query-overlay').classList.remove('open');
}

function updateCharCount() {
    document.getElementById('char-count').textContent = document.getElementById('query-input').value.length;
}

function clearQuery() {
    document.getElementById('query-input').value = '';
    document.getElementById('char-count').textContent = '0';
    document.getElementById('query-result').innerHTML = `<span style="font-size:11px;color:var(--faint);">Analysis will appear here…</span>`;
}

async function optimizeQuery() {
    const q = document.getElementById('query-input').value.trim();
    const r = document.getElementById('query-result');
    if (!q) {
        showToast('Paste a SQL query first');
        return;
    }
    r.textContent = 'Loading…';
    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                input_prompt: q
            })
        });
        const data = await response.json();
        r.innerHTML = data.response
    } catch (error) {
        r.textContent = 'Connect an AI backend to get analysis...';
    }
}

/* ── Analyzer panel ─────────────────────────── */
function openAnalyzePanel() {
    document.getElementById('explain-overlay').classList.add('open');
}

function closeAnalyzePanel() {
    document.getElementById('explain-overlay').classList.remove('open');
}

/* ── DDL copy ────────────────────────────── */
function copyDDL() {
    const text = document.getElementById('ddl-content').textContent;
    navigator.clipboard.writeText(text).then(() => showToast('DDL copied to clipboard'));
}

/* ── Toast ───────────────────────────────── */
function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2200);
}

/* ── Helpers ─────────────────────────────── */
function esc(s) {
    if (s == null) return '—';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function pill(text, cls) {
    return `<span class="pill ${cls}">${text}</span>`;
}

function emptyState(msg) {
    return `<div class="empty-state"><i class="fas fa-inbox"></i>${msg}</div>`;
}

function emptyRow(cols, msg = 'No data') {
    return `<tr><td colspan="${cols}" style="text-align:center;color:var(--faint);padding:20px;font-size:12px;">${msg}</td></tr>`;
}

function errorRow(cols) {
    return `<tr><td colspan="${cols}" style="text-align:center;color:var(--red);padding:16px;font-size:12px;"><i class="fas fa-triangle-exclamation"></i> Failed to load</td></tr>`;
}

function constraintPill(type) {
    const map = {
        'PRIMARY KEY': 'pill-amber',
        'FOREIGN KEY': 'pill-blue',
        'UNIQUE': 'pill-green',
        'CHECK': 'pill-gray'
    };
    return pill(esc(type), map[type] || 'pill-gray');
}

function rulePill(rule) {
    if (!rule) return '—';
    const map = {
        'CASCADE': 'pill-red',
        'SET NULL': 'pill-amber',
        'NO ACTION': 'pill-gray',
        'RESTRICT': 'pill-gray',
        'SET DEFAULT': 'pill-blue'
    };
    return pill(esc(rule), map[rule] || 'pill-gray');
}

function kvCard(title, pairs, icon = 'fas fa-info-circle') {
    return `<div class="kv-card">
        <div class="kv-card-head"><i class="${icon}"></i> ${title}</div>
        <div class="kv-list">${pairs.map(([k, v]) => `<div class="kv-row"><div class="kv-key">${k}</div><div class="kv-val">${esc(v)}</div></div>`).join('')}</div>
    </div>`;
}

function highlightSQL(sql) {
    const keywords = /\b(CREATE|TABLE|VIEW|SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AND|OR|NOT|NULL|DEFAULT|PRIMARY|FOREIGN|KEY|REFERENCES|UNIQUE|CHECK|INDEX|INSERT|UPDATE|DELETE|DROP|ALTER|ADD|COLUMN|CONSTRAINT|IF|EXISTS|AS|WITH|ORDER|GROUP|BY|HAVING|LIMIT|OFFSET|IN|LIKE|BETWEEN|CASE|WHEN|THEN|ELSE|END|DISTINCT|RETURNING|SET|VALUES|INTO|BEGIN|COMMIT|ROLLBACK|GRANT|REVOKE|TO|ON|ALL|PUBLIC|SEQUENCE|FUNCTION|PROCEDURE|TRIGGER|SCHEMA|EXTENSION|TYPE|ENUM|SERIAL|BIGSERIAL|GENERATED|ALWAYS|IDENTITY|CASCADE|NO|ACTION|RESTRICT)\b/gi;
    const types = /\b(INTEGER|INT|BIGINT|SMALLINT|TEXT|VARCHAR|CHAR|BOOLEAN|BOOL|FLOAT|DOUBLE|REAL|NUMERIC|DECIMAL|DATE|TIME|TIMESTAMP|TIMESTAMPTZ|UUID|JSONB|JSON|BYTEA|OID|INTERVAL|CHARACTER VARYING|PRECISION)\b/gi;
    return sql
        .replace(keywords, m => `<span class="kw">${m}</span>`)
        .replace(types, m => `<span class="type-c">${m}</span>`);
}

/* ── Boot ────────────────────────────────── */
initApp();