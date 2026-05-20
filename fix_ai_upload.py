content = open('pages/ProviderDashboard.jsx').read()

old = """      const data = await resp.json();
      if (data.url) {
        setForm(p => ({ ...p, image_url: data.url }));
        setFilePreview(null); setFileObj(null);
        // Persist to saved_images on existing record
        const existingRecord = editingSlot !== "new" ? editingSlot : null;
        if (existingRecord?.id) {
          const existingSaved = existingRecord.saved_images || [];
          const newSaved = [data.url, ...existingSaved.filter(u => u !== data.url)].slice(0, 3);
          await ClassifiedAd.update(existingRecord.id, { ai_prompt: aiPrompt, image_url: data.url, saved_images: newSaved });
          await loadAds();
          const fresh = await ClassifiedAd.filter({ provider_id: provider.id });
          const updated = fresh.find(a => a.id === existingRecord.id);
          if (updated) setEditingSlot(updated);
        }
      } else { setAiError("Generation failed: " + (data.error || "unknown error")); }"""

new = """      const data = await resp.json();
      if (data.url) {
        let finalUrl = data.url;

        // If backend returned base64 (server-side CDN upload failed), upload from browser session instead
        if (finalUrl.startsWith("data:image")) {
          try {
            const b64str = finalUrl.split(",")[1];
            const byteArray = Uint8Array.from(atob(b64str), c => c.charCodeAt(0));
            const blob = new Blob([byteArray], { type: "image/png" });
            const file = new File([blob], "ai_ad_" + Date.now() + ".png", { type: "image/png" });
            const fd2 = new FormData();
            fd2.append("file", file);
            const upResp2 = await fetch("https://api.base44.app/api/apps/69d06ada8019d7e9edf7f8e8/storage/upload", { method: "POST", body: fd2 });
            const upData2 = await upResp2.json();
            if (upData2.url) finalUrl = upData2.url;
          } catch (upErr) {
            console.warn("Browser CDN upload fallback failed:", upErr);
          }
        }

        setForm(p => ({ ...p, image_url: finalUrl }));
        setFilePreview(null); setFileObj(null);
        // Persist to saved_images on existing record
        const existingRecord = editingSlot !== "new" ? editingSlot : null;
        if (existingRecord?.id) {
          const existingSaved = existingRecord.saved_images || [];
          const newSaved = [finalUrl, ...existingSaved.filter(u => u !== finalUrl)].slice(0, 3);
          await ClassifiedAd.update(existingRecord.id, { ai_prompt: aiPrompt, image_url: finalUrl, saved_images: newSaved });
          await loadAds();
          const fresh = await ClassifiedAd.filter({ provider_id: provider.id });
          const updated = fresh.find(a => a.id === existingRecord.id);
          if (updated) setEditingSlot(updated);
        }
      } else { setAiError("Generation failed: " + (data.error || "unknown error")); }"""

if old in content:
    content = content.replace(old, new)
    open('pages/ProviderDashboard.jsx', 'w').write(content)
    print('✅ Frontend fallback upload fix applied')
else:
    print('❌ Pattern not found - searching...')
    idx = content.find('const data = await resp.json')
    print(f'Found handleGenerateAI data parse at char {idx}')
    print(repr(content[idx:idx+500]))
