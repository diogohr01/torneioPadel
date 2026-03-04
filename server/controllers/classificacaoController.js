/**
 * Controller: Classificação do torneio com critérios de desempate.
 * Ordem: pontos (desc) -> confronto direto -> saldo de games -> games feitos.
 */
const duplaModel = require('../models/Dupla');
const partidaModel = require('../models/Partida');

/**
 * Calcula estatísticas por dupla a partir das partidas com resultado (do torneio).
 */
function calcularEstatisticas(torneioId) {
  const duplas = duplaModel.listar(torneioId);
  const partidas = partidaModel.listarComResultado(torneioId);

  const stats = {};
  duplas.forEach(d => {
    stats[d.id] = {
      id: d.id,
      nome: d.nome,
      jogos: 0,
      vitorias: 0,
      derrotas: 0,
      pontos: 0,
      games_feitos: 0,
      games_sofridos: 0,
      saldo_games: 0
    };
  });

  partidas.forEach(p => {
    const d1 = p.dupla1_id;
    const d2 = p.dupla2_id;
    const g1 = p.games_dupla1 || 0;
    const g2 = p.games_dupla2 || 0;
    if (stats[d1] && stats[d2]) {
      stats[d1].jogos += 1;
      stats[d2].jogos += 1;
      stats[d1].games_feitos += g1;
      stats[d1].games_sofridos += g2;
      stats[d2].games_feitos += g2;
      stats[d2].games_sofridos += g1;
      if (p.vencedor_id === d1) {
        stats[d1].vitorias += 1;
        stats[d1].pontos += 3;
        stats[d2].derrotas += 1;
      } else {
        stats[d2].vitorias += 1;
        stats[d2].pontos += 3;
        stats[d1].derrotas += 1;
      }
    }
  });

  const resultado = Object.values(stats).map(s => ({
    ...s,
    saldo_games: s.games_feitos - s.games_sofridos
  }));

  return resultado;
}

/**
 * Retorna o vencedor do confronto direto entre dupla A e B (partidas já com resultado).
 * Retorno: 1 se A à frente, -1 se B à frente, 0 se indefinido (sem jogo ou empate de games).
 */
function confrontoDireto(partidas, idA, idB) {
  const jogo = partidas.find(p => {
    const ids = [p.dupla1_id, p.dupla2_id].sort((a, b) => a - b);
    const pair = [idA, idB].sort((a, b) => a - b);
    return ids[0] === pair[0] && ids[1] === pair[1];
  });
  if (!jogo || jogo.vencedor_id == null) return 0;
  if (jogo.games_dupla1 === jogo.games_dupla2) return 0;
  const vencedor = jogo.vencedor_id;
  if (vencedor === idA) return 1;
  if (vencedor === idB) return -1;
  return 0;
}

function ordenarClassificacao(estatisticas, partidasComResultado) {
  return estatisticas.slice().sort((a, b) => {
    if (b.pontos !== a.pontos) return b.pontos - a.pontos;
    const confronto = confrontoDireto(partidasComResultado, a.id, b.id);
    if (confronto !== 0) return -confronto; // 1 => a à frente => queremos ordem negativa
    if (b.saldo_games !== a.saldo_games) return b.saldo_games - a.saldo_games;
    return b.games_feitos - a.games_feitos;
  });
}

function listar(req, res) {
  try {
    const torneioId = req.query.torneio_id != null ? parseInt(req.query.torneio_id, 10) : null;
    const estatisticas = calcularEstatisticas(torneioId);
    const partidasComResultado = partidaModel.listarComResultado(torneioId);
    const classificacao = ordenarClassificacao(estatisticas, partidasComResultado);
    // Adicionar posição
    classificacao.forEach((row, i) => {
      row.posicao = i + 1;
    });
    res.json(classificacao);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

module.exports = {
  listar,
  calcularEstatisticas,
  ordenarClassificacao
};
