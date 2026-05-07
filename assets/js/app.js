let state = {
    streamings: [],
    pagamentos: {},
    filtros: {
        busca: "",
        pessoa: "Todos"
    },
    editingId: null
};

function inicializarApp() {
    state.streamings = carregarStreamings();
    state.pagamentos = carregarStatusPagamentos();
    renderApp();
    setupEventListeners();
}

function setupEventListeners() {
    document.getElementById('streaming-form').addEventListener('submit', handleFormSubmit);
    document.getElementById('search-input').addEventListener('input', (e) => {
        state.filtros.busca = e.target.value;
        renderListaStreamings();
    });
}

function renderApp() {
    renderTopbar();
    renderResumoPessoas();
    renderListaStreamings();
}

function renderTopbar() {
    const total = state.streamings.reduce((acc, s) => acc + s.valor, 0);
    document.getElementById('topbar-mes').textContent = obterMesAtualFormatado();
    document.getElementById('topbar-total').textContent = formatarMoeda(total);
    document.getElementById('topbar-count').textContent = `${state.streamings.length} serviços`;
}

function renderResumoPessoas() {
    const { totais, detalhes } = calcularDivisoes(state.streamings);
    const container = document.getElementById('people-summary');
    const chave = obterChaveMesAtual();

    container.innerHTML = PESSOAS_PADRAO.map(pessoa => {
        const total = totais[pessoa];
        const status = state.pagamentos[chave][pessoa];
        const color = CONFIG.CORES_PESSOAS[pessoa];
        const numServicos = detalhes[pessoa].length;

        return `
            <div class="card-premium p-3 flex-1 min-w-[140px] flex flex-col gap-1 border-l-4 border-${color}-500">
                <div class="flex justify-between items-start">
                    <span class="text-xs font-bold text-slate-500 uppercase">${pessoa}</span>
                    <button onclick="togglePagamento('${pessoa}')" class="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase transition-colors ${status === 'pago' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}">
                        ${status}
                    </button>
                </div>
                <div class="text-lg font-extrabold text-slate-800">${formatarMoeda(total)}</div>
                <div class="text-[10px] text-slate-400 font-medium">${numServicos} serviços vinculados</div>
            </div>
        `;
    }).join('');
}

function renderListaStreamings() {
    const container = document.getElementById('streaming-list');
    const filtered = state.streamings.filter(s => {
        const matchBusca = normalizarTexto(s.nome).includes(normalizarTexto(state.filtros.busca));
        return matchBusca;
    });

    if (filtered.length === 0) {
        container.innerHTML = `<div class="p-8 text-center text-slate-400 font-medium">Nenhum streaming encontrado.</div>`;
        return;
    }

    container.innerHTML = filtered.map(s => `
        <div class="flex items-center gap-4 p-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 group">
            <div class="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center p-2 shadow-sm">
                <img src="${getStreamingIcon(s.nome)}" alt="${s.nome}" class="w-full h-full object-contain" onerror="this.src='${CONFIG.ICON_PATH}default.svg'">
            </div>
            <div class="flex-1 min-w-0">
                <h4 class="text-sm font-bold text-slate-800 truncate">${s.nome}</h4>
                <p class="text-[11px] text-slate-400 font-medium">Pago por <span class="text-slate-600 font-bold">${s.pagador}</span></p>
            </div>
            <div class="text-right">
                <div class="text-sm font-extrabold text-slate-700">${formatarMoeda(s.valor)}</div>
                <div class="text-[10px] text-slate-400 font-bold">${s.participantes.length} pessoas</div>
            </div>
            <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onclick="prepararEdicao(${s.id})" class="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors" title="Editar">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                </button>
                <button onclick="removerStreaming(${s.id})" class="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors" title="Excluir">
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

    if (state.editingId) {
        const idx = state.streamings.findIndex(s => s.id === state.editingId);
        state.streamings[idx] = { id: state.editingId, nome, valor, pagador, participantes };
        state.editingId = null;
        mostrarToast("Streaming atualizado!");
    } else {
        const novo = { id: gerarId(), nome, valor, pagador, participantes };
        state.streamings.push(novo);
        mostrarToast("Streaming adicionado!");
    }

    salvarStreamings(state.streamings);
    renderApp();
    e.target.reset();
    resetFormUI();
}

function prepararEdicao(id) {
    const s = state.streamings.find(x => x.id === id);
    if (!s) return;

    state.editingId = id;
    document.getElementById('f-nome').value = s.nome;
    document.getElementById('f-valor').value = s.valor;
    document.getElementById('f-pagador').value = s.pagador;
    
    document.querySelectorAll('input[name="f-participantes"]').forEach(cb => {
        cb.checked = s.participantes.includes(cb.value);
    });

    document.getElementById('form-title').textContent = "Editar Streaming";
    document.getElementById('btn-save').textContent = "Salvar Alterações";
    document.getElementById('btn-cancel').classList.remove('hidden');
}

function resetFormUI() {
    state.editingId = null;
    document.getElementById('form-title').textContent = "Novo Streaming";
    document.getElementById('btn-save').textContent = "Adicionar";
    document.getElementById('btn-cancel').classList.add('hidden');
    document.getElementById('streaming-form').reset();
}

function removerStreaming(id) {
    if (confirm("Deseja remover este streaming?")) {
        state.streamings = state.streamings.filter(s => s.id !== id);
        salvarStreamings(state.streamings);
        renderApp();
        mostrarToast("Streaming removido.");
    }
}

function togglePagamento(pessoa) {
    const chave = obterChaveMesAtual();
    state.pagamentos[chave][pessoa] = state.pagamentos[chave][pessoa] === 'pago' ? 'pendente' : 'pago';
    salvarStatusPagamentos(state.pagamentos);
    renderResumoPessoas();
}

function abrirModalDivisao() {
    const { totais, detalhes } = calcularDivisoes(state.streamings);
    const container = document.getElementById('modal-divisao-content');
    
    container.innerHTML = state.streamings.map(s => `
        <div class="p-4 border-b border-slate-100">
            <div class="flex justify-between items-center mb-2">
                <span class="font-bold text-slate-800">${s.nome}</span>
                <span class="text-sm font-extrabold text-blue-600">${formatarMoeda(s.valor)}</span>
            </div>
            <div class="flex flex-wrap gap-2">
                ${PESSOAS_PADRAO.map(p => {
                    const participa = s.participantes.includes(p);
                    const valorInd = participa ? s.valor / s.participantes.length : 0;
                    return `
                        <div class="px-2 py-1 rounded text-[10px] font-bold ${participa ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-300'}">
                            ${p}: ${formatarMoeda(valorInd)}
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
    const texto = gerarTextoWhatsApp(state);
    navigator.clipboard.writeText(texto).then(() => {
        mostrarToast("Resumo copiado para WhatsApp!");
    });
}

function restaurarPadrao() {
    if (confirm("Restaurar dados padrão?")) {
        const data = restaurarDadosPadrao();
        state.streamings = data.streamings;
        state.pagamentos = data.pagamentos;
        renderApp();
        mostrarToast("Dados restaurados.");
    }
}

function mostrarToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
}

window.onload = inicializarApp;
window.togglePagamento = togglePagamento;
window.prepararEdicao = prepararEdicao;
window.removerStreaming = removerStreaming;
window.abrirModalDivisao = abrirModalDivisao;
window.fecharModalDivisao = fecharModalDivisao;
window.copiarResumo = copiarResumo;
window.restaurarPadrao = restaurarPadrao;
window.resetFormUI = resetFormUI;
