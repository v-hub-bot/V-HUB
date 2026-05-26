                      {[
                        ["Business Name", "business_name"],
                        ["Owner Name", "owner_name"],
                        ["Email", "email"],
                        ["Phone", "phone"],
                        ["Website", "website"],
                        ["Address", "address"],
                        ["Years in Business", "years_in_business"],
                        ["License #", "license_number"],
                        ["Google Rating (1–5)", "google_rating"],
                      ].map(([label, key]) => (
                        <div key={key}>
                          <div style={{ fontSize: 10, color: T.brownLight, fontFamily: T.sans, fontWeight: 700, marginBottom: 2 }}>{label}</div>
                          <input
                            value={editForm[key] || ""}
                            onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                            style={{ width: "100%", padding: "7px 10px", fontSize: 13, fontFamily: T.sans, border: `1px solid ${T.border}`, borderRadius: 6, boxSizing: "border-box" }}
                          />
                        </div>
                      ))}
                      <div style={{ gridColumn: "1 / -1" }}>
                        <div style={{ fontSize: 10, color: T.brownLight, fontFamily: T.sans, fontWeight: 700, marginBottom: 2 }}>Google Review URL</div>
                        <input
                          type="url"
                          value={editForm.google_review_url || ""}
                          onChange={e => setEditForm(f => ({ ...f, google_review_url: e.target.value }))}
                          style={{ width: "100%", padding: "7px 10px", fontSize: 13, fontFamily: T.sans, border: `1px solid ${T.border}`, borderRadius: 6, boxSizing: "border-box" }}
                          placeholder="https://maps.app.goo.gl/..."
                        />
                        <div style={{ fontSize: 10, color: "#999", marginTop: 3, fontFamily: T.sans }}>Paste their Google Maps link — rating syncs automatically each night at 3 AM.</div>
                      </div>
                      {/* Hours of operation */}
                      <div style={{ gridColumn: "1 / -1" }}>
                        <div style={{ fontSize: 10, color: T.brownLight, fontFamily: T.sans, fontWeight: 700, marginBottom: 2 }}>Hours of Operation</div>
                        <textarea
                          value={editForm.hours_of_operation || ""}
                          onChange={e => setEditForm(f => ({ ...f, hours_of_operation: e.target.value }))}
                          rows={3}
                          placeholder={"Mon–Fri: 8am–5pm\nSat: 9am–1pm\nSun: Closed"}
                          style={{ width: "100%", padding: "7px 10px", fontSize: 13, fontFamily: T.sans, border: `1px solid ${T.border}`, borderRadius: 6, boxSizing: "border-box", resize: "vertical", lineHeight: 1.7 }}
                        />
                      </div>
                      {/* Mobile toggle */}
                      <div style={{ display: "flex", alignItems: "center", gap: 10, gridColumn: "1 / -1" }}>
                        <input type="checkbox" checked={!!editForm.is_mobile} onChange={e => setEditForm(f => ({ ...f, is_mobile: e.target.checked }))} style={{ width: 16, height: 16, cursor: "pointer" }} />
                        <span style={{ fontSize: 12, fontFamily: T.sans, color: T.brown }}>Mobile provider — travels to customers (no fixed address)</span>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: T.brownLight, fontFamily: T.sans, fontWeight: 700, marginBottom: 2 }}>Subscription Status</div>
                        <select value={editForm.subscription_status} onChange={e => setEditForm(f => ({ ...f, subscription_status: e.target.value }))}
                          style={{ width: "100%", padding: "7px 10px", fontSize: 13, fontFamily: T.sans, border: `1px solid ${T.border}`, borderRadius: 6 }}>
                          <option value="trial">Trial</option>
                          <option value="active">Active</option>
                          <option value="pending">Pending</option>
                          <option value="expired">Expired</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: T.brownLight, fontFamily: T.sans, fontWeight: 700, marginBottom: 2 }}>Subscription Tier</div>
                        <select value={editForm.subscription_tier} onChange={e => setEditForm(f => ({ ...f, subscription_tier: e.target.value }))}
                          style={{ width: "100%", padding: "7px 10px", fontSize: 13, fontFamily: T.sans, border: `1px solid ${T.border}`, borderRadius: 6 }}>
                          <option value="basic">Basic</option>
                          <option value="featured">Featured</option>
                          <option value="premium">Premium</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 10, color: T.brownLight, fontFamily: T.sans, fontWeight: 700, marginBottom: 2 }}>Notes (internal)</div>
                      <textarea
                        value={editForm.notes || ""}
                        onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                        rows={2}
                        style={{ width: "100%", padding: "7px 10px", fontSize: 13, fontFamily: T.sans, border: `1px solid ${T.border}`, borderRadius: 6, boxSizing: "border-box", resize: "vertical" }}
                      />
                    </div>
                    {/* ── Category ── */}
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 10, color: T.brownLight, fontFamily: T.sans, fontWeight: 700, marginBottom: 2 }}>Category</div>
                      <select
                        value={editForm.category_id || ""}
                        onChange={e => setEditForm(f => ({ ...f, category_id: e.target.value, services: [] }))}
                        style={{ width: "100%", padding: "7px 10px", fontSize: 13, fontFamily: T.sans, border: `1px solid ${T.border}`, borderRadius: 6 }}
                      >
                        <option value="">— Select category —</option>
                        {allCategories.filter(c => c.is_active !== false).map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    {/* ── Services multi-select ── */}
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 10, color: T.brownLight, fontFamily: T.sans, fontWeight: 700, marginBottom: 4 }}>
                        Services <span style={{ fontWeight: 400, color: "#999" }}>(click to toggle)</span>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {allServices
                          .filter(s => !editForm.category_id || s.category_id === editForm.category_id)
                          .filter(s => s.is_active !== false)
                          .map(s => {
                            const selected = (editForm.services || []).includes(s.id);
                            return (
                              <button key={s.id} type="button"
                                onClick={() => setEditForm(f => ({
                                  ...f,
                                  services: selected
                                    ? f.services.filter(x => x !== s.id)
                                    : [...(f.services || []), s.id]
                                }))}
                                style={{
                                  padding: "4px 10px", fontSize: 12, fontFamily: T.sans, borderRadius: 20, cursor: "pointer",
                                  border: selected ? `2px solid ${T.brownDark}` : `1px solid ${T.border}`,
                                  background: selected ? T.brownDark : "#fff",
                                  color: selected ? "#fff" : T.brownLight,
                                  fontWeight: selected ? 700 : 400,
                                }}
                              >{s.name}</button>
                            );
                          })}
                        {allServices.filter(s => !editForm.category_id || s.category_id === editForm.category_id).length === 0 &&
                          <div style={{ fontSize: 12, color: "#999", fontFamily: T.sans }}>Select a category first</div>}
                      </div>
                    </div>
                    {/* ── Service Areas (Villages) multi-select ── */}
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 10, color: T.brownLight, fontFamily: T.sans, fontWeight: 700, marginBottom: 4 }}>
                        Service Areas / Villages <span style={{ fontWeight: 400, color: "#999" }}>(click to toggle)</span>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, maxHeight: 140, overflowY: "auto", padding: "6px", background: "#fafafa", border: `1px solid ${T.border}`, borderRadius: 6 }}>
                        {allAreas.filter(a => a.is_active !== false).map(a => {
                          const selected = (editForm.service_areas || []).includes(a.id);
                          return (
                            <button key={a.id} type="button"
                              onClick={() => setEditForm(f => ({
                                ...f,
                                service_areas: selected
                                  ? f.service_areas.filter(x => x !== a.id)
                                  : [...(f.service_areas || []), a.id]
                              }))}
                              style={{
                                padding: "3px 9px", fontSize: 11, fontFamily: T.sans, borderRadius: 14, cursor: "pointer",
                                border: selected ? `2px solid #00796B` : `1px solid ${T.border}`,
                                background: selected ? "#00796B" : "#fff",
                                color: selected ? "#fff" : "#555",
                                fontWeight: selected ? 700 : 400,
                              }}
                            >{a.name}</button>
                          );
                        })}
                      </div>
                      <div style={{ fontSize: 10, color: "#888", fontFamily: T.sans, marginTop: 4 }}>
                        {(editForm.service_areas || []).length} village{(editForm.service_areas || []).length !== 1 ? "s" : ""} selected
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => saveEdit(p.id)} disabled={editSaving} style={{ ...S.btn("#2e7d32"), opacity: editSaving ? 0.6 : 1 }}>
                        {editSaving ? "Saving..." : "💾 Save Changes"}
                      </button>
                      <button onClick={() => setEditId(null)} style={S.btn("#888")}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── REVIEWS TAB ───────────────────────────────────────────────────────────────
function ReviewsTab({ reviews, setReviews, providers, adminPin }) {
  const [filter, setFilter] = useState("pending");
  const provMap = {}; providers.forEach(p => { provMap[p.id] = p.business_name; });
  const shown = reviews.filter(r => filter === "all" ? true : filter === "pending" ? !r.is_approved : r.is_approved);
  const approve = async (r) => {
    await fetch(`https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions/adminUpdateReview`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: "1357", id: r.id, fields: { is_approved: true } }),
    });
    // Immediately recalc provider rating so it's reflected now, not at 4am
    fetch(`https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions/recalcProviderRatings`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
    }).catch(() => {});
    setReviews(p => p.map(x => x.id === r.id ? { ...x, is_approved: true } : x));
  };
  const remove = async (r) => {
    if (!window.confirm("Delete this review?")) return;
    await fetch(`https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions/adminUpdateReview`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: "1357", id: r.id, delete: true }),
    });
    // Recalc provider rating after deletion
    fetch(`https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions/recalcProviderRatings`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
    }).catch(() => {});
    setReviews(p => p.filter(x => x.id !== r.id));
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", gap: 8 }}>
        {["pending", "approved", "all"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={S.filterBtn(filter === f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)} ({f === "pending" ? reviews.filter(r => !r.is_approved).length : f === "approved" ? reviews.filter(r => r.is_approved).length : reviews.length})
          </button>
        ))}
      </div>
      {shown.length === 0 && <div style={{ textAlign: "center", color: T.brownLight, padding: 24, fontStyle: "italic" }}>No reviews here.</div>}
      {shown.map(r => (
        <div key={r.id} style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <div><span style={{ fontWeight: 700, color: T.brownDark }}>{r.customer_name}</span>{r.customer_village && <span style={{ fontSize: 12, color: T.brownLight, marginLeft: 6 }}>· {r.customer_village}</span>}</div>
            <span style={{ color: "#DAA520" }}>{"★".repeat(r.rating || 0)}{"☆".repeat(5 - (r.rating || 0))}</span>
          </div>
          {provMap[r.provider_id] && <div style={{ fontSize: 11, color: T.brownLight, fontFamily: T.sans, marginBottom: 4 }}>For: {provMap[r.provider_id]}</div>}
          {r.service_used && <div style={{ fontSize: 11, color: T.brownLight, fontFamily: T.sans, marginBottom: 4 }}>Service: {r.service_used}</div>}
          <div style={{ fontSize: 13, color: T.brownDark, fontStyle: "italic", marginBottom: 6 }}>"{r.review_text}"</div>
          <div style={{ fontSize: 11, color: "#bbb", fontFamily: T.sans, marginBottom: 8 }}>{fmt(r.created_date)}</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {!r.is_approved && <button onClick={() => approve(r)} style={S.btn(T.green)}>✓ Approve</button>}
            <button onClick={() => remove(r)} style={S.btn(T.red)}>✕ Delete</button>
            <span style={S.badge(r.is_approved ? T.green : T.gold, r.is_approved ? "#e8f5e9" : "#fff8e1")}>{r.is_approved ? "Approved" : "Pending"}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── LEADS TAB ─────────────────────────────────────────────────────────────────
function LeadsTab({ leads, providers }) {
  const provMap = {}; providers.forEach(p => { provMap[p.id] = p.business_name; });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {leads.length === 0 && <div style={{ ...S.card, textAlign: "center", color: T.brownLight, padding: 30, fontStyle: "italic" }}>No lead inquiries yet.</div>}
      {[...leads].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).map(l => (
        <div key={l.id} style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontWeight: 700, color: T.brownDark }}>{l.customer_name}</span>
            <span style={S.badge(T.brown, T.parchmentDark)}>{l.status || "new"}</span>
          </div>
          <div style={{ fontSize: 12, color: T.brownLight, fontFamily: T.sans, marginBottom: 4 }}>{l.customer_email} · {l.customer_phone}</div>
          {provMap[l.provider_id] && <div style={{ fontSize: 12, color: T.teal, marginBottom: 4 }}>Provider: {provMap[l.provider_id]}</div>}
          {l.message && <div style={{ fontSize: 13, color: T.brownDark, fontStyle: "italic", marginBottom: 4 }}>"{l.message}"</div>}
          <div style={{ fontSize: 11, color: "#bbb", fontFamily: T.sans }}>{fmt(l.created_date)}</div>
        </div>
      ))}
    </div>
  );
}


// ── DEALS TAB ─────────────────────────────────────────────────────────────────
function DealsTab({ providers, classifiedAds }) {
  // Compute per-provider ad info
  const now = new Date();

  function daysLeft(expiresAt) {
    if (!expiresAt) return null;
    const exp = new Date(expiresAt);
    const diff = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
    return diff;
  }

  // Build provider map for quick lookup
  const provMap = {};
  (providers || []).forEach(p => { provMap[p.id] = p; });

  // Group ads by provider
  const adsByProvider = {};
  (classifiedAds || []).forEach(ad => {
    const pid = ad.provider_id;
    if (!adsByProvider[pid]) adsByProvider[pid] = { live: null, queued: [] };
    if (ad.is_active) adsByProvider[pid].live = ad;
    else adsByProvider[pid].queued.push(ad);
  });

  const providerIds = Object.keys(adsByProvider);
  const liveAds  = (classifiedAds || []).filter(a => a.is_active && (daysLeft(a.deal_expires_at) === null || daysLeft(a.deal_expires_at) >= 0));
  const expiredAds = (classifiedAds || []).filter(a => a.is_active && daysLeft(a.deal_expires_at) !== null && daysLeft(a.deal_expires_at) < 0);
  const queuedAds  = (classifiedAds || []).filter(a => !a.is_active);
  const totalRevenue = liveAds.length * 10;

  return (
    <div>
      {/* Summary row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 18 }}>
        {[
          ["🟢 Live Now", liveAds.length, "#2E7D32", "#E8F5E9"],
          ["⏰ Expired", expiredAds.length, "#E65100", "#FFF3E0"],
          ["⏭ Queued", queuedAds.length, "#1565C0", "#EFF8FF"],
          ["💰 This Week", `$${totalRevenue}`, "#1A6B3C", "#F1F8E9"],
        ].map(([label, val, color, bg]) => (
          <div key={label} style={{ background: bg, border: `2px solid ${color}`, borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 900, color, fontFamily: T.font }}>{val}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color, fontFamily: T.sans, letterSpacing: 1, textTransform: "uppercase" }}>{label}</div>
          </div>
        ))}
      </div>

      {providerIds.length === 0 && (
        <div style={{ textAlign: "center", padding: "32px 16px", color: "#999", fontFamily: T.sans, fontSize: 14 }}>
          No classified ads in the system yet.
        </div>
      )}

      {/* Per-provider ad cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {providerIds.sort((a, b) => {
          // Sort: live first, then queued, then expired
          const aHasLive = adsByProvider[a].live && (daysLeft(adsByProvider[a].live.deal_expires_at) === null || daysLeft(adsByProvider[a].live.deal_expires_at) >= 0);
          const bHasLive = adsByProvider[b].live && (daysLeft(adsByProvider[b].live.deal_expires_at) === null || daysLeft(adsByProvider[b].live.deal_expires_at) >= 0);
          if (aHasLive && !bHasLive) return -1;
          if (!aHasLive && bHasLive) return 1;
          return 0;
        }).map(pid => {
          const prov = provMap[pid];
          const { live, queued } = adsByProvider[pid];
          const days = live ? daysLeft(live.deal_expires_at) : null;
          const isExpired = days !== null && days < 0;
          const nextUp = queued.find(a => a.is_queued_next);

          return (
            <div key={pid} style={{
              background: "#fff",
              border: live && !isExpired ? "2px solid #2E7D32" : isExpired ? "2px solid #E65100" : `2px solid ${T.border}`,
              borderRadius: 10, padding: "12px 14px",
            }}>
              {/* Provider header */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 900, color: T.ink, fontFamily: T.font }}>
                    {prov?.business_name || pid}
                    {prov?.vh_number && <span style={{ marginLeft: 8, fontSize: 11, color: "#888", fontFamily: T.sans }}>#{prov.vh_number}</span>}
                  </div>
                  <div style={{ fontSize: 11, color: "#666", fontFamily: T.sans }}>{prov?.email || prov?.login_email || ""}</div>
                </div>
                {/* Status badge */}
                {live && !isExpired && (
                  <span style={{ background: "#E8F5E9", color: "#2E7D32", border: "1.5px solid #2E7D32", borderRadius: 12, padding: "3px 10px", fontSize: 11, fontWeight: 700, fontFamily: T.sans, whiteSpace: "nowrap" }}>
                    🟢 LIVE
                  </span>
                )}
                {isExpired && (
                  <span style={{ background: "#FFF3E0", color: "#E65100", border: "1.5px solid #E65100", borderRadius: 12, padding: "3px 10px", fontSize: 11, fontWeight: 700, fontFamily: T.sans, whiteSpace: "nowrap" }}>
                    ⏰ EXPIRED
                  </span>
                )}
                {!live && queued.length > 0 && (
                  <span style={{ background: "#EFF8FF", color: "#1565C0", border: "1.5px solid #1565C0", borderRadius: 12, padding: "3px 10px", fontSize: 11, fontWeight: 700, fontFamily: T.sans, whiteSpace: "nowrap" }}>
                    ⏭ QUEUED ONLY
                  </span>
                )}
              </div>

              {/* Live ad detail */}
              {live && (
                <div style={{ background: isExpired ? "#FFF3E0" : "#E8F5E9", borderRadius: 7, padding: "10px 12px", marginBottom: queued.length > 0 ? 8 : 0, display: "flex", gap: 10 }}>
                  {live.image_url && (
                    <img src={live.image_url} alt="" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 5, flexShrink: 0, border: "1.5px solid rgba(0,0,0,0.1)" }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 900, color: isExpired ? "#E65100" : "#1B5E20", fontFamily: T.font, marginBottom: 2 }}>
                      {live.headline || "(no headline)"}
                    </div>
                    {live.body && <div style={{ fontSize: 11, color: "#555", fontFamily: T.sans, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{live.body}</div>}
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      {live.village && <span style={{ fontSize: 10, color: "#00836B", fontFamily: T.sans }}>📍 {live.village}</span>}
                      {live.deal_expires_at && (
                        <span style={{ fontSize: 10, fontFamily: T.sans, fontWeight: 700, color: isExpired ? "#E65100" : "#2E7D32" }}>
                          {isExpired
                            ? `⏰ Expired ${Math.abs(days)} day${Math.abs(days) !== 1 ? "s" : ""} ago`
                            : days === 0
                              ? "⚡ Expires today"
                              : days === 1
                                ? "⚡ 1 day left"
                                : `✅ ${days} days left`
                          }
                        </span>
                      )}
                      <span style={{ fontSize: 10, fontFamily: T.sans, color: "#2E7D32", fontWeight: 700 }}>💰 $10 paid</span>
                    </div>
                    {live.deal_expires_at && (
                      <div style={{ fontSize: 10, color: "#888", fontFamily: T.sans, marginTop: 2 }}>
                        Runs through: {new Date(live.deal_expires_at).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Queued ads */}
              {queued.length > 0 && (
                <div style={{ marginTop: live ? 0 : 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#888", fontFamily: T.sans, letterSpacing: 1, textTransform: "uppercase", marginBottom: 5 }}>
                    Queued ({queued.length}/3)
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {queued.map(ad => (
                      <div key={ad.id} style={{
                        display: "flex", alignItems: "center", gap: 8,
                        background: ad.is_queued_next ? "#EFF8FF" : T.parchmentMid,
                        border: ad.is_queued_next ? "1.5px solid #1565C0" : `1px solid ${T.border}`,
                        borderRadius: 6, padding: "6px 10px",
                      }}>
                        {ad.image_url && <img src={ad.image_url} alt="" style={{ width: 32, height: 32, objectFit: "cover", borderRadius: 3, flexShrink: 0 }} />}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: T.ink, fontFamily: T.font, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {ad.headline || "(no headline)"}
                            {ad.is_queued_next && <span style={{ marginLeft: 6, fontSize: 9, background: "#1565C0", color: "#fff", borderRadius: 8, padding: "1px 5px", fontFamily: T.sans }}>NEXT</span>}
                          </div>
                          {ad.village && <div style={{ fontSize: 10, color: "#00836B", fontFamily: T.sans }}>📍 {ad.village}</div>}
                        </div>
                        {ad.saved_images?.length > 0 && (
                          <span style={{ fontSize: 10, color: "#6B4090", fontFamily: T.sans, flexShrink: 0 }}>🖼 {ad.saved_images.length}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── ANALYTICS TAB ─────────────────────────────────────────────────────────────
function AnalyticsTab({ providers, reviews, leads, stats, catMap, svcMap, fullSvcMap, classifiedAds }) {
  const [timeRange, setTimeRange] = React.useState("30d");
  const [analyticEvents, setAnalyticEvents] = React.useState([]);
  const [loadingEvents, setLoadingEvents] = React.useState(true);

  React.useEffect(() => {
    loadAllEvents();
  }, []);

  const loadAllEvents = async () => {
    setLoadingEvents(true);
    try {
      // Pull last 90 days of ProviderAnalytic events
      const cutoff90 = new Date(Date.now() - 90*24*60*60*1000).toISOString().slice(0,10);
      let all = [];
      let skip = 0;
      let hasMore = true;
      while (hasMore) {
        const page = await ProviderAnalytic.filter({ limit: 500, skip });
        if (!page || page.length === 0) { hasMore = false; break; }
        all = all.concat(page);
        skip += 500;
        hasMore = page.length === 500;
        if (all.length > 20000) break; // safety cap
      }
      setAnalyticEvents(all);
    } catch(e) {
      setAnalyticEvents([]);
    }
    setLoadingEvents(false);
  };

  const now = new Date();
  const rangeMs = { "24h": 86400000, "7d": 7*86400000, "30d": 30*86400000, "90d": 90*86400000 };
  const cutoff = new Date(now - (rangeMs[timeRange] || rangeMs["30d"]));

  const filteredLeads = leads.filter(l => l.created_date && new Date(l.created_date) >= cutoff);
  const filteredReviews = reviews.filter(r => r.created_date && new Date(r.created_date) >= cutoff);
  const filteredProviders = providers.filter(p => p.created_date && new Date(p.created_date) >= cutoff);
  const filteredEvents = analyticEvents.filter(e => e.created_date && new Date(e.created_date) >= cutoff);

  // Event breakdowns
  const siteEvents = filteredEvents.filter(e => e.provider_id === "SITE");
  const providerEvents = filteredEvents.filter(e => e.provider_id !== "SITE");
  const villageSearches = siteEvents.filter(e => e.event_type === "village_search");
  const searchPerformed = siteEvents.filter(e => e.event_type === "search_performed");
  const homepageViews = siteEvents.filter(e => e.event_type === "homepage_view");
  const featuredClicks = siteEvents.filter(e => e.event_type === "featured_banner_click");
  const profileViews = providerEvents.filter(e => e.event_type === "profile_view");
  const searchAppearances = providerEvents.filter(e => e.event_type === "search_appearance");
  const adClicks = providerEvents.filter(e => e.event_type === "classified_ad_click");
  const leadEvents = providerEvents.filter(e => e.event_type === "lead_inquiry");

  // Top villages searched
  const villageCounts = {};
  villageSearches.forEach(e => {
    if (e.area_name) villageCounts[e.area_name] = (villageCounts[e.area_name]||0)+1;
  });
  // Also count from search_performed
  searchPerformed.forEach(e => {
    if (e.area_name && e.area_name !== "All Villages") villageCounts[e.area_name] = (villageCounts[e.area_name]||0)+1;
  });
  const topVillages = Object.entries(villageCounts).sort((a,b)=>b[1]-a[1]).slice(0,10);

  // Top services searched
  const serviceCounts = {};
  searchPerformed.forEach(e => {
    if (e.service_name && e.service_name !== "All Services") serviceCounts[e.service_name] = (serviceCounts[e.service_name]||0)+1;
  });
  searchAppearances.forEach(e => {
    if (e.service_name) serviceCounts[e.service_name] = (serviceCounts[e.service_name]||0)+1;
  });
  const topServices = Object.entries(serviceCounts).sort((a,b)=>b[1]-a[1]).slice(0,10);

  // Top categories searched
  const catCounts = {};
  searchAppearances.forEach(e => {
    if (e.category_name) catCounts[e.category_name] = (catCounts[e.category_name]||0)+1;
  });
  const topCats = Object.entries(catCounts).sort((a,b)=>b[1]-a[1]).slice(0,8);

  // Top providers by profile views (from events, more accurate than counter)
  const provViewCounts = {};
  profileViews.forEach(e => { provViewCounts[e.provider_id] = (provViewCounts[e.provider_id]||0)+1; });
  const topViewedProviderIds = Object.entries(provViewCounts).sort((a,b)=>b[1]-a[1]).slice(0,8);
  const topViewedProviders = topViewedProviderIds.map(([id, cnt]) => ({
    provider: providers.find(p=>p.id===id),
    count: cnt
  })).filter(x=>x.provider);

  // Top providers by search appearances
  const provSearchCounts = {};
  searchAppearances.forEach(e => { provSearchCounts[e.provider_id] = (provSearchCounts[e.provider_id]||0)+1; });
  const topSearchedProviderIds = Object.entries(provSearchCounts).sort((a,b)=>b[1]-a[1]).slice(0,8);
  const topSearchedProviders = topSearchedProviderIds.map(([id, cnt]) => ({
    provider: providers.find(p=>p.id===id),
    count: cnt
  })).filter(x=>x.provider);

  // Provider subscription stats
  const paid = providers.filter(p => ["active","paid"].includes(p.subscription_status)).length;
  const trial = providers.filter(p => p.subscription_status === "trial").length;
  const inactive = providers.filter(p => ["inactive","expired","cancelled"].includes(p.subscription_status)).length;
  const activeAds = (classifiedAds||[]).filter(a => {
    if (!a.is_active) return false;
    if (a.deal_expires_at && new Date(a.deal_expires_at) < now) return false;
    return true;
  });

  // Last 7 days trend
  const last7 = Array.from({length:7},(_,i)=>{ const d=new Date(now); d.setDate(d.getDate()-6+i); return d.toISOString().split("T")[0]; });
  const profilesByDay = {};
  const searchesByDay = {};
  profileViews.forEach(e => { if(e.date_key) profilesByDay[e.date_key]=(profilesByDay[e.date_key]||0)+1; });
  searchAppearances.forEach(e => { if(e.date_key) searchesByDay[e.date_key]=(searchesByDay[e.date_key]||0)+1; });
  const last7Data = last7.map(d=>({ date:d, views:profilesByDay[d]||0, searches:searchesByDay[d]||0 }));
  const maxDay = Math.max(...last7Data.map(d=>Math.max(d.views,d.searches)),1);

  // Rating distribution
  const ratingDist = {1:0,2:0,3:0,4:0,5:0};
  reviews.forEach(r=>{ if(r.rating>=1&&r.rating<=5) ratingDist[r.rating]++; });
  const avgRating = reviews.length>0?(reviews.reduce((s,r)=>s+(r.rating||0),0)/reviews.length).toFixed(1):"—";

  // Provider signup trend
  const byMonth = {};
  providers.forEach(p => {
    if (!p.created_date) return;
    const d = new Date(p.created_date);
    const k = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    byMonth[k] = (byMonth[k]||0) + 1;
  });
  const months = Object.entries(byMonth).sort((a,b)=>a[0].localeCompare(b[0])).slice(-12);
  const maxM = Math.max(...months.map(m=>m[1]),1);

  const rangeLabels = {"24h":"Last 24 Hours","7d":"Last 7 Days","30d":"Last 30 Days","90d":"Last 90 Days"};

  // Bar helper
  const Bar = ({val, max, color="#1B3D6F", height=18}) => (
    <div style={{background:"#f0ece4",borderRadius:3,overflow:"hidden",height,flex:1,minWidth:60}}>
      <div style={{height:"100%",width:`${Math.max((val/Math.max(max,1))*100,2)}%`,background:color,borderRadius:3,transition:"width 0.3s"}}></div>
    </div>
  );

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>

      {/* Time Range Selector */}
      <div style={{...S.card,padding:"10px 16px"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
          <span style={{fontSize:12,fontWeight:700,color:T.brownLight,fontFamily:T.sans,marginRight:4}}>TIME RANGE:</span>
          {["24h","7d","30d","90d"].map(r=>(
            <button key={r} onClick={()=>setTimeRange(r)} style={{...S.filterBtn(timeRange===r),fontSize:12,padding:"5px 14px"}}>
              {r==="24h"?"24 Hours":r==="7d"?"7 Days":r==="30d"?"30 Days":"90 Days"}
            </button>
          ))}
          <button onClick={loadAllEvents} style={{marginLeft:"auto",fontSize:11,padding:"5px 12px",background:"#f0ece4",border:"1px solid #ccc",borderRadius:4,cursor:"pointer",color:T.brownLight}}>
            {loadingEvents ? "Loading..." : "↻ Refresh"}
          </button>
        </div>
      </div>

      {/* Platform Activity KPIs */}
      <div style={S.card}>
        <div style={S.secTitle}>📊 Platform Activity — {rangeLabels[timeRange]}</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
          {[
            ["🏠 Homepage Views", homepageViews.length, T.brown],
            ["🔍 Searches Run", searchPerformed.length, T.teal],
            ["👁️ Profile Views", profileViews.length, "#1A6B3C"],
            ["📰 Ad Clicks", adClicks.length, "#7B3FA0"],
          ].map(([l,v,c])=>(
            <div key={l} style={{textAlign:"center",background:T.parchment,borderRadius:6,padding:"12px 6px"}}>
              <div style={{fontSize:22,fontWeight:800,color:c,fontFamily:T.sans}}>{v.toLocaleString()}</div>
              <div style={{fontSize:10,color:T.brownLight,fontFamily:T.sans,textTransform:"uppercase",letterSpacing:0.5,lineHeight:1.3}}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginTop:8}}>
          {[
            ["📍 Village Searches", Object.values(villageCounts).reduce((a,b)=>a+b,0), "#E8431A"],
            ["📬 Leads Sent", filteredLeads.length, "#1A6B3C"],
            ["⭐ New Reviews", filteredReviews.length, T.gold],
            ["🌟 Featured Clicks", featuredClicks.length, "#CC0000"],
          ].map(([l,v,c])=>(
            <div key={l} style={{textAlign:"center",background:T.parchment,borderRadius:6,padding:"12px 6px"}}>
              <div style={{fontSize:22,fontWeight:800,color:c,fontFamily:T.sans}}>{v.toLocaleString()}</div>
              <div style={{fontSize:10,color:T.brownLight,fontFamily:T.sans,textTransform:"uppercase",letterSpacing:0.5,lineHeight:1.3}}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 7-Day Engagement Trend */}
      <div style={S.card}>
        <div style={S.secTitle}>📈 7-Day Engagement Trend</div>
        <div style={{display:"flex",gap:16,marginBottom:8}}>
          <span style={{fontSize:11,color:T.brown,fontFamily:T.sans}}>● Profile Views</span>
          <span style={{fontSize:11,color:T.teal,fontFamily:T.sans}}>● Search Appearances</span>
        </div>
        <div style={{display:"flex",alignItems:"flex-end",gap:6,height:80}}>
          {last7Data.map(({date,views,searches})=>{
            const d=new Date(date+"T12:00:00");
            const label=d.toLocaleDateString("en-US",{weekday:"short"});
            return (
              <div key={date} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                <div style={{width:"100%",display:"flex",gap:1,alignItems:"flex-end",height:60}}>
                  <div style={{flex:1,background:T.brown,borderRadius:"2px 2px 0 0",height:`${Math.max((views/maxDay)*56,views>0?4:0)}px`,transition:"height 0.3s"}} title={`${views} views`}></div>
                  <div style={{flex:1,background:T.teal,borderRadius:"2px 2px 0 0",height:`${Math.max((searches/maxDay)*56,searches>0?4:0)}px`,transition:"height 0.3s"}} title={`${searches} searches`}></div>
                </div>
                <div style={{fontSize:9,color:T.brownLight,fontFamily:T.sans}}>{label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Villages Searched */}
      <div style={S.card}>
        <div style={S.secTitle}>📍 Top Villages Searched</div>
        {loadingEvents ? <div style={{color:"#aaa",fontSize:13}}>Loading event data...</div> :
          topVillages.length === 0 ? <div style={{color:"#aaa",fontSize:13}}>No village search data yet — tracking is now active</div> :
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {topVillages.map(([village, cnt], i)=>(
              <div key={village} style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:11,fontWeight:700,color:T.brownLight,fontFamily:T.sans,width:18,textAlign:"right"}}>{i+1}.</span>
                <span style={{fontSize:13,color:T.brownDark,fontFamily:T.sans,width:160,flexShrink:0}}>{village}</span>
                <Bar val={cnt} max={topVillages[0]?.[1]||1} color="#E8431A" height={16}/>
                <span style={{fontSize:12,fontWeight:700,color:"#E8431A",fontFamily:T.sans,width:30,textAlign:"right"}}>{cnt}</span>
              </div>
            ))}
          </div>
        }
      </div>

      {/* Top Services Searched */}
      <div style={S.card}>
        <div style={S.secTitle}>🔧 Top Services Searched</div>
        {loadingEvents ? <div style={{color:"#aaa",fontSize:13}}>Loading...</div> :
          topServices.length === 0 ? <div style={{color:"#aaa",fontSize:13}}>No service search data yet</div> :
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {topServices.map(([svc, cnt], i)=>(
              <div key={svc} style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:11,fontWeight:700,color:T.brownLight,fontFamily:T.sans,width:18,textAlign:"right"}}>{i+1}.</span>
                <span style={{fontSize:13,color:T.brownDark,fontFamily:T.sans,width:160,flexShrink:0}}>{svc}</span>
                <Bar val={cnt} max={topServices[0]?.[1]||1} color={T.teal} height={16}/>
                <span style={{fontSize:12,fontWeight:700,color:T.teal,fontFamily:T.sans,width:30,textAlign:"right"}}>{cnt}</span>
              </div>
            ))}
          </div>
        }
      </div>

      {/* Top Providers — Profile Views */}
      <div style={S.card}>
        <div style={S.secTitle}>👁️ Most Viewed Providers ({rangeLabels[timeRange]})</div>
        {loadingEvents ? <div style={{color:"#aaa",fontSize:13}}>Loading...</div> :
          topViewedProviders.length === 0 ? <div style={{color:"#aaa",fontSize:13}}>No profile view data yet</div> :
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {topViewedProviders.map(({provider:p, count}, i)=>(
              <div key={p.id} style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:11,fontWeight:700,color:T.brownLight,fontFamily:T.sans,width:18,textAlign:"right"}}>{i+1}.</span>
                <span style={{fontSize:12,color:T.brownDark,fontFamily:T.sans,width:170,flexShrink:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.business_name}</span>
                <Bar val={count} max={topViewedProviders[0]?.count||1} color="#1A6B3C" height={16}/>
                <span style={{fontSize:12,fontWeight:700,color:"#1A6B3C",fontFamily:T.sans,width:30,textAlign:"right"}}>{count}</span>
              </div>
            ))}
          </div>
        }
      </div>

      {/* Top Providers — Search Appearances */}
      <div style={S.card}>
        <div style={S.secTitle}>🔍 Most Appeared in Search ({rangeLabels[timeRange]})</div>
        {loadingEvents ? <div style={{color:"#aaa",fontSize:13}}>Loading...</div> :
          topSearchedProviders.length === 0 ? <div style={{color:"#aaa",fontSize:13}}>No search data yet</div> :
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {topSearchedProviders.map(({provider:p, count}, i)=>(
              <div key={p.id} style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:11,fontWeight:700,color:T.brownLight,fontFamily:T.sans,width:18,textAlign:"right"}}>{i+1}.</span>
                <span style={{fontSize:12,color:T.brownDark,fontFamily:T.sans,width:170,flexShrink:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.business_name}</span>
                <Bar val={count} max={topSearchedProviders[0]?.count||1} color={T.teal} height={16}/>
                <span style={{fontSize:12,fontWeight:700,color:T.teal,fontFamily:T.sans,width:30,textAlign:"right"}}>{count}</span>
              </div>
            ))}
          </div>
        }
      </div>

      {/* Revenue Snapshot */}
      <div style={S.card}>
        <div style={S.secTitle}>💰 Revenue Snapshot</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
          {[["Est. MRR",`$${paid*12}`,T.teal],["Paid Providers",paid,"#1A6B3C"],["On Trial",trial,T.gold],["Active Featured Ads",activeAds.length,T.teal],["Featured Revenue",`$${activeAds.length*20}`,"#1A6B3C"],["Total Providers",providers.length,T.brown]].map(([l,v,c])=>(
            <div key={l} style={{textAlign:"center",background:T.parchment,borderRadius:6,padding:"10px 6px"}}>
              <div style={{fontSize:20,fontWeight:800,color:c,fontFamily:T.sans}}>{v}</div>
              <div style={{fontSize:10,color:T.brownLight,fontFamily:T.sans,textTransform:"uppercase",letterSpacing:0.5,lineHeight:1.3}}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Provider Signups by Month */}
      <div style={S.card}>
        <div style={S.secTitle}>📈 Provider Signups by Month</div>
        {months.length===0 ? <div style={{color:"#aaa",fontSize:13}}>No data yet</div> :
          <div style={{display:"flex",alignItems:"flex-end",gap:4,height:90,padding:"0 4px"}}>
            {months.map(([mo,cnt])=>(
              <div key={mo} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                <div style={{fontSize:9,color:T.brownLight,fontFamily:T.sans,fontWeight:700}}>{cnt}</div>
                <div style={{width:"100%",background:T.brown,borderRadius:"3px 3px 0 0",height:`${Math.max((cnt/maxM)*60,4)}px`}}></div>
                <div style={{fontSize:8,color:T.brownLight,fontFamily:T.sans,transform:"rotate(-45deg)",transformOrigin:"top left",marginLeft:6,whiteSpace:"nowrap"}}>
                  {mo.split("-")[1]}/{mo.split("-")[0].slice(2)}
                </div>
              </div>
            ))}
          </div>
        }
      </div>

      {/* Rating Distribution */}
      <div style={S.card}>
        <div style={S.secTitle}>⭐ Review Rating Distribution (All-Time · Avg: {avgRating})</div>
        <div style={{display:"flex",flexDirection:"column",gap:5}}>
          {[5,4,3,2,1].map(star=>(
            <div key={star} style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:12,color:T.gold,width:30,fontFamily:T.sans}}>{"⭐".repeat(star)}</span>
              <Bar val={ratingDist[star]} max={Math.max(...Object.values(ratingDist),1)} color={T.gold} height={14}/>
              <span style={{fontSize:12,fontWeight:700,color:T.brownLight,fontFamily:T.sans,width:24}}>{ratingDist[star]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* GA4 Link */}
      <div style={S.card}>
        <div style={S.secTitle}>🌐 External Traffic (Google Analytics)</div>
        <p style={{fontSize:13,color:T.brownLight,fontFamily:T.sans,margin:"0 0 10px 0"}}>
          For detailed traffic sources, demographics, and real-time visitors, open GA4 directly:
        </p>
        <a href="https://analytics.google.com/analytics/web/#/p490233278/reports/reportinghub"
          target="_blank" rel="noopener noreferrer"
          style={{display:"inline-block",padding:"10px 20px",background:T.brown,color:"#fff",borderRadius:5,fontSize:13,fontWeight:700,fontFamily:T.sans,textDecoration:"none"}}>
          📊 Open Google Analytics →
        </a>
        <div style={{marginTop:10,fontSize:12,color:T.brownLight,fontFamily:T.sans}}>
          Measurement ID: G-1EJ40FW9E1 · Property: V-Hub Homepage
        </div>
      </div>

    </div>
  );
}


// ── ADD PROVIDER TAB ──────────────────────────────────────────────────────────
function AddProviderTab({ onAdded, categories, services: allServices, serviceAreas: allAreas, adminPin }) {
  const activeServices = allServices.filter(s => s.is_active !== false);
  const activeAreas = allAreas.filter(a => a.is_active !== false);

  // Macro village groups (mirrors ListService)
  const MACRO_AREAS = [
    { key: "marion", label: "🟠 Marion County Villages", villages: ["Briar Meadow","Calumet Grove","Chatham","Chatham at Souilliere","Piedmont","Springdale","Woodbury","Woodbury at Phillips"] },
    { key: "sumter_north_466", label: "🔵 Sumter County — North of SR-466", villages: ["Alhambra","Belle Aire","De Allende","De La Vista","Glenbrook","Hacienda","Palo Alto","Polo Ridge","Rio Grande","Rio Ponderosa","Rio Ranchero","Santiago","Santo Domingo","Summerhill","Tierra Del Sol"] },
    { key: "sumter_between_466_466a", label: "🟢 Sumter County — SR-466 to SR-466A", villages: ["Amelia","Ashland","Belvedere","Bonita","Bonnybrook","Bridgeport at Creekside Landing","Bridgeport at Lake Miona","Bridgeport at Lakeshore Cottages","Bridgeport at Lake Sumter","Bridgeport at Laurel Valley","Bridgeport at Miona Shores","Bridgeport at Mission Hills","Buttonwood","Caroline","Duval","Hadley","Hemingway","Largo","Liberty Park","Lynnhaven","Mallory Square","Pennecamp","Poinciana","Sabal Chase","St. Charles","St. James","Sunset Pointe","Tall Trees","Tamarind Grove","Virginia Trace","Winifred"] },
    { key: "sumter_between_466a_hwy44", label: "🟡 Sumter County — SR-466A to Hwy 44", villages: ["Charlotte","Collier","Collier at Alden Bungalows","Collier at Antrim Dells","Collier at Atwood Bungalows","Dunedin","Fernandina","Gilchrist","Hillsborough","LaBelle","Lake Deaton","Osceola Hills","Osceola Hills at Soaring Eagle Preserve","Pinellas","Sanibel"] },
    { key: "sumter_south_hwy44", label: "🔴 Sumter County — South of Hwy 44", villages: ["Bradford","Cason Hammock","Chitty Chatty","Citrus Grove","DeSoto","Fenney","Hammock at Fenney","Hawkins","Linden","Marsh Bend","McClure","Monarch Grove","St. Catherine","St. John"] },
    { key: "eastport", label: "🌊 Eastport / Newest", villages: ["Dabney","Lake Denham","Moultrie Creek","Newell","Shady Brook"] },
    { key: "family", label: "🏠 Family / Non-Age-Restricted", villages: ["Bison Valley","Middleton","Oak Meadows","Oxford Oaks"] },
  ];

  // Build a name→id map for service areas
  const areaNameToId = {};
  activeAreas.forEach(a => {
    const shortName = a.name.includes(' — ') ? a.name.split(' — ').pop().trim() : a.name;
    areaNameToId[shortName] = a.id;
    areaNameToId[a.name] = a.id;
  });

  const empty = {
    business_name: "", owner_name: "", email: "", phone: "", website: "",
    description: "", address: "", license_number: "", years_in_business: "",
    google_review_url: "", notes: "", category_id: "", services: [], service_areas: [],
    trial_days: "45",
  };
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(null);
  const [svcSearch, setSvcSearch] = useState("");
  const [openMacros, setOpenMacros] = useState({});

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleSvc = (id) => setForm(f => ({ ...f, services: f.services.includes(id) ? f.services.filter(x => x !== id) : [...f.services, id] }));
  const toggleArea = (id) => setForm(f => ({ ...f, service_areas: f.service_areas.includes(id) ? f.service_areas.filter(x => x !== id) : [...f.service_areas, id] }));
  const toggleMacro = (key) => setOpenMacros(m => ({ ...m, [key]: !m[key] }));

  // Services grouped by selected category
  const catServices = {};
  activeServices.forEach(s => { if (!catServices[s.category_id]) catServices[s.category_id] = []; catServices[s.category_id].push(s); });
  const filteredSvcs = svcSearch.trim()
    ? activeServices.filter(s => s.name.toLowerCase().includes(svcSearch.toLowerCase()))
    : (catServices[form.category_id] || []);

  const setCategory = (catId) => setForm(f => ({ ...f, category_id: catId, services: [] }));

  // Count how many villages are selected per macro group
  const macroSelectedCount = (macro) => {
    return macro.villages.filter(vName => {
      const id = areaNameToId[vName];
      return id && form.service_areas.includes(id);
    }).length;
  };

  const selectAllMacro = (macro) => {
    const ids = macro.villages.map(v => areaNameToId[v]).filter(Boolean);
    setForm(f => {
      const current = new Set(f.service_areas);
      ids.forEach(id => current.add(id));
      return { ...f, service_areas: Array.from(current) };
    });
  };

  const deselectAllMacro = (macro) => {
    const ids = new Set(macro.villages.map(v => areaNameToId[v]).filter(Boolean));
    setForm(f => ({ ...f, service_areas: f.service_areas.filter(id => !ids.has(id)) }));
  };

  const save = async () => {
