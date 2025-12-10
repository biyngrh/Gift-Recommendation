# 🎁 Gift Genius

![Project Status](https://img.shields.io/badge/Status-Active-success)
![Tech Stack](https://img.shields.io/badge/Built%20With-Next.js%20%7C%20Tailwind%20%7C%20Gemini%20AI-blueviolet)

> **Berhenti memberikan kado yang membosankan.** Biarkan AI menemukan hadiah yang paling bijaksana dan personal berdasarkan kepribadian penerima.

**Gift Genius** adalah aplikasi web pintar yang ditenagai oleh **Google Gemini AI**. Aplikasi ini mengubah deskripsi singkat tentang seseorang (contoh: *"Ayah saya yang suka berkebun tapi sering sakit pinggang"*) menjadi rekomendasi kado yang sangat spesifik dan penuh empati.

![Tampilan Aplikasi](./public/screenshot.png)
*(Catatan: Ganti gambar ini dengan screenshot asli aplikasi Anda agar lebih menarik!)*

---

## ✨ Fitur Utama

* **🧠 Mesin Empati AI:** Menggunakan Gemini 1.5 Flash untuk menganalisis kebutuhan tersembunyi dan emosi, bukan sekadar mencocokkan kata kunci.
* **🔮 Tampilan "Ethereal" Glassmorphism:** Antarmuka modern dengan efek kaca transparan, mode gelap, dan visual yang memanjakan mata.
* **⚡ 100% Client-Side:** Aplikasi berjalan sepenuhnya di browser pengguna tanpa memerlukan server backend yang rumit.
* **🎯 Rekomendasi Terstruktur:** Memberikan 3 kartu hasil kurasi yang berisi:
    * **Nama Barang Spesifik** (Bukan kategori umum).
    * **Alasan Emosional** ("Kenapa kado ini cocok?").
    * **Estimasi Harga**.
* **🔎 Pencarian Instan:** Tombol satu klik untuk langsung mencari produk yang direkomendasikan di Google/E-commerce.
* **💾 Simpan Ide:** Fitur "Riwayat" yang menyimpan ide kado favorit Anda langsung di memori browser (LocalStorage).

---

## 🛠️ Teknologi yang Digunakan

Proyek ini dibangun dengan filosofi *"Vibe Coding"*: Cepat, Efisien, dan Visual.

* **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
* **Otak AI:** [Google Gemini API](https://aistudio.google.com/) (Model `gemini-1.5-flash`)
* **Desain UI:** [Tailwind CSS](https://tailwindcss.com/) (Gaya Glassmorphism)
* **Ikon:** [Lucide React](https://lucide.dev/)
* **Manajemen State:** React Hooks

---

## 💡 Bagaimana Cara Kerjanya?

1.  **Input Cerita:** Pengguna mendeskripsikan penerima kado di kolom teks (Sifat, hobi, atau masalah yang sedang dihadapi).
2.  **Prompt Engineering:** Aplikasi mengirimkan instruksi khusus ke Gemini untuk bertindak sebagai "Asisten Belanja yang Empatik" dan meminta data dalam format JSON yang rapi.
3.  **Proses Berpikir:** Gemini menganalisis konteks cerita untuk menemukan ide kado yang mungkin tidak terpikirkan sebelumnya.
4.  **Visualisasi:** React mengubah data JSON tersebut menjadi kartu-kartu cantik yang siap dibaca.
5.  **Eksekusi:** Pengguna menekan tombol "Cari Barang" untuk membelinya secara online.

---

## 🤝 Kontribusi

Kontribusi adalah hal yang membuat komunitas open source menjadi tempat yang luar biasa untuk belajar dan berkreasi. Setiap kontribusi yang Anda berikan akan **sangat dihargai**.

Jika Anda memiliki ide fitur baru atau ingin memperbaiki tampilan, silakan buat *Pull Request* atau diskusikan di kolom *Issues*.

---

<div align="center">
  <p>Didukung oleh Google Gemini AI</p>
</div>
