/**
 * Chamadas à API do backend (base URL relativa /api).
 */
const API_BASE = '/api';

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

const api = {
  duplas: {
    listar: () => request('/duplas'),
    obter: (id) => request('/duplas/' + id),
    criar: (body) => request('/duplas', { method: 'POST', body: JSON.stringify(body) }),
    atualizar: (id, body) => request('/duplas/' + id, { method: 'PUT', body: JSON.stringify(body) }),
    apagar: (id) => request('/duplas/' + id, { method: 'DELETE' })
  },
  partidas: {
    listar: () => request('/partidas'),
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
    listar: () => request('/classificacao')
  }
};
