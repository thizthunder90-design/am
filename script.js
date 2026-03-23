// Menggunakan jalur relatif yang didukung GitHub Pages
const GITHUB_BASE = "./bank-soal/"; 

const DAFTAR_TOKEN = {
    "ekonomi": "EKO123",
    "matematika": "MAT123"
    // Tambahkan mapel lain di sini
};

const $ = id => document.getElementById(id);
let listSoal = [];

async function validasiDanMulai() {
    const nama = $("inNama").value;
    const token = $("inToken").value.toUpperCase();
    const mapel = $("selectMapel").value;

    if (!nama || !mapel) return alert("Mohon lengkapi Nama dan Mata Pelajaran!");
    if (token !== DAFTAR_TOKEN[mapel]) return alert("Token Salah!");

    mulaiLoadSoal(mapel);
}

async function mulaiLoadSoal(mapel) {
    try {
        // Gabungkan jalur: ./bank-soal/ + ekonomi + .json
        const urlFinal = GITHUB_BASE + mapel + ".json";
        
        const response = await fetch(urlFinal);
        
        if (!response.ok) {
            throw new Error(`File ${mapel}.json tidak ditemukan di folder bank-soal.`);
        }
        
        listSoal = await response.json();
        
        $("outNama").innerText = $("inNama").value;
        $("outMapel").innerText = "UJIAN: " + mapel.toUpperCase();
        
        renderSoalKeLayar();
        
        $("loginScreen").style.display = "none";
        $("examArea").style.display = "block";
        
    } catch (e) {
        // Alert ini sekarang akan memberi tahu letak kesalahannya secara spesifik
        alert("Pesan Sistem: " + e.message);
    }
}

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
    
    $("boxSoal").innerHTML = html + `<button class="btn-utama" style="background:#10b981; margin-bottom:80px;" onclick="location.reload()">KIRIM JAWABAN</button>`;
}
