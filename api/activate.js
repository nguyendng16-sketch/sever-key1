const supabase = require('./_db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  const { key, deviceId } = req.body;
  if (!key || !deviceId)
    return res.json({ success: false, message: 'Thiếu key hoặc deviceId' });

  const { data: row } = await supabase.from('keys').select('*').eq('key', key).single();
  if (!row) return res.json({ success: false, message: 'Key không tồn tại' });
  if (row.status === 'banned') return res.json({ success: false, message: 'Key bị khoá' });

  const now = Date.now();

  if (!row.device_id) {
    const expires = now + row.duration_hours * 3600 * 1000;
    await supabase.from('keys').update({
      device_id: deviceId, activated_at: now, expires_at: expires, status: 'active'
    }).eq('key', key);
    return res.json({ success: true, message: 'Kích hoạt OK', expiresAt: expires, remainingMs: expires - now });
  }

  if (row.device_id !== deviceId)
    return res.json({ success: false, message: 'Key đã dùng thiết bị khác' });

  if (now > row.expires_at) {
    await supabase.from('keys').update({ status: 'expired' }).eq('key', key);
    return res.json({ success: false, message: 'Key hết hạn' });
  }

  res.json({ success: true, message: 'Hợp lệ', expiresAt: row.expires_at, remainingMs: row.expires_at - now });
};
