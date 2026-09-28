(() => {

    const COLS_ALL = 8;
    const COLS_TABLE = 6;

    function strategyBadge(strategy) {
        const colors = {
            RANGE: 'var(--indigo, #6366f1)',
            LIST: 'var(--success, #22c55e)',
            HASH: 'var(--warning, #f59e0b)',
        };
        const color = colors[(strategy || '').toUpperCase()] || 'var(--text-muted)';
        return `<span style="color:${color};font-weight:600;font-size:11px">${strategy || '—'}</span>`;
    }

    function rowAll(p) {
        return `<tr>
            <td class="mono">${p.partitionName || '—'}</td>
            <td>${p.parentSchema || '—'}</td>
            <td>${p.parentTable || '—'}</td>
            <td>${strategyBadge(p.partitionStrategy)}</td>
            <td class="mono" style="font-size:12px">${p.partitionKey || '—'}</td>
            <td style="font-size:12px;color:var(--text-muted);max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"
                title="${p.partitionBound || ''}">${p.partitionBound || '—'}</td>
            <td>${Nova.fmtNum(p.rows)}</td>
            <td>${p.sizePretty || '—'}</td>
        </tr>`;
    }

    function rowTable(p) {
        return `<tr>
            <td class="mono">${p.partitionName || '—'}</td>
            <td>${strategyBadge(p.partitionStrategy)}</td>
            <td class="mono" style="font-size:12px">${p.partitionKey || '—'}</td>
            <td style="font-size:12px;color:var(--text-muted);max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"
                title="${p.partitionBound || ''}">${p.partitionBound || '—'}</td>
            <td>${Nova.fmtNum(p.rows)}</td>
            <td>${p.sizePretty || '—'}</td>
        </tr>`;
    }

    // ── Tab: All Partitions ────────────────────────────────────────────────
    async function loadAll() {
        const body = document.getElementById('part-all-body');
        body.innerHTML = Nova.skeletonRows(COLS_ALL, 8);
        try {
            const data = await Nova.apiFetch('/partitions');
            const rows = Array.isArray(data) ? data : (data.content ?? []);
            if (!rows.length) {
                body.innerHTML = `<tr><td colspan="${COLS_ALL}"><div class="empty-state"><div class="empty-icon">◻</div><div class="empty-label">No partitions found</div></div></td></tr>`;
                return;
            }
            body.innerHTML = rows.map(rowAll).join('');
        } catch (err) {
            body.innerHTML = `<tr><td colspan="${COLS_ALL}" class="text-muted" style="padding:20px;text-align:center">${err.message}</td></tr>`;
        }
    }

    // ── Tab: By Table ──────────────────────────────────────────────────────
    async function loadByTable() {
        const schema = document.getElementById('part-schema-filter').value;
        const table = document.getElementById('part-table-filter').value;
        const body = document.getElementById('part-table-body');

        if (!schema || !table) {
            body.innerHTML = `<tr><td colspan="${COLS_TABLE}" class="text-muted" style="padding:20px;text-align:center">Select a schema and table above</td></tr>`;
            return;
        }

        body.innerHTML = Nova.skeletonRows(COLS_TABLE, 6);
        try {
            const data = await Nova.apiFetch(`/partitions/${encodeURIComponent(schema)}/${encodeURIComponent(table)}`);
            const rows = Array.isArray(data) ? data : (data.content ?? []);
            if (!rows.length) {
                body.innerHTML = `<tr><td colspan="${COLS_TABLE}"><div class="empty-state"><div class="empty-icon">◻</div><div class="empty-label">No partitions for this table</div></div></td></tr>`;
                return;
            }
            body.innerHTML = rows.map(rowTable).join('');
        } catch (err) {
            body.innerHTML = `<tr><td colspan="${COLS_TABLE}" class="text-muted" style="padding:20px;text-align:center">${err.message}</td></tr>`;
        }
    }

    // ── Schema / Table filter population ──────────────────────────────────
    async function populateSchemaFilter() {
        try {
            const schemas = await Nova.apiFetch('/schemas');
            const sel = document.getElementById('part-schema-filter');
            // clear all except the first placeholder option
            while (sel.options.length > 1) sel.remove(1);
            (Array.isArray(schemas) ? schemas : schemas.content || []).forEach(s => {
                const opt = document.createElement('option');
                opt.value = s.name || s;
                opt.textContent = s.name || s;
                sel.appendChild(opt);
            });
        } catch (_) { /* non-critical */
        }
    }

    async function populateTableFilter(schema) {
        const sel = document.getElementById('part-table-filter');
        while (sel.options.length > 1) sel.remove(1);
        if (!schema) return;
        try {
            const tables = await Nova.apiFetch(`/tables?schema=${encodeURIComponent(schema)}&size=200`);
            const rows = Array.isArray(tables) ? tables : (tables.content ?? []);
            rows.forEach(t => {
                const opt = document.createElement('option');
                opt.value = t.tableName || t.name || t;
                opt.textContent = t.tableName || t.name || t;
                sel.appendChild(opt);
            });
        } catch (_) { /* non-critical */
        }
    }

    // ── Tab switching ──────────────────────────────────────────────────────
    let allLoaded = false;

    function init() {
        const container = document.getElementById('part-tabs');
        const tabs = container.querySelectorAll('.tab');
        const panels = container.querySelectorAll('.tab-panel');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                panels.forEach(p => p.classList.remove('active'));
                tab.classList.add('active');
                container.querySelector(`.tab-panel[data-tab="${tab.dataset.tab}"]`)?.classList.add('active');
                if (Nova.isConnected() && tab.dataset.tab === 'all' && !allLoaded) {
                    allLoaded = true;
                    loadAll();
                }
            });
        });

        // Schema filter change → reload table list
        document.getElementById('part-schema-filter').addEventListener('change', e => {
            populateTableFilter(e.target.value);
        });

        if (tabs.length) tabs[0].click();
    }

    function onConnected() {
        if (!allLoaded) {
            allLoaded = true;
            loadAll();
        }
        populateSchemaFilter();
    }

    // Expose loadByTable globally for the inline onclick button
    window.PartPage = {loadByTable};

    document.addEventListener('DOMContentLoaded', () => {
        init();
        if (Nova.isConnected()) onConnected();
    });
    document.addEventListener('nova:connected', onConnected);
})();
