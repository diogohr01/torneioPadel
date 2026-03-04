/**
 * Chamadas à API do backend.
 * API_BASE: em localhost fica '/api'; em produção (ex. GitHub Pages) usa window.API_BASE_URL (URL do Render + /api).
 */
const API_BASE = (typeof window !== 'undefined' && window.API_BASE_URL) ? window.API_BASE_URL : '/api';

async function request(path, options = {}) {
  const url = path.startsWith('http') ? path : API_BASE + path;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.erro || res.statusText);
  return data;
}

function queryTorneio() {
  const id = window.torneioAtualId;
  return id != null ? '?torneio_id=' + id : '';
}

const api = {
  torneios: {
    listar: () => request('/torneios'),
    obter: (id) => request('/torneios/' + id),
    criar: (body) => request('/torneios', { method: 'POST', body: JSON.stringify(body) }),
    proximoJogo: (id) => request('/torneios/' + id + '/proximo-jogo'),
    gerarPartidas: (id, rodadas) =>
      request('/torneios/' + id + '/gerar-partidas', {
        method: 'POST',
        body: JSON.stringify({ rodadas: rodadas != null ? rodadas : 1 })
      }),
    adicionarRodadas: (id, rodadas) =>
      request('/torneios/' + id + '/adicionar-rodadas', {
        method: 'POST',
        body: JSON.stringify({ rodadas: rodadas != null ? rodadas : 1 })
      })
  },
  duplas: {
    listar: (torneioId) => request('/duplas' + (torneioId != null ? '?torneio_id=' + torneioId : '')),
    obter: (id) => request('/duplas/' + id),
    criar: (body) => request('/duplas', { method: 'POST', body: JSON.stringify(body) }),
    atualizar: (id, body) => request('/duplas/' + id, { method: 'PUT', body: JSON.stringify(body) }),
    apagar: (id) => request('/duplas/' + id, { method: 'DELETE' })
  },
  partidas: {
    listar: (torneioId) => request('/partidas' + (torneioId != null ? '?torneio_id=' + torneioId : '')),
    obter: (id) => request('/partidas/' + id),
    criar: (body) => request('/partidas', { method: 'POST', body: JSON.stringify(body) }),
    atualizar: (id, body) => request('/partidas/' + id, { method: 'PUT', body: JSON.stringify(body) }),
    apagar: (id) => request('/partidas/' + id, { method: 'DELETE' }),
    registarResultado: (id, games_dupla1, games_dupla2) =>
      request('/partidas/' + id + '/resultado', {
        method: 'POST',
        body: JSON.stringify({ games_dupla1, games_dupla2 })
      })
  },
  classificacao: {
    listar: (torneioId) => request('/classificacao' + (torneioId != null ? '?torneio_id=' + torneioId : ''))
  }
};
