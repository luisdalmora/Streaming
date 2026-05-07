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
    const icons = {
        disney: 'disney-plus.svg',
        max: 'max.svg',
        hbo: 'max.svg',
        apple: 'apple-tv.svg',
        netflix: 'netflix.svg',
        globo: 'globoplay.svg',
        prime: 'prime-video.svg',
        spotify: 'spotify.svg',
        youtube: 'youtube.svg',
        crunchyroll: 'crunchyroll.svg',
        meli: 'meli.svg',
        paramount: 'paramount.svg',
        gamepass: 'gamepass.svg',
        psplus: 'psplus.svg',
        nintendo: 'nintendo.svg'
    };

    for (const key in icons) {
        if (normalized.includes(key)) return CONFIG.ICON_PATH + icons[key];
    }
    return CONFIG.ICON_PATH + 'default.svg';
}

function obterChaveMesAtual() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function obterMesAtualFormatado() {
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const d = new Date();
    return `${meses[d.getMonth()]}/${d.getFullYear()}`;
}

function calcularDivisoes(streamings) {
    const totais = {};
    const detalhes = {};
    PESSOAS_PADRAO.forEach(p => {
        totais[p] = 0;
        detalhes[p] = [];
    });

    streamings.forEach(s => {
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

function gerarTextoWhatsApp(state) {
    const { totais, detalhes } = calcularDivisoes(state.streamings);
    const mes = obterMesAtualFormatado();
    const chave = obterChaveMesAtual();
    const totalGeral = state.streamings.reduce((acc, s) => acc + s.valor, 0);

    let texto = `📺 *Resumo Streaming - ${mes}*\n\n`;
    texto += `💰 *Total Geral:* ${formatarMoeda(totalGeral)}\n\n`;

    PESSOAS_PADRAO.forEach(pessoa => {
        const status = state.pagamentos[chave][pessoa] === 'pago' ? '✅ Pago' : '⏳ Pendente';
        texto += `👤 *${pessoa}* (${status})\n`;
        texto += `Total: *${formatarMoeda(totais[pessoa])}*\n`;
        
        detalhes[pessoa].forEach(item => {
            texto += `- ${item.nome}: ${formatarMoeda(item.valor)}\n`;
        });
        texto += `\n`;
    });

    return texto;
}
