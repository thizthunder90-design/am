const GITHUB_BASE = "./bank-soal/"; 

const DAFTAR_TOKEN = {
    "ekonomi": "EKO123",
    "matematika": "MAT123",
    "fisika": "FIS123"
};

let listSoal = [];
let detikSisa = 3600; // 60 Menit
let intervalTimer;
const $ = id => document.getElementById(id);

// 1. Validasi Login
async function validasiDanMulai() {
    const nama = $("inNama").value;
    const token = $("inToken").value.toUpperCase();
    const mapel = $("selectMapel").value;

    if (!nama || !mapel) return alert("Lengkapi data!");
    if (token !== DAFTAR_TOKEN[mapel]) return alert("Token Salah!");

    mulaiLoadSoal(mapel);
}

// 2. Load File JSON
async function mulaiLoadSoal(mapel) {
    try {
        const response = await fetch(GITHUB_BASE + mapel + ".json");
        if (!response.ok) throw new Error("File soal tidak ditemukan!");
        
        listSoal = await response.json();
        
        $("outNama").innerText = $("inNama").value;
        $("outMapel").innerText = mapel.toUpperCase();
        
        renderSoal();
        
        $("loginScreen").style.display = "none";
        $("examArea").style.display = "block";
        
        startTimer(); // Menjalankan mesin waktu
        
    } catch (e) {
        alert("Error: " + e.message);
    }
}

// 3. Mesin Timer (Perbaikan Bug)
function startTimer() {
    clearInterval(intervalTimer);
    intervalTimer = setInterval(() => {
        let jam = Math.floor(detikSisa / 3600);
        let menit = Math.floor((detikSisa % 3600) / 60);
        let detik = detikSisa % 60;

        const display = 
            (jam < 10 ? "0"+jam : jam) + ":" + 
            (menit < 10 ? "0"+menit : menit) + ":" + 
            (detik < 10 ? "0"+detik : detik);

        $("outTimer").innerText = display;

        if (detikSisa <= 0) {
            clearInterval(intervalTimer);
            alert("Waktu Habis!");
            location.reload();
        }
        detikSisa--;
    }, 1000);
}

// 4. Render Soal ke Layar
function renderSoal() {
    let html = "";
    const huruf = ['A', 'B', 'C', 'D', 'E'];

    listSoal.forEach((s, i) => {
        html += `
        <div class="q-card">
            <div style="font-weight:800; margin-bottom:15px;">${i+1}. ${s.q}</div>
            ${s.a.map((opt, idx) => `
                <label class="opt-item">
                    <input type="radio" name="soal${i}">
                    <span class="alphabet">${huruf[idx]}.</span> ${opt}
                </label>
            `).join("")}
        </div>`;
    });
    $("boxSoal").innerHTML = html + `<button class="btn-utama" style="background:#10b981; margin-bottom:50px;" onclick="location.reload()">KIRIM JAWABAN</button>`;
}
// --- FITUR KEAMANAN WEB ---

// 1. Matikan Klik Kanan
document.addEventListener('contextmenu', event => event.preventDefault());

// 2. Matikan Shortcut Keyboard (F12, Ctrl+U, Ctrl+Shift+I, dll)
document.onkeydown = function(e) {
    if (e.ctrlKey && 
        (e.keyCode === 67 || e.keyCode === 86 || e.keyCode === 85 || e.keyCode === 117)) {
        return false;
    }
    if (e.keyCode === 123) { // F12
        return false;
    }
};

// 3. Deteksi jika siswa pindah Tab (Peringatan)
document.addEventListener("visibilitychange", function() {
    if (document.hidden) {
        alert("PERINGATAN: Jangan meninggalkan halaman ujian atau skor Anda akan dibatalkan!");
    }
});
// --- KONFIGURASI KEAMANAN ---
const TOKEN_RESET_ADMIN = "ADMIN99"; // Token yang dipegang pengawas
let isExamStarted = false; // Penanda agar deteksi hanya jalan saat ujian

// --- DETEKSI PINDAH TAB / KELUAR APLIKASI ---
document.addEventListener("visibilitychange", function() {
    if (document.hidden && isExamStarted) {
        kunciUjian();
    }
});

// Fungsi untuk mengunci layar
function kunciUjian() {
    $("lockScreen").style.display = "flex";
    // Opsional: Hentikan timer saat terkunci agar adil
    clearInterval(intervalTimer); 
}

// Fungsi untuk membuka kunci (Hanya bisa oleh pengawas)
function bukaKunciUjian() {
    const inputToken = $("adminToken").value;
    
    if (inputToken === TOKEN_RESET_ADMIN) {
        $("lockScreen").style.display = "none";
        $("adminToken").value = ""; // Kosongkan input
        startTimer(); // Jalankan kembali timer
        alert("Akses diberikan. Lanjutkan ujian dengan jujur!");
    } else {
        alert("TOKEN SALAH! Tindakan ini dicatat oleh sistem.");
    }
}

// --- UPDATE FUNGSI mulaiLoadSoal ---
// Pastikan variabel isExamStarted diubah jadi true
async function mulaiLoadSoal(mapel) {
    // ... kode fetch soal yang sudah ada ...
    
    isExamStarted = true; // Tandai ujian dimulai
    $("loginScreen").style.display = "none";
    $("examArea").style.display = "block";
    startTimer();
}
