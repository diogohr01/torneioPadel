/**
 * Dashboard: cards (total partidas, total duplas, líder) e tabela de classificação.
 */
(function () {
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

  function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  async function carregar() {
    try {
      const [classificacao, partidas] = await Promise.all([
        api.classificacao.listar(),
        api.partidas.listar()
      ]);
      atualizarCards(classificacao, partidas);
      renderizarClassificacao(classificacao);
      if (typeof partidasAtualizarLista === 'function') partidasAtualizarLista(partidas);
      if (typeof partidasAtualizarSelect === 'function') partidasAtualizarSelect(partidas);
    } catch (err) {
      console.error(err);
      el('tbodyClassificacao').innerHTML =
        '<tr><td colspan="9" class="text-center text-danger">Erro ao carregar: ' + escapeHtml(err.message) + '</td></tr>';
      el('totalPartidas').textContent = '-';
      el('totalDuplas').textContent = '-';
      el('liderAtual').textContent = '-';
    }
  }

  // Inicialização e refresh global
  window.dashboardRefresh = carregar;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', carregar);
  } else {
    carregar();
  }
})();
