/* =============================================================================
   fisicaBatalha.js — Fundação de Física 2.5D da Batalha (Etapa 1)
   -----------------------------------------------------------------------------
   Módulo ADITIVO ao Arcane Clash — Duelo de Magias.

   O que este arquivo NÃO faz (de propósito):
   - não calcula dano, vida, cooldown, drop, recompensa, missão ou balanceamento;
   - não mexe em Supabase, autenticação, inventário, loja, PvP ou RPCs;
   - não substitui o sistema de posição X/Y já existente (chão do jogo continua
     sendo o plano X/Y de sempre) — ele só adiciona um eixo de "altura" (salto/
     gravidade), knockback físico e uma câmera com zoom/shake, tudo isolado
     aqui dentro e consumido pelo batalha.js através de window.FisicaBatalha.

   Se este arquivo não carregar por algum motivo, o batalha.js continua
   funcionando exatamente como antes (todas as chamadas fazem "typeof
   window.FisicaBatalha !== 'undefined'" antes de usar).
   ============================================================================= */
(function () {
  "use strict";

  // ---- Constantes de física (ajustáveis sem mexer em nenhuma outra lógica) ----
  const GRAVIDADE = 0.62;        // "peso" da queda, em px por frame² (referência 60fps)
  const IMPULSO_PULO = 11.5;     // velocidade vertical inicial do salto
  const ALTURA_MAX_VISUAL = 130; // trava de segurança pro offset visual do salto
  const SQUASH_POUSO = 1.16;     // achatamento leve ao tocar o chão
  const SQUASH_RECUPERACAO = 0.22; // velocidade de volta ao tamanho normal
  const ATRITO_ZOOM = 0.10;      // decaimento do "zoom de impacto" por ~30 frames
  const ATRITO_SHAKE = 0.06;     // decaimento do screen shake por ~20 frames

  function criarCorpo() {
    return {
      altura: 0,      // distância acima do chão (0 = no chão)
      velAltura: 0,   // velocidade vertical do salto/queda
      noChao: true,   // estado no chão/no ar
      squash: 1,      // 1 = tamanho normal; <1 esticado, >1 achatado
    };
  }

  // Um corpo físico por combatente presente na arena.
  const corpos = { personagem: criarCorpo(), inimigo: criarCorpo(), guilherme: criarCorpo() };

  function pular(id) {
    const c = corpos[id];
    if (!c || !c.noChao) return false; // sem pulo duplo
    c.velAltura = IMPULSO_PULO;
    c.noChao = false;
    return true;
  }

  // Squash/stretch leve ao iniciar um golpe (chamado no instante do cast da skill).
  function esticarAtaque(id, forca) {
    const c = corpos[id];
    if (c) c.squash = Math.max(0.8, 1 - (forca || 0.12));
  }

  function atualizarCorpo(id, dt60) {
    const c = corpos[id];
    if (!c || dt60 <= 0) return;

    if (!c.noChao) {
      c.velAltura -= GRAVIDADE * dt60;
      c.altura += c.velAltura * dt60;
      if (c.altura <= 0) {
        c.altura = 0;
        c.velAltura = 0;
        c.noChao = true;
        c.squash = SQUASH_POUSO; // impacto do pouso
      }
    }
    // volta suave ao tamanho normal (tanto do pouso quanto do esticar de ataque)
    c.squash += (1 - c.squash) * Math.min(1, SQUASH_RECUPERACAO * dt60);
  }

  function atualizarTodos(dt60) {
    Object.keys(corpos).forEach(function (id) { atualizarCorpo(id, dt60); });
  }

  // Offset visual pronto pra usar direto no transform do sprite (posicionarSprite).
  function offsetVisual(id) {
    const c = corpos[id];
    if (!c) return { dy: 0, scaleX: 1, scaleY: 1, sombraEscala: 1, sombraOpacidade: 0.5 };
    const alturaClamp = Math.min(c.altura, ALTURA_MAX_VISUAL);
    return {
      dy: -alturaClamp,                    // sobe na tela conforme salta
      scaleX: 1 / Math.sqrt(c.squash),
      scaleY: c.squash,
      sombraEscala: Math.max(0.35, 1 - alturaClamp / 160), // sombra encolhe no ar
      sombraOpacidade: Math.max(0.12, 0.55 - alturaClamp / 220),
    };
  }

  // ---- Câmera dinâmica: zoom de impacto + screen shake, sempre suaves ----
  let zoomPulso = 0, shakeMag = 0, shakeAng = 0;

  function pulsarZoom(intensidade) { zoomPulso = Math.min(0.10, zoomPulso + (intensidade || 0.02)); }
  function abalarCamera(intensidade) { shakeMag = Math.min(14, shakeMag + (intensidade || 4)); }

  function atualizarCamera(dt60) {
    if (dt60 > 0) {
      zoomPulso *= Math.pow(ATRITO_ZOOM, dt60 / 30);
      if (zoomPulso < 0.0008) zoomPulso = 0;
      shakeMag *= Math.pow(ATRITO_SHAKE, dt60 / 20);
      if (shakeMag < 0.05) shakeMag = 0;
      shakeAng += 2.4 * dt60;
    }
    return {
      zoomExtra: zoomPulso,
      shakeX: Math.cos(shakeAng) * shakeMag,
      shakeY: Math.sin(shakeAng * 1.3) * shakeMag,
    };
  }

  window.FisicaBatalha = {
    corpos: corpos,
    pular: pular,
    esticarAtaque: esticarAtaque,
    atualizarTodos: atualizarTodos,
    offsetVisual: offsetVisual,
    pulsarZoom: pulsarZoom,
    abalarCamera: abalarCamera,
    atualizarCamera: atualizarCamera,
  };
})();
