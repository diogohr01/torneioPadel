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
  /** Contagem de comentários por partida (atualizada ao abrir o modal ou publicar). */
  let comentariosCountByPartida = {};

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
      const mostrarRegistar = !temResultado && p.id === idProximoJogo && !window.torneioFinalizado;
      const btnRegistar = mostrarRegistar
        ? `<button type="button" class="btn btn-sm btn-primary btn-action ms-2" data-partida-id="${p.id}" data-dupla1="${escapeHtml(p.dupla1_nome)}" data-dupla2="${escapeHtml(p.dupla2_nome)}">Registrar</button>`
        : '';
      const nComentarios = comentariosCountByPartida[p.id] != null ? comentariosCountByPartida[p.id] : 0;
      const btnComentarios = `<button type="button" class="btn btn-sm btn-outline-secondary btn-comentarios ms-1" data-partida-id="${p.id}" data-dupla1="${escapeHtml(p.dupla1_nome)}" data-dupla2="${escapeHtml(p.dupla2_nome)}" data-ordem="${p.ordem != null ? p.ordem : ''}">💬 Comentários (${nComentarios})</button>`;
      return `
        <div class="list-group-item${extraClass}">
          <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <span>${ordemLabel}<strong>${escapeHtml(p.dupla1_nome)}</strong> vs <strong>${escapeHtml(p.dupla2_nome)}</strong></span>
            <span class="d-flex align-items-center flex-wrap">
              <span class="badge bg-${temResultado ? 'success' : 'secondary'}">${resultado}</span>
              ${btnComentarios}
              ${btnRegistar}
            </span>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('button[data-partida-id].btn-primary').forEach(function (btn) {
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

    container.querySelectorAll('button.btn-comentarios').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var partidaId = this.getAttribute('data-partida-id');
        var dupla1 = this.getAttribute('data-dupla1') || 'Dupla 1';
        var dupla2 = this.getAttribute('data-dupla2') || 'Dupla 2';
        var ordem = this.getAttribute('data-ordem') || '';
        var titulo = ordem ? 'Jogo ' + ordem + ': ' + dupla1 + ' vs ' + dupla2 : dupla1 + ' vs ' + dupla2;
        window.partidasAbrirModalComentarios(partidaId, 'Comentários - ' + titulo);
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

    var finalizado = !!window.torneioFinalizado;
    select.disabled = finalizado;
    var btnSubmit = document.getElementById('formResultado') && document.getElementById('formResultado').querySelector('button[type="submit"]');
    if (btnSubmit) btnSubmit.disabled = finalizado;
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

  var modalComentariosPartidaId = null;

  function formatarDataComentario(createdAt) {
    if (!createdAt) return '';
    try {
      var d = new Date(createdAt);
      return isNaN(d.getTime()) ? createdAt : d.toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' });
    } catch (e) {
      return createdAt;
    }
  }

  window.partidasAbrirModalComentarios = async function (partidaId, titulo) {
    modalComentariosPartidaId = partidaId;
    var modalLabel = el('modalComentariosLabel');
    if (modalLabel) modalLabel.textContent = titulo || 'Comentários';
    var lista = el('comentariosLista');
    if (lista) lista.innerHTML = '<p class="text-muted small">A carregar...</p>';
    var modalEl = document.getElementById('modalComentarios');
    if (modalEl && typeof bootstrap !== 'undefined') {
      var modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.show();
    }
    try {
      var comentarios = await api.partidas.listarComentarios(partidaId);
      comentariosCountByPartida[partidaId] = comentarios.length;
      if (window.partidasAtualizarLista) window.partidasAtualizarLista(partidasCache);
      if (lista) {
        if (comentarios.length === 0) {
          lista.innerHTML = '<p class="text-muted small mb-0">Ainda não há comentários. Sê o primeiro!</p>';
        } else {
          lista.innerHTML = comentarios.map(function (c) {
            var autor = (c.autor_nome && c.autor_nome.trim()) ? escapeHtml(c.autor_nome) : 'Anónimo';
            var texto = escapeHtml(c.texto);
            var data = formatarDataComentario(c.created_at);
            return '<div class="comentario-item"><span class="comentario-autor">' + autor + '</span> <span class="comentario-data text-muted small">' + data + '</span><p class="comentario-texto mb-0">' + texto + '</p></div>';
          }).join('');
        }
      }
      if (el('comentarioTexto')) el('comentarioTexto').value = '';
    } catch (err) {
      if (lista) lista.innerHTML = '<p class="text-danger small">Erro ao carregar comentários.</p>';
    }
  };

  el('formComentario').addEventListener('submit', async function (e) {
    e.preventDefault();
    var partidaId = modalComentariosPartidaId;
    if (!partidaId) return;
    var nome = (el('comentarioAutorNome') && el('comentarioAutorNome').value) ? el('comentarioAutorNome').value.trim() : null;
    var texto = el('comentarioTexto') && el('comentarioTexto').value ? el('comentarioTexto').value.trim() : '';
    if (!texto) return;
    try {
      await api.partidas.adicionarComentario(partidaId, { autor_nome: nome || null, texto: texto });
      var comentarios = await api.partidas.listarComentarios(partidaId);
      comentariosCountByPartida[partidaId] = comentarios.length;
      if (window.partidasAtualizarLista) window.partidasAtualizarLista(partidasCache);
      var lista = el('comentariosLista');
      if (lista) {
        if (comentarios.length === 0) {
          lista.innerHTML = '<p class="text-muted small mb-0">Ainda não há comentários.</p>';
        } else {
          lista.innerHTML = comentarios.map(function (c) {
            var autor = (c.autor_nome && c.autor_nome.trim()) ? escapeHtml(c.autor_nome) : 'Anónimo';
            var textoEsc = escapeHtml(c.texto);
            var data = formatarDataComentario(c.created_at);
            return '<div class="comentario-item"><span class="comentario-autor">' + autor + '</span> <span class="comentario-data text-muted small">' + data + '</span><p class="comentario-texto mb-0">' + textoEsc + '</p></div>';
          }).join('');
        }
      }
      if (el('comentarioTexto')) el('comentarioTexto').value = '';
      var toast = el('toastSucesso');
      if (toast) {
        toast.textContent = 'Comentário publicado!';
        toast.classList.add('show');
        setTimeout(function () { toast.classList.remove('show'); toast.textContent = ''; }, 3500);
      }
    } catch (err) {
      var errEl = document.getElementById('erroComentario');
      if (errEl) errEl.textContent = err.message || 'Erro ao publicar.';
    }
  });

  document.getElementById('emojiButtons').addEventListener('click', function (e) {
    var btn = e.target.closest('.btn-emoji');
    if (!btn) return;
    var emoji = btn.getAttribute('data-emoji');
    if (!emoji) return;
    var ta = el('comentarioTexto');
    if (!ta) return;
    var start = ta.selectionStart;
    var end = ta.selectionEnd;
    var val = ta.value;
    ta.value = val.slice(0, start) + emoji + val.slice(end);
    ta.selectionStart = ta.selectionEnd = start + emoji.length;
    ta.focus();
  });

  el('formResultado').addEventListener('submit', async function (e) {
    e.preventDefault();
    const errEl = el('erroResultado');
    errEl.textContent = '';

    if (window.torneioFinalizado) {
      errEl.textContent = 'Torneio já finalizado. Não é possível registar mais resultados.';
      return;
    }

    const partidaId = el('selectPartida').value;
    const g1 = parseInt(el('gamesDupla1').value, 10);
    const g2 = parseInt(el('gamesDupla2').value, 10);

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
      errEl.textContent = err.message || 'Erro ao registrar resultado.';
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
