import type { Akta, DashboardStats } from "./types"
import { defaultWorkflowNotaris, defaultWorkflowPPAT } from "./types"

const KEY = "enotariskupro_akta"

// ── seed data ────────────────────────────────────────────────────────────────

const SEED: Akta[] = [
  // ── NOTARIIL ────────────────────────────────────────────────────────────
  {
    id: "akta-001",
    tipeAkta: "NOTARIIL",
    kategori: "Akta Pendirian PT",
    nomorAkta: "001/NOT/VII/2025",
    tanggalAkta: "2025-07-02",
    perihal: "Pendirian PT Maju Bersama Sejahtera",
    statusUmum: "Selesai",
    pihak: [
      { nama: "Budi Santoso, S.E.", nik: "3171012501800001", peran: "Pendiri / Direktur Utama", alamat: "Jl. Sudirman No. 10, Jakarta Selatan", tempatLahir: "Jakarta", tanggalLahir: "1980-01-25", kewarganegaraan: "WNI", pekerjaan: "Pengusaha" },
      { nama: "Siti Aminah, S.H.", nik: "3171016505820002", peran: "Pendiri / Komisaris", alamat: "Jl. Gatot Subroto No. 5, Jakarta Selatan", tempatLahir: "Bandung", tanggalLahir: "1982-05-65", kewarganegaraan: "WNI", pekerjaan: "Advokat" },
      { nama: "Rahmat Hidayat", nik: "3171017804850003", peran: "Pendiri / Komisaris Independen", alamat: "Jl. Thamrin No. 22, Jakarta Pusat", tempatLahir: "Surabaya", tanggalLahir: "1985-04-18", kewarganegaraan: "WNI", pekerjaan: "Konsultan" },
    ],
    saksi: [
      { nama: "Drs. Hadi Purnomo", nik: "3171010101600099", pekerjaan: "Pensiunan PNS", alamat: "Jl. Mawar No. 3, Jakarta Selatan" },
      { nama: "Yuliani, S.E.", nik: "3171014506850098", pekerjaan: "Karyawan Swasta", alamat: "Jl. Melati No. 7, Jakarta Selatan" },
    ],
    dokumen: [
      { id: "d001a", nama: "KTP Budi Santoso", jenis: "Identitas", nomor: "3171012501800001", keterangan: "Asli & Fotokopi", status: "ada" },
      { id: "d001b", nama: "KTP Siti Aminah", jenis: "Identitas", nomor: "3171016505820002", keterangan: "Asli & Fotokopi", status: "ada" },
      { id: "d001c", nama: "KTP Rahmat Hidayat", jenis: "Identitas", nomor: "3171017804850003", keterangan: "Asli & Fotokopi", status: "ada" },
      { id: "d001d", nama: "Kartu Keluarga Para Pendiri", jenis: "Identitas", nomor: "", keterangan: "Fotokopi", status: "ada" },
      { id: "d001e", nama: "NPWP Pribadi Pendiri", jenis: "Identitas", nomor: "", keterangan: "3 lembar NPWP masing-masing pendiri", status: "ada" },
      { id: "d001f", nama: "Akta Pendirian (Draft)", jenis: "Akta/SK", nomor: "001/NOT/VII/2025", keterangan: "Telah disetujui para pendiri", status: "ada" },
      { id: "d001g", nama: "SK Kemenkumham", jenis: "Akta/SK", nomor: "AHU-0034521.AH.01.01", keterangan: "Pengesahan badan hukum PT", status: "ada" },
      { id: "d001h", nama: "NPWP Perusahaan", jenis: "Identitas", nomor: "01.234.567.8-901.000", keterangan: "Diterbitkan KPP setelah pengesahan", status: "ada" },
    ],
    pajak: {
      bea_materai: "10.000",
      honorarium: "5.000.000",
      biayaLain: "500.000",
      catatanPajak: "Bea materai pada akta dan salinan. Honorarium sesuai tarif kantor.",
    },
    workflowNotaris: {
      periksaIdentitas: "selesai",
      draftAkta: "selesai",
      bacakanAkta: "selesai",
      penandatangananAkta: "selesai",
      pembukukuan: "selesai",
      serahMinuta: "selesai",
    },
    catatan: "Akta telah disahkan Kemenkumham dengan SK No. AHU-0034521.AH.01.01.Tahun2025. Modal dasar Rp 1.000.000.000. Semua proses telah selesai dan minuta diserahkan.",
    createdAt: "2025-07-01T08:00:00Z",
    updatedAt: "2025-07-10T14:30:00Z",
  },
  {
    id: "akta-002",
    tipeAkta: "NOTARIIL",
    kategori: "APHT",
    nomorAkta: "015/NOT/VII/2025",
    tanggalAkta: "2025-07-15",
    perihal: "Akta Pemberian Hak Tanggungan atas Pinjaman Bank BRI Cabang Sudirman",
    statusUmum: "Proses",
    pihak: [
      { nama: "Ahmad Fauzi", nik: "3275030303750004", peran: "Debitur / Pemberi HT" },
      { nama: "Ny. Haryati Fauzi", nik: "3275014505780005", peran: "Debitur / Pemberi HT (Istri)" },
      { nama: "PT Bank BRI Tbk – Cabang Sudirman", nik: "-", peran: "Kreditur / Penerima HT" },
    ],
    workflowNotaris: {
      periksaIdentitas: "selesai",
      draftAkta: "selesai",
      bacakanAkta: "selesai",
      penandatangananAkta: "proses",
      pembukukuan: "belum",
      serahMinuta: "belum",
    },
    catatan: "Nilai pinjaman Rp 2.500.000.000. Objek HT: SHM No. 4321/Kebayoran Baru. Menunggu tandatangan pejabat bank yang berwenang.",
    createdAt: "2025-07-14T10:00:00Z",
    updatedAt: "2025-07-15T16:00:00Z",
  },
  {
    id: "akta-003",
    tipeAkta: "NOTARIIL",
    kategori: "Akta Keterangan Waris",
    nomorAkta: "022/NOT/VII/2025",
    tanggalAkta: "2025-07-20",
    perihal: "Surat Keterangan Waris Alm. H. Surya Atmaja bin H. Darsono",
    statusUmum: "Tertunda",
    pihak: [
      { nama: "Yanti Atmaja", nik: "3171014012750006", peran: "Ahli Waris I (Istri)" },
      { nama: "Benny Atmaja, S.T.", nik: "3171010505780007", peran: "Ahli Waris II (Anak Kandung)" },
      { nama: "Diana Atmaja", nik: "3171016208820008", peran: "Ahli Waris III (Anak Kandung)" },
    ],
    workflowNotaris: {
      periksaIdentitas: "selesai",
      draftAkta: "proses",
      bacakanAkta: "belum",
      penandatangananAkta: "belum",
      pembukukuan: "belum",
      serahMinuta: "belum",
    },
    catatan: "Menunggu surat kematian asli yang dilegalisir dari Dinas Dukcapil Jakarta Selatan. Dokumen lain sudah lengkap.",
    createdAt: "2025-07-20T08:30:00Z",
    updatedAt: "2025-07-20T08:30:00Z",
  },
  {
    id: "akta-004",
    tipeAkta: "NOTARIIL",
    kategori: "Akta Pendirian CV",
    nomorAkta: "030/NOT/VIII/2025",
    tanggalAkta: "2025-08-05",
    perihal: "Pendirian CV Karya Teknik Mandiri",
    statusUmum: "Selesai",
    pihak: [
      { nama: "Dedi Kurniawan, S.T.", nik: "3578061205800009", peran: "Sekutu Aktif / Direktur" },
      { nama: "Eko Prasetyo", nik: "3578010808830010", peran: "Sekutu Pasif" },
    ],
    workflowNotaris: {
      periksaIdentitas: "selesai",
      draftAkta: "selesai",
      bacakanAkta: "selesai",
      penandatangananAkta: "selesai",
      pembukukuan: "selesai",
      serahMinuta: "selesai",
    },
    catatan: "CV bergerak di bidang konstruksi dan teknik. Pendaftaran di Pengadilan Negeri Surabaya telah selesai. Semua dokumen telah diserahkan.",
    createdAt: "2025-08-04T09:00:00Z",
    updatedAt: "2025-08-12T11:00:00Z",
  },
  {
    id: "akta-005",
    tipeAkta: "NOTARIIL",
    kategori: "Akta Perjanjian",
    nomorAkta: "038/NOT/VIII/2025",
    tanggalAkta: "2025-08-18",
    perihal: "Perjanjian Sewa Menyewa Ruko Jl. Gajah Mada No. 88 Selama 5 Tahun",
    statusUmum: "Selesai",
    pihak: [
      { nama: "PT Properti Makmur Abadi", nik: "NPWP: 01.234.567.8-901.000", peran: "Pihak Pertama (Pemilik / Pemberi Sewa)" },
      { nama: "Rina Margaretha, S.E., M.M.", nik: "3273015507850011", peran: "Pihak Kedua (Penyewa)" },
    ],
    workflowNotaris: {
      periksaIdentitas: "selesai",
      draftAkta: "selesai",
      bacakanAkta: "selesai",
      penandatangananAkta: "selesai",
      pembukukuan: "selesai",
      serahMinuta: "selesai",
    },
    catatan: "Nilai sewa Rp 150.000.000/tahun. Jangka waktu 5 tahun (Agustus 2025 – Agustus 2030). Uang jaminan Rp 300.000.000 telah dibayar.",
    createdAt: "2025-08-17T10:00:00Z",
    updatedAt: "2025-08-19T15:00:00Z",
  },
  {
    id: "akta-006",
    tipeAkta: "NOTARIIL",
    kategori: "Akta Kuasa",
    nomorAkta: "045/NOT/VIII/2025",
    tanggalAkta: "2025-08-25",
    perihal: "Surat Kuasa Khusus Penjualan Tanah dan Bangunan di Depok",
    statusUmum: "Selesai",
    pihak: [
      { nama: "Ir. Soetrisno Hadiwibowo", nik: "3276010101550012", peran: "Pemberi Kuasa" },
      { nama: "Agus Setiawan, S.H.", nik: "3276020202800013", peran: "Penerima Kuasa" },
    ],
    workflowNotaris: {
      periksaIdentitas: "selesai",
      draftAkta: "selesai",
      bacakanAkta: "selesai",
      penandatangananAkta: "selesai",
      pembukukuan: "selesai",
      serahMinuta: "selesai",
    },
    catatan: "Kuasa untuk menjual SHM No. 789/Depok. Kuasa berlaku 6 bulan sejak ditandatangani.",
    createdAt: "2025-08-25T08:00:00Z",
    updatedAt: "2025-08-25T12:00:00Z",
  },

  // ── PPAT ────────────────────────────────────────────────────────────────
  {
    id: "akta-007",
    tipeAkta: "PPAT",
    kategori: "AJB (Akta Jual Beli)",
    nomorAkta: "001/PPAT/VII/2025",
    tanggalAkta: "2025-07-10",
    perihal: "Jual Beli Tanah dan Bangunan SHM No. 1234/Cibubur Luas 250 m²",
    statusUmum: "Proses",
    pihak: [
      { nama: "Hendra Wijaya", nik: "3174051001850014", peran: "Penjual", alamat: "Jl. Raya Bekasi No. 45, Jakarta Timur", tempatLahir: "Jakarta", tanggalLahir: "1985-10-10", kewarganegaraan: "WNI", pekerjaan: "Wiraswasta" },
      { nama: "Dewi Kusuma, S.E.", nik: "3174012808900015", peran: "Pembeli", alamat: "Jl. Cibubur Raya No. 7, Jakarta Timur", tempatLahir: "Bandung", tanggalLahir: "1990-08-28", kewarganegaraan: "WNI", pekerjaan: "Karyawan Swasta" },
    ],
    saksi: [
      { nama: "Andi Susanto", nik: "3174011201750097", pekerjaan: "Pegawai Negeri Sipil", alamat: "Jl. Ciracas No. 10, Jakarta Timur" },
      { nama: "Rini Marliani", nik: "3174016609800096", pekerjaan: "Ibu Rumah Tangga", alamat: "Jl. Cibubur No. 22, Jakarta Timur" },
    ],
    objekTanah: {
      nomorSertifikat: "SHM No. 1234/Cibubur",
      nop: "31.74.040.004.012-0001.0",
      luasTanah: "250",
      alamatObjek: "Jl. Cibubur Indah No. 12, Kel. Cibubur, Kec. Ciracas, Jakarta Timur 13720",
      nilaiTransaksi: "1.500.000.000",
      jenisTanah: "Pekarangan / Bangunan",
      kelasTanah: "A",
    },
    dokumen: [
      { id: "d007a", nama: "KTP Penjual (Hendra Wijaya)", jenis: "Identitas", nomor: "3174051001850014", keterangan: "Asli & 3 lembar fotokopi", status: "ada" },
      { id: "d007b", nama: "KTP Pembeli (Dewi Kusuma)", jenis: "Identitas", nomor: "3174012808900015", keterangan: "Asli & 3 lembar fotokopi", status: "ada" },
      { id: "d007c", nama: "Kartu Keluarga Penjual", jenis: "Identitas", nomor: "", keterangan: "Fotokopi", status: "ada" },
      { id: "d007d", nama: "Kartu Keluarga Pembeli", jenis: "Identitas", nomor: "", keterangan: "Fotokopi", status: "ada" },
      { id: "d007e", nama: "Sertifikat Asli SHM No. 1234", jenis: "Sertifikat", nomor: "SHM 1234/Cibubur", keterangan: "Asli, dicek di BPN", status: "ada" },
      { id: "d007f", nama: "SPPT PBB Tahun 2025", jenis: "Pajak", nomor: "31.74.040.004.012-0001.0", keterangan: "Sudah lunas", status: "ada" },
      { id: "d007g", nama: "Bukti Pelunasan BPHTB", jenis: "Pajak", nomor: "SSPD-2025-07-001", keterangan: "Rp 60.000.000 – Lunas", status: "ada" },
      { id: "d007h", nama: "Bukti Pelunasan PPh Final", jenis: "Pajak", nomor: "SSP-2025-07-001", keterangan: "Rp 37.500.000 – Lunas", status: "ada" },
      { id: "d007i", nama: "IMB / PBG", jenis: "Akta/SK", nomor: "IMB-2018-001234", keterangan: "Bangunan permanen 2 lantai", status: "ada" },
      { id: "d007j", nama: "Surat Persetujuan Suami/Istri Penjual", jenis: "Perjanjian", nomor: "", keterangan: "Ditandatangani di atas materai", status: "ada" },
    ],
    pajak: {
      bphtb: "60.000.000",
      bphtbStatus: "lunas",
      pph: "37.500.000",
      pphStatus: "lunas",
      bea_materai: "20.000",
      honorarium: "7.500.000",
      catatanPajak: "BPHTB: 5% x (NJOP - NJOPTKP). PPh Final: 2.5% x nilai transaksi. Sudah dibayar sebelum penandatanganan AJB.",
    },
    workflowPPAT: {
      pengecekanBPN: "selesai",
      validasiPajak_BPHTB: "selesai",
      validasiPajak_PPh: "selesai",
      penandatangananAkta: "selesai",
      pendaftaranBPN: "proses",
      balikNama: "belum",
      serahTerimaSertifikat: "belum",
    },
    catatan: "BPHTB: Rp 60.000.000 (lunas). PPh: Rp 37.500.000 (lunas). Berkas sudah diterima BPN Kota Jakarta Timur pada 18 Juli 2025. Estimasi selesai balik nama: 45 hari kerja.",
    createdAt: "2025-07-09T09:00:00Z",
    updatedAt: "2025-07-20T11:00:00Z",
  },
  {
    id: "akta-008",
    tipeAkta: "PPAT",
    kategori: "Akta Hibah PPAT",
    nomorAkta: "005/PPAT/VII/2025",
    tanggalAkta: "2025-07-18",
    perihal: "Hibah Tanah Pekarangan SHM No. 567/Semarang Luas 180 m² dari Ayah ke Anak",
    statusUmum: "Selesai",
    pihak: [
      { nama: "H. Slamet Riyadi", nik: "3317010101600016", peran: "Pemberi Hibah (Ayah)" },
      { nama: "Riko Riyadi, S.T.", nik: "3317012503900017", peran: "Penerima Hibah (Anak Kandung)" },
    ],
    objekTanah: {
      nomorSertifikat: "SHM No. 567/Semarang",
      nop: "33.17.020.001.005-0001.0",
      luasTanah: "180",
      alamatObjek: "Jl. Pemuda No. 45, Kel. Sekayu, Kec. Semarang Tengah, Kota Semarang 50132",
      nilaiTransaksi: "800.000.000",
    },
    workflowPPAT: {
      pengecekanBPN: "selesai",
      validasiPajak_BPHTB: "tidak_diperlukan",
      validasiPajak_PPh: "tidak_diperlukan",
      penandatangananAkta: "selesai",
      pendaftaranBPN: "selesai",
      balikNama: "selesai",
      serahTerimaSertifikat: "selesai",
    },
    catatan: "Hibah antar keluarga sedarah lurus satu derajat. Bebas BPHTB dan PPh sesuai PP 34/2016 dan Perda Kota Semarang. Sertifikat balik nama atas nama Riko Riyadi telah diserahkan.",
    createdAt: "2025-07-17T08:00:00Z",
    updatedAt: "2025-08-01T15:00:00Z",
  },
  {
    id: "akta-009",
    tipeAkta: "PPAT",
    kategori: "APHT (Akta Pemberian Hak Tanggungan)",
    nomorAkta: "008/PPAT/VIII/2025",
    tanggalAkta: "2025-08-10",
    perihal: "Pemberian Hak Tanggungan Peringkat I atas SHM No. 4321/Kebayoran Baru",
    statusUmum: "Selesai",
    pihak: [
      { nama: "Ir. Suhardi Pranoto", nik: "3171060606700018", peran: "Pemberi HT / Debitur" },
      { nama: "PT Bank Mandiri Tbk – KCP Blok M", nik: "-", peran: "Pemegang HT / Kreditur" },
    ],
    objekTanah: {
      nomorSertifikat: "SHM No. 4321/Kebayoran Baru",
      nop: "31.74.010.002.003-0005.0",
      luasTanah: "320",
      alamatObjek: "Jl. Melawai Raya No. 20, Kel. Melawai, Kec. Kebayoran Baru, Jakarta Selatan 12160",
      nilaiTransaksi: "5.000.000.000",
    },
    workflowPPAT: {
      pengecekanBPN: "selesai",
      validasiPajak_BPHTB: "tidak_diperlukan",
      validasiPajak_PPh: "tidak_diperlukan",
      penandatangananAkta: "selesai",
      pendaftaranBPN: "selesai",
      balikNama: "tidak_diperlukan",
      serahTerimaSertifikat: "selesai",
    },
    catatan: "Nilai pinjaman Rp 3.500.000.000. APHT terdaftar di BPN Jakarta Selatan. Roya dapat dilakukan setelah pelunasan. Sertifikat disimpan oleh bank selama kredit berlangsung.",
    createdAt: "2025-08-09T10:00:00Z",
    updatedAt: "2025-08-20T14:00:00Z",
  },
  {
    id: "akta-010",
    tipeAkta: "PPAT",
    kategori: "AJB (Akta Jual Beli)",
    nomorAkta: "012/PPAT/VIII/2025",
    tanggalAkta: "2025-08-22",
    perihal: "Jual Beli Apartemen Unit 15C Menara Hijau Jakarta Selatan",
    statusUmum: "Proses",
    pihak: [
      { nama: "CV Graha Properti Nusantara", nik: "NPWP: 02.345.678.9-012.000", peran: "Penjual (Developer)" },
      { nama: "dr. Fitriani Handayani, Sp.OG.", nik: "3275047007850019", peran: "Pembeli" },
    ],
    objekTanah: {
      nomorSertifikat: "SHMSRS No. 33/XV/C/Pasar Minggu",
      nop: "31.74.070.012.001-0015.3",
      luasTanah: "72",
      alamatObjek: "Menara Hijau Tower B Unit 15C, Jl. TB Simatupang No. 10, Pasar Minggu, Jakarta Selatan",
      nilaiTransaksi: "1.200.000.000",
    },
    workflowPPAT: {
      pengecekanBPN: "selesai",
      validasiPajak_BPHTB: "proses",
      validasiPajak_PPh: "selesai",
      penandatangananAkta: "belum",
      pendaftaranBPN: "belum",
      balikNama: "belum",
      serahTerimaSertifikat: "belum",
    },
    catatan: "BPHTB sedang diverifikasi Dispenda Jakarta Selatan. PPh developer sudah lunas. Menunggu validasi BPHTB sebelum penandatanganan AJB.",
    createdAt: "2025-08-21T11:00:00Z",
    updatedAt: "2025-08-22T16:00:00Z",
  },
  {
    id: "akta-011",
    tipeAkta: "PPAT",
    kategori: "Akta Pembagian Hak Bersama",
    nomorAkta: "015/PPAT/IX/2025",
    tanggalAkta: "2025-09-05",
    perihal: "Pembagian Hak Bersama atas Warisan SHM No. 890/Bandung Wetan",
    statusUmum: "Tertunda",
    pihak: [
      { nama: "Asep Koswara", nik: "3273011505720020", peran: "Ahli Waris I (Pihak Pertama)" },
      { nama: "Titi Koswara", nik: "3273014808780021", peran: "Ahli Waris II (Pihak Kedua)" },
      { nama: "Dian Koswara, S.H.", nik: "3273010202840022", peran: "Ahli Waris III (Pihak Ketiga)" },
    ],
    objekTanah: {
      nomorSertifikat: "SHM No. 890/Bandung Wetan",
      nop: "32.73.010.004.007-0002.0",
      luasTanah: "450",
      alamatObjek: "Jl. Surapati No. 33, Kel. Sadang Serang, Kec. Coblong, Kota Bandung 40133",
      nilaiTransaksi: "2.700.000.000",
    },
    workflowPPAT: {
      pengecekanBPN: "selesai",
      validasiPajak_BPHTB: "belum",
      validasiPajak_PPh: "belum",
      penandatangananAkta: "belum",
      pendaftaranBPN: "belum",
      balikNama: "belum",
      serahTerimaSertifikat: "belum",
    },
    catatan: "Proses tertunda karena salah satu ahli waris (Titi Koswara) sedang berada di luar negeri. Perlu kehadiran semua pihak untuk penandatanganan. Estimasi: Oktober 2025.",
    createdAt: "2025-09-04T09:00:00Z",
    updatedAt: "2025-09-05T10:00:00Z",
  },
  {
    id: "akta-012",
    tipeAkta: "PPAT",
    kategori: "AJB (Akta Jual Beli)",
    nomorAkta: "018/PPAT/IX/2025",
    tanggalAkta: "2025-09-15",
    perihal: "Jual Beli Tanah Kavling SHM No. 2200/Bekasi Luas 600 m²",
    statusUmum: "Selesai",
    pihak: [
      { nama: "PT Bekasi Land Development", nik: "NPWP: 03.456.789.0-123.000", peran: "Penjual" },
      { nama: "H. Mochammad Ridwan", nik: "3275050505650023", peran: "Pembeli" },
    ],
    objekTanah: {
      nomorSertifikat: "SHM No. 2200/Medan Satria",
      nop: "32.75.040.006.009-0003.0",
      luasTanah: "600",
      alamatObjek: "Perumahan Grand Bekasi Residences Blok D-15, Jl. Raya Perjuangan, Medan Satria, Bekasi Utara",
      nilaiTransaksi: "900.000.000",
    },
    workflowPPAT: {
      pengecekanBPN: "selesai",
      validasiPajak_BPHTB: "selesai",
      validasiPajak_PPh: "selesai",
      penandatangananAkta: "selesai",
      pendaftaranBPN: "selesai",
      balikNama: "selesai",
      serahTerimaSertifikat: "selesai",
    },
    catatan: "BPHTB: Rp 18.000.000 (lunas). PPh: Rp 22.500.000 (lunas). Sertifikat sudah balik nama atas nama H. Mochammad Ridwan dan telah diserahkan kepada pemilik baru.",
    createdAt: "2025-09-14T08:00:00Z",
    updatedAt: "2025-10-02T13:00:00Z",
  },
]

// ── helpers ──────────────────────────────────────────────────────────────────

function load(): Akta[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    return JSON.parse(raw) as Akta[]
  } catch {
    return []
  }
}

function save(data: Akta[]): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    console.error("[storage] Failed to persist data")
  }
}

const SEED_FLAG = "enotariskupro_seeded_v5"

function ensureSeeded(): void {
  if (typeof window === "undefined") return
  // Only seed once per browser (flag stored in localStorage)
  if (localStorage.getItem(SEED_FLAG)) return
  // Only seed if database is currently empty
  const existing = load()
  if (existing.length === 0) {
    save(SEED)
  }
  localStorage.setItem(SEED_FLAG, "1")
}

/** Public helper: wipe all data and reload SEED (for demo reset button). */
export function resetToSeedData(): void {
  if (typeof window === "undefined") return
  save(SEED)
  localStorage.setItem(SEED_FLAG, "1")
}

// ── public API ────────────────────────────────────────────────────────────────

export const aktaService = {
  init(): void {
    ensureSeeded()
  },

  getAll(): Akta[] {
    ensureSeeded()
    return load().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  },

  getById(id: string): Akta | undefined {
    return load().find((a) => a.id === id)
  },

  create(data: Omit<Akta, "id" | "createdAt" | "updatedAt">): Akta {
    const all = load()
    const akta: Akta = {
      ...data,
      workflowNotaris: data.tipeAkta === "NOTARIIL" ? (data.workflowNotaris ?? defaultWorkflowNotaris) : undefined,
      workflowPPAT: data.tipeAkta === "PPAT" ? (data.workflowPPAT ?? defaultWorkflowPPAT) : undefined,
      id: `akta-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    save([akta, ...all])
    return akta
  },

  update(id: string, patch: Partial<Akta>): Akta | null {
    const all = load()
    const idx = all.findIndex((a) => a.id === id)
    if (idx === -1) return null
    all[idx] = { ...all[idx], ...patch, updatedAt: new Date().toISOString() }
    save(all)
    return all[idx]
  },

  delete(id: string): boolean {
    const all = load()
    const next = all.filter((a) => a.id !== id)
    if (next.length === all.length) return false
    save(next)
    return true
  },

  getStats(): DashboardStats {
    const all = aktaService.getAll()
    return {
      totalNotaris: all.filter((a) => a.tipeAkta === "NOTARIIL").length,
      totalPPAT: all.filter((a) => a.tipeAkta === "PPAT").length,
      totalProses: all.filter((a) => a.statusUmum === "Proses").length,
      totalSelesai: all.filter((a) => a.statusUmum === "Selesai").length,
      totalTertunda: all.filter((a) => a.statusUmum === "Tertunda").length,
      totalDibatalkan: all.filter((a) => a.statusUmum === "Dibatalkan").length,
      aktaTerbaru: all.slice(0, 5),
    }
  },

  search(query: string): Akta[] {
    const q = query.toLowerCase().trim()
    if (!q) return aktaService.getAll()
    return load().filter(
      (a) =>
        a.nomorAkta.toLowerCase().includes(q) ||
        a.perihal.toLowerCase().includes(q) ||
        a.kategori.toLowerCase().includes(q) ||
        a.pihak.some((p) => p.nama.toLowerCase().includes(q) || p.nik.includes(q)) ||
        (a.objekTanah?.nomorSertifikat.toLowerCase().includes(q) ?? false) ||
        (a.objekTanah?.nop.includes(q) ?? false)
    )
  },
}
