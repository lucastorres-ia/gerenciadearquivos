// 🔥 CONFIG FIREBASE (SEMPRE PRIMEIRO)
const firebaseConfig = {
  apiKey: "AIzaSyCHuNbJBU8rCzfkl6VXSk7R54C_bypy1As",
  authDomain: "gerencia-de-arquivos-f16a0.firebaseapp.com",
  databaseURL: "https://gerencia-de-arquivos-f16a0-default-rtdb.firebaseio.com",
  projectId: "gerencia-de-arquivos-f16a0",
  storageBucket: "gerencia-de-arquivos-f16a0.firebasestorage.app",
  messagingSenderId: "1060282316250",
  appId: "1:1060282316250:web:5611377d0a5cca3ce23ce3"
};

// ✅ INICIALIZA
firebase.initializeApp(firebaseConfig);
const db = firebase.database();


//-----------------------------------
// ✅ SALVAR ARQUIVO
//-----------------------------------
function salvarArquivo() {
  const file = document.getElementById("fileInput").files[0];
  const categoria = document.getElementById("categoria").value;

  if (!file) return mostrarAlerta("Selecione um arquivo!");

  const reader = new FileReader();

  reader.onload = function(e) {
    const novoArquivo = {
      nome: file.name,
      categoria: categoria || "Geral",
      favorito: false,
      data: new Date().toLocaleString(),
      conteudo: e.target.result
    };

    db.ref("arquivos").push(novoArquivo);
    mostrarAlerta("✅ Arquivo enviado!");
  };

  reader.readAsDataURL(file);
}


//-----------------------------------
// ✅ LISTAR (TEMPO REAL)
//-----------------------------------
function listarArquivos(filtro = "") {
  const lista = document.getElementById("listaArquivos");

  db.ref("arquivos").on("value", (snapshot) => {
    lista.innerHTML = "";

    const dados = snapshot.val();

    if (!dados) return;

    Object.keys(dados).forEach((id) => {
      const a = dados[id];

      if (!a.nome.toLowerCase().includes(filtro.toLowerCase())) return;

      const li = document.createElement("li");

      li.innerHTML = `
        <div class="file-info">
          <b>${a.nome}</b><br>
          <small>${a.categoria} • ${a.data}</small>
        </div>

        <div class="actions">
          <button onclick="baixar('${a.conteudo}', '${a.nome}')">⬇</button>
        </div>
      `;

      lista.appendChild(li);
    });
  });
}



//-----------------------------------
// ✅ BUSCA
//-----------------------------------
function buscarArquivo() {
  const termo = document.getElementById("search").value;
  listarArquivos(termo);
}


//-----------------------------------
// ✅ DOWNLOAD
//-----------------------------------
function baixar(conteudo, nome) {
  const link = document.createElement("a");
  link.href = conteudo;
  link.download = nome;
  link.click();
}


//-----------------------------------
// ✅ DRAG & DROP
//-----------------------------------
const dropArea = document.getElementById("dropArea");

if (dropArea) {
  dropArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropArea.style.background = "rgba(255,255,255,0.1)";
  });

  dropArea.addEventListener("dragleave", () => {
    dropArea.style.background = "transparent";
  });

  dropArea.addEventListener("drop", async (e) => {
    e.preventDefault();
    dropArea.style.background = "transparent";

    const files = e.dataTransfer.files;

    for (const file of files) {

      if (file.name.endsWith(".zip")) {
        await importarZipDireto(file);
      } else {
        uploadDireto(file);
      }
    }
  });
}


//-----------------------------------
// ✅ UPLOAD DIRETO (ARRASTADO)
//-----------------------------------
function uploadDireto(file) {
  const reader = new FileReader();

  reader.onload = function(e) {
    const novoArquivo = {
      nome: file.name,
      categoria: "Arrastado",
      favorito: false,
      data: new Date().toLocaleString(),
      conteudo: e.target.result
    };

    db.ref("arquivos").push(novoArquivo);

    mostrarAlerta("🚀 Arquivo enviado!");
  };

  reader.readAsDataURL(file);
}


//-----------------------------------
// ✅ IMPORTAR ZIP
//-----------------------------------
async function importarZipDireto(file) {
  const zip = new JSZip();
  const buffer = await file.arrayBuffer();
  const zipData = await zip.loadAsync(buffer);

  let total = 0;

  const promises = [];

  zipData.forEach((caminho, arquivoZip) => {

    if (!arquivoZip.dir) {

      const promessa = arquivoZip.async("base64").then((base64) => {

  const partes = caminho.split("/");
  const nome = partes.pop();

  // 🔥 caminho completo da pasta
  const pasta = partes.join("/") || "Geral";

  const novoArquivo = {
    nome,
    pasta, // ✅ IMPORTANTE (novo campo)
    favorito: false,
    data: new Date().toLocaleString(),
          conteudo: "data:application/octet-stream;base64," + base64
  };
        }



  // 🔥 salva no Firebase
  db.ref("arquivos").push(novoArquivo);
};

        const partes = caminho.split("/");
const nome = partes.pop();

// guarda a pasta completa
const pasta = partes.join("/") || "Geral";


        const novoArquivo = {
          nome,
          categoria,
          favorito: false,
          data: new Date().toLocaleString(),
          conteudo: "data:application/octet-stream;base64," + base64
        };

        // ✅ SALVA DIRETO NO FIREBASE
        db.ref("arquivos").push(novoArquivo);

        total++;
      };

      promises.push(promessa);
    
  ;

  await Promise.all(promises);

  mostrarAlerta(`✅ ${total} arquivos enviados pro banco`);

//-----------------------------------
// ✅ ALERTA
//-----------------------------------
function mostrarAlerta(msg) {
  const div = document.createElement("div");
  div.className = "alert";
  div.innerText = msg;

  document.body.appendChild(div);

  setTimeout(() => div.remove(), 2000);
}

// ✅ mudar entre telas
function mostrarSecao(secao) {
  document.getElementById("dashboard").style.display = "none";
  document.getElementById("files").style.display = "none";

  document.getElementById(secao).style.display = "block";

  // muda título
  document.getElementById("titulo").innerText =
    secao === "dashboard" ? "Dashboard" : "Arquivos";
}


// ✅ mostrar favoritos (adaptado pro Firebase)
function mostrarFavoritos() {
  const lista = document.getElementById("listaArquivos");

  db.ref("arquivos").once("value", (snapshot) => {
    lista.innerHTML = "";

    const dados = snapshot.val();

    for (let id in dados) {
      const a = dados[id];

      if (!a.favorito) continue;

      const li = document.createElement("li");

      li.innerHTML = `
        <div class="file-info">
          <b>${a.nome}</b>
        </div>
      `;

      lista.appendChild(li);
    }
  });

  mostrarSecao("files");
}

function carregarArquivos() {
  const lista = document.getElementById("listaArquivos");

  db.ref("arquivos").on("value", (snapshot) => {
    lista.innerHTML = "";

    const dados = snapshot.val();

    if (!dados) {
      atualizarDashboard(0, 0);
      atualizarContador(0);
      return;
    }

    let total = 0;
    let favoritos = 0;

    Object.keys(dados).forEach((id) => {
      const a = dados[id];

      total++;
      if (a.favorito) favoritos++;

      const li = document.createElement("li");

      li.innerHTML = `
        <div class="file-info">
          <b>${a.nome}</b><br>
          <small>${a.categoria} • ${a.data}</small>
        </div>

        <div class="actions">
          <button onclick="baixar('${a.conteudo}', '${a.nome}')">⬇</button>
        </div>
      `;

      lista.appendChild(li);
    });

    // 🔥 ATUALIZA DASHBOARD
    atualizarDashboard(total, favoritos);
    atualizarContador(total);
  });
}
``
function atualizarDashboard(total = 0, favoritos = 0) {
  document.getElementById("total").innerText = total;
  document.getElementById("fav").innerText = favoritos;
}

function atualizarContador(total = 0) {
  document.getElementById("totalArquivos").innerText = total;
}
function carregarArquivosAgrupados() {
  const lista = document.getElementById("listaArquivos");

  db.ref("arquivos").on("value", (snapshot) => {
    lista.innerHTML = "";

    const dados = snapshot.val();
    if (!dados) return;

    const grupos = {};

    Object.values(dados).forEach((a) => {
      if (!grupos[a.categoria]) {
        grupos[a.categoria] = [];
      }
      grupos[a.categoria].push(a);
    });

    Object.keys(grupos).forEach((categoria) => {
      const title = document.createElement("h3");
      title.innerText = "📂 " + categoria;
      lista.appendChild(title);

      grupos[categoria].forEach((a) => {
        const li = document.createElement("li");

        li.innerHTML = `
          <b>${a.nome}</b>
          <button onclick="baixar('${a.conteudo}', '${a.nome}')">⬇</button>
        `;

        lista.appendChild(li);
      });
    });
  });
}
function carregarPastas() {
  const lista = document.getElementById("listaArquivos");
  lista.innerHTML = "";

  db.ref("arquivos").once("value", (snapshot) => {
    const dados = snapshot.val();
    if (!dados) return;

    const pastas = {};

    Object.values(dados).forEach((a) => {
      if (!pastas[a.categoria]) {
        pastas[a.categoria] = [];
      }
      pastas[a.categoria].push(a);
    });

    // criar pastas
    Object.keys(pastas).forEach((categoria) => {
      const li = document.createElement("li");

      li.innerHTML = `
        📂 <b>${categoria}</b>
      `;

      li.style.cursor = "pointer";

      li.onclick = () => abrirPasta(categoria);

      lista.appendChild(li);
    });
  });
}

function abrirPasta(nomeCategoria) {
  const lista = document.getElementById("listaArquivos");

  db.ref("arquivos").once("value", (snapshot) => {
    lista.innerHTML = `<h3>📂 ${nomeCategoria}</h3>`;

    const dados = snapshot.val();

    Object.values(dados)
      .filter(a => a.categoria === nomeCategoria)
      .sort((a,b) => new Date(b.data) - new Date(a.data)) // 🔥 ORDENAÇÃO (IMPORTANTE)
      .forEach((a) => {

        const li = document.createElement("li");

        li.innerHTML = `
          <div>
            📄 <b>${a.nome}</b><br>
            <small>${a.data}</small>
          </div>

          <button onclick="baixar('${a.conteudo}', '${a.nome}')">
            ⬇
          </button>
        `;

        lista.appendChild(li);
      });
  });
}
//-----------------------------------
// ✅ INICIO
//-----------------------------------
carregarArquivos();
``