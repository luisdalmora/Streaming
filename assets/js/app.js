let state = {
    allData: {},
    currentMonth: "",
    filtros: {
        busca: ""
    },
    editingId: null
};

function inicializarApp() {
    state.allData = carregarTudo();
    state.currentMonth = obterChaveMesAtual();
    
    // Garantir que o mês atual existe no estado
    if (!state.allData[state.currentMonth]) {
        state.allData[state.currentMonth] = {
            streamings: [...STREAMINGS_PADRAO],
            pagamentos: {}
        };
        PESSOAS_PADRAO.forEach(p => state.allData[state.currentMonth].pagamentos[p] = "pendente");
        salvarTudo(state.allData);
    }

    setupEventListeners();
    renderApp();
}

function setupEventListeners() {
    document.getElementById('streaming-form').addEventListener('submit', handleFormSubmit);
    document.getElementById('search-input').addEventListener('input', (e) => {
        state.filtros.busca = e.target.value;
        renderListaStreamings();
    });
}

function renderApp() {
    renderSidebar();
    renderDashboard();
}

function renderSidebar() {
    const container = document.getElementById('month-list');
    const chaves = Object.keys(state.allData).sort().reverse();
    
    container.innerHTML = chaves.map(chave => `
        <div onclick="mudarMes('${chave}')" class="nav-item ${chave === state.currentMonth ? 'active' : ''}">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            <span class="nav-text">${formatarChaveMes(chave)}</span>
        </div>
    `).join('');
}

function renderDashboard() {
    const monthData = state.allData[state.currentMonth];
    const { totais, detalhes } = calcularDivisoes(monthData.streamings);
    
    // Atualizar Título
    document.getElementById('current-month-title').textContent = formatarChaveMes(state.currentMonth);
    
    // Cards Financeiros
    const totalGeral = monthData.streamings.reduce((acc, s) => acc + s.valor, 0);
    let totalPago = 0;
    PESSOAS_PADRAO.forEach(p => {
        if (monthData.pagamentos[p] === 'pago') totalPago += totais[p];
    });
    
    document.getElementById('card-total-mes').textContent = formatarMoeda(totalGeral);
    document.getElementById('card-total-pago').textContent = formatarMoeda(totalPago);
    document.getElementById('card-total-pendente').textContent = formatarMoeda(totalGeral - totalPago);
    
    // Status por Pessoa
    const statusContainer = document.getElementById('people-payment-status');
    statusContainer.innerHTML = PESSOAS_PADRAO.map(p => {
        const status = monthData.pagamentos[p];
        const color = CONFIG.CORES_PESSOAS[p];
        return `
            <div class="person-status-card border-${color}-500">
                <div>
                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">${p}</p>
                    <p class="text-lg font-extrabold text-slate-800">${formatarMoeda(totais[p])}</p>
                </div>
                <div onclick="toggleStatusPagamento('${p}')" class="payment-toggle ${status}">
                    ${status === 'pago' ? '✅ Pago' : '⏳ Pendente'}
                </div>
            </div>
        `;
    }).join('');


    renderListaStreamings();
}

function renderListaStreamings() {
    const container = document.getElementById('streaming-list');
    const monthData = state.allData[state.currentMonth];
    
    const filtered = monthData.streamings.filter(s => {
        return normalizarTexto(s.nome).includes(normalizarTexto(state.filtros.busca));
    });

    if (filtered.length === 0) {
        container.innerHTML = `<div class="p-12 text-center text-slate-400">Nenhum serviço encontrado para este mês.</div>`;
        return;
    }

    container.innerHTML = filtered.map(s => `
        <div class="flex items-center gap-5 p-4 hover:bg-slate-50 transition-all group">
            <div class="service-icon-container">
                <img src="${getStreamingIcon(s.nome)}" alt="${s.nome}" onerror="this.src='${CONFIG.ICON_PATH}default.svg'">
            </div>
            <div class="flex-1 min-w-0">
                <h4 class="text-sm font-bold text-slate-800 truncate">${s.nome}</h4>
                <div class="flex flex-wrap gap-1.5 mt-1">
                    ${s.participantes.map(p => `<span class="text-[9px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md font-bold uppercase">${p}</span>`).join('')}
                </div>
            </div>

            <div class="text-right mr-4">
                <div class="text-sm font-extrabold text-slate-700">${formatarMoeda(s.valor)}</div>
                <div class="text-[10px] text-slate-400 font-bold">Pago por ${s.pagador}</div>
            </div>
            <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button onclick="prepararEdicao(${s.id})" class="p-2 hover:bg-blue-50 text-blue-600 rounded-xl transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                </button>
                <button onclick="removerStreaming(${s.id})" class="p-2 hover:bg-rose-50 text-rose-600 rounded-xl transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
            </div>
        </div>
    `).join('');
}

function handleFormSubmit(e) {
    e.preventDefault();
    const nome = document.getElementById('f-nome').value;
    const valor = parseFloat(document.getElementById('f-valor').value);
    const pagador = document.getElementById('f-pagador').value;
    const participantes = Array.from(document.querySelectorAll('input[name="f-participantes"]:checked')).map(cb => cb.value);

    const monthData = state.allData[state.currentMonth];

    if (state.editingId) {
        const idx = monthData.streamings.findIndex(s => s.id === state.editingId);
        monthData.streamings[idx] = { id: state.editingId, nome, valor, pagador, participantes };
        mostrarToast("Serviço atualizado!");
    } else {
        const novo = { id: gerarId(), nome, valor, pagador, participantes };
        monthData.streamings.push(novo);
        mostrarToast("Serviço adicionado!");
    }

    salvarTudo(state.allData);
    renderDashboard();
    resetFormUI();
}

function prepararEdicao(id) {
    const s = state.allData[state.currentMonth].streamings.find(x => x.id === id);
    if (!s) return;

    state.editingId = id;
    document.getElementById('f-nome').value = s.nome;
    document.getElementById('f-valor').value = s.valor;
    document.getElementById('f-pagador').value = s.pagador;
    
    document.querySelectorAll('input[name="f-participantes"]').forEach(cb => {
        cb.checked = s.participantes.includes(cb.value);
    });

    document.getElementById('form-title').textContent = "Editar Serviço";
    document.getElementById('btn-save').textContent = "Salvar Alterações";
    document.getElementById('btn-cancel').classList.remove('hidden');
}

function resetFormUI() {
    state.editingId = null;
    document.getElementById('form-title').textContent = "Adicionar Serviço";
    document.getElementById('btn-save').textContent = "Confirmar Registro";
    document.getElementById('btn-cancel').classList.add('hidden');
    document.getElementById('streaming-form').reset();
}

function removerStreaming(id) {
    if (confirm("Remover este serviço do mês atual?")) {
        state.allData[state.currentMonth].streamings = state.allData[state.currentMonth].streamings.filter(s => s.id !== id);
        salvarTudo(state.allData);
        renderDashboard();
        mostrarToast("Removido com sucesso.");
    }
}

function toggleStatusPagamento(pessoa) {
    const status = state.allData[state.currentMonth].pagamentos[pessoa];
    state.allData[state.currentMonth].pagamentos[pessoa] = status === 'pago' ? 'pendente' : 'pago';
    salvarTudo(state.allData);
    renderDashboard();
}

function mudarMes(chave) {
    state.currentMonth = chave;
    resetFormUI();
    renderApp();
}

function criarNovoMes() {
    const nomeMes = prompt("Digite o mês e ano (Ex: 06/2026):");
    if (!nomeMes) return;
    
    const [mes, ano] = nomeMes.split('/');
    if (!mes || !ano || mes > 12 || mes < 1) {
        alert("Formato inválido. Use MM/AAAA");
        return;
    }
    
    const chave = `${ano}-${mes.padStart(2, '0')}`;
    if (state.allData[chave]) {
        alert("Este mês já existe!");
        return;
    }
    
    state.allData[chave] = {
        streamings: [],
        pagamentos: {}
    };
    PESSOAS_PADRAO.forEach(p => state.allData[chave].pagamentos[p] = "pendente");
    
    salvarTudo(state.allData);
    mudarMes(chave);
}

function duplicarMesAnterior() {
    const anterior = obterChaveMesAnterior(state.currentMonth);
    if (!state.allData[anterior]) {
        alert("Mês anterior não encontrado no histórico.");
        return;
    }
    
    if (confirm(`Deseja copiar todos os serviços de ${formatarChaveMes(anterior)} para ${formatarChaveMes(state.currentMonth)}?`)) {
        // Clonar serviços (gerando novos IDs para evitar conflitos se necessário, mas aqui IDs são por mês)
        state.allData[state.currentMonth].streamings = state.allData[anterior].streamings.map(s => ({...s, id: gerarId() + Math.random()}));
        salvarTudo(state.allData);
        renderDashboard();
        mostrarToast("Dados duplicados com sucesso!");
    }
}

function abrirModalDivisao() {
    const monthData = state.allData[state.currentMonth];
    const { totais, detalhes } = calcularDivisoes(monthData.streamings);
    const container = document.getElementById('modal-divisao-content');
    
    container.innerHTML = monthData.streamings.map(s => `
        <div class="p-5 border-b border-slate-100 last:border-0">
            <div class="flex justify-between items-center mb-3">
                <span class="font-bold text-slate-800">${s.nome}</span>
                <span class="text-sm font-extrabold text-blue-600">${formatarMoeda(s.valor)}</span>
            </div>
            <div class="grid grid-cols-3 gap-2">
                ${PESSOAS_PADRAO.map(p => {
                    const participa = s.participantes.includes(p);
                    const valorInd = participa ? s.valor / s.participantes.length : 0;
                    return `
                        <div class="p-2 rounded-xl text-[10px] font-bold ${participa ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-slate-50 text-slate-300 border border-transparent'}">
                            <p class="uppercase opacity-70">${p}</p>
                            <p class="text-xs mt-1">${formatarMoeda(valorInd)}</p>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `).join('');

    document.getElementById('modal-divisao').classList.remove('hidden');
    document.getElementById('modal-divisao').classList.add('flex');
}

function fecharModalDivisao() {
    document.getElementById('modal-divisao').classList.add('hidden');
    document.getElementById('modal-divisao').classList.remove('flex');
}

function copiarResumo() {
    const monthData = state.allData[state.currentMonth];
    const texto = gerarTextoWhatsApp(monthData, state.currentMonth);
    navigator.clipboard.writeText(texto).then(() => {
        mostrarToast("Resumo do mês copiado!");
    });
}

function mostrarToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
}

// Expor para o HTML
window.onload = inicializarApp;
window.mudarMes = mudarMes;
window.criarNovoMes = criarNovoMes;
window.duplicarMesAnterior = duplicarMesAnterior;
window.toggleStatusPagamento = toggleStatusPagamento;
window.prepararEdicao = prepararEdicao;
window.removerStreaming = removerStreaming;
window.abrirModalDivisao = abrirModalDivisao;
window.fecharModalDivisao = fecharModalDivisao;
window.copiarResumo = copiarResumo;
window.resetFormUI = resetFormUI;
