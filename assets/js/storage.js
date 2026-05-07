function carregarStreamings() {
    const saved = localStorage.getItem(CONFIG.CHAVE_STORAGE_STREAMINGS);
    return saved ? JSON.parse(saved) : [...STREAMINGS_PADRAO];
}

function salvarStreamings(streamings) {
    localStorage.setItem(CONFIG.CHAVE_STORAGE_STREAMINGS, JSON.stringify(streamings));
}

function carregarStatusPagamentos() {
    const saved = localStorage.getItem(CONFIG.CHAVE_STORAGE_PAGAMENTOS);
    const data = saved ? JSON.parse(saved) : {};
    const chave = obterChaveMesAtual();
    
    if (!data[chave]) {
        data[chave] = {};
        PESSOAS_PADRAO.forEach(p => data[chave][p] = "pendente");
    }
    return data;
}

function salvarStatusPagamentos(pagamentos) {
    localStorage.setItem(CONFIG.CHAVE_STORAGE_PAGAMENTOS, JSON.stringify(pagamentos));
}

function limparStorage() {
    localStorage.removeItem(CONFIG.CHAVE_STORAGE_STREAMINGS);
    localStorage.removeItem(CONFIG.CHAVE_STORAGE_PAGAMENTOS);
}

function restaurarDadosPadrao() {
    limparStorage();
    return {
        streamings: [...STREAMINGS_PADRAO],
        pagamentos: carregarStatusPagamentos()
    };
}
