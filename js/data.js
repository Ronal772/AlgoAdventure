// ==================== DATA BANK SOAL, MISI & KONFIGURASI ====================
const STORAGE_KEYS = {
  STUDENTS: 'algo_adv_students_v2',
  SESSION: 'algo_adv_session_v2',
  PRETEST_BANK: 'algo_adv_pretest_v2',
  POSTTEST_BANK: 'algo_adv_posttest_v2',
  HEADER_CFG: 'algo_adv_header_v2',
  GSHEET_URL: 'algo_adv_gsheet_v2'
};

const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

const DEFAULT_HEADER_CONFIG = {
  bgUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1600&q=80',
  opacity: 82
};

// 20 Soal Pretest (5 soal C1, 5 soal C2, 5 soal C3, 5 soal C4)
const DEFAULT_PRETEST_QUESTIONS = [
  { level: 'C1', q: 'Apa yang dimaksud dengan algoritma dalam ilmu komputer?', opts: ['Urutan langkah-langkah logis dan sistematis untuk menyelesaikan masalah', 'Perangkat keras untuk memproses data biner', 'Bahasa pemrograman tingkat mesin', 'Aplikasi pengolah angka dan grafik'], ans: 0, exp: 'Algoritma adalah urutan langkah logis dan terstruktur untuk menyelesaikan suatu masalah.' },
  { level: 'C1', q: 'Ciri algoritma yang menyatakan bahwa proses harus berhenti setelah sejumlah langkah terbatas disebut...', opts: ['Definiteness', 'Finiteness', 'Input', 'Effectiveness'], ans: 1, exp: 'Finiteness (keterbatasan) berarti algoritma harus berakhir setelah langkah terbatas.' },
  { level: 'C1', q: 'Simbol flowchart berbentuk belah ketupat (diamond) digunakan untuk menyatakan...', opts: ['Mulai dan Selesai', 'Input dan Output', 'Keputusan / Percabangan kondisi', 'Proses perhitungan'], ans: 2, exp: 'Belah ketupat melambangkan Decision (keputusan Ya/Tidak).' },
  { level: 'C1', q: 'Simbol flowchart berbentuk oval (terminator) berfungsi untuk...', opts: ['Menghubungkan halaman berbeda', 'Menandai awal (Start) dan akhir (End) program', 'Menampilkan hasil ke layar', 'Menyimpan variabel sementara'], ans: 1, exp: 'Terminator berbentuk oval menandai titik mulai dan selesai.' },
  { level: 'C1', q: 'Penulisan algoritma yang menyerupai kode bahasa pemrograman tetapi mudah dibaca manusia disebut...', opts: ['Pseudocode', 'Machine Code', 'Compiler', 'Flowchart'], ans: 0, exp: 'Pseudocode adalah deskripsi algoritma menggunakan bahasa semi-pemrograman.' },

  { level: 'C2', q: 'Mengapa setiap langkah dalam algoritma harus bersifat Definiteness (pasti)?', opts: ['Agar ukuran file program menjadi kecil', 'Agar tidak menimbulkan tafsir ganda (ambigu) saat dijalankan komputer', 'Agar program tidak membutuhkan input', 'Agar hanya bisa dijalankan satu kali'], ans: 1, exp: 'Komputer mengeksekusi instruksi secara harfiah sehingga setiap langkah harus pasti dan tidak ambigu.' },
  { level: 'C2', q: 'Perbedaan utama antara struktur percabangan (Selection) dan perulangan (Looping) adalah...', opts: ['Percabangan memilih jalur aksi berdasar kondisi, perulangan mengulang blok instruksi', 'Percabangan hanya memakai angka, perulangan memakai huruf', 'Perulangan tidak memerlukan syarat berhenti', 'Tidak ada perbedaan di antara keduanya'], ans: 0, exp: 'Selection memilih satu dari beberapa jalur; Looping mengulang instruksi selama kondisi terpenuhi.' },
  { level: 'C2', q: 'Dalam flowchart menghitung luas persegi panjang, langkah "Hitung Luas = P × L" menggunakan simbol...', opts: ['Jajar genjang', 'Persegi panjang', 'Oval', 'Belah ketupat'], ans: 1, exp: 'Operasi perhitungan aritmetika termasuk Process sehingga memakai persegi panjang.' },
  { level: 'C2', q: 'Jika sebuah algoritma tidak memiliki nilai keluaran (Output), maka algoritma tersebut...', opts: ['Tetap valid karena output bersifat opsional', 'Melanggar ciri utama algoritma karena tidak menghasilkan solusi', 'Otomatis berubah menjadi flowchart', 'Berjalan lebih cepat'], ans: 1, exp: 'Setiap algoritma wajib menghasilkan minimal satu output sebagai solusi masalah.' },
  { level: 'C2', q: 'Simbol jajar genjang pada flowchart digunakan pada tahap...', opts: ['Membaca nilai masukan pengguna dan mencetak hasil akhir', 'Membandingkan dua bilangan', 'Mengakhiri seluruh program', 'Melompat ke sub-program'], ans: 0, exp: 'Jajar genjang merepresentasikan operasi Input maupun Output.' },

  { level: 'C3', q: 'Diketahui algoritma: x = 10; y = 4; jika (x > y) maka z = x - y, jika tidak z = x + y. Nilai z adalah...', opts: ['14', '6', '40', '4'], ans: 1, exp: 'Karena 10 > 4 bernilai benar (True), maka z = 10 - 4 = 6.' },
  { level: 'C3', q: 'Perhatikan pseudocode: total = 0; ulangi i dari 1 sampai 4: total = total + i. Berapa nilai akhir total?', opts: ['4', '6', '10', '15'], ans: 2, exp: 'total = 0 + 1 + 2 + 3 + 4 = 10.' },
  { level: 'C3', q: 'Sebuah toko memberi diskon jika belanja >= 100000. Kondisi percabangan yang tepat adalah...', opts: ['belanja < 100000', 'belanja >= 100000', 'belanja == 0', 'belanja != 100000'], ans: 1, exp: 'Syarat minimal 100.000 ditulis dengan operator lebih besar atau sama dengan (>=).' },
  { level: 'C3', q: 'Jika skor = 50 dan syarat lulus adalah "skor > 50", maka output yang tampil adalah...', opts: ['Lulus', 'Tidak Lulus', 'Error', 'Kosong'], ans: 1, exp: '50 > 50 bernilai False (salah), sehingga masuk ke cabang Tidak Lulus.' },
  { level: 'C3', q: 'Urutan langkah yang benar untuk menukar isi gelas A (kopi) dan gelas B (teh) adalah...', opts: ['Tuang A ke B langsung', 'Siapkan gelas kosong C; tuang A ke C; tuang B ke A; tuang C ke B', 'Buang isi A lalu isi dengan B', 'Tuang B ke A lalu A ke B'], ans: 1, exp: 'Pertukaran dua variabel memerlukan variabel bantu sementara (gelas C).' },

  { level: 'C4', q: 'Sebuah perulangan "while (x > 0)" memiliki nilai awal x = 5, namun di dalam loop tertulis "x = x + 1". Apa yang terjadi?', opts: ['Loop berhenti setelah 5 kali', 'Terjadi Infinite Loop (perulangan tak terbatas) karena x selalu > 0', 'Nilai x langsung menjadi 0', 'Program berhenti karena syntax error'], ans: 1, exp: 'Karena x terus bertambah (6, 7, 8...), kondisi x > 0 selalu benar sehingga terjadi infinite loop.' },
  { level: 'C4', q: 'Siswa membuat rumus rata-rata 3 nilai: "rata = A + B + C / 3". Saat diuji dengan A=80, B=80, C=90, hasilnya 190. Kesalahan ini termasuk...', opts: ['Syntax Error', 'Logic Error karena kurang tanda kurung (A + B + C) / 3', 'Hardware Error', 'Overflow Error'], ans: 1, exp: 'Pembagian dieksekusi lebih dulu dari penjumlahan sehingga perlu tanda kurung.' },
  { level: 'C4', q: 'Manakah algoritma pencarian angka 7 pada daftar terurut [1, 3, 5, 7, 9, 11, 13] yang paling efisien?', opts: ['Memeriksa satu per satu dari index 0 hingga akhir', 'Memulai dari nilai tengah (7) dengan metode Binary Search', 'Mengacak urutan daftar terlebih dahulu', 'Menghapus angka genap terlebih dahulu'], ans: 1, exp: 'Binary Search membagi ruang pencarian menjadi dua sehingga menemukan 7 dalam 1 langkah.' },
  { level: 'C4', q: 'Pada flowchart cek bilangan genap, tertulis kondisi "N mod 2 == 1" lalu cabang Ya mencetak "Genap". Perbaikan yang tepat adalah...', opts: ['Mengubah kondisi menjadi N mod 2 == 0', 'Mengubah simbol menjadi oval', 'Menghapus input N', 'Mengganti N dengan 0'], ans: 0, exp: 'Bilangan genap habis dibagi 2 sehingga sisa baginya (N mod 2) sama dengan 0.' },
  { level: 'C4', q: 'Program kasir menghitung kembalian: "kembalian = total_belanja - uang_bayar". Jika belanja 35.000 dan bayar 50.000, outputnya -15.000. Solusinya adalah...', opts: ['Membalik rumus menjadi kembalian = uang_bayar - total_belanja', 'Mengalikan hasil dengan 0', 'Menambahkan pajak 10%', 'Mengubah tipe data menjadi teks'], ans: 0, exp: 'Uang kembalian diperoleh dari uang pembayaran dikurangi total belanja.' }
];

// 20 Soal Posttest (Setara C1-C4 dengan variasi kasus baru)
const DEFAULT_POSTTEST_QUESTIONS = [
  { level: 'C1', q: 'Siapakah ilmuwan yang namanya menjadi asal-usul istilah "Algoritma"?', opts: ['Al-Khwarizmi', 'Alan Turing', 'Charles Babbage', 'Ada Lovelace'], ans: 0, exp: 'Kata algoritma berasal dari nama matematikawan Abu Ja’far Muhammad ibnu Musa Al-Khwarizmi.' },
  { level: 'C1', q: 'Simbol flowchart berbentuk persegi panjang digunakan untuk melambangkan...', opts: ['Proses / Pengolahan data', 'Input / Output', 'Terminator', 'Percabangan'], ans: 0, exp: 'Persegi panjang digunakan untuk menyatakan proses pengolahan data.' },
  { level: 'C1', q: 'Struktur algoritma yang menjalankan instruksi baris demi baris secara berurutan disebut...', opts: ['Sequence (Runtunan)', 'Selection (Percabangan)', 'Iteration (Perulangan)', 'Recursion'], ans: 0, exp: 'Sequence menjalankan instruksi secara berurutan dari awal hingga akhir.' },
  { level: 'C1', q: 'Operator modulo (%) atau "mod" dalam algoritma berfungsi untuk menghasilkan...', opts: ['Sisa hasil pembagian', 'Hasil pangkat dua', 'Nilai rata-rata', 'Bilangan pembulatan ke atas'], ans: 0, exp: 'Operator modulo menghasilkan sisa pembagian dua bilangan bulat.' },
  { level: 'C1', q: 'Proses mencari dan memperbaiki kesalahan (bug) dalam algoritma atau program disebut...', opts: ['Debugging', 'Compiling', 'Installing', 'Formatting'], ans: 0, exp: 'Debugging adalah proses melacak dan memperbaiki kesalahan pada program.' },

  { level: 'C2', q: 'Mengapa flowchart sangat membantu programmer sebelum menulis kode program?', opts: ['Memvisualisasikan alur logika program secara jelas sehingga mudah dipahami', 'Menggantikan fungsi sistem operasi', 'Menambah kapasitas memori RAM komputer', 'Menghapus kebutuhan akan variabel'], ans: 0, exp: 'Flowchart memetakan alur keputusan dan proses secara visual sebelum implementasi kode.' },
  { level: 'C2', q: 'Kapan kita sebaiknya menggunakan struktur perulangan (Looping) daripada menulis baris kode berulang kali?', opts: ['Ketika ada instruksi serupa yang harus dijalankan berkali-kali', 'Ketika program hanya memiliki satu baris output', 'Ketika tidak ada kondisi yang perlu diperiksa', 'Ketika program tidak menerima input'], ans: 0, exp: 'Looping membuat kode ringkas dan efisien saat mengulang proses serupa.' },
  { level: 'C2', q: 'Dalam notasi algoritma, variabel berperan sebagai...', opts: ['Wadah penyimpanan nilai/data di memori yang isinya dapat berubah', 'Tombol untuk mematikan komputer', 'Kabel penghubung monitor', 'Judul dokumen laporan'], ans: 0, exp: 'Variabel menyimpan data sementara selama algoritma dieksekusi.' },
  { level: 'C2', q: 'Jika sebuah kondisi pada percabangan IF-ELSE bernilai Salah (False), maka bagian yang dieksekusi adalah...', opts: ['Blok instruksi pada cabang ELSE', 'Blok instruksi pada cabang IF', 'Seluruh blok diabaikan dan komputer mati', 'Program kembali ke baris pertama secara otomatis'], ans: 0, exp: 'Cabang ELSE dijalankan ketika kondisi pada IF bernilai False.' },
  { level: 'C2', q: 'Garis berpanah (Flowline) pada diagram alir berfungsi untuk...', opts: ['Menunjukkan arah aliran eksekusi dari satu langkah ke langkah berikutnya', 'Menyimpan konstanta matematika', 'Menandai komentar pengembang', 'Membagi layar menjadi dua bagian'], ans: 0, exp: 'Flowline menghubungkan simbol dan menunjukkan arah urutan proses.' },

  { level: 'C3', q: 'Diketahui: a = 3; b = 5; a = a + b; b = a - b. Nilai akhir dari a dan b berturut-turut adalah...', opts: ['a = 8, b = 3', 'a = 3, b = 5', 'a = 8, b = 5', 'a = 5, b = 3'], ans: 0, exp: 'a menjadi 3 + 5 = 8; lalu b menjadi 8 - 5 = 3.' },
  { level: 'C3', q: 'Perulangan: hasil = 1; ulangi k dari 1 sampai 4: hasil = hasil * k. Berapa output hasil?', opts: ['10', '16', '24', '12'], ans: 2, exp: 'hasil = 1 × 1 × 2 × 3 × 4 = 24 (faktorial 4).' },
  { level: 'C3', q: 'Untuk menentukan apakah bilangan X berada di antara 10 dan 20 (inklusif), kondisi logika yang benar adalah...', opts: ['X >= 10 AND X <= 20', 'X > 10 OR X < 20', 'X == 10 AND X == 20', 'X < 10 AND X > 20'], ans: 0, exp: 'Operator AND memastikan kedua batas (>= 10 dan <= 20) terpenuhi bersamaan.' },
  { level: 'C3', q: 'Jika suhu = 38, dan aturan: jika suhu >= 37.5 cetak "Demam", selain itu cetak "Normal". Outputnya adalah...', opts: ['Demam', 'Normal', '38', 'Tidak ada output'], ans: 0, exp: 'Karena 38 >= 37.5 bernilai True, maka tercetak "Demam".' },
  { level: 'C3', q: 'Algoritma menentukan bilangan terbesar dari A=12, B=25, C=19 akan menghasilkan...', opts: ['12', '19', '25', '56'], ans: 2, exp: 'Nilai maksimum di antara 12, 25, dan 19 adalah 25.' },

  { level: 'C4', q: 'Sebuah kode memiliki percabangan berurutan: jika nilai >= 60 cetak "C", jika nilai >= 80 cetak "A". Saat nilai = 90, tercetak "C". Mengapa demikian?', opts: ['Karena kondisi >= 60 diperiksa lebih dulu dan sudah bernilai True untuk 90', 'Karena angka 90 lebih kecil dari 80', 'Karena komputer tidak mengenal huruf A', 'Karena terjadi syntax error'], ans: 0, exp: 'Pengecekan rentang nilai bertingkat harus dimulai dari batas tertinggi (>= 80) lebih dulu.' },
  { level: 'C4', q: 'Dalam array berisi 1.000 data terurut, Algoritma A memerlukan maksimal 1.000 langkah, sedangkan Algoritma B hanya maksimal 10 langkah. Kesimpulannya adalah...', opts: ['Algoritma B jauh lebih efisien dari segi kompleksitas waktu', 'Algoritma A lebih cepat daripada Algoritma B', 'Keduanya memiliki efisiensi yang identik', 'Algoritma B tidak bisa digunakan untuk data besar'], ans: 0, exp: 'Semakin sedikit langkah untuk ukuran input sama, semakin efisien algoritmanya.' },
  { level: 'C4', q: 'Siswa menulis: "for (i = 10; i <= 5; i++) { print(i); }". Saat dijalankan, tidak ada angka yang tercetak sama sekali. Penyebabnya adalah...', opts: ['Kondisi awal i = 10 sudah tidak memenuhi syarat i <= 5 sejak awal', 'Perintah print salah ketik', 'Angka 10 terlalu besar untuk memori', 'Perulangan berjalan selamanya'], ans: 0, exp: 'Karena 10 <= 5 langsung bernilai False pada pemeriksaan pertama, badan loop tidak pernah dieksekusi.' },
  { level: 'C4', q: 'Pada algoritma menghitung luas lingkaran, tertulis "Luas = 3.14 * r * 2". Jika r = 10, hasil seharusnya 314 namun keluar 62.8. Perbaikan yang benar adalah...', opts: ['Mengubah rumus menjadi Luas = 3.14 * r * r', 'Mengubah 3.14 menjadi 314', 'Menghapus variabel r', 'Mengganti tanda * menjadi +'], ans: 0, exp: 'Luas lingkaran adalah π × r², bukan π × r × 2.' },
  { level: 'C4', q: 'Sebuah lampu pintar menyala otomatis jika "hari_gelap == True" DAN "ada_orang == True". Jika hari gelap tetapi ruangan kosong, lampu tetap mati. Hal ini menunjukkan...', opts: ['Logika gerbang AND berjalan sesuai spesifikasi karena kedua syarat wajib terpenuhi', 'Sensor cahaya mengalami kerusakan', 'Program mengalami infinite loop', 'Operator AND bekerja sama seperti operator OR'], ans: 0, exp: 'Gerbang AND hanya menghasilkan True jika seluruh kondisi bernilai True.' }
];

const MISSION_DATA = {
  1: {
    badge: 'C1 • Mengingat',
    title: 'Level 1: Mengingat Konsep Dasar Algoritma',
    points: 100,
    question: 'Manakah urutan langkah paling tepat dalam membuat secangkir teh manis secara algoritmis?',
    options: [
      'Minum teh → Siapkan gelas → Tuang air panas → Masukkan teh & gula',
      'Siapkan gelas → Masukkan teh & gula → Tuang air panas → Aduk hingga larut → Sajikan',
      'Tuang air panas → Buang gelas → Aduk gula',
      'Masukkan gula → Minum air dingin → Siapkan teko'
    ],
    correct: 1,
    explanation: 'Tepat! Algoritma harus tersusun secara logis, berurutan dari persiapan hingga penyajian.'
  },
  2: {
    badge: 'C2 • Memahami',
    title: 'Level 2: Memahami Simbol Flowchart',
    points: 120,
    question: 'Dalam pembuatan Flowchart, jika kita ingin membuat percabangan "Apakah nilai > 75?", simbol apa yang wajib digunakan?',
    options: [
      'Persegi Panjang (Process)',
      'Jajar Genjang (Input/Output)',
      'Belah Ketupat (Decision)',
      'Lingkaran Kecil (Connector)'
    ],
    correct: 2,
    explanation: 'Benar! Simbol Belah Ketupat (Decision) digunakan untuk menguji kondisi logika Ya/Tidak.'
  },
  3: {
    badge: 'C3 • Menerapkan',
    title: 'Level 3: Menerapkan Percabangan & Looping',
    points: 150,
    question: 'Perhatikan potongan algoritma:\nangka = 2\nulangi 3 kali:\n   angka = angka * 2\ntampilkan angka\nBerapa nilai yang tampil di layar?',
    options: ['6', '8', '16', '32'],
    correct: 2,
    explanation: 'Hebat! Iterasi 1: 2×2=4, Iterasi 2: 4×2=8, Iterasi 3: 8×2=16.'
  },
  4: {
    badge: 'C4 • Menganalisis',
    title: 'Level 4: Menganalisis & Debugging Algoritma',
    points: 200,
    question: 'Sebuah program kelulusan memiliki syarat: nilai minimal 75 dinyatakan Lulus. Programmer menulis kondisi "IF nilai > 75 THEN Lulus". Ketika siswa mendapat nilai tepat 75, ia dinyatakan Tidak Lulus. Apa analisis perbaikan paling tepat?',
    options: [
      'Mengubah operator ">" menjadi ">=" agar nilai 75 ikut terpenuhi',
      'Mengubah operator ">" menjadi "<"',
      'Menghapus blok ELSE pada program',
      'Mengubah nilai siswa menjadi 80 secara paksa'
    ],
    correct: 0,
    explanation: 'Analisis tajam! Operator ">" tidak menyertakan batas 75, sehingga harus diperbaiki menjadi ">=".'
  }
};

const FLOWCHART_BLOCKS = [
  { id: 'b0', label: '▶ Mulai' },
  { id: 'b1', label: 'Input Nilai' },
  { id: 'b2', label: 'Proses: nilai > 50 ?' },
  { id: 'b3', label: 'Output: Lulus' },
  { id: 'b4', label: 'Output: Tidak Lulus' },
  { id: 'b5', label: 'Selesai' }
];
