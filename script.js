// --- KONFIGURASI ---
const GITHUB_BASE = "https://raw.githubusercontent.com/username/repo/main/bank-soal/";

const DAFTAR_TOKEN = {
    "ekonomi": "TOKEN_EKO",
    "matematika": "TOKEN_MAT",
    "fisika": "TOKEN_FIS",
    "sejarah": "TOKEN_SEJ"
};

let listSoal = [];
let dataJawaban = {};
const $ = id => document.getElementById(id);

// --- FUNGSI UTAMA ---
async function mulaiUjian(mapel) {
    const nama = $('inNama').value;
    const token = $('inToken').value.toUpperCase();

    if(!nama) return alert("Isi nama Anda!");
    if(token !== DAFTAR_TOKEN[mapel]) return alert("Token Salah!");

    try {
        const res = await fetch(GITHUB_BASE + mapel + ".json");
        listSoal = await res.json();
        
        $('outNama').innerText = nama;
        $('outMapel').innerText = "UJIAN: " + mapel.toUpperCase();
        
        renderSoal();
        
        $('loginScreen').style.display = 'none';
        $('examArea').style.display = 'block';
        document.documentElement.requestFullscreen().catch(() => {});
    } catch (e) {
        alert("Gagal memuat soal. Periksa koneksi.");
    }
}

function renderSoal() {
    let html = '';
    const huruf = ['A', 'B', 'C', 'D', 'E'];

    listSoal.forEach((soal, sIdx) => {
        html += `
        <div class="q-card">
            <div style="font-weight:800; margin-bottom:15px;">${sIdx+1}. ${soal.q}</div>
            <div class="opt-list">
                ${soal.a.map((opt, oIdx) => `
                    <label class="opt-item" id="opt-${sIdx}-${oIdx}">
                        <input type="radio" name="q${sIdx}" onclick="pilih(${sIdx}, ${oIdx})">
                        <b style="color:var(--primary); margin-right:10px;">${huruf[oIdx]}.</b> ${opt}
                    </label>
                `).join('')}
            </div>
        </div>`;
    });
    $('boxSoal').innerHTML = html + `<button onclick="selesai()" style="width:100%; padding:20px; background:#10b981; color:white; border:none; border-radius:15px; font-weight:800; margin-top:20px; margin-bottom:50px;">KIRIM JAWABAN</button>`;
}

function pilih(sIdx, oIdx) {
    const huruf = ['A', 'B', 'C', 'D', 'E'];
    dataJawaban[sIdx + 1] = huruf[oIdx];
    
    // Reset visual
    for(let i=0; i<5; i++) {
        const el = $('opt-'+sIdx+'-'+i);
        if(el) el.classList.remove('active');
    }
    // Set visual aktif
    $('opt-'+sIdx+'-'+oIdx).classList.add('active');
}

function selesai() {
    if(confirm("Selesai ujian?")) {
        let rekap = `NAMA: ${$('inNama').value}\nJAWABAN: `;
        listSoal.forEach((_, i) => rekap += `${i+1}:${dataJawaban[i+1] || "-"}, `);
        alert(rekap);
        location.reload();
    }
}
