'use strict';
const el=id=>document.getElementById(id);
const ticket=new URLSearchParams(location.hash.slice(1)).get('ticket');
history.replaceState(null,'',location.pathname+location.search);
let stream=null,photo='',version=0,sending=false;
const validTicket=/^[a-f0-9]{64}\.[a-f0-9]{64}$/.test(ticket||'');
function status(text){el('status').textContent=text;}
function stop(){version++;if(stream)stream.getTracks().forEach(t=>t.stop());stream=null;el('video').srcObject=null;['video','take','stop'].forEach(id=>el(id).hidden=true);el('start').disabled=sending||!validTicket;}
async function start(){
  if(sending||!validTicket)return;
  stop();const request=version;el('start').disabled=true;
  try{
    if(!navigator.mediaDevices?.getUserMedia)throw Error('UNAVAILABLE');
    const next=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:1280}},audio:false});
    if(version!==request){next.getTracks().forEach(t=>t.stop());return;}
    stream=next;el('video').srcObject=stream;el('video').hidden=false;await el('video').play();
    if(version!==request)return;
    el('take').hidden=el('stop').hidden=false;el('use').hidden=el('photo').hidden=true;status('Posisikan wajah Anda, lalu tekan Ambil Foto.');
  }catch(error){if(version!==request)return;stop();status(error.name==='NotAllowedError'?'Izinkan kamera melalui pengaturan situs/browser, lalu coba lagi.':'Kamera tidak tersedia. Periksa perangkat dan izin kamera.');}
}
el('start').onclick=start;el('stop').onclick=()=>{stop();status('Kamera ditutup.');};
el('take').onclick=()=>{
  const v=el('video');if(!v.videoWidth)return;
  const scale=Math.min(1,1280/Math.max(v.videoWidth,v.videoHeight)),c=el('canvas');
  c.width=Math.round(v.videoWidth*scale);c.height=Math.round(v.videoHeight*scale);c.getContext('2d').drawImage(v,0,0,c.width,c.height);
  photo=c.toDataURL('image/jpeg',.85);stop();el('photo').src=photo;el('download').href=photo;
  ['photo','use','download'].forEach(id=>el(id).hidden=false);el('start').textContent='Foto Ulang';status('Periksa foto sebelum memilih Gunakan Foto & Kembali.');
};
async function returnToForm(cancel){
  if(sending||!validTicket||(!cancel&&!photo))return;
  sending=true;stop();['use','cancel','start'].forEach(id=>el(id).disabled=true);
  try{
    status(cancel?'Memulihkan formulir…':'Menitipkan foto sementara dan memulihkan formulir…');
    const res=await window.appApiCall('saveSelfieHandoff',{ticket,photo:cancel?'':photo,cancel});
    const url=new URL(res.returnUrl),expected=new URL(window.APP_CONFIG.apiUrl);
    if(url.origin!==expected.origin||url.pathname!==expected.pathname||url.search||!/^#selfieReturn=[a-f0-9]{64}\.[a-f0-9]{64}$/.test(url.hash))throw Error('Alamat kembali tidak sesuai.');
    const link=el('return');link.href=url.href;link.hidden=false;status('Foto siap dikembalikan. Jika belum berpindah, tekan Kembali ke Formulir.');
    location.replace(url.href);
  }catch(error){status(error.message+' Foto tetap tersedia untuk diunduh.');}
  finally{sending=false;['use','cancel','start'].forEach(id=>el(id).disabled=!validTicket);}
}
el('use').onclick=()=>returnToForm(false);el('cancel').onclick=()=>returnToForm(true);
if(!validTicket){el('start').disabled=el('cancel').disabled=true;status('Buka halaman ini melalui tombol Buka Kamera di formulir /exec. Jika tadi memuat ulang kamera, kembali ke formulir dan mulai lagi.');}
window.addEventListener('pagehide',stop);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
