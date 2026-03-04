/**
 * Dashboard: cards (total partidas, total duplas, líder), próximo jogo, tabela de classificação.
 * Usa torneioAtualId em todas as chamadas.
 */
(function () {
  let lastClassificacao = [];

  function el(id) {
    return document.getElementById(id);
  }

  function atualizarCards(classificacao, partidas) {
    const comResultado = partidas.filter(p => p.vencedor_id != null).length;
    el('totalPartidas').textContent = comResultado;
    el('totalDuplas').textContent = classificacao.length;
    el('liderAtual').textContent = classificacao.length
      ? classificacao[0].nome
      : '-';
  }

  function renderizarClassificacao(classificacao) {
    const tbody = el('tbodyClassificacao');
    if (!classificacao || classificacao.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted">Nenhum dado ainda.</td></tr>';
      return;
    }
    tbody.innerHTML = classificacao.map(row => `
      <tr>
        <td><strong>${row.posicao}</strong></td>
        <td>${escapeHtml(row.nome)}</td>
        <td>${row.jogos}</td>
        <td>${row.vitorias}</td>
        <td>${row.derrotas}</td>
        <td><strong>${row.pontos}</strong></td>
        <td>${row.games_feitos}</td>
        <td>${row.games_sofridos}</td>
        <td>${row.saldo_games >= 0 ? '+' : ''}${row.saldo_games}</td>
      </tr>
    `).join('');
  }

  function abrirModalDetalhesClassificacao(row) {
    if (!row) return;
    el('detPosicao').textContent = row.posicao;
    el('detDupla').textContent = row.nome;
    el('detJogos').textContent = row.jogos;
    el('detVitorias').textContent = row.vitorias;
    el('detDerrotas').textContent = row.derrotas;
    el('detPontos').textContent = row.pontos;
    el('detGamesFeitos').textContent = row.games_feitos;
    el('detGamesSofridos').textContent = row.games_sofridos;
    el('detSaldo').textContent = (row.saldo_games >= 0 ? '+' : '') + row.saldo_games;
    var modalEl = document.getElementById('modalDetalhesClassificacao');
    if (modalEl && typeof bootstrap !== 'undefined') {
      var modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.show();
    }
  }

  function renderizarClassificacaoCards(classificacao) {
    const container = el('classificacao-cards');
    if (!container) return;
    if (!classificacao || classificacao.length === 0) {
      container.innerHTML = '<p class="text-muted mb-0">Nenhum dado ainda.</p>';
      return;
    }
    lastClassificacao = classificacao;
    const saldo = (row) => (row.saldo_games >= 0 ? '+' : '') + row.saldo_games;
    container.innerHTML = classificacao.map((row, i) => {
      const isLeader = i === 0;
      const cardClass = isLeader ? 'classificacao-card-item card leader' : 'classificacao-card-item card';
      return `
        <div class="${cardClass} classificacao-card-clickable" data-index="${i}" role="button" tabindex="0" aria-label="Ver detalhes de ${escapeHtml(row.nome)}">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <span class="card-pos">${row.posicao}º</span>
              <span class="card-nome">${escapeHtml(row.nome)}</span>
            </div>
            <div class="card-stats">
              <span><strong>${row.pontos}</strong> pts</span>
              <span>${row.jogos} jogos</span>
              <span>${row.vitorias}V-${row.derrotas}D</span>
              <span>Saldo ${saldo(row)}</span>
            </div>
            <small class="text-muted d-block mt-2">Toque para ver todos os dados</small>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.classificacao-card-clickable').forEach(function (card) {
      function openDetalhes() {
        var idx = card.getAttribute('data-index');
        if (idx == null) return;
        var row = lastClassificacao[parseInt(idx, 10)];
        if (row) abrirModalDetalhesClassificacao(row);
      }
      card.addEventListener('click', openDetalhes);
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openDetalhes();
        }
      });
    });
  }

  async function atualizarProximoJogo() {
    const card = el('cardProximoJogo');
    const texto = el('proximoJogoTexto');
    const btn = el('btnRegistarProximo');
    if (!card || !texto) return;
    const tid = window.torneioAtualId;
    if (tid == null || window.torneioFinalizado) {
      card.style.display = 'none';
      return;
    }
    try {
      const partida = await api.torneios.proximoJogo(tid);
      if (partida) {
        card.style.display = 'block';
        texto.textContent = 'Jogo ' + (partida.ordem || '') + ': ' + (partida.dupla1_nome || '') + ' vs ' + (partida.dupla2_nome || '');
        btn.dataset.partidaId = partida.id;
        btn.dataset.dupla1 = partida.dupla1_nome || '';
        btn.dataset.dupla2 = partida.dupla2_nome || '';
      } else {
        card.style.display = 'none';
      }
    } catch (err) {
      card.style.display = 'none';
    }
  }

  function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function formatarDataFinalizado(createdAt) {
    if (!createdAt) return '';
    try {
      var d = new Date(createdAt);
      return isNaN(d.getTime()) ? '' : d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (e) {
      return '';
    }
  }

  function atualizarPodiumETorneioFinalizado(torneio, classificacao) {
    var btnFinalizar = el('btnFinalizarTorneio');
    var labelFinalizado = el('torneioFinalizadoLabel');
    var secaoPodio = el('podioCampeoes');
    var podioData = el('podioDataFinalizado');

    var finalizado = torneio && (torneio.finalizado === 1 || torneio.finalizado === true);
    window.torneioFinalizado = !!finalizado;

    if (btnFinalizar) {
      btnFinalizar.style.display = finalizado ? 'none' : 'inline-block';
      btnFinalizar.disabled = finalizado;
    }
    if (labelFinalizado) labelFinalizado.style.display = finalizado ? 'inline' : 'none';

    var btnNovo = el('btnNovoTorneio');
    var btnApagar = el('btnApagarTorneio');
    var btnRegistarProximo = el('btnRegistarProximo');
    var btnAdicionarDupla = el('btnAdicionarDupla');
    var btnGerarJogos = el('btnGerarJogos');
    var btnAdicionarRodadas = el('btnAdicionarRodadas');
    /* Novo torneio: sempre permitido. Apagar: bloqueado se finalizado */
    if (btnNovo) btnNovo.disabled = false;
    if (btnApagar) btnApagar.disabled = false;
    if (btnRegistarProximo) btnRegistarProximo.disabled = finalizado;
    if (btnAdicionarDupla) btnAdicionarDupla.disabled = finalizado;
    if (btnGerarJogos) btnGerarJogos.disabled = finalizado;
    if (btnAdicionarRodadas) btnAdicionarRodadas.disabled = finalizado;

    if (secaoPodio) {
      if (finalizado && classificacao && classificacao.length > 0) {
        secaoPodio.style.display = 'block';
        if (podioData && torneio.finalizado_at) {
          podioData.textContent = 'Torneio finalizado a ' + formatarDataFinalizado(torneio.finalizado_at);
          podioData.style.display = 'block';
        } else if (podioData) {
          podioData.style.display = 'none';
        }
        var top3 = classificacao.slice(0, 3);
        if (el('podioNome1')) el('podioNome1').textContent = top3[0] ? escapeHtml(top3[0].nome) : '-';
        if (el('podioNome2')) el('podioNome2').textContent = top3[1] ? escapeHtml(top3[1].nome) : '-';
        if (el('podioNome3')) el('podioNome3').textContent = top3[2] ? escapeHtml(top3[2].nome) : '-';
      } else {
        secaoPodio.style.display = 'none';
        if (podioData) podioData.style.display = 'none';
      }
    }
  }

  async function carregar() {
    const tid = window.torneioAtualId;
    if (tid == null) {
      el('tbodyClassificacao').innerHTML = '<tr><td colspan="9" class="text-center text-muted">Selecione um torneio.</td></tr>';
      var cardsEl = el('classificacao-cards');
      if (cardsEl) cardsEl.innerHTML = '<p class="text-muted mb-0">Selecione um torneio.</p>';
      el('totalPartidas').textContent = '-';
      el('totalDuplas').textContent = '-';
      el('liderAtual').textContent = '-';
      el('cardProximoJogo').style.display = 'none';
      var secaoPodio = el('podioCampeoes');
      if (secaoPodio) secaoPodio.style.display = 'none';
      var btnFinalizar = el('btnFinalizarTorneio');
      if (btnFinalizar) { btnFinalizar.style.display = 'none'; btnFinalizar.disabled = false; }
      var labelFinalizado = el('torneioFinalizadoLabel');
      if (labelFinalizado) labelFinalizado.style.display = 'none';
      window.torneioFinalizado = false;
      var btnNovo = el('btnNovoTorneio');
      var btnApagar = el('btnApagarTorneio');
      var btnRegistarProximo = el('btnRegistarProximo');
      var btnAdicionarDupla = el('btnAdicionarDupla');
      var btnGerarJogos = el('btnGerarJogos');
      var btnAdicionarRodadas = el('btnAdicionarRodadas');
      if (btnNovo) btnNovo.disabled = false;
      if (btnApagar) btnApagar.disabled = false;
      if (btnRegistarProximo) btnRegistarProximo.disabled = false;
      if (btnAdicionarDupla) btnAdicionarDupla.disabled = false;
      if (btnGerarJogos) btnGerarJogos.disabled = false;
      if (btnAdicionarRodadas) btnAdicionarRodadas.disabled = false;
      if (typeof partidasAtualizarLista === 'function') partidasAtualizarLista([]);
      if (typeof partidasAtualizarSelect === 'function') partidasAtualizarSelect([]);
      return;
    }
    try {
      const [classificacao, partidas, torneio] = await Promise.all([
        api.classificacao.listar(tid),
        api.partidas.listar(tid),
        api.torneios.obter(tid)
      ]);
      atualizarCards(classificacao, partidas);
      renderizarClassificacao(classificacao);
      renderizarClassificacaoCards(classificacao);
      atualizarPodiumETorneioFinalizado(torneio, classificacao);
      if (typeof partidasAtualizarLista === 'function') partidasAtualizarLista(partidas);
      if (typeof partidasAtualizarSelect === 'function') partidasAtualizarSelect(partidas);
      await atualizarProximoJogo();
    } catch (err) {
      console.error(err);
      el('tbodyClassificacao').innerHTML =
        '<tr><td colspan="9" class="text-center text-danger">Erro ao carregar: ' + escapeHtml(err.message) + '</td></tr>';
      var cardsEl = el('classificacao-cards');
      if (cardsEl) cardsEl.innerHTML = '<p class="text-danger mb-0">Erro ao carregar.</p>';
      el('totalPartidas').textContent = '-';
      el('totalDuplas').textContent = '-';
      el('liderAtual').textContent = '-';
      var secaoPodio = el('podioCampeoes');
      if (secaoPodio) secaoPodio.style.display = 'none';
    }
  }

  if (el('btnFinalizarTorneio')) {
    el('btnFinalizarTorneio').addEventListener('click', async function () {
      var tid = window.torneioAtualId;
      if (tid == null) return;
      if (!window.confirm('Tens a certeza que queres finalizar este torneio? Os campeões serão definidos pela classificação atual.')) return;
      try {
        await api.torneios.finalizar(tid);
        if (typeof window.dashboardRefresh === 'function') window.dashboardRefresh();
        var toast = el('toastSucesso');
        if (toast) {
          toast.textContent = 'Torneio finalizado!';
          toast.classList.add('show');
          setTimeout(function () { toast.classList.remove('show'); toast.textContent = ''; }, 3500);
        }
      } catch (err) {
        alert(err.message || 'Erro ao finalizar torneio.');
      }
    });
  }

  if (el('btnRegistarProximo')) {
    el('btnRegistarProximo').addEventListener('click', function () {
      const id = this.dataset.partidaId;
      const dupla1 = this.dataset.dupla1 || '';
      const dupla2 = this.dataset.dupla2 || '';
      if (!id) return;
      var select = el('selectPartida');
      if (select) select.value = id;
      if (el('labelDupla1')) el('labelDupla1').textContent = 'Games: ' + dupla1;
      if (el('labelDupla2')) el('labelDupla2').textContent = 'Games: ' + dupla2;
      var secao = document.getElementById('registar');
      if (secao) secao.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  window.dashboardRefresh = carregar;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', carregar);
  } else {
    carregar();
  }
})();
