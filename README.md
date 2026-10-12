# Aplikasi penuh di GitHub Pages — dua kamera dalam satu tab

Ini menggantikan halaman kamera saja pada repositori `IndraNusirwan/kamera-selfie`. URL utama tetap https://indranusirwan.github.io/kamera-selfie/ tetapi kini berisi seluruh formulir, OTP, pengajuan, dan admin. Kamera memerlukan izin pengguna, HTTPS, dan browser/perangkat yang mendukung.

## 1. Tambahkan API di Apps Script

Pada proyek Apps Script yang sudah berhasil mengirim OTP, klik + di bagian Files → Script. Beri nama `Api` (menjadi Api.gs), lalu salin isi file Api.gs dari paket pendamping. Jangan mengganti Code.gs OTP Anda. Pastikan tidak ada fungsi doPost lain pada proyek; jika sudah ada, gabungkan router terlebih dahulu, jangan menambah duplikat.

Pastikan Code.gs memakai `MAX_PHOTO_BYTES: 5 * 1024 * 1024`. Simpan, lalu Deploy → Manage deployments → Edit → New version → Deploy. Deployment harus Execute as: Me dan akses Anyone (bukan hanya pengguna yang login Google), agar permintaan GitHub dapat dibaca tanpa login Google. Jika kebijakan akun melarang akses Anyone, integrasi ini tidak bisa langsung dipakai.

File index.html lama di Apps Script boleh tetap ada. Tidak perlu menjalankan setupDatabase lagi. Api.gs memanggil fungsi Code.gs yang sudah ada dan tetap memerlukan sesi OTP untuk menyimpan pengajuan, serta sesi admin untuk akses data/foto/admin. API key tetap di Script Properties.

## 2. Ganti tampilan di GitHub

Unggah hanya `index.html`, `config.js`, `api-client.js`, dan README.md dari folder github-app ke root repositori kamera-selfie pada branch main, menggantikan index.html kamera yang lama. File camera.js yang lama tidak dipakai lagi, boleh dibiarkan. Jangan unggah Api.gs, Code.gs, foto, kredensial, atau data nasabah.

config.js sudah berisi URL /exec terakhir yang diberikan. Jika deployment memiliki URL baru, ubah `apiUrl` di config.js. Tidak ada API key dalam konfigurasi frontend.

GitHub Settings → Pages harus main → /(root). Tunggu deployment Pages selesai, lalu buka URL GitHub dan lakukan muat ulang paksa (Ctrl+Shift+R). Gunakan URL GitHub ini sebagai link aplikasi utama, bukan /exec dan bukan file HTML lokal.

## 3. Uji tanpa memakai saldo OTP

1. Klik Buka Kamera → Izinkan → Ambil Tangkapan Foto. Kamera/pratinjau tetap di halaman yang sama. Tutup kamera atau pindah tab menghentikan stream kamera.
2. Di HP, uji Selfie via Kamera HP. Pilihan kamera depan/file picker ditentukan browser/perangkat. Maksimal JPEG/PNG 5 MB.
3. Klik Periksa koneksi aplikasi (tanpa OTP) di bagian bawah. Pastikan muncul Apps Script terhubung. Pengujian ini tidak memanggil OTP.ID dan tidak menyimpan data.
4. Baru lakukan satu uji OTP, verifikasi, dan pengajuan contoh. Uji OTP memakai saldo provider. Kamera bukan pemeriksaan liveness atau pencocokan identitas otomatis.
5. Uji login admin beserta OTP dan akses foto dengan akun Anda.

Jika koneksi gagal, periksa Api.gs, versi deployment, izin Anyone, dan URL config.js. Frontend menggunakan POST text/plain, mengikuti redirect ContentService, serta tetap memakai CORS untuk membaca respons. Koneksi lintas domain harus diverifikasi pada deployment nyata; jangan mengubah mode menjadi no-cors karena respons OTP tidak dapat dibaca. Tidak ada pengiriman ulang otomatis ketika koneksi gagal, sebab permintaan mungkin sudah diproses server.

## Status verifikasi

Tes lokal memeriksa router API, penolakan fungsi internal, penerusan token ke fungsi otorisasi lama, kegagalan koneksi sebelum OTP, dan alur kamera satu halaman dengan mock perangkat. Tes ini belum membuktikan kamera nyata, izin akun Google, CORS deployment, pengiriman OTP, atau penyimpanan Drive bekerja online. Instal dan lakukan pemeriksaan koneksi sebelum membagikan link.

Foto dan token sesi hanya berada dalam memori halaman sampai proses penyimpanan yang sah. Muat ulang halaman akan menghapus sesi/formulir. Foto tidak diunggah ke GitHub. Jangan menambahkan kredensial ke repositori publik.

Referensi:
- https://developers.google.com/apps-script/guides/content
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
