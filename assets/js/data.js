const PESSOAS_PADRAO = ["Luis", "Ivonei", "Luciano"];

const STREAMINGS_PADRAO = [
    { id: 1, nome: "Crunchyroll", valor: 20.00, pagador: "Luis", participantes: ["Luis", "Ivonei"] },
    { id: 2, nome: "Spotify", valor: 40.89, pagador: "Luis", participantes: ["Luis", "Ivonei", "Luciano"] },
    { id: 3, nome: "YouTube Premium", valor: 53.90, pagador: "Luis", participantes: ["Luis", "Ivonei", "Luciano"] },
    { id: 4, nome: "Disney+", valor: 46.90, pagador: "Luis", participantes: ["Luis"] },
    { id: 5, nome: "Max", valor: 55.90, pagador: "Luis", participantes: ["Luis"] },
    { id: 6, nome: "Apple TV", valor: 29.90, pagador: "Luis", participantes: ["Luis"] },
    { id: 7, nome: "Netflix", valor: 59.90, pagador: "Luis", participantes: ["Luis"] },
    { id: 8, nome: "Globo Play", valor: 27.93, pagador: "Luis", participantes: ["Luis"] },
    { id: 9, nome: "Prime Video", valor: 19.90, pagador: "Luis", participantes: ["Luis"] },
    { id: 10, nome: "Meli+", valor: 0.00, pagador: "Luis", participantes: ["Luis"] }
];

const MESES_NOMES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

const CONFIG = {
    CHAVE_STORAGE_DADOS: 'streaming_dashboard_data_v1', // Nova chave para estrutura unificada
    CORES_PESSOAS: {
        "Luis": "blue",
        "Ivonei": "purple",
        "Luciano": "emerald"
    },
    ICON_PATH: 'assets/img/icons/'
};

