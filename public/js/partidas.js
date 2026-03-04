/**
 * Lista de partidas e formulário para registar resultado.
 */
(function () {
  function el(id) {
    return document.getElementById(id);
  }

  function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  let partidasCache = [];

  window.partidasAtualizarLista = function (partidas) {
    partidasCache = partidas || partidasCache;
    const container = el('listaPartidas');
    if (!partidasCache.length) {
      container.innerHTML = '<div class="list-group-item text-muted">Nenhuma partida.</div>';
      return;
    }
    container.innerHTML = partidasCache.map(p => {
      const temResultado = p.vencedor_id != null;
      const resultado = temResultado
        ? `${p.games_dupla1} - ${p.games_dupla2}`
        : 'Pendente';
      const extraClass = temResultado ? ' resultado-ok' : '';
      return `
        <div class="list-group-item${extraClass}">
          <div class="d-flex justify-content-between align-items-center flex-wrap">
            <span><strong>${escapeHtml(p.dupla1_nome)}</strong> vs <strong>${escapeHtml(p.dupla2_nome)}</strong></span>
            <span class="badge bg-${temResultado ? 'success' : 'secondary'}">${resultado}</span>
          </div>
        </div>
      `;
    }).join('');
  };

  window.partidasAtualizarSelect = function (partidas) {
    partidasCache = partidas || partidasCache;
    const select = el('selectPartida');
    if (!select) return;
    const semResultado = partidasCache.filter(p => p.vencedor_id == null);
    select.innerHTML = '<option value="">Selecionar partida...</option>' +
      semResultado.map(p => `
        <option value="${p.id}" data-dupla1="${escapeHtml(p.dupla1_nome)}" data-dupla2="${escapeHtml(p.dupla2_nome)}">
          ${escapeHtml(p.dupla1_nome)} vs ${escapeHtml(p.dupla2_nome)}
        </option>
      `).join('');

    select.addEventListener('change', function () {
      const opt = this.options[this.selectedIndex];
      if (opt && opt.value) {
        el('labelDupla1').textContent = 'Games: ' + (opt.dataset.dupla1 || 'Dupla 1');
        el('labelDupla2').textContent = 'Games: ' + (opt.dataset.dupla2 || 'Dupla 2');
      }
    });
  };

  el('formResultado').addEventListener('submit', async function (e) {
    e.preventDefault();
    const partidaId = el('selectPartida').value;
    const g1 = parseInt(el('gamesDupla1').value, 10);
    const g2 = parseInt(el('gamesDupla2').value, 10);
    const errEl = el('erroResultado');
    errEl.textContent = '';

    if (!partidaId) {
      errEl.textContent = 'Selecione uma partida.';
      return;
    }
    if (isNaN(g1) || isNaN(g2) || g1 < 0 || g2 < 0) {
      errEl.textContent = 'Indique games válidos (números ≥ 0).';
      return;
    }
    if (g1 === g2) {
      errEl.textContent = 'MD1 não permite empate. Deve haver um vencedor.';
      return;
    }

    try {
      await api.partidas.registarResultado(partidaId, g1, g2);
      el('gamesDupla1').value = '';
      el('gamesDupla2').value = '';
      el('selectPartida').value = '';
      if (window.dashboardRefresh) window.dashboardRefresh();
    } catch (err) {
      errEl.textContent = err.message || 'Erro ao registar resultado.';
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      if (partidasCache.length) {
        partidasAtualizarSelect(partidasCache);
      }
    });
  }
})();
