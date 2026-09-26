/* =============================================================================
   ambienteBatalha.js — Identidade Visual por Boss (item 11/12/13 do roteiro)
   -----------------------------------------------------------------------------
   Módulo ADITIVO ao Arcane Clash — Duelo de Magias.

   O que este arquivo NÃO faz (de propósito):
   - não calcula dano, vida, cooldown, drop, recompensa ou balanceamento;
   - não mexe em Supabase, RPCs, colisão, gravidade, knockback ou câmera;
   - não substitui o fundo (Boss{N}Img.png) nem o chão já desenhados em
     batalha.js — só desenha POR CIMA deles (tingimento leve + partículas),
     e só se este arquivo carregar (todas as chamadas em batalha.js fazem
     "if (window.AmbienteBatalha)" antes de usar).

   TEMAS (item 13): um por boss, todos com um `nome` e uma cor de chão só
   para já existir a arquitetura pedida. Só o boss 1 (Arlan / Universo 1)
   tem partículas implementadas nesta etapa — os outros 9 ficam reservados
   ("particulas: null") até cada universo ganhar seu mundo de verdade, como
   pedido explicitamente no roteiro ("não implementar todos esses mundos
   agora"). Adicionar um novo bioma no futuro é só preencher a linha do
   boss aqui — nenhuma outra parte do jogo precisa mudar.
   ============================================================================= */
(function () {
  "use strict";

  const TEMAS = {
    1:  { nome: "Floresta Arcana (escola)", corChao: "rgba(40,95,45,0.28)",  particulas: "folhas" },
    2:  { nome: "Tempestade",               corChao: "rgba(30,55,80,0.28)",  particulas: null },
    3:  { nome: "Neve e Gelo",              corChao: "rgba(70,95,120,0.28)", particulas: null },
    4:  { nome: "Vulcão",                   corChao: "rgba(95,35,20,0.28)",  particulas: null },
    5:  { nome: "Deserto",                  corChao: "rgba(110,85,40,0.28)", particulas: null },
    6:  { nome: "Planeta Destruído",        corChao: "rgba(50,50,55,0.28)",  particulas: null },
    7:  { nome: "Mundo Mágico",             corChao: "rgba(75,40,105,0.28)", particulas: null },
    8:  { nome: "Sobrenatural",             corChao: "rgba(35,35,65,0.28)",  particulas: null },
    9:  { nome: "Liminar/Estranho",         corChao: "rgba(85,80,60,0.28)",  particulas: null },
    10: { nome: "Arena Final",              corChao: "rgba(65,20,20,0.28)",  particulas: null }
  };

  function obterTema(bossId) {
    return TEMAS[Number(bossId)] || null;
  }

  // ---- Partículas leves (só "folhas", usadas hoje pelo boss 1 / Arlan) ----
  const MAX_PARTICULAS = 10; // teto pequeno de propósito (item 17 — desempenho em celular)
  let particulas = [];
  let temaAtivoId = null;

  function iniciar(bossId, worldW, worldH) {
    temaAtivoId = Number(bossId);
    particulas = [];
    const tema = obterTema(temaAtivoId);
    if (tema && tema.particulas === "folhas") {
      for (let i = 0; i < MAX_PARTICULAS; i++) {
        particulas.push({
          x: Math.random() * worldW,
          y: Math.random() * worldH * 0.55,
          vy: 0.22 + Math.random() * 0.30,
          vx: (Math.random() - 0.5) * 0.35,
          fase: Math.random() * Math.PI * 2,
          tamanho: 5 + Math.random() * 4
        });
      }
    }
  }

  function atualizar(dt60, worldW, worldH) {
    if (!particulas.length || dt60 <= 0) return;
    particulas.forEach(function (p) {
      p.fase += 0.03 * dt60;
      p.x += (p.vx + Math.sin(p.fase) * 0.3) * dt60;
      p.y += p.vy * dt60;
      if (p.y > worldH * 0.65) { p.y = -10; p.x = Math.random() * worldW; }
      if (p.x < -20) p.x = worldW + 20;
      if (p.x > worldW + 20) p.x = -20;
    });
  }

  function desenhar(ctx, worldW, worldH) {
    const tema = obterTema(temaAtivoId);
    if (!tema) return;

    // Tingimento leve do chão — um único fillRect por cima do gradiente que
    // batalha.js já desenha, sem substituir nada existente.
    ctx.save();
    ctx.fillStyle = tema.corChao;
    ctx.fillRect(0, worldH * 0.62, worldW, worldH * 0.38);
    ctx.restore();

    if (particulas.length) {
      ctx.save();
      ctx.fillStyle = "rgba(130,205,100,0.55)";
      particulas.forEach(function (p) {
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.tamanho, p.tamanho * 0.6, p.fase, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }
  }

  window.AmbienteBatalha = {
    obterTema: obterTema,
    iniciar: iniciar,
    atualizar: atualizar,
    desenhar: desenhar
  };
})();
