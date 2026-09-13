const { customAlphabet } = require('nanoid');
const supabase = require('./db');
const nanoid = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 4);
const genKey = () => `KEY-${nanoid()}-${nanoid()}-${nanoid()}`;
const DURATIONS = { '1h':1, '1d':24, '3d':72, '7d':168, '14d':336, '30d':720 };

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  const { duration, amount = 1, adminToken } = req.body;
  if (adminToken !== process.env.ADMIN_TOKEN)
    return res.json({ success: false, message: 'Sai admin token' });

  const hours = DURATIONS[duration];
  if (!hours) return res.json({ success: false, message: 'Duration sai' });

  const now = Date.now();
  const keys = Array.from({ length: amount }, genKey);
  const rows = keys.map(k => ({ key: k, duration_hours: hours, created_at: now }));

  const { error } = await supabase.from('keys').insert(rows);
  if (error) return res.json({ success: false, message: error.message });

  res.json({ success: true, duration, hours, keys });
};
