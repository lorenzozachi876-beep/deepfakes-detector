let model;

async function carregarModelo() {
  model = await tf.loadLayersModel("./model/model.json");
  console.log(model);
  console.log(model.inputs);
}

carregarModelo();

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

    // Lê o arquivo
    const arrayBuffer = await arquivoAtual.arrayBuffer();

    console.log(arrayBuffer);

    // Dados temporários para testar o modelo
    const inputTensor = tf.randomNormal([1, 40]);

    // Faz previsão
    const prediction = model.predict(inputTensor);

    // Resultado
    const valor = await prediction.data();

    // Porcentagem
    const chanceIA = (valor[0] * 100).toFixed(2);

    esconderLoader();

    resultado.innerText =
      `${chanceIA}% chance de ser IA`;

  } catch (err) {

    console.error(err);

    esconderLoader();

    resultado.innerText =
      "Erro ao analisar áudio.";

  }

  processando = false;
  botao.disabled = false;
});
