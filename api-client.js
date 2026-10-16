'use strict';
// No OTP key or admin credential belongs in this file. Session tokens stay in memory.
let apiCheckedAt = 0;
async function apiRequest(action, args) {
  const endpoint = window.APP_CONFIG && window.APP_CONFIG.apiUrl;
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(endpoint || '')) {
    throw new Error('URL Apps Script belum benar. Periksa config.js.');
  }
  const requestId = Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2,'0')).join('');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), action === 'ping' ? 20000 : 90000);
  try {
    // text/plain avoids preflight. CORS stays enabled so responses can be read.
    const response = await fetch(endpoint, {
      method:'POST', mode:'cors', credentials:'omit', redirect:'follow',
      headers:{'Content-Type':'text/plain;charset=UTF-8'},
      body:JSON.stringify({protocol:'peminjaman-api-v1',requestId,action,args}),
      signal:controller.signal
    });
    if (!response.ok) throw new Error('API_HTTP_' + response.status);
    let envelope;
    try { envelope = await response.json(); } catch (_) { throw new Error('API_RESPONSE'); }
    if (!envelope || envelope.protocol !== 'peminjaman-api-v1' || envelope.requestId !== requestId ||
        !envelope.result || typeof envelope.result.success !== 'boolean') throw new Error('API_RESPONSE');
    if (!envelope.result.success) {
      const error = new Error(typeof envelope.result.message === 'string' ? envelope.result.message : 'Permintaan ditolak server.');
      error.applicationError = true; throw error;
    }
    return envelope.result;
  } catch (error) {
    if (error.applicationError) throw error;
    apiCheckedAt = 0;
    const detail = error.name === 'AbortError' ? 'TIMEOUT' :
      /^API_HTTP_\d+$/.test(error.message || '') ? error.message :
      error.message === 'API_RESPONSE' ? 'RESPONS_BUKAN_API_ATAU_VERSI_TIDAK_SESUAI' :
      error.name === 'TypeError' ? 'JARINGAN_ATAU_CORS' : 'KONEKSI_GAGAL';
    if (action === 'ping') throw new Error('Belum terhubung ke Apps Script [' + detail + '; v20261016b]. OTP belum dikirim. Coba Periksa Koneksi lalu kirim kode dalam kurung ini.');
    if (action === 'saveSelfieHandoff') throw new Error('Konfirmasi penyimpanan foto belum diterima. Periksa koneksi, lalu coba Gunakan Foto & Kembali lagi. Tiket yang sama tidak membuat penyimpanan ganda.');
    throw new Error('Konfirmasi server belum diterima. Permintaan mungkin sudah diproses; jangan langsung mengulang. Untuk OTP, periksa pesan masuk dan tunggu minimal 60 detik.');
  } finally { clearTimeout(timer); }
}
window.appApiCall = async function (action, ...args) {
  if (action !== 'ping' && Date.now() - apiCheckedAt > 60000) {
    await apiRequest('ping', []); apiCheckedAt = Date.now();
  }
  const result = await apiRequest(action,args);
  if (action === 'ping') apiCheckedAt = Date.now();
  return result;
};
