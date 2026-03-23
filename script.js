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
