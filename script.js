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

function renderSoal() {
    let html = "";
    listSoal.forEach((s, i) => {
        html += `<div class="q-card">
            <b>${i+1}. ${s.q}</b>
            ${s.a.map(opt => `<label class="opt-item"><input type="radio" name="q${i}">${opt}</label>`).join("")}
        </div>`;
    });
    $("boxSoal").innerHTML = html;
}
