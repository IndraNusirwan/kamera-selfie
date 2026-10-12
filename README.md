# Kamera selfie untuk GitHub Pages

Unggah hanya index.html, camera.js, dan README.md dari folder ini ke repositori kamera. Jangan unggah Code.gs, API key, data nasabah, atau foto.

1. Buat repositori GitHub untuk kamera, misalnya `kamera-selfie`.
2. Unggah file di atas ke root repositori pada branch main.
3. Buka Settings → Pages → Deploy from a branch → main → /(root) → Save.
4. Tunggu GitHub menampilkan URL situs, misalnya https://NAMA-AKUN.github.io/kamera-selfie/.
5. Di file index-live-updated.html aplikasi, cari `const CAMERA_PAGE_URL = '';` dan isi URL tersebut di antara tanda petik.
6. Salin seluruh isi index-live-updated.html ke index.html Apps Script. Simpan dan deploy versi baru. Pertahankan Code.gs OTP yang sudah berhasil; batas foto server harus 5 MB.
7. Buka /exec lalu Buka Kamera di Tab Baru → Aktifkan Kamera → Izinkan → Ambil Foto → Gunakan Foto. Kembali ke tab formulir untuk melihat pratinjau. Uji ini tidak mengirim OTP.

Jika hanya ingin mencoba kamera, buka URL GitHub Pages langsung. Foto dapat diunduh untuk diunggah ke formulir, tetapi tombol Gunakan Foto hanya muncul ketika halaman dibuka melalui aplikasi.

Foto berada dalam memori browser; tidak ada upload foto atau penyimpanan browser permanen di halaman kamera. Transfer memakai postMessage dengan origin, jendela pengirim, token acak sekali pakai, masa berlaku 10 menit, validasi gambar dan ukuran. Nonce dan origin dikirim melalui fragment URL, lalu dihapus dari alamat. Foto hanya dikirim setelah pengguna memilih Gunakan Foto. Jika hubungan opener dibatasi browser, gunakan Unduh Foto dan unggah manual. Izin browser/perangkat tetap diperlukan; tidak ada jaminan pop-up izin muncul bila sebelumnya ditolak.

Kode ini belum diuji pada deployment GitHub Pages dan perangkat pengguna. Uji kamera nyata serta transfer ke Apps Script setelah publikasi, sebelum digunakan untuk pengajuan sebenarnya.

Referensi: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
