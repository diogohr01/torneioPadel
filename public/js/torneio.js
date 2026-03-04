/**
 * Selector de torneio: carrega lista, guarda seleção (localStorage), dispara refresh.
 */
(function () {
  function el(id) {
    return document.getElementById(id);
  }

  const STORAGE_KEY = 'torneioAtualId';

  window.torneioAtualId = parseInt(localStorage.getItem(STORAGE_KEY), 10) || null;

  function setTorneio(id) {
    window.torneioAtualId = id == null ? null : parseInt(id, 10);
    if (window.torneioAtualId != null) {
      localStorage.setItem(STORAGE_KEY, String(window.torneioAtualId));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  window.obterTorneioAtual = function () {
    return window.torneioAtualId;
  };

  async function carregarTorneios() {
    const select = el('selectTorneio');
    if (!select) return;
    try {
      const torneios = await api.torneios.listar();
      select.innerHTML = '<option value="">-- Selecionar torneio --</option>' +
        torneios.map(t => '<option value="' + t.id + '">' + escapeHtml(t.nome) + '</option>').join('');
      if (torneios.length && window.torneioAtualId != null) {
        const exists = torneios.some(t => t.id === window.torneioAtualId);
        if (exists) {
          select.value = String(window.torneioAtualId);
        } else {
          select.value = String(torneios[0].id);
          setTorneio(torneios[0].id);
        }
      } else if (torneios.length) {
        select.value = String(torneios[0].id);
        setTorneio(torneios[0].id);
      }
      select.dispatchEvent(new Event('change'));
    } catch (err) {
      console.error(err);
      select.innerHTML = '<option value="">Erro ao carregar</option>';
    }
  }

  function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function refreshTudo() {
    if (typeof window.dashboardRefresh === 'function') window.dashboardRefresh();
    if (typeof window.duplasRefresh === 'function') window.duplasRefresh();
  }

  el('selectTorneio').addEventListener('change', function () {
    const val = this.value;
    setTorneio(val || null);
    refreshTudo();
  });

  var modalNovoTorneio = null;
  var modalEl = document.getElementById('modalNovoTorneio');
  if (modalEl) {
    modalNovoTorneio = new bootstrap.Modal(modalEl);
  }

  el('btnNovoTorneio').addEventListener('click', function () {
    el('novoTorneioNome').value = '';
    el('erroModalTorneio').style.display = 'none';
    el('erroModalTorneio').textContent = '';
    if (modalNovoTorneio) modalNovoTorneio.show();
  });

  el('btnCriarTorneio').addEventListener('click', async function () {
    var nomeInput = el('novoTorneioNome');
    var nome = nomeInput && nomeInput.value ? nomeInput.value.trim() : '';
    var errEl = el('erroModalTorneio');
    if (!nome) {
      if (errEl) { errEl.textContent = 'Indique o nome do torneio.'; errEl.style.display = 'block'; }
      return;
    }
    if (errEl) { errEl.style.display = 'none'; errEl.textContent = ''; }
    try {
      var t = await api.torneios.criar({ nome: nome });
      if (modalNovoTorneio) modalNovoTorneio.hide();
      await carregarTorneios();
      el('selectTorneio').value = String(t.id);
      setTorneio(t.id);
      refreshTudo();
    } catch (err) {
      if (errEl) {
        errEl.textContent = err.message || 'Erro ao criar torneio. Tente novamente.';
        errEl.style.display = 'block';
      }
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', carregarTorneios);
  } else {
    carregarTorneios();
  }
})();
