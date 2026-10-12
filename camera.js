'use strict';
const el = id => document.getElementById(id);
const params = new URLSearchParams(location.hash.slice(1));
const nonce = params.get('nonce');
let parentOrigin = '', stream = null, photo = '', version = 0, ackTimer;
try {
  const origin = new URL(params.get('parent'));
  if (origin.protocol === 'https:' && /(^|[.-])script\.google(?:usercontent)?\.com$/.test(origin.hostname)) parentOrigin = origin.origin;
} catch (_) {}
history.replaceState(null, '', location.pathname + location.search);
const connected = !!(window.opener && parentOrigin && /^[a-f0-9]{32}$/.test(nonce || ''));
function status(text) { el('status').textContent = text; }
function stop() {
  version++;
  if (stream) stream.getTracks().forEach(track => track.stop());
  stream = null; el('video').srcObject = null;
  el('video').hidden = el('take').hidden = el('stop').hidden = true;
  el('start').disabled = false;
}
async function start() {
  stop(); const request = version;
  clearTimeout(ackTimer); el('use').disabled = false;
  photo = ''; el('photo').removeAttribute('src');
  ['photo', 'use', 'retry', 'download'].forEach(id => el(id).hidden = true);
  el('download').removeAttribute('href');
  el('start').disabled = true;
  try {
    if (!navigator.mediaDevices?.getUserMedia) throw Error('UNAVAILABLE');
    const next = await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:1280}},audio:false});
    if (request !== version) { next.getTracks().forEach(track => track.stop()); return; }
    stream = next; el('video').srcObject = stream; el('video').hidden = false;
    await el('video').play();
    if (request !== version) return;
    el('take').hidden = el('stop').hidden = false;
    status('Posisikan wajah Anda, lalu tekan Ambil Foto.');
  } catch (error) {
    if (request !== version) return;
    stop(); status(error.name === 'NotAllowedError' ? 'Kamera belum diizinkan. Periksa izin kamera untuk situs ini pada browser dan perangkat.' : 'Kamera tidak tersedia. Pastikan kamera tersambung dan tidak digunakan aplikasi lain.');
  }
}
el('start').onclick = el('retry').onclick = start;
el('stop').onclick = () => { stop(); status('Kamera ditutup.'); };
el('take').onclick = () => {
  const video = el('video'); if (!video.videoWidth) return;
  const ratio = Math.min(1, 1280 / Math.max(video.videoWidth, video.videoHeight));
  const canvas = el('canvas'); canvas.width = Math.round(video.videoWidth * ratio); canvas.height = Math.round(video.videoHeight * ratio);
  canvas.getContext('2d').drawImage(video,0,0,canvas.width,canvas.height);
  photo = canvas.toDataURL('image/jpeg', .85); stop();
  el('photo').src = photo; el('download').href = photo;
  ['photo','retry','download'].forEach(id => el(id).hidden = false);
  el('use').hidden = !connected;
  status(connected ? 'Periksa foto. Pilih Gunakan Foto untuk mengirimnya ke formulir yang membuka halaman ini.' : 'Foto siap. Unduh foto lalu unggah ke formulir aplikasi.');
};
el('use').onclick = () => {
  if (!photo || !connected) return;
  el('use').disabled = true;
  status('Mengirim foto ke formulir…');
  window.opener.postMessage({type:'selfie-photo-v1',nonce,photo}, parentOrigin);
  clearTimeout(ackTimer);
  ackTimer = setTimeout(() => { el('use').disabled = false; status('Belum ada konfirmasi dari formulir. Kembali dan periksa foto, atau unduh lalu unggah secara manual.'); }, 7000);
};
window.addEventListener('message', event => {
  if (!connected || event.source !== window.opener || event.origin !== parentOrigin || event.data?.nonce !== nonce || event.data?.type !== 'selfie-accepted-v1') return;
  clearTimeout(ackTimer); status('Foto sudah diterima. Anda dapat menutup tab ini dan kembali ke formulir.');
  el('use').hidden = true;
});
window.addEventListener('pagehide', stop);
document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
