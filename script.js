// CONFIGURATION
const GITHUB_BASE = "./bank-soal/"; 
const TOKEN_RESET_ADMIN = "ADMIN99"; // Token untuk buka kunci jika siswa nakal
const DAFTAR_TOKEN = {
    "ekonomi": "EKO123",
    "matematika": "MAT123"
};

// GLOBAL VARIABLES
let listSoal = [];
let detikSisa = 3600; // 1 Jam
let intervalTimer;
let isExamStarted = false;

// HELPER SELECTOR
const $ = id => document.getElementById(id);

// 1. LOGIN VALIDATION
async function validasiDanMulai() {
    const nama = $("inNama").value.trim();
    const token = $("inToken").value.trim().toUpperCase();
    const mapel = $("selectMapel").value;

    if (!nama || !mapel) return alert("Lengkapi Nama dan Mapel!");
    if (token !== DAFTAR_TOKEN[mapel]) return alert("Token Ujian Salah!");

    mulaiLoadSoal(mapel);
}

// 2. LOAD DATA FROM GITHUB
async function mulaiLoadSoal(mapel) {
    try {
        const response = await fetch(`${GITHUB_BASE}${mapel}.json`);
        
        if (!response.ok) {
            throw new Error(`File ${mapel}.json tidak ditemukan di folder bank-soal.`);
        }
        
        listSoal = await response.json();
        
        if (!listSoal || listSoal.length === 0) {
            throw new Error("Data soal kosong atau format salah.");
        }

        // Tampilkan Identitas di Header
        $("outNama").innerText = $("inNama").value.toUpperCase();
        $("outMapel").innerText = "UJIAN: " + mapel.toUpperCase();
        
        // Render Soal ke Layar
        renderSoalKeLayar();
        
        // Pindah Layar
        $("loginScreen").style.display = "none";
        $("examArea").style.display = "block";
        
        // Aktifkan Fitur
        isExamStarted = true;
        startTimer();
        
    } catch (e) {
        alert("GAGAL MEMUAT SOAL: " + e.message);
    }
}

// 3. RENDER SOAL (Memperbaiki tampilan kosong)
function renderSoalKeLayar() {
    let html = "";
    const huruf = ['A', 'B', 'C', 'D', 'E'];

    listSoal.forEach((s, i) => {
        html += `
        <div class="q-card">
            <div class="q-text"><b>${i+1}.</b> ${s.q}</div>
            <div class="opt-list">
                ${s.a.map((opt, idx) => `
                    <label class="opt-item">
                        <input type="radio" name="soal${i}" value="${huruf[idx]}">
                        <span class="alphabet">${huruf[idx]}.</span>
                        <span class="opt-text">${opt}</span>
                    </label>
                `).join("")}
            </div>
        </div>`;
    });
    
    // Tombol Kirim di bawah
    const btnSelesai = `
        <button class="btn-utama" 
                style="background:#10b981; margin-top:30px; margin-bottom:100px;" 
                onclick="konfirmasiSelesai()">
            KIRIM JAWABAN SEKARANG
        </button>`;

    $("boxSoal").innerHTML = html + btnSelesai;
}

// 4. TIMER ENGINE
function startTimer() {
    clearInterval(intervalTimer);
    intervalTimer = setInterval(() => {
        let jam = Math.floor(detikSisa / 3600);
        let menit = Math.floor((detikSisa % 3600) / 60);
        let detik = detikSisa % 60;

        $("outTimer").innerText = 
            `${String(jam).padStart(2, '0')}:${String(menit).padStart(2, '0')}:${String(detik).padStart(2, '0')}`;

        if (detikSisa <= 0) {
            clearInterval(intervalTimer);
            alert("WAKTU HABIS!");
            location.reload();
        }
        detikSisa--;
    }, 1000);
}

// 5. SECURITY: DETECT TAB SWITCHING
document.addEventListener("visibilitychange", () => {
    if (document.hidden && isExamStarted) {
        $("lockScreen").style.display = "flex";
        clearInterval(intervalTimer); // Pause timer saat terkunci
    }
});

function bukaKunciUjian() {
    const tokenInput = $("adminToken").value;
    if (tokenInput === TOKEN_RESET_ADMIN) {
        $("lockScreen").style.display = "none";
        $("adminToken").value = "";
        startTimer(); // Lanjut timer
    } else {
        alert("Token Admin Salah!");
    }
}

function konfirmasiSelesai() {
    if(confirm("Apakah Anda yakin ingin mengakhiri ujian?")) {
        alert("Jawaban berhasil dikirim!");
        location.reload();
    }
}

// Disable Right Click & Inspect
document.addEventListener('contextmenu', e => e.preventDefault());
document.onkeydown = e => {
    if (e.ctrlKey && (e.keyCode === 85 || e.keyCode === 83 || e.keyCode === 73)) return false;
    if (e.keyCode === 123) return false; // F12
};
