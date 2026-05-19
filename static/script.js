console.log("SCRIPT ATIVO");

const input = document.getElementById("arquivo");
const nomeArquivo = document.getElementById("nomeArquivo");
const botao = document.getElementById("botao");
const resultado = document.getElementById("resultado");
const loader = document.getElementById("loader");

let arquivoAtual = null;
let processando = false;

input.addEventListener("change", () => {
  arquivoAtual = input.files[0];

  nomeArquivo.innerText = arquivoAtual
    ? `Arquivo: ${arquivoAtual.name}`
    : "Nenhum arquivo selecionado";
});

function mostrarLoader() {
  loader.classList.remove("hidden");
  resultado.innerText = "";
}

function esconderLoader() {
  loader.classList.add("hidden");
}

botao.addEventListener("click", async (e) => {
  e.preventDefault();

  if (processando) return;

  if (!arquivoAtual) {
    resultado.innerText = "Selecione um arquivo primeiro.";
    return;
  }

  processando = true;
  botao.disabled = true;

  mostrarLoader();

  try {

    const formData = new FormData();
    formData.append("arquivo", arquivoAtual);

    const resposta = await fetch("/analisar", {
      method: "POST",
      body: formData
    });

    const data = await resposta.json();

    esconderLoader();

    resultado.innerText =
      `${data.chance_ia}% chance de ser IA`;

  } catch (err) {

    console.error(err);

    esconderLoader();

    resultado.innerText =
      "Erro ao analisar áudio.";

  }

  processando = false;
  botao.disabled = false;
});
