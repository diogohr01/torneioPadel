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

  /** Devolve o id da primeira partida pendente (por ordem), ou null. */
  function proximaPartidaPendenteId(partidas) {
    const ordenadas = partidas.slice().sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));
    const proxima = ordenadas.find(p => p.vencedor_id == null);
    return proxima ? proxima.id : null;
  }

  window.partidasAtualizarLista = function (partidas) {
    partidasCache = partidas || partidasCache;
    const container = el('listaPartidas');
    if (!partidasCache.length) {
      container.innerHTML = '<div class="list-group-item text-muted">Nenhuma partida.</div>';
      return;
    }
    const idProximoJogo = proximaPartidaPendenteId(partidasCache);
    container.innerHTML = partidasCache.map(p => {
      const temResultado = p.vencedor_id != null;
      const resultado = temResultado
        ? `${p.games_dupla1} - ${p.games_dupla2}`
        : 'Pendente';
      const extraClass = temResultado ? ' resultado-ok' : '';
      const ordemLabel = (p.ordem != null) ? 'Jogo ' + p.ordem + ': ' : '';
      const mostrarRegistar = !temResultado && p.id === idProximoJogo;
      const btnRegistar = mostrarRegistar
        ? `<button type="button" class="btn btn-sm btn-primary btn-action ms-2" data-partida-id="${p.id}" data-dupla1="${escapeHtml(p.dupla1_nome)}" data-dupla2="${escapeHtml(p.dupla2_nome)}">Registar</button>`
        : '';
      return `
        <div class="list-group-item${extraClass}">
          <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <span>${ordemLabel}<strong>${escapeHtml(p.dupla1_nome)}</strong> vs <strong>${escapeHtml(p.dupla2_nome)}</strong></span>
            <span class="d-flex align-items-center">
              <span class="badge bg-${temResultado ? 'success' : 'secondary'}">${resultado}</span>
              ${btnRegistar}
            </span>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('[data-partida-id]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = this.getAttribute('data-partida-id');
        var dupla1 = this.getAttribute('data-dupla1') || 'Dupla 1';
        var dupla2 = this.getAttribute('data-dupla2') || 'Dupla 2';
        var select = el('selectPartida');
        var secao = document.getElementById('registar');
        if (select) select.value = id;
        if (el('labelDupla1')) el('labelDupla1').textContent = 'Games: ' + dupla1;
        if (el('labelDupla2')) el('labelDupla2').textContent = 'Games: ' + dupla2;
        if (secao) secao.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
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

    var idProximo = proximaPartidaPendenteId(partidasCache);
    if (idProximo) {
      select.value = idProximo;
      var opt = select.options[select.selectedIndex];
      if (opt && opt.value) {
        if (el('labelDupla1')) el('labelDupla1').textContent = 'Games: ' + (opt.dataset.dupla1 || 'Dupla 1');
        if (el('labelDupla2')) el('labelDupla2').textContent = 'Games: ' + (opt.dataset.dupla2 || 'Dupla 2');
      }
    }
  };

  (function () {
    var select = el('selectPartida');
    if (select) select.addEventListener('change', function () {
      var opt = this.options[this.selectedIndex];
      if (opt && opt.value) {
        if (el('labelDupla1')) el('labelDupla1').textContent = 'Games: ' + (opt.dataset.dupla1 || 'Dupla 1');
        if (el('labelDupla2')) el('labelDupla2').textContent = 'Games: ' + (opt.dataset.dupla2 || 'Dupla 2');
      }
    });
  })();

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
      if (el('labelDupla1')) el('labelDupla1').textContent = 'Games Dupla 1';
      if (el('labelDupla2')) el('labelDupla2').textContent = 'Games Dupla 2';
      if (window.dashboardRefresh) window.dashboardRefresh();
      var toast = el('toastSucesso');
      if (toast) {
        toast.textContent = 'Resultado registado!';
        toast.classList.add('show');
        setTimeout(function () {
          toast.classList.remove('show');
          toast.textContent = '';
        }, 3500);
      }
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
