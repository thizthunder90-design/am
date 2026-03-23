const GITHUB_BASE = "./bank-soal/"; 
const TOKEN_RESET_ADMIN = "ADMIN99"; // Token Pengawas
const DAFTAR_TOKEN = {
    "ekonomi": "5435",
    "matematika": "2123",
    "biologi": "4456",
    "sosiologi": "9999",
};

let listSoal = [];
let detikSisa = 3600; // 1 Jam
let intervalTimer;
let isExamStarted = false;

const $ = id => document.getElementById(id);

// 1. Fungsi Pemicu Fullscreen
function triggerFullscreen() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { // Chrome, Safari, Opera
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { // IE/Edge
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

// 3. Load Soal dari GitHub
async function mulaiLoadSoal(mapel) {
    try {
        const response = await fetch(`${GITHUB_BASE}${mapel}.json`);
        if (!response.ok) throw new Error("File soal tidak ditemukan.");
        
        listSoal = await response.json();
        if (!listSoal || listSoal.length === 0) throw new Error("Data soal kosong.");

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
        alert("Gagal memuat: " + e.message);
    }
}

// 4. Render Soal (Solusi Layar Kosong)
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
                        <b style="color:#2563eb; margin: 0 10px;">${huruf[idx]}.</b> ${opt}
                    </label>
                `).join("")}
            </div>
        </div>`;
    });
    
    $("boxSoal").innerHTML = html + `<button class="btn-utama" style="background:#10b981; margin-top:30px; margin-bottom:100px;" onclick="location.reload()">KIRIM JAWABAN</button>`;
}

// 5. Timer Engine
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
            alert("Waktu Habis!");
            location.reload();
        }
        detikSisa--;
    }, 1000);
}

// 6. Keamanan: Deteksi Pindah Tab
document.addEventListener("visibilitychange", () => {
    if (document.hidden && isExamStarted) {
        $("lockScreen").style.display = "flex";
        clearInterval(intervalTimer);
    }
});

// 7. Buka Kunci (Tetap Fullscreen)
function bukaKunciUjian() {
    if ($("adminToken").value === TOKEN_RESET_ADMIN) {
        triggerFullscreen(); // Paksa masuk fullscreen lagi
        $("lockScreen").style.display = "none";
        $("adminToken").value = "";
        startTimer();
    } else {
        alert("Token Admin Salah!");
    }
}

// 8. Proteksi Tambahan
document.addEventListener('contextmenu', e => e.preventDefault());
document.onkeydown = e => {
    if (e.ctrlKey && (e.keyCode === 85 || e.keyCode === 73 || e.keyCode === 83)) return false;
    if (e.keyCode === 123) return false;
};
