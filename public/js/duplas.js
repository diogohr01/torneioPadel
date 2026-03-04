/**
 * Secção Duplas: listar, adicionar, editar e apagar duplas do torneio atual.
 * Botão "Gerar todos os jogos" para criar partidas todos-contra-todos.
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

  async function carregarDuplas() {
    const tid = window.torneioAtualId;
    const container = el('listaDuplas');
    const formWrap = el('formDuplaWrap');
    if (!container) return;
    if (tid == null) {
      container.innerHTML = '<div class="list-group-item text-muted">Selecione um torneio.</div>';
      if (formWrap) formWrap.style.display = 'none';
      return;
    }
    try {
      const duplas = await api.duplas.listar(tid);
      if (!duplas.length) {
        container.innerHTML = '<div class="list-group-item text-muted">Nenhuma dupla. Use "Adicionar dupla" para criar.</div>';
      } else {
        container.innerHTML = duplas.map(d => `
          <div class="list-group-item d-flex justify-content-between align-items-center">
            <span>${escapeHtml(d.nome)}</span>
            <span>
              <button type="button" class="btn btn-sm btn-outline-primary me-1" data-dupla-id="${d.id}" data-dupla-nome="${escapeHtml(d.nome)}">Editar</button>
              <button type="button" class="btn btn-sm btn-outline-danger" data-dupla-id="${d.id}">Apagar</button>
            </span>
          </div>
        `).join('');
      }
      container.querySelectorAll('[data-dupla-id]').forEach(function (btn) {
        const id = btn.getAttribute('data-dupla-id');
        if (btn.classList.contains('btn-outline-danger')) {
          btn.addEventListener('click', function () { apagarDupla(id); });
        } else {
          const nome = btn.getAttribute('data-dupla-nome') || '';
          btn.addEventListener('click', function () { mostrarFormEdit(id, nome); });
        }
      });
    } catch (err) {
      container.innerHTML = '<div class="list-group-item text-danger">Erro: ' + escapeHtml(err.message) + '</div>';
    }
    if (formWrap) formWrap.style.display = 'none';
  }

  function mostrarFormNova() {
    el('duplaIdEdit').value = '';
    el('duplaNome').value = '';
    el('formDuplaWrap').style.display = 'block';
  }

  function mostrarFormEdit(id, nome) {
    el('duplaIdEdit').value = id;
    el('duplaNome').value = nome;
    el('formDuplaWrap').style.display = 'block';
  }

  function esconderForm() {
    el('formDuplaWrap').style.display = 'none';
  }

  el('btnAdicionarDupla').addEventListener('click', function () {
    if (window.torneioAtualId == null) {
      alert('Selecione um torneio primeiro.');
      return;
    }
    mostrarFormNova();
  });

  el('btnCancelarDupla').addEventListener('click', esconderForm);

  el('formDupla').addEventListener('submit', async function (e) {
    e.preventDefault();
    const idEdit = el('duplaIdEdit').value;
    const nome = el('duplaNome').value.trim();
    if (!nome) return;
    try {
      if (idEdit) {
        await api.duplas.atualizar(idEdit, { nome: nome });
      } else {
        await api.duplas.criar({ nome: nome, torneio_id: window.torneioAtualId });
      }
      esconderForm();
      carregarDuplas();
      if (window.dashboardRefresh) window.dashboardRefresh();
    } catch (err) {
      alert(err.message || 'Erro ao guardar.');
    }
  });

  async function apagarDupla(id) {
    if (!window.confirm('Apagar esta dupla? (Partidas onde participa podem ficar inválidas.)')) return;
    try {
      await api.duplas.apagar(id);
      carregarDuplas();
      if (window.dashboardRefresh) window.dashboardRefresh();
    } catch (err) {
      alert(err.message || 'Erro ao apagar.');
    }
  }

  function getRodadas() {
    var sel = el('selectRodadas');
    return sel ? parseInt(sel.value, 10) || 1 : 1;
  }

  el('btnGerarJogos').addEventListener('click', async function () {
    const tid = window.torneioAtualId;
    if (tid == null) {
      alert('Selecione um torneio.');
      return;
    }
    try {
      await api.torneios.gerarPartidas(tid, getRodadas());
      if (window.dashboardRefresh) window.dashboardRefresh();
      alert('Jogos gerados com sucesso.');
    } catch (err) {
      alert(err.message || 'Erro ao gerar jogos.');
    }
  });

  el('btnAdicionarRodadas').addEventListener('click', async function () {
    const tid = window.torneioAtualId;
    if (tid == null) {
      alert('Selecione um torneio.');
      return;
    }
    try {
      await api.torneios.adicionarRodadas(tid, getRodadas());
      if (window.dashboardRefresh) window.dashboardRefresh();
      alert('Rodada(s) adicionada(s) com sucesso.');
    } catch (err) {
      alert(err.message || 'Erro ao adicionar rodadas.');
    }
  });

  window.duplasRefresh = carregarDuplas;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      if (window.torneioAtualId != null) carregarDuplas();
    });
  }
})();
