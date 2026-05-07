function normalizarTexto(txt) {
    return txt.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

function gerarId() {
    return Date.now() + Math.floor(Math.random() * 1000);
}

function getStreamingIcon(nome) {
    const normalized = normalizarTexto(nome);
    if (normalized.includes("disney")) return "assets/img/icons/disney-plus.svg";
    if (normalized.includes("max") || normalized.includes("hbo")) return "assets/img/icons/max.svg";
    if (normalized.includes("apple")) return "assets/img/icons/apple-tv.svg";
    if (normalized.includes("netflix")) return "assets/img/icons/netflix.svg";
    if (normalized.includes("globo")) return "assets/img/icons/globoplay.svg";
    if (normalized.includes("prime")) return "assets/img/icons/prime-video.svg";
    if (normalized.includes("spotify")) return "assets/img/icons/spotify.svg";
    if (normalized.includes("youtube")) return "assets/img/icons/youtube.svg";
    if (normalized.includes("crunchyroll")) return "assets/img/icons/crunchyroll.svg";
    if (normalized.includes("meli")) return "assets/img/icons/meli.svg";
    return "assets/img/icons/default.svg";
}

function obterChaveMesAtual() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function obterMesAtualFormatado() {
    const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const d = new Date();
    return `${meses[d.getMonth()]}/${d.getFullYear()}`;
}

function calcularValorIndividual(total, numParticipantes) {
    if (numParticipantes === 0) return 0;
    return total / numParticipantes;
}

function validarValor(valor) {
    return !isNaN(valor) && valor >= 0;
}
