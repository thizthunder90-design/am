// Jika mencoba di laptop, gunakan jalur relatif
// Nanti jika sudah di GitHub, ganti ke "https://raw.githubusercontent.com/..."
const GITHUB_BASE = "./bank-soal/"; 

const DAFTAR_TOKEN = {
    "ekonomi": "EKO123",
    "matematika": "MAT123"
};

const $ = id => document.getElementById(id);
let listSoal = [];

function validasiDanMulai() {
    const mapel = $("selectMapel").value;
    const token = $("inToken").value;
    const nama = $("inNama").value;

    if (!nama || !mapel) return alert("Lengkapi data!");
    if (token !== DAFTAR_TOKEN[mapel]) return alert("Token Salah!");

    mulaiUjian(mapel);
}

async function mulaiUjian(mapel) {
    try {
        const response = await fetch(`${GITHUB_BASE}${mapel}.json`);
        listSoal = await response.json();
        
        $("outNama").innerText = $("inNama").value;
        $("outMapel").innerText = mapel.toUpperCase();
        
        renderSoal();
        
        $("loginScreen").style.display = "none";
        $("examArea").style.display = "block";
    } catch (e) {
        alert("Gagal memuat file JSON. Gunakan 'Live Server' di VS Code!");
    }
}

function renderSoalKeLayar() {
    let html = "";
    const huruf = ['A', 'B', 'C', 'D', 'E']; // Daftar huruf opsi

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
    
    // Tambahkan tombol selesai di bawah
    $("boxSoal").innerHTML = html + `
        <button class="btn-utama" 
                style="background:#10b981; margin-top:30px; margin-bottom:80px;" 
                onclick="selesaiUjian()">
            KIRIM JAWABAN
        </button>`;
}
