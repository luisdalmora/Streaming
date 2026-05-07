let state = {
    streamings: [],
    pagamentos: {},
    filtros: {
        busca: "",
        pessoa: "Todos",
        status: "Todos"
    }
};

function inicializarApp() {
    state.streamings = carregarStreamings();
    state.pagamentos = carregarStatusPagamentos();
    renderApp();
    setupEventListeners();
}

function setupEventListeners() {
    document.getElementById('add-streaming-form').addEventListener('submit', adicionarStreaming);
    document.getElementById('edit-streaming-form').addEventListener('submit', salvarEdicaoStreaming);
}

function renderApp() {
    renderizarHero();
    renderizarCardsPessoas();
    renderizarListaStreamings();
    renderizarTabelaDivisao();
}

function calcularDivisoes() {
    const totais = {};
    const detalhes = {};
    PESSOAS_PADRAO.forEach(p => {
        totais[p] = 0;
        detalhes[p] = [];
    });

    state.streamings.forEach(s => {
        if (s.participantes.length > 0) {
            const valorInd = s.valor / s.participantes.length;
            s.participantes.forEach(p => {
                totais[p] += valorInd;
                detalhes[p].push({ nome: s.nome, valor: valorInd });
            });
        }
    });
    return { totais, detalhes };
}

function calcularTotalGeral() {
    return state.streamings.reduce((acc, s) => acc + s.valor, 0);
}

function renderizarHero() {
    const total = calcularTotalGeral();
    const count = state.streamings.length;
    
    document.getElementById('hero-total').textContent = formatarMoeda(total);
    document.getElementById('hero-count').textContent = count;
    document.getElementById('badge-month').textContent = obterMesAtualFormatado();
}

function renderizarCardsPessoas() {
    const { totais, detalhes } = calcularDivisoes();
    const container = document.getElementById('people-grid');
    const chave = obterChaveMesAtual();
    const statusPags = state.pagamentos[chave];

    container.innerHTML = PESSOAS_PADRAO.map(pessoa => {
        const total = totais[pessoa];
        const status = statusPags[pessoa] || "pendente";
        const isPago = status === "pago";
        const cor = CONFIG.CORES_PESSOAS[pessoa];

        return `
            <div class="person-card" style="border-top: 6px solid ${cor}">
                <div class="person-card-header">
                    <div class="person-avatar" style="background: ${cor}20; color: ${cor}">
                        ${pessoa[0]}
                    </div>
                    <div class="person-meta">
                        <h3>${pessoa}</h3>
                        <span class="status-badge ${isPago ? 'status-pago' : 'status-pendente'}">
                            ${status}
                        </span>
                    </div>
                </div>
                <div class="person-card-body">
                    <div class="person-total-value">${formatarMoeda(total)}</div>
                    <p class="person-sub">${detalhes[pessoa].length} streamings vinculados</p>
                    
                    <ul class="person-items-list">
                        ${detalhes[pessoa].map(item => `
                            <li>
                                <div class="item-info">
                                    <img src="${getStreamingIcon(item.nome)}" alt="${item.nome}">
                                    <span>${item.nome}</span>
                                </div>
                                <span class="item-price">${formatarMoeda(item.valor)}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
                <div class="person-card-footer">
                    <button class="btn ${isPago ? 'btn-outline' : 'btn-success'} btn-full" onclick="alternarStatusPagamento('${pessoa}')">
                        ${isPago ? 'Marcar como Pendente' : 'Marcar como Pago'}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function renderizarListaStreamings() {
    const container = document.getElementById('streaming-list');
    const filtered = state.streamings.filter(s => {
        const matchBusca = normalizarTexto(s.nome).includes(normalizarTexto(state.filtros.busca));
        const matchPessoa = state.filtros.pessoa === "Todos" || s.participantes.includes(state.filtros.pessoa);
        
        let matchStatus = true;
        if (state.filtros.status !== "Todos") {
            const chave = obterChaveMesAtual();
            const statusRef = state.pagamentos[chave][s.pagador];
            matchStatus = statusRef === state.filtros.status.toLowerCase();
        }
        return matchBusca && matchPessoa && matchStatus;
    });

    if (filtered.length === 0) {
        container.innerHTML = `<div class="empty-state">Nenhum streaming encontrado.</div>`;
        return;
    }

    container.innerHTML = filtered.map(s => `
        <div class="streaming-card-horizontal">
            <div class="s-card-main">
                <div class="s-card-icon">
                    <img src="${getStreamingIcon(s.nome)}" alt="${s.nome}">
                </div>
                <div class="s-card-info">
                    <h4>${s.nome}</h4>
                    <p>Total: <strong>${formatarMoeda(s.valor)}</strong> | Pagador: <strong>${s.pagador}</strong></p>
                </div>
            </div>
            <div class="s-card-details">
                <div class="s-card-val-ind">
                    <span>Individual</span>
                    <strong>${formatarMoeda(s.participantes.length > 0 ? s.valor / s.participantes.length : 0)}</strong>
                </div>
                <div class="s-card-participants">
                    ${s.participantes.map(p => `
                        <div class="p-avatar-sm" title="${p}" style="background: ${CONFIG.CORES_PESSOAS[p]}">
                            ${p[0]}
                        </div>
                    `).join('')}
                </div>
                <div class="s-card-actions">
                    <button class="btn-icon" onclick="abrirModalEdicao(${s.id})" title="Editar">✏️</button>
                    <button class="btn-icon btn-icon-danger" onclick="removerStreaming(${s.id})" title="Excluir">🗑️</button>
                </div>
            </div>
        </div>
    `).join('');
}

function renderizarTabelaDivisao() {
    const tbody = document.querySelector('#table-division tbody');
    tbody.innerHTML = state.streamings.map(s => `
        <tr>
            <td>
                <div class="td-streaming">
                    <img src="${getStreamingIcon(s.nome)}" alt="${s.nome}">
                    <span>${s.nome}</span>
                </div>
            </td>
            <td>${formatarMoeda(s.valor)}</td>
            <td><span class="pagador-tag">${s.pagador}</span></td>
            ${PESSOAS_PADRAO.map(p => `
                <td>
                    <label class="custom-checkbox">
                        <input type="checkbox" ${s.participantes.includes(p) ? 'checked' : ''} onchange="alternarParticipante(${s.id}, '${p}')">
                        <span class="checkmark"></span>
                    </label>
                </td>
            `).join('')}
            <td>
                <button class="btn-sm btn-outline" onclick="abrirModalEdicao(${s.id})">Editar</button>
            </td>
        </tr>
    `).join('');
}

function adicionarStreaming(e) {
    e.preventDefault();
    const nome = document.getElementById('add-nome').value;
    const valor = parseFloat(document.getElementById('add-valor').value);
    const pagador = document.getElementById('add-pagador').value;
    const participantes = Array.from(document.querySelectorAll('input[name="add-participantes"]:checked')).map(cb => cb.value);

    if (!nome || !validarValor(valor)) {
        mostrarToast("Preencha todos os campos corretamente.", "error");
        return;
    }

    const novo = { id: gerarId(), nome, valor, pagador, participantes };
    state.streamings.push(novo);
    salvarStreamings(state.streamings);
    renderApp();
    e.target.reset();
    mostrarToast("Streaming adicionado com sucesso!", "success");
}

function abrirModalEdicao(id) {
    const s = state.streamings.find(x => x.id === id);
    if (!s) return;

    document.getElementById('edit-id').value = s.id;
    document.getElementById('edit-nome').value = s.nome;
    document.getElementById('edit-valor').value = s.valor;
    document.getElementById('edit-pagador').value = s.pagador;

    const checkboxes = document.querySelectorAll('input[name="edit-participantes"]');
    checkboxes.forEach(cb => {
        cb.checked = s.participantes.includes(cb.value);
    });

    document.getElementById('modal-edit').classList.add('active');
}

function fecharModalEdicao() {
    document.getElementById('modal-edit').classList.remove('active');
}

function salvarEdicaoStreaming(e) {
    e.preventDefault();
    const id = parseInt(document.getElementById('edit-id').value);
    const nome = document.getElementById('edit-nome').value;
    const valor = parseFloat(document.getElementById('edit-valor').value);
    const pagador = document.getElementById('edit-pagador').value;
    const participantes = Array.from(document.querySelectorAll('input[name="edit-participantes"]:checked')).map(cb => cb.value);

    const idx = state.streamings.findIndex(s => s.id === id);
    if (idx !== -1) {
        state.streamings[idx] = { ...state.streamings[idx], nome, valor, pagador, participantes };
        salvarStreamings(state.streamings);
        renderApp();
        fecharModalEdicao();
        mostrarToast("Streaming atualizado com sucesso!", "success");
    }
}

function removerStreaming(id) {
    if (confirm("Deseja realmente excluir este streaming?")) {
        state.streamings = state.streamings.filter(s => s.id !== id);
        salvarStreamings(state.streamings);
        renderApp();
        mostrarToast("Streaming removido.", "info");
    }
}

function alternarParticipante(streamingId, pessoa) {
    const s = state.streamings.find(x => x.id === streamingId);
    if (s) {
        if (s.participantes.includes(pessoa)) {
            s.participantes = s.participantes.filter(p => p !== pessoa);
        } else {
            s.participantes.push(pessoa);
        }
        salvarStreamings(state.streamings);
        renderApp();
    }
}

function alternarStatusPagamento(pessoa) {
    const chave = obterChaveMesAtual();
    const atual = state.pagamentos[chave][pessoa];
    state.pagamentos[chave][pessoa] = atual === "pago" ? "pendente" : "pago";
    
    salvarStatusPagamentos(state.pagamentos);
    renderizarCardsPessoas();
    mostrarToast(`Status de ${pessoa} alterado.`, "info");
}

function aplicarFiltros() {
    state.filtros.busca = document.getElementById('search-input').value;
    state.filtros.pessoa = document.getElementById('filter-person').value;
    state.filtros.status = document.getElementById('filter-status').value;
    renderizarListaStreamings();
}

function copiarResumoWhatsApp() {
    const { totais, detalhes } = calcularDivisoes();
    const chave = obterChaveMesAtual();
    const mesFormatado = obterMesAtualFormatado();
    
    let texto = `📺 *Resumo Streaming - ${mesFormatado}*\n\n`;

    PESSOAS_PADRAO.forEach(pessoa => {
        const status = state.pagamentos[chave][pessoa];
        texto += `👤 *${pessoa}*\n`;
        texto += `Total: ${formatarMoeda(totais[pessoa])}\n`;
        texto += `Status: ${status.charAt(0).toUpperCase() + status.slice(1)}\n`;
        
        detalhes[pessoa].forEach(item => {
            texto += `- ${item.nome}: ${formatarMoeda(item.valor)}\n`;
        });
        texto += `\n`;
    });

    navigator.clipboard.writeText(texto).then(() => {
        mostrarToast("Resumo copiado para WhatsApp!", "success");
    });
}

function mostrarToast(mensagem, tipo = "success") {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    
    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
        warning: '⚠️'
    };

    toast.innerHTML = `<span>${icons[tipo] || '🔔'}</span> ${mensagem}`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function restaurarPadrao() {
    if (confirm("Deseja restaurar os dados padrão?")) {
        const data = restaurarDadosPadrao();
        state.streamings = data.streamings;
        state.pagamentos = data.pagamentos;
        renderApp();
        mostrarToast("Dados restaurados com sucesso!", "info");
    }
}

function limparDados() {
    if (confirm("Deseja limpar todos os dados?")) {
        limparStorage();
        state.streamings = [];
        state.pagamentos = carregarStatusPagamentos();
        renderApp();
        mostrarToast("Dados limpos.", "warning");
    }
}

window.onload = inicializarApp;
