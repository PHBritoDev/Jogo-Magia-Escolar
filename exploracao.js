// ===== ETAPA 3: FUNDAÇÃO DO MUNDO EXPLORÁVEL 2.5D =====
// Módulo separado do combate (batalha.js). Não importa nem depende de nada de
// batalha.js/fisicaBatalha.js — só reaproveita o MESMO PADRÃO (câmera com
// centro+zoom suavizados e limitados, corpo com posição/velocidade) pra não
// criar dois jeitos diferentes de resolver o mesmo problema.
//
// Combate continua 100% intacto: nenhuma variável, função ou elemento daqui
// tem o mesmo nome/id do que já existe em batalha.js.

(function () {
  "use strict";

  // ---------------------------------------------------------------------
  // 1) MUNDO — dimensões e estado do jogador (worldX/worldY/velocidade/direção/chão)
  // ---------------------------------------------------------------------
  const WORLD_W = 3000;
  const WORLD_H = 1600;
  const MARGEM_MUNDO = 140;

  const jogadorExp = {
    worldX: WORLD_W * 0.5,
    worldY: WORLD_H * 0.6,
    velX: 0,
    velY: 0,
    direcao: "baixo", // "cima" | "baixo" | "esquerda" | "direita" — base p/ sprites futuros por direção
    noChao: true // reservado: exploração hoje é top-down (sem gravidade), mas o campo já existe
    // pra permitir, no futuro, reaproveitar o corpo de física da Etapa 1 (salto/queda) sem mudar
    // a forma como o resto do módulo lê a posição do jogador.
  };

  const VEL_MAX = 3.1;
  const ACELERACAO = 0.55;

  // ETAPA 5 (item 2/5) — escala visual moderada por profundidade. worldY aqui
  // representa profundidade no CHÃO da exploração (NUNCA a física de salto/Y
  // vertical da batalha — são módulos e conceitos totalmente separados).
  // Mapeia o Y do mundo (limitesMundoExp.minY..maxY) pra uma escala pequena,
  // sem alterar o tamanho original de nenhum asset (só a renderização).
  const ESCALA_PROFUNDIDADE_MIN = 0.85;
  const ESCALA_PROFUNDIDADE_MAX = 1.12;
  function escalaPorProfundidade(y) {
    const t = clamp((y - limitesMundoExp.minY) / (limitesMundoExp.maxY - limitesMundoExp.minY), 0, 1);
    return ESCALA_PROFUNDIDADE_MIN + (ESCALA_PROFUNDIDADE_MAX - ESCALA_PROFUNDIDADE_MIN) * t;
  }

  let limitesMundoExp = {
    minX: MARGEM_MUNDO, minY: MARGEM_MUNDO,
    maxX: WORLD_W - MARGEM_MUNDO, maxY: WORLD_H - MARGEM_MUNDO
  };

  function clamp(v, mi, ma) { return Math.max(mi, Math.min(ma, v)); }

  // ---------------------------------------------------------------------
  // ETAPA 8 (item 15) — CONFIGURAÇÃO DE TEMA VISUAL, reutilizável por
  // universo. Não duplica código: hoje só "floresta_magica" existe (Universo
  // 1); universos futuros poderão reaproveitar a MESMA função de desenho do
  // fundo/clima só trocando qual objeto de tema é lido. Nenhum outro módulo
  // ainda liga isso a `universos.js` — é só a estrutura, como pedido.
  // ---------------------------------------------------------------------
  const TEMAS_VISUAIS = {
    floresta_magica: {
      ceu: ["#12294f", "#182a52", "#0c1730"],
      chao: ["rgba(10,18,10,0)", "rgba(6,14,8,0.55)"],
      corParticulaClima: "rgba(225,235,200,0.45)",
      corParticulaMagica: "rgba(150,225,255,0.55)"
    }
  };
  const temaAtual = TEMAS_VISUAIS.floresta_magica;

  // ---------------------------------------------------------------------
  // 2) PONTOS DE INTERESSE — estrutura reutilizável (item 8 do roteiro)
  // ---------------------------------------------------------------------
  // Cada ponto: posição no mundo, raio de interação, nome, tipo e ação ao interagir.
  // A área inicial usa só isso como "decoração com propósito" — sem assets novos.
  const pontosDeInteresse = [
    {
      id: "escola", nome: "Escola de Magia", tipo: "escola",
      // ETAPA 11 (item 1/5) — a Escola agora abre o interior de verdade em vez
      // do toast de "em construção". Usa a mesma arquitetura reutilizável
      // (entrarEmInterior) definida na seção 2.6 logo abaixo; a função só
      // existe nesse ponto do arquivo em tempo de EXECUÇÃO (clique), não de
      // parse, então a referência tardia é segura.
      promptTexto: "Entrar na Escola",
      x: WORLD_W * 0.28, y: WORLD_H * 0.45, raio: 110,
      aoInteragir: function () {
        if (typeof entrarEmInterior === "function") entrarEmInterior(CONFIG_INTERIOR_ESCOLA);
      }
    },
    {
      id: "loja", nome: "Loja", tipo: "loja",
      // ETAPA 12 (item 2/5) — a Loja exterior continua existindo; agora ela
      // abre o INTERIOR (arquitetura da Etapa 11), e é de dentro do interior
      // que o sistema de loja já existente (show("tela-loja")) é aberto —
      // ver pontosInteriorLoja mais abaixo. Nada do sistema de loja/compra/
      // inventário/moedas foi recriado.
      promptTexto: "Entrar na Loja",
      x: WORLD_W * 0.5, y: WORLD_H * 0.72, raio: 100,
      aoInteragir: function () {
        if (typeof entrarEmInterior === "function") entrarEmInterior(CONFIG_INTERIOR_LOJA);
      }
    },
    {
      id: "arena", nome: "Arena", tipo: "arena",
      // ETAPA 12 (item 7/9) — mesma ideia da Loja: a Arena exterior agora
      // abre o interior; a seleção de bosses já existente (show("tela-
      // bosses")) é aberta de dentro dele — ver pontosInteriorArena. Nenhuma
      // segunda seleção de boss/sistema de batalha foi criada.
      promptTexto: "Entrar na Arena",
      x: WORLD_W * 0.74, y: WORLD_H * 0.45, raio: 110,
      aoInteragir: function () {
        if (typeof entrarEmInterior === "function") entrarEmInterior(CONFIG_INTERIOR_ARENA);
      }
    }
  ];
  let poiProximo = null;

  // ---------------------------------------------------------------------
  // 2.1) ETAPA 4 — CONSTRUÇÕES FÍSICAS DOS POIs (item 2/3/4 do roteiro)
  // ---------------------------------------------------------------------
  // Cada construção tem posição/tamanho VISUAL (o prédio na tela) e uma caixa
  // de COLISÃO própria, menor e centrada na base do prédio — assim o jogador
  // esbarra na "parede", mas o raio de interação do POI (já existente acima,
  // maior que a colisão) continua disparando antes de encostar de vez, exatamente
  // como numa entrada de verdade. Não duplica pontosDeInteresse: só referencia
  // o poiId pra reaproveitar raio/nome/aoInteragir já definidos.
  const construcoesMundo = [
    {
      poiId: "escola", w: 260, h: 210, corPrincipal: "#4b3ac9", corTelhado: "#241b6e",
      emblema: "🏫", legenda: "Escola de Magia"
    },
    {
      poiId: "loja", w: 230, h: 175, corPrincipal: "#caa136", corTelhado: "#7a5a12",
      emblema: "🏪", legenda: "Loja"
    },
    {
      poiId: "arena", w: 270, h: 220, corPrincipal: "#b23a3a", corTelhado: "#6e1f1f",
      emblema: "⚔️", legenda: "Arena"
    }
  ].map(function (c) {
    const poi = pontosDeInteresse.filter(function (p) { return p.id === c.poiId; })[0];
    c.x = poi.x; c.y = poi.y;
    // Colisão = "pegada" do prédio no chão: mais baixa e mais estreita que o
    // desenho inteiro (que inclui telhado), então o telhado pode "passar" um
    // pouco visualmente sem travar o jogador num raio maior do que deveria.
    c.colisao = {
      x: c.x, y: c.y + c.h * 0.30,
      hw: c.w * 0.34, hh: c.h * 0.20
    };
    return c;
  });

  // ---------------------------------------------------------------------
  // 2.2) ETAPA 4 — CAMINHOS (item 5): ligam Escola → Praça central → Loja/Arena.
  // ---------------------------------------------------------------------
  const centroPraca = { x: WORLD_W * 0.5, y: WORLD_H * 0.55 };
  const segmentosCaminho = [
    [{ x: construcoesMundo[0].x, y: construcoesMundo[0].y + construcoesMundo[0].h * 0.35 }, centroPraca],
    [centroPraca, { x: construcoesMundo[1].x, y: construcoesMundo[1].y - construcoesMundo[1].h * 0.1 }],
    [centroPraca, { x: construcoesMundo[2].x, y: construcoesMundo[2].y + construcoesMundo[2].h * 0.35 }]
  ];

  // ETAPA 9 (item 5/6) — pequeno trecho ligando o spawn (posição inicial do
  // jogador, ver `jogadorExp` mais abaixo) até a praça, pra já nascer "em
  // cima" do caminho principal em vez de num vazio.
  const SPAWN_X = WORLD_W * 0.5, SPAWN_Y = WORLD_H * 0.6;
  segmentosCaminho.push([{ x: SPAWN_X, y: SPAWN_Y }, centroPraca]);

  // ETAPA 9 (item 7) — caminhos SECUNDÁRIOS, mais estreitos e discretos:
  // da praça até cada NPC, e até os 2 pequenos segredos visuais da Etapa 8.
  // Só visual (sem colisão nenhuma, item 8) — servem de guia, não de parede.
  // Preenchidos logo depois de `npcsMundo` ser definido, mais abaixo, porque
  // dependem das posições dos NPCs (evita duplicar coordenadas aqui).
  const segmentosSecundarios = [];

  // ---------------------------------------------------------------------
  // 2.3) ETAPA 4 — DECORAÇÃO/OBSTÁCULOS DE AMBIENTE (itens 6 e 7).
  // ---------------------------------------------------------------------
  // Posições fixas (determinísticas — não é aleatório a cada carregamento) e
  // afastadas dos prédios/caminhos. "tipo" só serve pro visual (cor/emoji de
  // fallback); "colide" define se vira obstáculo físico ou é só decorativo.
  const decoracaoMundo = [
    { tipo: "arvore", x: WORLD_W * 0.12, y: WORLD_H * 0.30, raio: 34, colide: true },
    { tipo: "arvore", x: WORLD_W * 0.10, y: WORLD_H * 0.62, raio: 34, colide: true },
    { tipo: "arvore", x: WORLD_W * 0.40, y: WORLD_H * 0.22, raio: 30, colide: true },
    { tipo: "arvore", x: WORLD_W * 0.62, y: WORLD_H * 0.20, raio: 30, colide: true },
    { tipo: "arvore", x: WORLD_W * 0.88, y: WORLD_H * 0.30, raio: 34, colide: true },
    { tipo: "arvore", x: WORLD_W * 0.90, y: WORLD_H * 0.63, raio: 34, colide: true },
    { tipo: "arvore", x: WORLD_W * 0.35, y: WORLD_H * 0.85, raio: 30, colide: true },
    { tipo: "arvore", x: WORLD_W * 0.65, y: WORLD_H * 0.85, raio: 30, colide: true },
    { tipo: "pedra", x: WORLD_W * 0.20, y: WORLD_H * 0.50, raio: 22, colide: true },
    { tipo: "pedra", x: WORLD_W * 0.80, y: WORLD_H * 0.50, raio: 22, colide: true },
    { tipo: "pedra", x: centroPraca.x - 90, y: centroPraca.y + 60, raio: 16, colide: false },
    { tipo: "poste", x: centroPraca.x - 60, y: centroPraca.y - 40, raio: 10, colide: true },
    { tipo: "poste", x: centroPraca.x + 60, y: centroPraca.y - 40, raio: 10, colide: true },
    { tipo: "banco", x: centroPraca.x, y: centroPraca.y + 40, raio: 26, colide: false },
    { tipo: "arbusto", x: construcoesMundo[0].x + 160, y: construcoesMundo[0].y + 40, raio: 18, colide: false },
    { tipo: "arbusto", x: construcoesMundo[1].x - 150, y: construcoesMundo[1].y + 20, raio: 18, colide: false },
    { tipo: "arbusto", x: construcoesMundo[2].x - 170, y: construcoesMundo[2].y + 40, raio: 18, colide: false },

    // ETAPA 8 (item 2/9) — pontos de interesse visuais pequenos, "plantados"
    // perto de elementos que já existem (árvore grande + pedras próximas +
    // grupo de flores), em vez de espalhados aleatoriamente pelo mapa.
    { tipo: "flor", x: WORLD_W * 0.125, y: WORLD_H * 0.335, raio: 14, colide: false },
    { tipo: "flor", x: WORLD_W * 0.145, y: WORLD_H * 0.315, raio: 12, colide: false },
    { tipo: "grama", x: WORLD_W * 0.105, y: WORLD_H * 0.345, raio: 16, colide: false },
    { tipo: "grama", x: WORLD_W * 0.395, y: WORLD_H * 0.255, raio: 16, colide: false },
    { tipo: "folha", x: WORLD_W * 0.34, y: WORLD_H * 0.24, raio: 10, colide: false },
    { tipo: "grama", x: WORLD_W * 0.885, y: WORLD_H * 0.335, raio: 16, colide: false },
    { tipo: "flor", x: WORLD_W * 0.905, y: WORLD_H * 0.34, raio: 12, colide: false },
    { tipo: "grama", x: centroPraca.x + 110, y: centroPraca.y + 70, raio: 14, colide: false },
    { tipo: "folha", x: centroPraca.x - 40, y: centroPraca.y - 90, raio: 10, colide: false },
    { tipo: "grama", x: construcoesMundo[1].x + 130, y: construcoesMundo[1].y + 30, raio: 14, colide: false },
    { tipo: "flor", x: construcoesMundo[1].x + 155, y: construcoesMundo[1].y + 15, raio: 12, colide: false },

    // ETAPA 9 (item 5/10) — pequena textura ao longo dos caminhos (pedrinhas
    // e folhas nas bordas) + 1 detalhe a mais na praça, pra reforçar a
    // leitura "isso é um caminho de terra", sem criar objetos novos de tipo.
    { tipo: "pedra", x: centroPraca.x - 250, y: centroPraca.y + 20, raio: 10, colide: false },
    { tipo: "folha", x: centroPraca.x - 180, y: centroPraca.y + 34, raio: 9, colide: false },
    { tipo: "pedra", x: construcoesMundo[2].x - 220, y: construcoesMundo[2].y + 20, raio: 10, colide: false },
    { tipo: "folha", x: construcoesMundo[1].x - 200, y: construcoesMundo[1].y + 46, raio: 9, colide: false },
    { tipo: "arvore", x: centroPraca.x + 210, y: centroPraca.y - 150, raio: 26, colide: true },

    // ETAPA 8 (item 14) — "pequenos segredos visuais": decoração isolada,
    // fora do caminho principal, sem interação nenhuma por enquanto (só
    // visual, como pedido). Poderão virar POI/missão/coleta no futuro.
    { tipo: "pedra-magica", x: WORLD_W * 0.30, y: WORLD_H * 0.90, raio: 20, colide: false },
    { tipo: "clareira", x: WORLD_W * 0.94, y: WORLD_H * 0.86, raio: 46, colide: false },

    // ETAPA 13 (item 7/8/9) — pequenos detalhes intencionais perto de cada
    // prédio, reforçando a identidade visual própria de cada um sem exigir
    // asset novo nenhum (mesmo padrão de decoração já existente: emoji +
    // sombra + Y-sort, só objetos NOVOS, nenhuma lógica nova). Posicionados
    // perto da entrada de cada prédio, longe do NPC/decor já existentes ali.
    { tipo: "runa-escola", x: construcoesMundo[0].x - 95, y: construcoesMundo[0].y + 100, raio: 16, colide: false },
    { tipo: "runa-escola", x: construcoesMundo[0].x + 40, y: construcoesMundo[0].y + 118, raio: 14, colide: false },
    { tipo: "caixa-loja", x: construcoesMundo[1].x - 60, y: construcoesMundo[1].y + 92, raio: 18, colide: false },
    { tipo: "frasco-loja", x: construcoesMundo[1].x + 70, y: construcoesMundo[1].y + 96, raio: 14, colide: false },
    { tipo: "bandeira-arena", x: construcoesMundo[2].x - 150, y: construcoesMundo[2].y + 30, raio: 20, colide: false },
    { tipo: "bandeira-arena", x: construcoesMundo[2].x + 150, y: construcoesMundo[2].y + 30, raio: 20, colide: false },
    { tipo: "tocha-arena", x: construcoesMundo[2].x - 95, y: construcoesMundo[2].y + 100, raio: 16, colide: false }
  ];

  // ---------------------------------------------------------------------
  // 2.4) ETAPA 4 — NPCs decorativos (item 13). Estrutura pronta pra ganhar
  // diálogo/quest futuramente; hoje só existem, dão vida ao mundo e já tem
  // área de interação reservada (raioInteracao) mesmo sem ação nenhuma ainda.
  // ---------------------------------------------------------------------
  // Campos missionId/dialogo* ficam null por padrão (nenhum comportamento novo
  // agora) — só existem pra permitir que, futuramente, um NPC aponte pra uma
  // missão já existente no sistema de missões (menu.js), sem criar um sistema
  // de missões paralelo. Ver window.ArcaneUniversos (universos.js).
  // ETAPA 7 (item 4/5) — cada NPC agora aponta pra uma missão REAL do array
  // `missions` (menu.js), pelo id. Nenhuma missão nova foi criada; isto só
  // conecta um NPC já existente a uma entrada que já existia antes.
  const npcsMundo = [
    { id: "npc1", nome: "Aprendiz", emoji: "🧙", x: construcoesMundo[0].x + 90, y: construcoesMundo[0].y + 70, raioInteracao: 70,
      missionId: "tutorial-spin",
      dialogoInicial: "Aprendiz: Ainda não girou o Banner hoje? Vá até lá e tente sua sorte!",
      dialogoEmProgresso: "Aprendiz: Continue tentando — o Banner pode te dar algo bom.",
      dialogoConcluido: "Aprendiz: Muito bem! Já girou o Banner. Volte pra pegar sua recompensa." },
    { id: "npc2", nome: "Mercador", emoji: "🧑‍🌾", x: construcoesMundo[1].x + 100, y: construcoesMundo[1].y + 10, raioInteracao: 70,
      missionId: "battleVanessa",
      dialogoInicial: "Mercador: Um duelista de verdade precisa entrar numa batalha. Vá até a Arena!",
      dialogoEmProgresso: "Mercador: A Arena está logo ali. Não tenha medo.",
      dialogoConcluido: "Mercador: Você lutou! Isso merece uma recompensa." },
    { id: "npc3", nome: "Guarda", emoji: "💂", x: construcoesMundo[2].x - 110, y: construcoesMundo[2].y + 70, raioInteracao: 70,
      missionId: "tutorial-equip",
      dialogoInicial: "Guarda: Só deixo passar quem já provou valor derrotando o Arlan.",
      dialogoEmProgresso: "Guarda: Ainda não? A Arena é logo ali, vá com cuidado.",
      dialogoConcluido: "Guarda: Você derrotou o Arlan! Impressionante. Vá receber sua recompensa." }
  ];

  // ETAPA 9 (item 7) — agora que `npcsMundo` existe, liga cada NPC a um ponto
  // próximo do caminho principal (a praça é o ponto comum mais simples e
  // sempre visível). Os segredos visuais da Etapa 8 (pedra-mágica/clareira)
  // também recebem uma trilha bem discreta — mesma ideia, sem colisão.
  segmentosSecundarios.push(
    [centroPraca, { x: npcsMundo[0].x, y: npcsMundo[0].y + 40 }],
    [centroPraca, { x: npcsMundo[1].x, y: npcsMundo[1].y + 40 }],
    [centroPraca, { x: npcsMundo[2].x, y: npcsMundo[2].y + 40 }],
    [centroPraca, { x: WORLD_W * 0.30, y: WORLD_H * 0.90 }],
    [centroPraca, { x: WORLD_W * 0.94, y: WORLD_H * 0.86 }]
  );

  // ---------------------------------------------------------------------
  // 2.5) ETAPA 4 — COLISÃO GENÉRICA (item 7): lista única reaproveitada por
  // construções + decoração marcada como "colide". Formato {x,y,hw,hh,type}
  // (hw/hh = metade da largura/altura, mais simples de testar em AABB).
  // ---------------------------------------------------------------------
  const obstaculosMundo = [];
  construcoesMundo.forEach(function (c) {
    obstaculosMundo.push({ x: c.colisao.x, y: c.colisao.y, hw: c.colisao.hw, hh: c.colisao.hh, type: "construcao" });
  });
  // ETAPA 5 (item 5/6) — "ground point": d.x/d.y É o ponto onde o objeto toca
  // o chão (usado tanto pro Y-sort quanto pra base da colisão); o desenho
  // (visual) pode ser bem maior que isso, como uma árvore alta com hitbox só
  // no tronco. Fatores por tipo deixam isso explícito e fácil de ajustar.
  const FATORES_HITBOX_POR_TIPO = {
    arvore: { hw: 0.20, hh: 0.22, offsetY: 0.05 }, // hitbox estreita = passa perto da copa
    pedra: { hw: 0.62, hh: 0.5, offsetY: 0.3 },
    poste: { hw: 0.62, hh: 0.5, offsetY: 0.3 }
  };
  decoracaoMundo.forEach(function (d) {
    if (!d.colide) return;
    const fator = FATORES_HITBOX_POR_TIPO[d.tipo] || { hw: 0.62, hh: 0.5, offsetY: 0.3 };
    obstaculosMundo.push({
      x: d.x, y: d.y + d.raio * fator.offsetY,
      hw: d.raio * fator.hw, hh: d.raio * fator.hh, type: d.tipo
    });
  });

  // Testa um círculo (jogador, raio RAIO_COLISAO_JOGADOR) contra um AABB.
  const RAIO_COLISAO_JOGADOR = 26;
  function circuloColideComCaixa(px, py, raio, caixa) {
    const dx = clamp(px, caixa.x - caixa.hw, caixa.x + caixa.hw) - px;
    const dy = clamp(py, caixa.y - caixa.hh, caixa.y + caixa.hh) - py;
    return (dx * dx + dy * dy) < (raio * raio);
  }

  // ---------------------------------------------------------------------
  // 2.6) ETAPA 11 — ARQUITETURA REUTILIZÁVEL DE INTERIORES (Escola agora;
  //      Loja/Arena no futuro reaproveitando as MESMAS duas funções).
  // ---------------------------------------------------------------------
  // Ideia central: um "interior" NÃO é um mapa/canvas/câmera novos — é só
  // uma pequena região dentro do MESMO plano de coordenadas WORLD_W x
  // WORLD_H que a exploração já usa, cercada por "paredes" (obstáculos no
  // mesmo formato {x,y,hw,hh,type} de sempre). Entrar/sair só troca QUAIS
  // obstáculos e QUAIS pontos de interesse estão "ativos" (colideComAlgum-
  // Obstaculo e atualizarInteracaoProxima passam a ler obstaculosAtivos/
  // pontosAtivos em vez das constantes do mundo exterior) e mostra/esconde
  // a camada certa via uma classe CSS em #area-exploracao — câmera,
  // colisão circular, Y-sort, escala por profundidade, sombra, joystick,
  // teclado e o próprio loop de exploração continuam sendo exatamente os
  // mesmos, sem nenhuma duplicação.
  let obstaculosAtivos = obstaculosMundo;
  let pontosAtivos = pontosDeInteresse;
  let interiorAtivo = null;       // config do interior atual, ou null (mundo exterior)
  let posRetornoExterior = null;  // {x,y} no exterior, pra voltar exatamente onde entrou

  // Colocado no CENTRO do mundo (longe de qualquer borda) só pra a câmera
  // (que já clampa nos limites do mundo, sem mudança nenhuma aqui) nunca
  // precisar "descolar" do jogador por falta de espaço. Como o mundo
  // exterior fica todo escondido (.dentro-interior) enquanto o jogador está
  // dentro, sobrepor visualmente a praça não tem nenhum efeito — nada do
  // exterior é desenhado por cima nem colide nesse momento.
  const INTERIOR_W = 380, INTERIOR_H = 260;
  const INTERIOR_ORIGEM_X = WORLD_W / 2 - INTERIOR_W / 2;
  const INTERIOR_ORIGEM_Y = WORLD_H / 2 - INTERIOR_H / 2;
  const INTERIOR_PORTA_X = INTERIOR_ORIGEM_X + INTERIOR_W * 0.5;
  const INTERIOR_PORTA_Y = INTERIOR_ORIGEM_Y + INTERIOR_H;
  const PAREDE_ESP = 24;

  function paredeRet(x, y, w, h) {
    return { x: x, y: y, hw: w / 2, hh: h / 2, type: "parede" };
  }

  // Colisão do interior (item 3): perímetro fechado, com um vão central na
  // parede de baixo pra porta de saída, + 2 obstáculos de mobília grande
  // (mesas do professor) e 1 pro quadro/estante — só o mínimo necessário
  // pra não atravessar paredes/móveis, como pedido.
  const obstaculosInteriorEscola = [
    paredeRet(INTERIOR_ORIGEM_X + INTERIOR_W / 2, INTERIOR_ORIGEM_Y, INTERIOR_W, PAREDE_ESP),
    paredeRet(INTERIOR_ORIGEM_X, INTERIOR_ORIGEM_Y + INTERIOR_H / 2, PAREDE_ESP, INTERIOR_H),
    paredeRet(INTERIOR_ORIGEM_X + INTERIOR_W, INTERIOR_ORIGEM_Y + INTERIOR_H / 2, PAREDE_ESP, INTERIOR_H),
    paredeRet(INTERIOR_ORIGEM_X + INTERIOR_W * 0.20, INTERIOR_ORIGEM_Y + INTERIOR_H, INTERIOR_W * 0.40, PAREDE_ESP),
    paredeRet(INTERIOR_ORIGEM_X + INTERIOR_W * 0.80, INTERIOR_ORIGEM_Y + INTERIOR_H, INTERIOR_W * 0.40, PAREDE_ESP),
    paredeRet(INTERIOR_ORIGEM_X + INTERIOR_W * 0.28, INTERIOR_ORIGEM_Y + INTERIOR_H * 0.46, 66, 34),
    paredeRet(INTERIOR_ORIGEM_X + INTERIOR_W * 0.72, INTERIOR_ORIGEM_Y + INTERIOR_H * 0.46, 66, 34),
    paredeRet(INTERIOR_ORIGEM_X + INTERIOR_W * 0.50, INTERIOR_ORIGEM_Y + INTERIOR_H * 0.14, 96, 20)
  ];

  // Decoração visual do interior (item 2/8) — desenhada uma única vez em
  // prepararInteriorEscola(), reaproveitando exatamente o mesmo padrão de
  // divs posicionados em coordenadas de mundo que decoracaoMundo/npcsMundo
  // já usam (mesmo z-index = Math.floor(y), pro Y-sort continuar valendo
  // certinho contra o jogador sem nenhum código novo de ordenação).
  const decorInteriorEscola = [
    { emoji: "🪑", x: INTERIOR_ORIGEM_X + INTERIOR_W * 0.28, y: INTERIOR_ORIGEM_Y + INTERIOR_H * 0.46, tamanho: 44 },
    { emoji: "🪑", x: INTERIOR_ORIGEM_X + INTERIOR_W * 0.72, y: INTERIOR_ORIGEM_Y + INTERIOR_H * 0.46, tamanho: 44 },
    { emoji: "📖", x: INTERIOR_ORIGEM_X + INTERIOR_W * 0.50, y: INTERIOR_ORIGEM_Y + INTERIOR_H * 0.14, tamanho: 40 },
    { emoji: "📚", x: INTERIOR_ORIGEM_X + INTERIOR_W * 0.10, y: INTERIOR_ORIGEM_Y + INTERIOR_H * 0.18, tamanho: 38 },
    // Área central reservada (item 8/9): hoje só um marcador visual discreto
    // de "aqui pode ir um professor/desafio no futuro" — nenhum NPC/lógica
    // nova é criada agora, é só a estrutura pedida no roteiro.
    { emoji: "✨", x: INTERIOR_ORIGEM_X + INTERIOR_W * 0.50, y: INTERIOR_ORIGEM_Y + INTERIOR_H * 0.60, tamanho: 30 }
  ];

  const pontosInteriorEscola = [
    {
      id: "sair-escola", nome: "Saída", tipo: "saida",
      promptTexto: "Sair da Escola",
      x: INTERIOR_PORTA_X, y: INTERIOR_PORTA_Y - 14, raio: 95,
      aoInteragir: function () { sairDoInterior(); }
    }
  ];

  const CONFIG_INTERIOR_ESCOLA = {
    tipo: "escola",
    obstaculos: obstaculosInteriorEscola,
    pois: pontosInteriorEscola,
    spawn: { x: INTERIOR_ORIGEM_X + INTERIOR_W * 0.5, y: INTERIOR_ORIGEM_Y + INTERIOR_H * 0.78 }
  };

  // Cria (uma única vez) o wrapper DOM do interior da Escola dentro da MESMA
  // camada de mundo já existente (#camada-mundo-exploracao) — nenhum canvas
  // ou container novo. O wrapper começa com display:none inline; entrar/sair
  // só alterna esse display, sem recriar nada a cada vez.
  function prepararInteriorEscola() {
    const camada = document.getElementById("camada-mundo-exploracao");
    if (!camada || document.getElementById("interior-escola-wrapper")) return;

    const wrapper = document.createElement("div");
    wrapper.id = "interior-escola-wrapper";
    wrapper.style.position = "absolute";
    wrapper.style.left = "0";
    wrapper.style.top = "0";
    wrapper.style.width = WORLD_W + "px";
    wrapper.style.height = WORLD_H + "px";
    wrapper.style.pointerEvents = "none";
    wrapper.style.display = "none";

    const piso = document.createElement("div");
    piso.className = "interior-piso";
    piso.style.position = "absolute";
    piso.style.left = INTERIOR_ORIGEM_X + "px";
    piso.style.top = INTERIOR_ORIGEM_Y + "px";
    piso.style.width = INTERIOR_W + "px";
    piso.style.height = INTERIOR_H + "px";
    piso.style.zIndex = "0";
    wrapper.appendChild(piso);

    // Vão da porta desenhado por cima do piso, no mesmo lugar do vão físico
    // das paredes (obstaculosInteriorEscola) — só visual, guia o olho.
    const porta = document.createElement("div");
    porta.className = "interior-porta-marca";
    porta.style.position = "absolute";
    porta.style.left = (INTERIOR_PORTA_X - INTERIOR_W * 0.20) + "px";
    porta.style.top = (INTERIOR_PORTA_Y - 18) + "px";
    porta.style.width = (INTERIOR_W * 0.40) + "px";
    porta.style.height = "28px";
    porta.style.zIndex = "1";
    wrapper.appendChild(porta);

    obstaculosInteriorEscola.forEach(function (parede) {
      if (parede.type !== "parede") return;
      const el = document.createElement("div");
      el.className = "interior-parede";
      el.style.position = "absolute";
      el.style.left = (parede.x - parede.hw) + "px";
      el.style.top = (parede.y - parede.hh) + "px";
      el.style.width = (parede.hw * 2) + "px";
      el.style.height = (parede.hh * 2) + "px";
      el.style.zIndex = String(Math.floor(parede.y) + 2);
      wrapper.appendChild(el);
    });

    decorInteriorEscola.forEach(function (d) {
      const el = document.createElement("div");
      el.className = "interior-objeto";
      el.style.position = "absolute";
      el.style.left = (d.x - d.tamanho / 2) + "px";
      el.style.top = (d.y - d.tamanho / 2) + "px";
      el.style.width = d.tamanho + "px";
      el.style.height = d.tamanho + "px";
      el.style.fontSize = Math.round(d.tamanho * 0.62) + "px";
      el.style.zIndex = String(Math.floor(d.y) + 2);
      el.textContent = d.emoji;
      wrapper.appendChild(el);
    });

    camada.appendChild(wrapper);
  }

  // ---------------------------------------------------------------------
  // ETAPA 12 — LOJA e ARENA reaproveitando a MESMA arquitetura da Etapa 11.
  // ---------------------------------------------------------------------
  // A Escola (acima) mantém sua função própria (prepararInteriorEscola),
  // sem nenhuma alteração. Loja e Arena, por serem duas novas, compartilham
  // UM builder genérico (criarWrapperInterior) e UM helper de paredes com
  // porta (paredesComPortaEmbaixo) — assim a implementação NÃO é copiada
  // três vezes, só configurada duas vezes com dados diferentes.
  function paredesComPortaEmbaixo(origemX, origemY, w, h, esp) {
    return [
      paredeRet(origemX + w / 2, origemY, w, esp),
      paredeRet(origemX, origemY + h / 2, esp, h),
      paredeRet(origemX + w, origemY + h / 2, esp, h),
      paredeRet(origemX + w * 0.20, origemY + h, w * 0.40, esp),
      paredeRet(origemX + w * 0.80, origemY + h, w * 0.40, esp)
    ];
  }

  // Builder genérico do wrapper DOM de um interior (piso + marca de porta +
  // paredes + objetos decorativos), no mesmo padrão visual/posicional que
  // prepararInteriorEscola já usa (mesma camada, mesmo esquema de z-index
  // por Y, mesmo display:none inicial). `especificacao` = { origemX,
  // origemY, w, h, portaX, portaY, portaLargura, pisoClasse, paredes, decor }.
  function criarWrapperInterior(tipo, especificacao) {
    const camadaMundo = document.getElementById("camada-mundo-exploracao");
    const wrapperId = "interior-" + tipo + "-wrapper";
    if (!camadaMundo || document.getElementById(wrapperId)) return;

    const wrapper = document.createElement("div");
    wrapper.id = wrapperId;
    wrapper.style.position = "absolute";
    wrapper.style.left = "0";
    wrapper.style.top = "0";
    wrapper.style.width = WORLD_W + "px";
    wrapper.style.height = WORLD_H + "px";
    wrapper.style.pointerEvents = "none";
    wrapper.style.display = "none";

    const piso = document.createElement("div");
    piso.className = "interior-piso " + (especificacao.pisoClasse || "");
    piso.style.position = "absolute";
    piso.style.left = especificacao.origemX + "px";
    piso.style.top = especificacao.origemY + "px";
    piso.style.width = especificacao.w + "px";
    piso.style.height = especificacao.h + "px";
    piso.style.zIndex = "0";
    wrapper.appendChild(piso);

    const porta = document.createElement("div");
    porta.className = "interior-porta-marca";
    porta.style.position = "absolute";
    porta.style.left = (especificacao.portaX - especificacao.portaLargura / 2) + "px";
    porta.style.top = (especificacao.portaY - 18) + "px";
    porta.style.width = especificacao.portaLargura + "px";
    porta.style.height = "28px";
    porta.style.zIndex = "1";
    wrapper.appendChild(porta);

    (especificacao.paredes || []).forEach(function (parede) {
      const el = document.createElement("div");
      el.className = "interior-parede " + (especificacao.paredeClasse || "");
      el.style.position = "absolute";
      el.style.left = (parede.x - parede.hw) + "px";
      el.style.top = (parede.y - parede.hh) + "px";
      el.style.width = (parede.hw * 2) + "px";
      el.style.height = (parede.hh * 2) + "px";
      el.style.zIndex = String(Math.floor(parede.y) + 2);
      wrapper.appendChild(el);
    });

    (especificacao.decor || []).forEach(function (d) {
      const el = document.createElement("div");
      el.className = "interior-objeto " + (d.classeExtra || "");
      el.style.position = "absolute";
      el.style.left = (d.x - d.tamanho / 2) + "px";
      el.style.top = (d.y - d.tamanho / 2) + "px";
      el.style.width = d.tamanho + "px";
      el.style.height = d.tamanho + "px";
      el.style.fontSize = Math.round(d.tamanho * 0.62) + "px";
      el.style.zIndex = String(Math.floor(d.y) + 2);
      el.textContent = d.emoji;
      wrapper.appendChild(el);
    });

    camadaMundo.appendChild(wrapper);
  }

  // ----- LOJA -----------------------------------------------------------
  // Mesmo "canto seguro" de câmera que a Escola usa (centro do mundo — some
  // por completo enquanto outro interior estiver ativo, então reaproveitar
  // as mesmas coordenadas não causa nenhuma sobreposição visual).
  const LOJA_W = 340, LOJA_H = 240, LOJA_PAREDE_ESP = 22;
  const LOJA_ORIGEM_X = WORLD_W / 2 - LOJA_W / 2;
  const LOJA_ORIGEM_Y = WORLD_H / 2 - LOJA_H / 2;
  const LOJA_PORTA_X = LOJA_ORIGEM_X + LOJA_W * 0.5;
  const LOJA_PORTA_Y = LOJA_ORIGEM_Y + LOJA_H;

  // Colisão (item 4): perímetro + balcão + 2 prateleiras. Espaço central
  // livre pro jogador andar sem parede invisível desnecessária.
  const obstaculosInteriorLoja = paredesComPortaEmbaixo(LOJA_ORIGEM_X, LOJA_ORIGEM_Y, LOJA_W, LOJA_H, LOJA_PAREDE_ESP).concat([
    paredeRet(LOJA_ORIGEM_X + LOJA_W * 0.5, LOJA_ORIGEM_Y + LOJA_H * 0.30, LOJA_W * 0.46, 26), // balcão
    paredeRet(LOJA_ORIGEM_X + LOJA_W * 0.14, LOJA_ORIGEM_Y + LOJA_H * 0.56, 26, 90),           // prateleira esquerda
    paredeRet(LOJA_ORIGEM_X + LOJA_W * 0.86, LOJA_ORIGEM_Y + LOJA_H * 0.56, 26, 90)            // prateleira direita
  ]);

  // Identidade visual da Loja (item 11): balcão, prateleiras, frascos/baús,
  // atendente reservado (decorativo, sem NPC/diálogo novo nesta etapa).
  const decorInteriorLoja = [
    { emoji: "🛒", x: LOJA_ORIGEM_X + LOJA_W * 0.5, y: LOJA_ORIGEM_Y + LOJA_H * 0.30, tamanho: 46 },
    { emoji: "📦", x: LOJA_ORIGEM_X + LOJA_W * 0.14, y: LOJA_ORIGEM_Y + LOJA_H * 0.56, tamanho: 44 },
    { emoji: "📦", x: LOJA_ORIGEM_X + LOJA_W * 0.86, y: LOJA_ORIGEM_Y + LOJA_H * 0.56, tamanho: 44 },
    { emoji: "🧪", x: LOJA_ORIGEM_X + LOJA_W * 0.30, y: LOJA_ORIGEM_Y + LOJA_H * 0.16, tamanho: 30 },
    { emoji: "🧴", x: LOJA_ORIGEM_X + LOJA_W * 0.70, y: LOJA_ORIGEM_Y + LOJA_H * 0.16, tamanho: 30 },
    // Atendente reservado pro futuro (item 3/5) — só decorativo por ora.
    { emoji: "🧙‍♂️", x: LOJA_ORIGEM_X + LOJA_W * 0.5, y: LOJA_ORIGEM_Y + LOJA_H * 0.42, tamanho: 42 }
  ];

  const pontosInteriorLoja = [
    {
      // ETAPA 12 (item 5) — a PONTE pro sistema de loja já existente:
      // reabre exatamente a mesma tela (show("tela-loja")) que a Loja
      // exterior já abria antes desta etapa. Nenhum inventário/compra/
      // moeda/preço/equipamento novo foi criado — tudo isso continua 100%
      // do sistema atual.
      id: "balcao-loja", nome: "Balcão da Loja", tipo: "balcao",
      promptTexto: "Abrir Loja",
      x: LOJA_ORIGEM_X + LOJA_W * 0.5, y: LOJA_ORIGEM_Y + LOJA_H * 0.38, raio: 75,
      aoInteragir: function () { if (typeof show === "function") show("tela-loja"); }
    },
    {
      id: "sair-loja", nome: "Saída", tipo: "saida",
      promptTexto: "Sair da Loja",
      x: LOJA_PORTA_X, y: LOJA_PORTA_Y - 14, raio: 90,
      aoInteragir: function () { sairDoInterior(); }
    }
  ];

  const CONFIG_INTERIOR_LOJA = {
    tipo: "loja",
    obstaculos: obstaculosInteriorLoja,
    pois: pontosInteriorLoja,
    spawn: { x: LOJA_ORIGEM_X + LOJA_W * 0.5, y: LOJA_ORIGEM_Y + LOJA_H * 0.82 }
  };

  // ----- ARENA ------------------------------------------------------------
  const ARENA_W = 420, ARENA_H = 300, ARENA_PAREDE_ESP = 24;
  const ARENA_ORIGEM_X = WORLD_W / 2 - ARENA_W / 2;
  const ARENA_ORIGEM_Y = WORLD_H / 2 - ARENA_H / 2;
  const ARENA_PORTA_X = ARENA_ORIGEM_X + ARENA_W * 0.5;
  const ARENA_PORTA_Y = ARENA_ORIGEM_Y + ARENA_H;

  // Colisão (item 4): só o perímetro — espaço aberto de treinamento no
  // centro, como pedido ("piso circular", "espaço aberto"), sem paredes
  // internas desnecessárias.
  const obstaculosInteriorArena = paredesComPortaEmbaixo(ARENA_ORIGEM_X, ARENA_ORIGEM_Y, ARENA_W, ARENA_H, ARENA_PAREDE_ESP);

  // Identidade visual da Arena (item 11): bandeiras nos cantos, tochas,
  // placa de "área de combate" — tudo só decorativo (sem colisão), reforça
  // "aqui é onde acontecem os combates" sem duplicar o piso circular real
  // da tela de batalha.
  const decorInteriorArena = [
    { emoji: "🚩", x: ARENA_ORIGEM_X + ARENA_W * 0.12, y: ARENA_ORIGEM_Y + ARENA_H * 0.18, tamanho: 34 },
    { emoji: "🚩", x: ARENA_ORIGEM_X + ARENA_W * 0.88, y: ARENA_ORIGEM_Y + ARENA_H * 0.18, tamanho: 34 },
    { emoji: "🔥", x: ARENA_ORIGEM_X + ARENA_W * 0.16, y: ARENA_ORIGEM_Y + ARENA_H * 0.60, tamanho: 30 },
    { emoji: "🔥", x: ARENA_ORIGEM_X + ARENA_W * 0.84, y: ARENA_ORIGEM_Y + ARENA_H * 0.60, tamanho: 30 },
    // Placa/área central de combate (item 8/9) — é a MESMA POI de seleção
    // de batalha (ver pontosInteriorArena), este emoji só marca o lugar.
    { emoji: "⚔️", x: ARENA_ORIGEM_X + ARENA_W * 0.5, y: ARENA_ORIGEM_Y + ARENA_H * 0.44, tamanho: 46 }
  ];

  const pontosInteriorArena = [
    {
      // ETAPA 12 (item 9) — reabre a seleção de bosses JÁ EXISTENTE
      // (show("tela-bosses")), a mesma que a Arena exterior já abria.
      // Nenhuma segunda seleção de boss, dano, HP, IA ou física foi criada
      // — batalha.js não foi tocado.
      id: "selecao-batalha", nome: "Área de Combate", tipo: "batalha",
      promptTexto: "Entrar na Seleção de Batalha",
      x: ARENA_ORIGEM_X + ARENA_W * 0.5, y: ARENA_ORIGEM_Y + ARENA_H * 0.44, raio: 90,
      aoInteragir: function () { if (typeof show === "function") show("tela-bosses"); }
    },
    {
      id: "sair-arena", nome: "Saída", tipo: "saida",
      promptTexto: "Sair da Arena",
      x: ARENA_PORTA_X, y: ARENA_PORTA_Y - 14, raio: 95,
      aoInteragir: function () { sairDoInterior(); }
    }
  ];

  const CONFIG_INTERIOR_ARENA = {
    tipo: "arena",
    obstaculos: obstaculosInteriorArena,
    pois: pontosInteriorArena,
    spawn: { x: ARENA_ORIGEM_X + ARENA_W * 0.5, y: ARENA_ORIGEM_Y + ARENA_H * 0.84 }
  };

  // Mensagem de "você entrou" por tipo de interior (usada em entrarEmInterior,
  // logo abaixo) — só texto, nenhum sistema novo de notificação.
  const MENSAGENS_ENTRADA_INTERIOR = {
    escola: "🏫 Você entrou na Escola.",
    loja: "🛍️ Você entrou na Loja.",
    arena: "⚔️ Você entrou na Arena."
  };

  // Transição curta de fade (item 6) — 1 único div translúcido, criado uma
  // vez sob #viewport-exploracao (não cria overlay novo no HTML nem mexe em
  // #modal-pause/outros overlays já existentes). Leve o bastante pra celular:
  // só opacidade via CSS transition, sem partícula/nova animação nenhuma.
  function obterOverlayTransicaoExp() {
    let overlay = document.getElementById("overlay-transicao-exploracao");
    if (overlay) return overlay;
    const viewport = document.getElementById("viewport-exploracao");
    if (!viewport) return null;
    overlay = document.createElement("div");
    overlay.id = "overlay-transicao-exploracao";
    overlay.style.position = "absolute";
    overlay.style.inset = "0";
    overlay.style.background = "#05060f";
    overlay.style.opacity = "0";
    overlay.style.pointerEvents = "none";
    overlay.style.zIndex = "50";
    overlay.style.transition = "opacity .22s ease";
    viewport.appendChild(overlay);
    return overlay;
  }

  function transicaoFadeExp(aoEscurecer) {
    const overlay = obterOverlayTransicaoExp();
    if (!overlay) { if (aoEscurecer) aoEscurecer(); return; }
    overlay.style.opacity = "1";
    setTimeout(function () {
      if (aoEscurecer) aoEscurecer();
      requestAnimationFrame(function () { overlay.style.opacity = "0"; });
    }, 210);
  }

  // entrarEmInterior(config) / sairDoInterior() — a arquitetura reutilizável
  // pedida no item 5. `config` = { tipo, obstaculos, pois, spawn }. Qualquer
  // interior futuro (Loja/Arena) só precisa montar o MESMO formato de config
  // (como CONFIG_INTERIOR_ESCOLA acima) e ter seu próprio wrapper DOM
  // (#interior-<tipo>-wrapper) — nenhuma destas duas funções muda.
  function entrarEmInterior(config) {
    if (!config || interiorAtivo) return; // já dentro de um interior: ignora
    posRetornoExterior = { x: jogadorExp.worldX, y: jogadorExp.worldY };
    transicaoFadeExp(function () {
      interiorAtivo = config;
      obstaculosAtivos = config.obstaculos;
      pontosAtivos = config.pois;

      const area = document.getElementById("area-exploracao");
      if (area) area.classList.add("dentro-interior");
      const wrapper = document.getElementById("interior-" + config.tipo + "-wrapper");
      if (wrapper) wrapper.style.display = "block";

      definirSpawnExploracao(config.spawn.x, config.spawn.y);
      atualizarInteracaoProxima();
      if (typeof mostrarDica === "function") {
        const msg = MENSAGENS_ENTRADA_INTERIOR[config.tipo] || "Você entrou.";
        mostrarDica(msg, "normal", { chave: "entrou-interior-" + config.tipo, umaVez: true, cooldownMs: 0 });
      }
    });
  }

  function sairDoInterior() {
    if (!interiorAtivo) return;
    const config = interiorAtivo;
    const retorno = posRetornoExterior;
    transicaoFadeExp(function () {
      const area = document.getElementById("area-exploracao");
      if (area) area.classList.remove("dentro-interior");
      const wrapper = document.getElementById("interior-" + config.tipo + "-wrapper");
      if (wrapper) wrapper.style.display = "none";

      interiorAtivo = null;
      obstaculosAtivos = obstaculosMundo;
      pontosAtivos = pontosDeInteresse;

      if (retorno) definirSpawnExploracao(retorno.x, retorno.y);
      posRetornoExterior = null;
      atualizarInteracaoProxima();
    });
  }
  window.entrarEmInterior = entrarEmInterior;
  window.sairDoInterior = sairDoInterior;

  // ---------------------------------------------------------------------
  // 3) CÂMERA DO MUNDO — mesmo padrão conceitual da Etapa 2 (centro + zoom,
  //    suavização, limites), instância própria e independente da câmera de
  //    combate. Compartilham a IDEIA, não o estado (evita qualquer risco pra
  //    batalha em andamento).
  // ---------------------------------------------------------------------
  const camExp = { centerX: 0, centerY: 0, zoom: 0 };
  const CAM_ZOOM = 0.92; // exploração não precisa de zoom dinâmico por distância (só 1 personagem)
  const CAM_SUAVIZACAO_PAN = 0.10;
  let ultimoFrameCamExp = 0;
  // ETAPA 5 (item 10) — leve antecipação na direção do movimento: dá um
  // pouco mais de "espaço à frente" na tela, suavizado em separado (mais
  // lento que o pan normal) e com um teto pequeno pra nunca balançar.
  let camAntecipacaoX = 0, camAntecipacaoY = 0;
  const CAM_ANTECIPACAO_MAX = 55;
  const CAM_ANTECIPACAO_SUAV = 0.05;

  function atualizarCameraExploracao(dt60) {
    const viewport = document.getElementById("viewport-exploracao");
    const area = document.getElementById("area-exploracao");
    if (!viewport || !area) return;

    const viewportW = Math.max(1, viewport.clientWidth);
    const viewportH = Math.max(1, viewport.clientHeight);

    if (!camExp.zoom) {
      camExp.centerX = jogadorExp.worldX;
      camExp.centerY = jogadorExp.worldY;
      camExp.zoom = CAM_ZOOM;
    } else {
      const velMag = Math.hypot(jogadorExp.velX, jogadorExp.velY);
      let antecipDesejadaX = 0, antecipDesejadaY = 0;
      if (velMag > 0.2) {
        antecipDesejadaX = (jogadorExp.velX / VEL_MAX) * CAM_ANTECIPACAO_MAX;
        antecipDesejadaY = (jogadorExp.velY / VEL_MAX) * CAM_ANTECIPACAO_MAX;
      }
      const alphaAntecip = 1 - Math.pow(1 - CAM_ANTECIPACAO_SUAV, dt60);
      camAntecipacaoX += (antecipDesejadaX - camAntecipacaoX) * alphaAntecip;
      camAntecipacaoY += (antecipDesejadaY - camAntecipacaoY) * alphaAntecip;

      const alpha = 1 - Math.pow(1 - CAM_SUAVIZACAO_PAN, dt60);
      camExp.centerX += (jogadorExp.worldX + camAntecipacaoX - camExp.centerX) * alpha;
      camExp.centerY += (jogadorExp.worldY + camAntecipacaoY - camExp.centerY) * alpha;
    }

    const meiaLarguraMundo = viewportW / (2 * camExp.zoom);
    const meiaAlturaMundo = viewportH / (2 * camExp.zoom);
    const centroX = meiaLarguraMundo * 2 > WORLD_W ? WORLD_W / 2 : clamp(camExp.centerX, meiaLarguraMundo, WORLD_W - meiaLarguraMundo);
    const centroY = meiaAlturaMundo * 2 > WORLD_H ? WORLD_H / 2 : clamp(camExp.centerY, meiaAlturaMundo, WORLD_H - meiaAlturaMundo);

    const offsetX = viewportW / 2 - centroX * camExp.zoom;
    const offsetY = viewportH / 2 - centroY * camExp.zoom;
    area.style.transformOrigin = "0 0";
    area.style.transform = `translate(${offsetX}px,${offsetY}px) scale(${camExp.zoom})`;

    // Parallax leve do midground (camadas do mundo, item 6): a camada de estruturas
    // se desloca um pouco menos que o mundo real, reforçando profundidade.
    const midground = document.getElementById("camada-midground-exploracao");
    if (midground) {
      const fatorParallax = 0.5;
      const dx = (centroX - WORLD_W / 2) * (1 - fatorParallax);
      const dy = (centroY - WORLD_H / 2) * (1 - fatorParallax);
      midground.style.transform = `translate(${-dx}px,${-dy}px)`;
    }
  }

  // ---------------------------------------------------------------------
  // 4) CAMADAS DO MUNDO (item 6) — background/midground/world/foreground.
  //    Preparadas aqui; a área inicial só usa placeholders simples em CSS/canvas,
  //    sem exigir assets novos.
  // ---------------------------------------------------------------------
  function desenharFundoExploracao() {
    const canvas = document.getElementById("mundo-exploracao-fundo");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, WORLD_W, WORLD_H);

    const ceu = ctx.createLinearGradient(0, 0, 0, WORLD_H);
    ceu.addColorStop(0, temaAtual.ceu[0]);
    ceu.addColorStop(0.55, temaAtual.ceu[1]);
    ceu.addColorStop(1, temaAtual.ceu[2]);
    ctx.fillStyle = ceu;
    ctx.fillRect(0, 0, WORLD_W, WORLD_H);

    // Chão visual (mesma ideia da Etapa 2): faixa inferior mais escura.
    const chaoY = WORLD_H * 0.62;
    const chao = ctx.createLinearGradient(0, chaoY, 0, WORLD_H);
    chao.addColorStop(0, temaAtual.chao[0]);
    chao.addColorStop(1, temaAtual.chao[1]);
    ctx.fillStyle = chao;
    ctx.fillRect(0, chaoY, WORLD_W, WORLD_H - chaoY);

    // ETAPA 4 (item 5) — caminhos ligando Escola/Loja/Arena pela praça central,
    // desenhados uma única vez no canvas de fundo (não custa nada por frame).
    ctx.save();
    ctx.strokeStyle = "rgba(210,190,140,0.28)";
    ctx.lineWidth = 92;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    segmentosCaminho.forEach(function (seg) {
      ctx.beginPath();
      ctx.moveTo(seg[0].x, seg[0].y);
      ctx.lineTo(seg[1].x, seg[1].y);
      ctx.stroke();
    });
    ctx.strokeStyle = "rgba(235,220,180,0.16)";
    ctx.lineWidth = 92;
    ctx.setLineDash([26, 22]);
    segmentosCaminho.forEach(function (seg) {
      ctx.beginPath();
      ctx.moveTo(seg[0].x, seg[0].y);
      ctx.lineTo(seg[1].x, seg[1].y);
      ctx.stroke();
    });
    ctx.restore();

    // ETAPA 9 (item 5/7) — caminhos SECUNDÁRIOS (praça → NPCs → segredos):
    // mais estreitos e discretos que o principal, pra guiar sem competir com
    // ele. Mesmo canvas, mesmo custo (desenhado uma única vez, não por frame).
    ctx.save();
    ctx.strokeStyle = "rgba(200,182,138,0.16)";
    ctx.lineWidth = 40;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.setLineDash([18, 16]);
    segmentosSecundarios.forEach(function (seg) {
      ctx.beginPath();
      ctx.moveTo(seg[0].x, seg[0].y);
      ctx.lineTo(seg[1].x, seg[1].y);
      ctx.stroke();
    });
    ctx.restore();

    // ETAPA 9 (item 9) — pequena área de transição visual (grama → terra) na
    // entrada de cada prédio, pra parecer que o prédio nasce do próprio chão
    // em vez de só estar "em cima" do mapa.
    ctx.save();
    construcoesMundo.forEach(function (c) {
      const entradaY = c.y + c.h * 0.30;
      const transicao = ctx.createRadialGradient(c.x, entradaY, 10, c.x, entradaY, 120);
      transicao.addColorStop(0, "rgba(220,205,160,0.30)");
      transicao.addColorStop(1, "rgba(220,205,160,0)");
      ctx.fillStyle = transicao;
      ctx.beginPath();
      ctx.ellipse(c.x, entradaY, 120, 60, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // ETAPA 13 (item 2) — pequenas manchas de terra intencionais ao longo do
    // caminho principal (não aleatórias: uma perto de cada prédio + uma na
    // praça), reforçando a transição grama→terra já existente (Etapa 9) sem
    // criar nenhum elemento DOM novo — só mais um desenho estático no MESMO
    // canvas de fundo, custo zero por frame.
    ctx.save();
    [
      { x: construcoesMundo[0].x - 20, y: construcoesMundo[0].y + 150, r: 46 },
      { x: construcoesMundo[1].x + 10, y: construcoesMundo[1].y + 130, r: 40 },
      { x: construcoesMundo[2].x - 10, y: construcoesMundo[2].y + 150, r: 46 },
      { x: centroPraca.x - 160, y: centroPraca.y + 90, r: 34 }
    ].forEach(function (mancha) {
      const grad = ctx.createRadialGradient(mancha.x, mancha.y, 2, mancha.x, mancha.y, mancha.r);
      grad.addColorStop(0, "rgba(140,105,60,0.22)");
      grad.addColorStop(1, "rgba(140,105,60,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(mancha.x, mancha.y, mancha.r, mancha.r * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // Praça central (item 14 — leitura clara de "estou aqui"/pontos ao redor).
    ctx.save();
    ctx.fillStyle = "rgba(220,205,160,0.20)";
    ctx.beginPath();
    ctx.arc(centroPraca.x, centroPraca.y, 130, 0, Math.PI * 2);
    ctx.fill();
    // ETAPA 9 (item 10) — anel interno sutil, só pra dar mais composição à
    // praça sem adicionar nenhum elemento novo (estático, sem custo por frame).
    ctx.strokeStyle = "rgba(150,225,255,0.18)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centroPraca.x, centroPraca.y, 70, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // ---------------------------------------------------------------------
  // ETAPA 7 (item 3) — clima leve (vento/folhas) pra tirar a sensação de
  // cenário morto. Desenhado num canvas próprio, em espaço de VIEWPORT (não
  // do mundo 3000x1600), então não precisa reagir à câmera nem escalar com
  // ela — só o tamanho da tela. Poucas partículas fixas (item 17: leve o
  // bastante pra celular, nenhuma criação/destruição de objeto por frame).
  // ---------------------------------------------------------------------
  const MAX_PARTICULAS_CLIMA = 12;
  // ETAPA 8 (item 10) — partículas mágicas discretas, além das folhas já
  // existentes. Reaproveita o MESMO canvas/loop de clima (nenhum canvas novo,
  // nenhum custo extra de frame): só mais um array pequeno, desenhado logo
  // depois das folhas. Sobem devagar e piscam — bem menos que as folhas, pra
  // ficar discreto como pedido.
  const MAX_PARTICULAS_MAGICAS = 6;
  let particulasMagicas = [];
  let canvasClima = null, ctxClima = null;
  let particulasClima = [];

  function redimensionarClima() {
    if (!canvasClima) return;
    const viewport = document.getElementById("viewport-exploracao");
    if (!viewport) return;
    canvasClima.width = Math.max(1, viewport.clientWidth);
    canvasClima.height = Math.max(1, viewport.clientHeight);
  }

  function prepararClima() {
    canvasClima = document.getElementById("clima-exploracao");
    if (!canvasClima) return;
    ctxClima = canvasClima.getContext("2d");
    redimensionarClima();
    if (!particulasClima.length) {
      for (let i = 0; i < MAX_PARTICULAS_CLIMA; i++) {
        particulasClima.push({
          x: Math.random() * canvasClima.width,
          y: Math.random() * canvasClima.height,
          vx: 0.25 + Math.random() * 0.35,
          vy: 0.10 + Math.random() * 0.12,
          fase: Math.random() * Math.PI * 2,
          tamanho: 3 + Math.random() * 3
        });
      }
    }
    if (!particulasMagicas.length) {
      for (let i = 0; i < MAX_PARTICULAS_MAGICAS; i++) {
        particulasMagicas.push({
          x: Math.random() * canvasClima.width,
          y: Math.random() * canvasClima.height,
          vy: -(0.08 + Math.random() * 0.10),
          fase: Math.random() * Math.PI * 2,
          tamanho: 1.6 + Math.random() * 1.6
        });
      }
    }
  }

  function atualizarEDesenharClima(dt60) {
    if (!ctxClima || !canvasClima || dt60 <= 0) return;
    ctxClima.clearRect(0, 0, canvasClima.width, canvasClima.height);
    ctxClima.save();
    ctxClima.fillStyle = temaAtual.corParticulaClima;
    particulasClima.forEach(function (p) {
      p.fase += 0.02 * dt60;
      p.x += (p.vx + Math.sin(p.fase) * 0.25) * dt60;
      p.y += p.vy * dt60;
      if (p.x > canvasClima.width + 10) p.x = -10;
      if (p.y > canvasClima.height + 10) p.y = -10;
      ctxClima.beginPath();
      ctxClima.ellipse(p.x, p.y, p.tamanho, p.tamanho * 0.6, p.fase, 0, Math.PI * 2);
      ctxClima.fill();
    });
    ctxClima.restore();

    ctxClima.save();
    ctxClima.fillStyle = temaAtual.corParticulaMagica;
    particulasMagicas.forEach(function (p) {
      p.fase += 0.03 * dt60;
      p.y += p.vy * dt60;
      if (p.y < -10) p.y = canvasClima.height + 10;
      const alfa = 0.35 + Math.sin(p.fase) * 0.35;
      ctxClima.globalAlpha = Math.max(0, alfa);
      ctxClima.beginPath();
      ctxClima.arc(p.x, p.y, p.tamanho, 0, Math.PI * 2);
      ctxClima.fill();
    });
    ctxClima.restore();
  }

  // ---------------------------------------------------------------------
  // ETAPA 4 (item 1) — carregar imagem tentando reaproveitar assets do
  // projeto; se não existir, cai num fallback simples em CSS/emoji, sem
  // travar nem gerar erro visível. Nenhum arquivo novo é criado por isso.
  // ---------------------------------------------------------------------
  function criarImagemComFallback(candidatos, className, onFalhaTotal) {
    const img = document.createElement("img");
    img.className = className;
    img.draggable = false;
    let indice = 0;
    function tentar() {
      if (indice >= candidatos.length) { if (onFalhaTotal) onFalhaTotal(img); return; }
      img.src = candidatos[indice++];
    }
    img.addEventListener("error", tentar, false);
    tentar();
    return img;
  }

  // Placeholders de midground: construções físicas dos POIs (itens 2/3/4).
  function prepararMidground() {
    const midground = document.getElementById("camada-midground-exploracao");
    if (!midground) return;
    midground.innerHTML = "";
    midground.style.position = "absolute";
    midground.style.left = "0";
    midground.style.top = "0";
    midground.style.width = WORLD_W + "px";
    midground.style.height = WORLD_H + "px";
    midground.style.pointerEvents = "none";
    midground.style.willChange = "transform";

    construcoesMundo.forEach(function (c) {
      const predio = document.createElement("div");
      predio.className = "predio-mundo predio-" + c.poiId;
      predio.style.position = "absolute";
      predio.style.left = (c.x - c.w / 2) + "px";
      predio.style.top = (c.y - c.h) + "px";
      predio.style.width = c.w + "px";
      predio.style.height = c.h + "px";
      predio.style.setProperty("--cor-predio", c.corPrincipal);
      predio.style.setProperty("--cor-telhado", c.corTelhado);
      predio.dataset.poiId = c.poiId;
      predio.innerHTML =
        '<div class="predio-telhado"><span class="predio-emblema">' + c.emblema + '</span></div>' +
        '<div class="predio-corpo"><div class="predio-porta"></div></div>' +
        '<span class="predio-legenda">' + c.legenda + "</span>";
      midground.appendChild(predio);
    });
  }

  // ---------------------------------------------------------------------
  // 5) JOGADOR (camada "world") — sprite + sombra simples, sem física de combate.
  // ---------------------------------------------------------------------
  const TAMANHO_JOGADOR_EXP = 150;
  let elJogadorExp = null;
  let elSombraExp = null;

  // ETAPA 4 (item 9/11) — sprite tenta usar o personagem atualmente equipado
  // (se o menu.js expuser essa info de forma segura e só leitura); caindo pro
  // mesmo fallback de sempre se não existir. Nada aqui grava/altera inventário.
  function obterImagemPersonagemAtual() {
    try {
      if (typeof window.obterImagemPersonagemEquipado === "function") {
        const img = window.obterImagemPersonagemEquipado();
        if (img) return img;
      }
      if (window.personagemEquipadoAtual && window.personagemEquipadoAtual.imagem) {
        return window.personagemEquipadoAtual.imagem;
      }
    } catch (_) { /* nunca deixa isso quebrar a exploração */ }
    return "ArlanBanner.webp";
  }

  function prepararCamadaMundo() {
    const camada = document.getElementById("camada-mundo-exploracao");
    if (!camada) return;
    camada.innerHTML = "";
    camada.style.position = "absolute";
    camada.style.left = "0";
    camada.style.top = "0";
    camada.style.width = WORLD_W + "px";
    camada.style.height = WORLD_H + "px";
    camada.style.pointerEvents = "none";

    // ETAPA 4 (item 6/7/8) — decoração de ambiente, criada UMA vez (não a cada
    // frame) e já com z-index fixo pela posição Y (objetos decorativos não se
    // movem, só o jogador precisa reordenar dinamicamente contra eles).
    decoracaoMundo.forEach(function (d) {
      const el = document.createElement("div");
      // ETAPA 11 (item 2) — "elemento-exterior" marca tudo que só deve
      // aparecer fora de um interior; escondido via CSS quando
      // #area-exploracao ganha a classe .dentro-interior (ver 2.6).
      el.className = "decor-mundo decor-" + d.tipo + " elemento-exterior";
      const tamanho = d.raio * 2;
      el.style.position = "absolute";
      el.style.left = (d.x - tamanho / 2) + "px";
      el.style.top = (d.y - tamanho * 1.35) + "px";
      el.style.width = tamanho + "px";
      el.style.height = (tamanho * 1.6) + "px";
      el.style.zIndex = String(Math.floor(d.y));
      // ETAPA 5 (item 2) — escala moderada por profundidade, calculada uma
      // única vez (decoração é estática) e ancorada na base (transformOrigin
      // "bottom") pra escalar sem "flutuar" pra cima/baixo do ground point.
      el.style.transformOrigin = "center bottom";
      el.style.transform = "scale(" + escalaPorProfundidade(d.y).toFixed(3) + ")";
      el.innerHTML = '<span class="decor-sombra"></span><span class="decor-emblema">' + emblemaDecor(d.tipo) + "</span>";
      camada.appendChild(el);
    });

    // ETAPA 4 (item 13) — NPCs decorativos, mesma lógica de criação única.
    npcsMundo.forEach(function (npc) {
      const el = document.createElement("div");
      el.className = "npc-mundo elemento-exterior"; // ETAPA 11 (item 2/7)
      el.style.position = "absolute";
      el.style.left = (npc.x - 34) + "px";
      el.style.top = (npc.y - 78) + "px";
      el.style.width = "68px";
      el.style.height = "78px";
      el.style.zIndex = String(Math.floor(npc.y));
      el.style.transformOrigin = "center bottom"; // ETAPA 5 (item 2/12): mesma escala por profundidade
      el.style.transform = "scale(" + escalaPorProfundidade(npc.y).toFixed(3) + ")";
      el.dataset.npcId = npc.id;
      el.innerHTML =
        '<span class="npc-badge hidden"></span>' +
        '<span class="npc-sombra"></span><span class="npc-emblema">' + npc.emoji + '</span><span class="npc-nome">' + npc.nome + "</span>";
      camada.appendChild(el);
    });

    // ETAPA 11/12 (item 2/5) — wrappers dos interiores, escondidos por
    // padrão (display:none inline); entrarEmInterior/sairDoInterior só
    // alternam esse display, nada é recriado a cada entrada/saída.
    prepararInteriorEscola();
    criarWrapperInterior("loja", {
      origemX: LOJA_ORIGEM_X, origemY: LOJA_ORIGEM_Y, w: LOJA_W, h: LOJA_H,
      portaX: LOJA_PORTA_X, portaY: LOJA_PORTA_Y, portaLargura: LOJA_W * 0.40,
      pisoClasse: "interior-piso-loja", paredeClasse: "interior-parede-loja",
      paredes: obstaculosInteriorLoja, decor: decorInteriorLoja
    });
    criarWrapperInterior("arena", {
      origemX: ARENA_ORIGEM_X, origemY: ARENA_ORIGEM_Y, w: ARENA_W, h: ARENA_H,
      portaX: ARENA_PORTA_X, portaY: ARENA_PORTA_Y, portaLargura: ARENA_W * 0.40,
      pisoClasse: "interior-piso-arena", paredeClasse: "interior-parede-arena",
      paredes: obstaculosInteriorArena, decor: decorInteriorArena
    });

    elSombraExp = document.createElement("div");
    elSombraExp.className = "sombra-chao";
    camada.appendChild(elSombraExp);

    elJogadorExp = document.createElement("img");
    elJogadorExp.className = "sprite-jogo";
    elJogadorExp.src = obterImagemPersonagemAtual(); // mesmo fallback já usado em batalha.js
    elJogadorExp.style.width = TAMANHO_JOGADOR_EXP + "px";
    elJogadorExp.style.height = TAMANHO_JOGADOR_EXP + "px";
    elJogadorExp.style.transformOrigin = "center bottom"; // ETAPA 5 (item 2): pés fixos ao escalar
    elJogadorExp.dataset.estado = "idle";
    camada.appendChild(elJogadorExp);
  }

  // Emojis de fallback simples (item 1: só usado se não houver asset melhor;
  // modular o bastante pra trocar por <img> depois sem mexer no resto).
  function emblemaDecor(tipo) {
    switch (tipo) {
      case "arvore": return "🌳";
      case "pedra": return "🪨";
      case "poste": return "💡";
      case "banco": return "🪑";
      case "arbusto": return "🌿";
      case "flor": return "🌸";
      case "grama": return "🌾";
      case "folha": return "🍂";
      case "pedra-magica": return "🔮";
      case "clareira": return "✨";
      case "runa-escola": return "🔯";
      case "caixa-loja": return "🧺";
      case "frasco-loja": return "🍾";
      case "bandeira-arena": return "🚩";
      case "tocha-arena": return "🔥";
      default: return "•";
    }
  }

  // ETAPA 5 (item 9) — fase do "passo": avança só enquanto anda, some parado.
  // Produz um deslocamento vertical bem pequeno (±3px, antes da escala) sem
  // spritesheet nenhum — leve o bastante pra não deformar o personagem.
  let faseAndarExp = 0;

  function desenharJogadorExploracao(dt60) {
    if (!elJogadorExp || !elSombraExp) return;
    const virarEsquerda = jogadorExp.direcao === "esquerda";
    // ETAPA 4 (item 11) — estado idle/walk preparado via atributo (sem
    // spritesheet ainda); permite trocar de sprite/CSS por estado depois sem
    // mudar mais nada aqui.
    const emMovimento = Math.abs(jogadorExp.velX) > 0.15 || Math.abs(jogadorExp.velY) > 0.15;
    elJogadorExp.dataset.estado = emMovimento ? "andando" : "idle";

    if (emMovimento) faseAndarExp += (dt60 || 0) * 0.35;
    else faseAndarExp = 0;
    const bobAndar = emMovimento ? Math.sin(faseAndarExp * Math.PI * 2) * 3 : 0;

    // ETAPA 5 (item 2) — escala moderada por profundidade (worldY = chão da
    // exploração, nada a ver com a física de salto da batalha).
    const escala = escalaPorProfundidade(jogadorExp.worldY);
    const escalaX = (virarEsquerda ? -1 : 1) * escala;
    elJogadorExp.style.transform =
      "translate(" + (jogadorExp.worldX - TAMANHO_JOGADOR_EXP / 2) + "px," +
      (jogadorExp.worldY - TAMANHO_JOGADOR_EXP / 2 + bobAndar) + "px)" +
      " scale(" + escalaX.toFixed(3) + "," + escala.toFixed(3) + ")";
    // ETAPA 4 (item 8) — ordenação por profundidade: jogador fica atrás/à
    // frente da decoração e dos NPCs conforme sua posição Y no mundo.
    const zJogador = Math.floor(jogadorExp.worldY);
    elJogadorExp.style.zIndex = String(zJogador + 1);
    elSombraExp.style.zIndex = String(zJogador);

    // ETAPA 5 (item 3) — sombra acompanha a posição real e a mesma escala
    // moderada de profundidade (fica um pouco menor/maior junto do personagem).
    const larguraSombra = TAMANHO_JOGADOR_EXP * 0.62 * escala, alturaSombra = TAMANHO_JOGADOR_EXP * 0.2 * escala;
    const sy = jogadorExp.worldY + TAMANHO_JOGADOR_EXP * 0.42;
    elSombraExp.style.width = larguraSombra + "px";
    elSombraExp.style.height = alturaSombra + "px";
    elSombraExp.style.opacity = 0.5;
    elSombraExp.style.transform =
      "translate(" + (jogadorExp.worldX - larguraSombra / 2) + "px," + (sy - alturaSombra / 2) + "px)";
  }

  // ---------------------------------------------------------------------
  // 6) MOVIMENTO — WASD/setas (desktop) + joystick próprio (mobile). NÃO reusa
  //    os listeners/flags de batalha.js (evita qualquer interferência no combate).
  // ---------------------------------------------------------------------
  let expMovDireita = false, expMovEsquerda = false, expMovCima = false, expMovBaixo = false;
  let exploracaoAtiva = false;
  // ETAPA 5 (item 7) — entrada analógica do joystick: preserva os mesmos
  // booleans acima (usados por qualquer outra checagem que exista), mas
  // adiciona magnitude proporcional só quando o joystick está sendo usado,
  // pra inclinação pequena = devagar e inclinação maior = mais rápido. O
  // teclado continua digital (comportamento inalterado).
  let joystickExpAtivo = false;
  let joystickExpVetorX = 0, joystickExpVetorY = 0;

  window.addEventListener("keydown", function (evento) {
    if (!exploracaoAtiva) return;
    const tecla = evento.key.toLowerCase();
    if (evento.key === "ArrowRight" || tecla === "d") expMovDireita = true;
    if (evento.key === "ArrowLeft" || tecla === "a") expMovEsquerda = true;
    if (evento.key === "ArrowUp" || tecla === "w") expMovCima = true;
    if (evento.key === "ArrowDown" || tecla === "s") expMovBaixo = true;
    if (tecla === "e") interagirComPoiProximo();
  });
  window.addEventListener("keyup", function (evento) {
    if (!exploracaoAtiva) return;
    const tecla = evento.key.toLowerCase();
    if (evento.key === "ArrowRight" || tecla === "d") expMovDireita = false;
    if (evento.key === "ArrowLeft" || tecla === "a") expMovEsquerda = false;
    if (evento.key === "ArrowUp" || tecla === "w") expMovCima = false;
    if (evento.key === "ArrowDown" || tecla === "s") expMovBaixo = false;
  });

  (function configurarJoystickExploracao() {
    const base = document.getElementById("exploracao-joystick-base");
    const knob = document.getElementById("exploracao-joystick-knob");
    if (!base || !knob) return;

    const RAIO = 32;
    const ZONA_MORTA = 8;
    let arrastando = false;
    let pointerId = null;

    function mover(clientX, clientY) {
      const rect = base.getBoundingClientRect();
      const centroX = rect.left + rect.width / 2;
      const centroY = rect.top + rect.height / 2;
      let dx = clientX - centroX;
      let dy = clientY - centroY;
      const dist = Math.hypot(dx, dy);
      if (dist > RAIO) { dx = (dx / dist) * RAIO; dy = (dy / dist) * RAIO; }
      knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
      expMovDireita = dx > ZONA_MORTA;
      expMovEsquerda = dx < -ZONA_MORTA;
      expMovBaixo = dy > ZONA_MORTA;
      expMovCima = dy < -ZONA_MORTA;
      // ETAPA 5 (item 7): magnitude proporcional (0..1 por eixo), já com a
      // zona morta descontada pra não ter um "salto" logo na borda do centro.
      joystickExpAtivo = true;
      joystickExpVetorX = Math.abs(dx) > ZONA_MORTA ? clamp(dx / RAIO, -1, 1) : 0;
      joystickExpVetorY = Math.abs(dy) > ZONA_MORTA ? clamp(dy / RAIO, -1, 1) : 0;
    }
    function soltar() {
      if (!arrastando) return;
      arrastando = false;
      pointerId = null;
      knob.classList.remove("arrastando");
      knob.style.transform = "translate(-50%, -50%)";
      expMovDireita = expMovEsquerda = expMovCima = expMovBaixo = false;
      joystickExpAtivo = false;
      joystickExpVetorX = 0; joystickExpVetorY = 0;
    }
    base.addEventListener("pointerdown", function (evento) {
      if (!exploracaoAtiva) return;
      evento.preventDefault();
      arrastando = true;
      pointerId = evento.pointerId;
      knob.classList.add("arrastando");
      try { base.setPointerCapture(pointerId); } catch (_) {}
      mover(evento.clientX, evento.clientY);
    });
    base.addEventListener("pointermove", function (evento) {
      if (!arrastando || evento.pointerId !== pointerId) return;
      mover(evento.clientX, evento.clientY);
    });
    base.addEventListener("pointerup", soltar);
    base.addEventListener("pointercancel", soltar);
    base.addEventListener("lostpointercapture", soltar);
  })();

  function atualizarMovimentoExploracao(dt60) {
    let alvoVelX = 0, alvoVelY = 0;
    if (joystickExpAtivo) {
      // ETAPA 5 (item 7) — analógico: velocidade proporcional à inclinação.
      alvoVelX = joystickExpVetorX * VEL_MAX;
      alvoVelY = joystickExpVetorY * VEL_MAX;
    } else {
      if (expMovDireita) alvoVelX = VEL_MAX;
      if (expMovEsquerda) alvoVelX = -VEL_MAX;
      if (expMovCima) alvoVelY = -VEL_MAX;
      if (expMovBaixo) alvoVelY = VEL_MAX;
      if (alvoVelX !== 0 && alvoVelY !== 0) { alvoVelX *= 0.7071; alvoVelY *= 0.7071; }
    }

    const alpha = 1 - Math.pow(1 - ACELERACAO, dt60);
    jogadorExp.velX += (alvoVelX - jogadorExp.velX) * alpha;
    jogadorExp.velY += (alvoVelY - jogadorExp.velY) * alpha;

    // ETAPA 4 (item 7) — colisão simples 2D: testa cada eixo separadamente
    // (permite "deslizar" na parede em vez de travar de vez quando o
    // movimento não é perfeitamente de frente pro obstáculo).
    const novoX = jogadorExp.worldX + jogadorExp.velX * dt60;
    if (!colideComAlgumObstaculo(novoX, jogadorExp.worldY)) {
      jogadorExp.worldX = novoX;
    } else {
      jogadorExp.velX = 0;
    }
    const novoY = jogadorExp.worldY + jogadorExp.velY * dt60;
    if (!colideComAlgumObstaculo(jogadorExp.worldX, novoY)) {
      jogadorExp.worldY = novoY;
    } else {
      jogadorExp.velY = 0;
    }

    if (Math.abs(jogadorExp.velX) > 0.15 || Math.abs(jogadorExp.velY) > 0.15) {
      if (Math.abs(jogadorExp.velX) > Math.abs(jogadorExp.velY)) {
        jogadorExp.direcao = jogadorExp.velX > 0 ? "direita" : "esquerda";
      } else {
        jogadorExp.direcao = jogadorExp.velY > 0 ? "baixo" : "cima";
      }
      // ETAPA 6 (item 11) — dica de tutorial só na primeira vez que o jogador
      // realmente se move (não ao entrar na tela). "umaVez" garante que isso
      // nunca mais apareça de novo nesta sessão.
      if (typeof mostrarDica === "function") {
        mostrarDica("🧭 Explore a escola, a loja e a arena.", "normal", { chave: "tutorial-explorar", umaVez: true, cooldownMs: 0 });
      }
    }

    // Colisão com os limites do mundo (mesmo princípio do calcularLimitesMundo da batalha).
    if (jogadorExp.worldX < limitesMundoExp.minX) { jogadorExp.worldX = limitesMundoExp.minX; jogadorExp.velX = 0; }
    if (jogadorExp.worldX > limitesMundoExp.maxX) { jogadorExp.worldX = limitesMundoExp.maxX; jogadorExp.velX = 0; }
    if (jogadorExp.worldY < limitesMundoExp.minY) { jogadorExp.worldY = limitesMundoExp.minY; jogadorExp.velY = 0; }
    if (jogadorExp.worldY > limitesMundoExp.maxY) { jogadorExp.worldY = limitesMundoExp.maxY; jogadorExp.velY = 0; }
  }

  function colideComAlgumObstaculo(px, py) {
    // ETAPA 11 (item 3) — passa a ler obstaculosAtivos (exterior OU o
    // interior atual), definido na seção 2.6. Fora de qualquer interior,
    // obstaculosAtivos === obstaculosMundo, ou seja: comportamento 100%
    // idêntico ao de antes.
    for (let i = 0; i < obstaculosAtivos.length; i++) {
      if (circuloColideComCaixa(px, py, RAIO_COLISAO_JOGADOR, obstaculosAtivos[i])) return true;
    }
    return false;
  }

  // ---------------------------------------------------------------------
  // 7) INTERAÇÃO (item 9) — detecta o POI mais próximo e mostra a dica
  //    ("Pressione E" no desktop, botão dedicado no mobile).
  // ---------------------------------------------------------------------
  // ETAPA 6 — NPCs também entram na busca do "ponto de interesse mais próximo"
  // (mesma lógica de raio+distância dos POIs), só que sem aoInteragir fixo:
  // cada NPC ganha, na hora, uma ação padrão que consulta o sistema de missões
  // já existente (menu.js) através do seu missionId — sem duplicar nada.
  // ETAPA 7 (item 5/6/7) — lê o estado REAL da missão do NPC direto do
  // sistema já existente em menu.js (`missions`, `claimed`,
  // `obterProgressoMissao`). Não cria nenhuma fonte de verdade nova: isto é
  // só uma leitura organizada do que já existe, pra alimentar o diálogo, o
  // badge sobre o NPC e a HUD de missão em foco.
  function obterInfoMissaoNpc(npc) {
    if (!npc.missionId || typeof missions === "undefined") return null;
    const missao = missions.filter(function (m) { return m.id === npc.missionId; })[0];
    if (!missao) return null;

    const jaResgatada = !!(typeof claimed !== "undefined" && claimed && claimed[missao.id]);
    const concluida = typeof missao.check === "function" && missao.check();
    const progresso = (typeof obterProgressoMissao === "function")
      ? obterProgressoMissao(missao)
      : { atual: concluida ? 1 : 0, total: 1, percentual: concluida ? 100 : 0 };

    // "disponível" (ainda não começou) vs "em andamento" é deduzido do
    // progresso real (atual === 0), sem inventar um estado novo separado.
    let estado;
    if (jaResgatada) estado = "resgatada";
    else if (concluida) estado = "concluida";
    else if (progresso.atual > 0) estado = "em-andamento";
    else estado = "disponivel";

    return { missao: missao, progresso: progresso, estado: estado, jaResgatada: jaResgatada, concluida: concluida };
  }

  // Escolhe qual fala mostrar com base no estado da missão do NPC (se houver).
  // Sem missionId: fica só a fala decorativa de sempre.
  function obterFalaNpc(npc) {
    const info = obterInfoMissaoNpc(npc);
    if (!info) return npc.dialogoInicial || (npc.nome + ": Olá, viajante!");
    if (info.jaResgatada || info.concluida) return npc.dialogoConcluido || ("✓ " + info.missao.title);
    return npc.dialogoEmProgresso || npc.dialogoInicial || ("📜 " + info.missao.title + " — " + info.missao.desc);
  }

  // ETAPA 7 (item 5/7) — missão que a HUD discreta mostra durante a
  // exploração: o último NPC com quem o jogador conversou. Só guarda um id
  // (nenhum progresso duplicado — a HUD sempre relê `missions`/`claimed`).
  let missaoEmFocoId = null;

  function abrirDialogoNpc(npc) {
    const overlay = document.getElementById("modal-npc-dialogo");
    const elNome = document.getElementById("npc-dialogo-nome");
    const elTexto = document.getElementById("npc-dialogo-texto");
    const blocoMissao = document.getElementById("npc-dialogo-missao");
    const elMissaoTitulo = document.getElementById("npc-dialogo-missao-titulo");
    const elMissaoBarra = document.getElementById("npc-dialogo-missao-barra");
    const elMissaoTexto = document.getElementById("npc-dialogo-missao-progresso");
    const botaoResgatar = document.getElementById("btn-npc-dialogo-resgatar");

    if (!overlay) {
      // Sem o modal no HTML (por qualquer motivo), cai no comportamento
      // simples de sempre — a exploração nunca trava por causa disso.
      if (typeof mostrarDica === "function") {
        mostrarDica(obterFalaNpc(npc), "normal", { chave: "npc-" + npc.id, cooldownMs: 2500 });
      } else if (typeof mostrarToast === "function") {
        mostrarToast(obterFalaNpc(npc));
      }
      return;
    }

    const info = obterInfoMissaoNpc(npc);
    if (elNome) elNome.textContent = npc.nome;
    if (elTexto) elTexto.textContent = obterFalaNpc(npc);

    if (info && !info.jaResgatada && blocoMissao) {
      blocoMissao.classList.remove("hidden");
      if (elMissaoTitulo) elMissaoTitulo.textContent = info.missao.title;
      if (elMissaoBarra) elMissaoBarra.style.width = info.progresso.percentual + "%";
      if (elMissaoTexto) {
        elMissaoTexto.textContent =
          info.progresso.atual.toLocaleString("pt-BR") + " / " + info.progresso.total.toLocaleString("pt-BR") +
          (info.concluida ? " • CONCLUÍDA" : "");
      }
      if (botaoResgatar) {
        botaoResgatar.classList.toggle("hidden", !info.concluida);
        // ETAPA 10 (auditoria) — BUG ENCONTRADO E CORRIGIDO: antes, o clique
        // fechava o diálogo IMEDIATAMENTE, sem esperar a resposta real do
        // servidor (claimMission já é 100% ligado ao RPC existente
        // `resgatar_missao`, em menu.js — não foi tocado). Se o RPC falhasse
        // (rede, sessão etc.), o diálogo já tinha fechado como se tivesse
        // dado certo, e o jogador só via o alert() de erro sem conseguir
        // tentar de novo ali mesmo. Agora: espera claimMission terminar (ela
        // mesma já trata erro/sucesso e sincroniza com o servidor) e só
        // então RE-RENDERIZA o diálogo com o estado real (`claimed`) —
        // fecha sozinho se o resgate deu certo, ou continua aberto com o
        // botão disponível de novo se falhou. Nenhuma recompensa é somada
        // aqui; a única fonte de verdade continua sendo o retorno do RPC.
        botaoResgatar.onclick = async function () {
          if (typeof claimMission !== "function") return;
          if (botaoResgatar.disabled) return; // evita clique duplo durante a chamada
          const textoOriginal = botaoResgatar.textContent;
          botaoResgatar.disabled = true;
          botaoResgatar.textContent = "...";
          try {
            await claimMission(info.missao.id);
          } finally {
            botaoResgatar.disabled = false;
            botaoResgatar.textContent = textoOriginal;
          }
          // Reabre com o estado atual (se resgatou de verdade, `claimed[id]`
          // já veio true do servidor via claimMission -> sincronizarEstadoDoServidor,
          // e o diálogo passa a mostrar a fala de "concluído" em vez do botão).
          abrirDialogoNpc(npc);
        };
      }
      missaoEmFocoId = info.missao.id;
    } else if (blocoMissao) {
      blocoMissao.classList.add("hidden");
    }

    overlay.classList.remove("hidden");
  }

  function fecharDialogoNpc() {
    const overlay = document.getElementById("modal-npc-dialogo");
    if (overlay) overlay.classList.add("hidden");
  }

  (function ligarBotaoFecharDialogoNpc() {
    const botao = document.getElementById("btn-npc-dialogo-fechar");
    if (botao) botao.addEventListener("click", fecharDialogoNpc);
  })();

  function aoInteragirComNpc(npc) {
    abrirDialogoNpc(npc);
  }

  // ---------------------------------------------------------------------
  // ETAPA 7 (item 6/7/8) — badge de estado sobre o NPC + HUD de missão em
  // foco + aviso de "missão concluída". Atualizado num intervalo próprio
  // (não a cada frame do loop de exploração) porque só 3 NPCs existem hoje
  // e isso não precisa de 60fps — leve o bastante pra celular (item 17).
  // ---------------------------------------------------------------------
  const estadoAnteriorNpc = {};

  function atualizarBadgesEHudMissao() {
    npcsMundo.forEach(function (npc) {
      const el = document.querySelector('.npc-mundo[data-npc-id="' + npc.id + '"] .npc-badge');
      const info = obterInfoMissaoNpc(npc);

      if (el) {
        if (!info || info.jaResgatada) {
          el.classList.add("hidden");
          el.classList.remove("em-andamento", "concluida");
          el.textContent = "";
        } else {
          el.classList.remove("hidden");
          el.classList.toggle("em-andamento", info.estado === "em-andamento");
          el.classList.toggle("concluida", info.estado === "concluida");
          el.textContent = info.estado === "concluida" ? "✓" : (info.estado === "em-andamento" ? "…" : "!");
        }
      }

      // Aviso de "missão concluída" (item 8) — dispara só na transição de
      // "não concluída" -> "concluída", uma única vez por missão, usando o
      // toast/dica já existente (nenhum sistema de notificação novo).
      if (info && info.estado === "concluida" && estadoAnteriorNpc[npc.id] && estadoAnteriorNpc[npc.id] !== "concluida" && typeof mostrarDica === "function") {
        mostrarDica("✅ Missão concluída! Volte ao " + npc.nome + " para resgatar sua recompensa.", "reward", { chave: "missao-concluida-" + npc.id, umaVez: false, cooldownMs: 8000 });
      }
      if (info) estadoAnteriorNpc[npc.id] = info.estado;
    });

    // HUD discreta da missão em foco (item 7) — sempre relendo os dados
    // reais de menu.js; não guarda progresso nenhum por conta própria.
    const hud = document.getElementById("hud-missao-exploracao");
    if (hud) {
      const npcFoco = missaoEmFocoId ? npcsMundo.filter(function (n) { return n.missionId === missaoEmFocoId; })[0] : null;
      const infoFoco = npcFoco ? obterInfoMissaoNpc(npcFoco) : null;
      if (!infoFoco || infoFoco.jaResgatada) {
        hud.classList.add("hidden");
      } else {
        hud.classList.remove("hidden");
        const nomeEl = hud.querySelector(".hud-missao-nome");
        const barraEl = hud.querySelector(".hud-missao-barra");
        const textoEl = hud.querySelector(".hud-missao-progresso");
        if (nomeEl) nomeEl.textContent = infoFoco.missao.title;
        if (barraEl) barraEl.style.width = infoFoco.progresso.percentual + "%";
        if (textoEl) {
          textoEl.textContent =
            infoFoco.progresso.atual.toLocaleString("pt-BR") + " / " + infoFoco.progresso.total.toLocaleString("pt-BR") +
            (infoFoco.concluida ? " • CONCLUÍDA" : "");
        }
      }
    }

    // Reaproveita o próprio renderMissions() já existente (idempotente) pra
    // manter a tela de Missões e os toasts de "missão concluída" corretos
    // mesmo enquanto o jogador está explorando (sem criar lógica paralela).
    if (typeof renderMissions === "function") renderMissions();
  }

  let intervaloBadgesMissao = null;

  function atualizarInteracaoProxima() {
    let maisProximo = null, menorDist = Infinity;
    // ETAPA 11 (item 1/4/5) — pontosAtivos é pontosDeInteresse (exterior) ou
    // os POIs do interior atual (ex.: a porta de saída), definido na 2.6.
    pontosAtivos.forEach(function (poi) {
      const dist = Math.hypot(poi.x - jogadorExp.worldX, poi.y - jogadorExp.worldY);
      if (dist <= poi.raio && dist < menorDist) { menorDist = dist; maisProximo = poi; }
    });
    // NPCs só existem no mundo exterior nesta etapa (item 7 — dentro da
    // Escola eles ainda são só decoração/estrutura reservada), então a
    // busca por NPC próximo é pulada enquanto dentro de um interior.
    if (!interiorAtivo) {
      npcsMundo.forEach(function (npc) {
        const dist = Math.hypot(npc.x - jogadorExp.worldX, npc.y - jogadorExp.worldY);
        if (dist <= npc.raioInteracao && dist < menorDist) {
          menorDist = dist;
          maisProximo = { id: "npc:" + npc.id, nome: npc.nome, aoInteragir: function () { aoInteragirComNpc(npc); } };
        }
      });
    }
    poiProximo = maisProximo;

    const prompt = document.getElementById("prompt-interacao-exploracao");
    const botaoMobile = document.getElementById("btn-interagir-exploracao");
    if (prompt) {
      prompt.classList.toggle("hidden", !poiProximo);
      // ETAPA 11 (item 1/4) — texto contextual ("E — Entrar na Escola" /
      // "E — Sair da Escola"); mantém o MESMO elemento/sistema de prompt de
      // sempre, só troca o texto conforme o POI mais próximo.
      if (poiProximo) {
        prompt.innerHTML = "Pressione <b>E</b> — " + (poiProximo.promptTexto || poiProximo.nome);
      }
    }
    if (botaoMobile) botaoMobile.style.display = poiProximo ? "block" : "none";
  }

  function interagirComPoiProximo() {
    if (poiProximo && typeof poiProximo.aoInteragir === "function") poiProximo.aoInteragir();
  }

  document.addEventListener("click", function (evento) {
    if (evento.target && evento.target.closest && evento.target.closest("#btn-interagir-exploracao")) {
      interagirComPoiProximo();
    }
  });

  // ---------------------------------------------------------------------
  // 8) LOOP — independente do loop de combate (rafBatalhaId em batalha.js).
  // ---------------------------------------------------------------------
  let rafExploracaoId = null;
  let ultimoFrameExp = 0;

  function loopExploracao(timestamp) {
    if (!exploracaoAtiva) { rafExploracaoId = null; return; }
    const deltaSegundos = Math.min(0.05, Math.max(0, (timestamp - (ultimoFrameExp || timestamp)) / 1000));
    ultimoFrameExp = timestamp;
    const dt60 = Math.min(3, Math.max(0, deltaSegundos * 60));

    atualizarMovimentoExploracao(dt60);
    atualizarInteracaoProxima();
    atualizarCameraExploracao(dt60);
    desenharJogadorExploracao(dt60);
    atualizarEDesenharClima(dt60);

    rafExploracaoId = requestAnimationFrame(loopExploracao);
  }

  function iniciarExploracao() {
    exploracaoAtiva = true;
    // ETAPA 11 (item 4) — se o jogador saiu da tela de exploração estando
    // dentro de um interior (ex.: botão ✕ / pause), a próxima entrada
    // sempre recomeça no mundo exterior, nunca "presa" dentro da Escola.
    if (interiorAtivo) {
      const area = document.getElementById("area-exploracao");
      if (area) area.classList.remove("dentro-interior");
      const wrapper = document.getElementById("interior-" + interiorAtivo.tipo + "-wrapper");
      if (wrapper) wrapper.style.display = "none";
      definirSpawnExploracao(
        posRetornoExterior ? posRetornoExterior.x : SPAWN_X,
        posRetornoExterior ? posRetornoExterior.y : SPAWN_Y
      );
      interiorAtivo = null;
      obstaculosAtivos = obstaculosMundo;
      pontosAtivos = pontosDeInteresse;
      posRetornoExterior = null;
    }
    camExp.zoom = 0; // força recentralizar a câmera no jogador nesta entrada
    camAntecipacaoX = 0; camAntecipacaoY = 0; // ETAPA 5: evita "salto" de antecipação entre sessões
    faseAndarExp = 0;
    desenharFundoExploracao();
    prepararMidground();
    prepararCamadaMundo();
    prepararClima();
    atualizarInteracaoProxima();
    // ETAPA 16 (item 4 do roteiro) — garante que o PRIMEIRO frame já nasça
    // com a câmera correta (não precisa de redimensionar a janela pra
    // "acordar"): mede o viewport agora mesmo, antes de pedir o primeiro
    // frame, e liga o ResizeObserver que mantém isso correto depois.
    atualizarCameraExploracao(0);
    iniciarObservadorResizeExploracao();
    ultimoFrameExp = 0;
    if (rafExploracaoId === null) rafExploracaoId = requestAnimationFrame(loopExploracao);

    // ETAPA 7 (item 6/7/8) — badges de missão sobre os NPCs + HUD discreta,
    // atualizados num intervalo próprio e leve (ver atualizarBadgesEHudMissao).
    atualizarBadgesEHudMissao();
    if (intervaloBadgesMissao) clearInterval(intervaloBadgesMissao);
    intervaloBadgesMissao = setInterval(atualizarBadgesEHudMissao, 500);

    if (typeof mostrarDica === "function") {
      mostrarDica("🕹️ Use o joystick (ou WASD) para se mover.", "normal", { chave: "tutorial-mover", umaVez: true, cooldownMs: 0 });
    }
  }

  // ETAPA 6 — permite que outro módulo (universos.js) posicione o jogador num
  // ponto específico do MESMO mundo/plano X-Y de sempre, sem mexer em nada da
  // física ou da câmera. Se x/y vierem vazios ou fora dos limites, não faz
  // nada além de garantir que o jogador continue dentro dos limites atuais —
  // ou seja, é seguro chamar isso com dados incompletos.
  function definirSpawnExploracao(x, y) {
    if (typeof x === "number" && !Number.isNaN(x)) jogadorExp.worldX = clamp(x, limitesMundoExp.minX, limitesMundoExp.maxX);
    if (typeof y === "number" && !Number.isNaN(y)) jogadorExp.worldY = clamp(y, limitesMundoExp.minY, limitesMundoExp.maxY);
    jogadorExp.velX = 0;
    jogadorExp.velY = 0;
  }
  window.definirSpawnExploracao = definirSpawnExploracao;

  function pararExploracao() {
    exploracaoAtiva = false;
    expMovDireita = expMovEsquerda = expMovCima = expMovBaixo = false;
    joystickExpAtivo = false;
    joystickExpVetorX = 0; joystickExpVetorY = 0;
    if (rafExploracaoId !== null) { cancelAnimationFrame(rafExploracaoId); rafExploracaoId = null; }
    if (intervaloBadgesMissao) { clearInterval(intervaloBadgesMissao); intervaloBadgesMissao = null; }
    fecharDialogoNpc();
  }

  window.addEventListener("resize", function () {
    if (exploracaoAtiva) atualizarCameraExploracao(0);
    redimensionarClima();
  }, { passive: true });

  // ---------------------------------------------------------------------
  // ETAPA 16 (item 3 do roteiro) — RESIZE ROBUSTO via ResizeObserver.
  // -----------------------------------------------------------------------
  // O listener de "resize" da window (acima) só dispara quando a JANELA
  // muda de tamanho. Ele não cobre os casos reais que causavam o bug
  // ("mapa preto até eu mexer no width/height"): a tela de exploração
  // ficando visível sem a window em si ter sido redimensionada, ou o
  // navegador levando um instante a mais pra assentar a altura real
  // (100dvh reagindo à barra de endereço) depois que a classe ".active" é
  // aplicada em #tela-exploracao.
  //
  // ResizeObserver é a API correta pra isso: ele observa o TAMANHO REAL do
  // próprio elemento (não a window) e chama o callback sempre que esse
  // tamanho muda de verdade — inclusive na primeira vez que passa a ter um
  // tamanho válido. Nenhum setTimeout/intervalo arbitrário é usado.
  //
  // Importante (item 3): isso só atualiza viewport/canvas/câmera — nunca
  // recria o mundo, NPCs, obstáculos ou reseta posição/progresso do
  // jogador (definirSpawnExploracao não é chamado aqui).
  let resizeObserverExp = null;
  function iniciarObservadorResizeExploracao() {
    if (resizeObserverExp || typeof ResizeObserver === "undefined") return;
    const viewport = document.getElementById("viewport-exploracao");
    if (!viewport) return;
    resizeObserverExp = new ResizeObserver(function () {
      if (exploracaoAtiva) atualizarCameraExploracao(0);
      redimensionarClima();
    });
    resizeObserverExp.observe(viewport);
  }

  const navBtn = document.getElementById("nav-exploracao");
  if (navBtn) navBtn.addEventListener("click", function () { iniciarExploracao(); });
  const sairBtn = document.getElementById("btn-sair-exploracao");
  if (sairBtn) sairBtn.addEventListener("click", function () { pararExploracao(); });

  // Exposto por clareza/depuração — nada aqui é lido ou chamado por batalha.js.
  window.iniciarExploracao = iniciarExploracao;
  window.pararExploracao = pararExploracao;
})();
