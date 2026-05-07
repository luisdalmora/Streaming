function carregarTudo() {
    const saved = localStorage.getItem(CONFIG.CHAVE_STORAGE_DADOS);
    const data = saved ? JSON.parse(saved) : {};
    
    // Se não houver dados para o mês atual, inicializar
    const chave = obterChaveMesAtual();
    if (!data[chave]) {
        data[chave] = {
            streamings: [...STREAMINGS_PADRAO],
            pagamentos: {}
        };
        PESSOAS_PADRAO.forEach(p => data[chave].pagamentos[p] = "pendente");
    }
    
    return data;
}

function salvarTudo(data) {
    localStorage.setItem(CONFIG.CHAVE_STORAGE_DADOS, JSON.stringify(data));
}

function limparStorage() {
    localStorage.removeItem(CONFIG.CHAVE_STORAGE_DADOS);
}

function restaurarDadosPadrao() {
    limparStorage();
    return carregarTudo();
}
