const supabase = require('./db');

module.exports = async (req, res) => {
  const { key, deviceId } = req.query;
  const { data: row } = await supabase.from('keys').select('*').eq('key', key).single();
  if (!row) return res.json({ valid: false, message: 'Không tồn tại' });
  const now = Date.now();
  if (!row.device_id) return res.json({ valid: false, status: 'unused' });
  if (row.device_id !== deviceId) return res.json({ valid: false, message: 'Sai thiết bị' });
  if (now > row.expires_at) return res.json({ valid: false, status: 'expired' });
  res.json({ valid: true, expiresAt: row.expires_at, remainingMs: row.expires_at - now });
};
