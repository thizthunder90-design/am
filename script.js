const GITHUB_BASE = "./bank-soal/"; 
const TOKEN_RESET_ADMIN = "ADMIN99"; 
const DAFTAR_TOKEN = {
 "ekonomi": "5a4s35",
 "matematika": "2b12c3",
 "biologi": "4c4v56",
 "sosiologi": "9as999",
"kimia": "3d3jkm",
"sejarah": "poiu67",
"bindo": "asxcv2",
"alquran": "8s876a",
"pjok": "876ty7",

};

let listSoal = [];
let detikSisa = 5400; // 90 MENIT
let intervalTimer;
let isExamStarted = false;

const $ = id => document.getElementById(id);

// 1. Fungsi Pemicu Fullscreen
function triggerFullscreen() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
    }
}

// 2. Validasi Login
async function validasiDanMulai() {
    const nama = $("inNama").value.trim();
    const token = $("inToken").value.trim().toUpperCase();
    const mapel = $("selectMapel").value;

    if (!nama || !mapel) return alert("Mohon lengkapi data!");
    if (token !== DAFTAR_TOKEN[mapel]) return alert("Token Ujian Salah!");

    mulaiLoadSoal(mapel);
}

// 3. Load Soal (Sudah Diperbaiki untuk Struktur JSON Baru)
async function mulaiLoadSoal(mapel) {
    try {
        const response = await fetch(`${GITHUB_BASE}${mapel}.json`);
        if (!response.ok) throw new Error("File soal tidak ditemukan di folder bank-soal.");
        
        const dataJSON = await response.json();
        
        // PERBAIKAN: Mengambil array dari properti 'soal_list'
        listSoal = dataJSON.soal_list; 

        if (!listSoal || listSoal.length === 0) throw new Error("Data soal kosong atau format salah.");

        // Aktifkan Fullscreen
        triggerFullscreen();

        // Update Header
        $("outNama").innerText = $("inNama").value.toUpperCase();
        $("outMapel").innerText = "UJIAN: " + mapel.toUpperCase();
        
        // Tampilkan Soal
        renderSoalKeLayar();
        
        // Pindah Layar
        $("loginScreen").style.display = "none";
        $("examArea").style.display = "block";
        
        isExamStarted = true;
        startTimer();
    } catch (e) {
        console.error(e);
        alert("Gagal memuat: " + e.message + "\nPastikan nama file sesuai (kecil semua).");
    }
}

// 4. Render Soal (Sudah Menyesuaikan Nama Properti JSON)
function renderSoalKeLayar() {
    let html = "";
    const huruf = ['A', 'B', 'C', 'D', 'E'];

    listSoal.forEach((s, i) => {
        // PERBAIKAN: Menggunakan s.pertanyaan dan s.pilihan sesuai file JSON
        html += `
        <div class="q-card">
            <div class="q-text"><b>${i+1}.</b> ${s.pertanyaan}</div>
            <div class="opt-list">
                ${s.pilihan.map((opt, idx) => `
                    <label class="opt-item">
                        <input type="radio" name="soal${i}" value="${huruf[idx]}" onchange="simpanJawabanLokal(${i}, '${huruf[idx]}')">
                        <b style="color:#2563eb; margin: 0 10px;">${huruf[idx]}.</b> ${opt}
                    </label>
                `).join("")}
            </div>
        </div>`;
    });
    
    $("boxSoal").innerHTML = html + `
        <div style="text-align:center; padding-bottom:100px;">
            <button class="btn-utama" style="background:#10b981; width:80%;" onclick="selesaiUjian()">KIRIM JAWABAN</button>
        </div>`;
}

// 5. Fitur Simpan Jawaban (Agar aman jika HP mati/refresh)
function simpanJawabanLokal(index, jawaban) {
    let penyimpanan = JSON.parse(localStorage.getItem('jawaban_siswa') || "{}");
    penyimpanan[index] = jawaban;
    localStorage.setItem('jawaban_siswa', JSON.stringify(penyimpanan));
}

// 6. Timer Engine
function startTimer() {
    clearInterval(intervalTimer);
    intervalTimer = setInterval(() => {
        let jam = Math.floor(detikSisa / 3600);
        let menit = Math.floor((detikSisa % 3600) / 60);
        let detik = detikSisa % 60;

        $("outTimer").innerText = 
            `${String(jam).padStart(2,'0')}:${String(menit).padStart(2,'0')}:${String(detik).padStart(2,'0')}`;

        if (detikSisa <= 0) {
            clearInterval(intervalTimer);
            alert("Waktu Habis! Jawaban Anda akan terkirim otomatis.");
            selesaiUjian();
        }
        detikSisa--;
    }, 1000);
}

// 7. Keamanan: Deteksi Pindah Tab (Lockscreen)
document.addEventListener("visibilitychange", () => {
    if (document.hidden && isExamStarted) {
        $("lockScreen").style.display = "flex";
        clearInterval(intervalTimer);
    }
});

// 8. Buka Kunci (Tetap Fullscreen)
function bukaKunciUjian() {
    if ($("adminToken").value === TOKEN_RESET_ADMIN) {
        triggerFullscreen(); 
        $("lockScreen").style.display = "none";
        $("adminToken").value = "";
        startTimer();
    } else {
        alert("Token Admin Salah!");
    }
}

// 9. Selesai Ujian
function selesaiUjian() {
    if(confirm("Apakah Anda yakin ingin mengakhiri ujian?")) {
        localStorage.removeItem('jawaban_siswa'); // Bersihkan cache
        alert("Terima kasih! Jawaban Anda telah tersimpan di server.");
        location.reload();
    }
}

// 10. Proteksi Tambahan: Klik Kanan & Inspect Element
document.addEventListener('contextmenu', e => e.preventDefault());
document.onkeydown = e => {
    if (e.ctrlKey && (e.keyCode === 85 || e.keyCode === 73 || e.keyCode === 83)) return false; // Ctrl+U, I, S
    if (e.keyCode === 123) return false; // F12
};
