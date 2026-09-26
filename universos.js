// =============================================================================
// universos.js — Galáxia de Universos (Etapa 15: Galáxia Visual + Auditoria)
// -----------------------------------------------------------------------------
// Módulo ADITIVO ao Arcane Clash — Duelo de Magias. Carregado DEPOIS de
// menu.js e exploracao.js (mesma ordem de scripts clássicos, sem módulos ES),
// então este arquivo pode ler livremente variáveis globais já existentes como
// `bosses`, `bossesDerrotados`, `missions`, `claimed`, `mostrarToast` e `show`
// — exatamente como batalha.js/exploracao.js já fazem entre si.
//
// O que este arquivo NÃO faz (de propósito):
// - não duplica dados de boss (nome/vida/imagem/rank) — sempre lê do array
//   `bosses` já existente em menu.js;
// - não cria uma segunda fonte de verdade pra "boss derrotado" — sempre lê
//   `bossesDerrotados`, que já é sincronizado com o servidor em menu.js;
// - não mexe em Supabase, RPC, autenticação, dano, vida, IA de boss ou física;
// - não constrói os 10 mundos. Universos 2–10 continuam só como CONFIGURAÇÃO
//   (nome/boss/spawn/imagem reservados) até cada mundo ser construído de fato.
//
// ETAPA 15 (o que mudou nesta etapa):
// - a tela de Universos deixou de usar a classe genérica ".boss-grid" (grade
//   quadrada de cards) e virou um MAPA DE GALÁXIA (".galaxy-map"): fundo
//   espacial, linhas conectando os universos e 10 "planetas" posicionados
//   num caminho, cada um com sua cor/tema;
// - cada planeta reaproveita a IMAGEM REAL do boss correspondente (campo
//   `imagem` do array `bosses`, ex: "Arlan.png") — a mesma arte que já existe
//   no jogo (tela de Bosses). Nenhuma imagem nova foi inventada;
// - ao tocar num universo desbloqueado, agora abre um PREVIEW (nome, tema,
//   descrição curta, boss) antes de entrar — só confirma com o clique em
//   "ENTRAR"; universo bloqueado mostra a mesma dica de sempre;
// - uma transição curta (fade + leve zoom, só CSS, sem JS pesado) acontece
//   entre Galáxia → Universo → Exploração.
//
// Se este arquivo não carregar por algum motivo, o jogo continua funcionando
// exatamente como antes: a Arena abre pela tela de bosses de sempre, e o
// mundo do Universo 1 (exploracao.js) continua 100% intacto.
// =============================================================================
(function () {
  "use strict";

  // ---------------------------------------------------------------------
  // 1) CONFIGURAÇÃO CENTRAL DOS UNIVERSOS (item 1/2/16 do roteiro original
  //    + item 2 da Etapa 15). Uma linha por universo. `bossId` referencia o
  //    array `bosses` já existente (menu.js) — nome/imagem/rank/skills do
  //    boss NUNCA são copiados pra cá, só referenciados por id.
  //    `pos` é só a posição (%) do planeta dentro do mapa da galáxia —
  //    puramente visual, não afeta gameplay/progresso.
  //    `cor` é a cor de identidade visual do universo (usada no brilho do
  //    planeta, na linha de conexão e no preview).
  // ---------------------------------------------------------------------
  const UNIVERSOS = [
    { id: 1, bossId: 1, cenario: "escola-arlan", spawn: null, tema: "Floresta Arcana", descricao: "O ponto de partida: a escola onde tudo começou, entre árvores e magia recém-despertada.", cor: "#5cff9c", pos: { x: 16, y: 10 } },
    { id: 2, bossId: 2, cenario: null, spawn: null, tema: "Tempestade", descricao: "Céus carregados e raios constantes — um universo em fúria permanente.", cor: "#4ab6ff", pos: { x: 54, y: 6 } },
    { id: 3, bossId: 3, cenario: null, spawn: null, tema: "Neve e Gelo", descricao: "Um mundo congelado, silencioso e cortante como o próprio gelo.", cor: "#8fdcff", pos: { x: 86, y: 17 } },
    { id: 4, bossId: 4, cenario: null, spawn: null, tema: "Vulcão", descricao: "Lava, cinzas e calor sufocante em cada canto deste universo.", cor: "#ff7a3d", pos: { x: 66, y: 30 } },
    { id: 5, bossId: 5, cenario: null, spawn: null, tema: "Deserto", descricao: "Areia sem fim sob um sol implacável.", cor: "#e8c169", pos: { x: 24, y: 33 } },
    { id: 6, bossId: 6, cenario: null, spawn: null, tema: "Planeta Destruído", descricao: "Ruínas flutuantes do que um dia foi um mundo inteiro.", cor: "#9aa3b8", pos: { x: 9, y: 47 } },
    { id: 7, bossId: 7, cenario: null, spawn: null, tema: "Mundo Mágico", descricao: "Energia arcana pura molda a paisagem a cada instante.", cor: "#b07bff", pos: { x: 40, y: 54 } },
    { id: 8, bossId: 8, cenario: null, spawn: null, tema: "Sobrenatural", descricao: "Sombras vivas e fenômenos que desafiam qualquer explicação.", cor: "#7b5cff", pos: { x: 76, y: 60 } },
    { id: 9, bossId: 9, cenario: null, spawn: null, tema: "Liminar / Estranho", descricao: "Espaços vazios e familiares demais — atmosfera original inspirada em espaços liminares, sem copiar mapas ou assets de nenhuma obra existente.", cor: "#d1c48a", pos: { x: 50, y: 75 } },
    { id: 10, bossId: 10, cenario: null, spawn: null, tema: "Arena Final", descricao: "O último universo. Identidade própria a definir com calma.", cor: "#ff4f6b", pos: { x: 20, y: 89 } }
  ];

  // Universo em que o jogador está agora. Hoje só o Universo 1 existe de
  // fato como mundo jogável, então isso começa (e por ora permanece) em 1.
  let universoAtual = 1;

  // ---------------------------------------------------------------------
  // 2) LEITURA DE PROGRESSO — SEMPRE reaproveitando o que já existe
  // ---------------------------------------------------------------------
  function listaBossesDerrotados() {
    return (typeof bossesDerrotados !== "undefined" && Array.isArray(bossesDerrotados))
      ? bossesDerrotados
      : [];
  }

  function bossFoiDerrotado(bossId) {
    return listaBossesDerrotados().indexOf(Number(bossId)) !== -1;
  }

  function obterBoss(universo) {
    if (typeof bosses === "undefined" || !Array.isArray(bosses)) return null;
    return bosses.filter(function (b) { return b.id === universo.bossId; })[0] || null;
  }

  function obterUniverso(id) {
    return UNIVERSOS.filter(function (u) { return u.id === Number(id); })[0] || null;
  }

  // Regra de desbloqueio (item 4 da Etapa 15 — preservada EXATAMENTE igual):
  // Universo 1 sempre aberto; os demais exigem que o boss do universo
  // ANTERIOR já tenha sido derrotado. Nenhuma tabela/coluna/RPC nova.
  function universoDesbloqueado(id) {
    const universo = obterUniverso(id);
    if (!universo) return false;
    if (universo.id === 1) return true;

    const anterior = obterUniverso(universo.id - 1);
    if (!anterior) return false;
    return bossFoiDerrotado(anterior.bossId);
  }

  // ---------------------------------------------------------------------
  // 3) SISTEMA DE MENSAGENS CURTAS — reaproveita mostrarToast (menu.js)
  // ---------------------------------------------------------------------
  const dicasJaMostradas = new Set();
  const dicaUltimoDisparo = {};

  function mostrarDica(texto, tipo, opcoes) {
    opcoes = opcoes || {};
    const chave = opcoes.chave || texto;

    if (opcoes.umaVez && dicasJaMostradas.has(chave)) return;

    const cooldownMs = typeof opcoes.cooldownMs === "number" ? opcoes.cooldownMs : 4000;
    const agora = Date.now();
    if (cooldownMs > 0 && dicaUltimoDisparo[chave] && (agora - dicaUltimoDisparo[chave]) < cooldownMs) return;

    dicaUltimoDisparo[chave] = agora;
    if (opcoes.umaVez) dicasJaMostradas.add(chave);

    if (typeof mostrarToast === "function") mostrarToast(texto, tipo || "normal");
  }
  window.mostrarDica = mostrarDica;

  // ---------------------------------------------------------------------
  // 4) TRANSIÇÃO LEVE (item 6 da Etapa 15) — só opacidade + escala via CSS
  //    (classe "ativa" no overlay, ver melhorias-visuais.css), nada de
  //    canvas/partículas pesadas aqui. Dura ~420ms no total.
  // ---------------------------------------------------------------------
  function jogarTransicao(callback) {
    const overlay = document.getElementById("universo-transicao-overlay");
    if (!overlay) { if (typeof callback === "function") callback(); return; }

    overlay.classList.add("ativa");
    setTimeout(function () {
      if (typeof callback === "function") callback();
      setTimeout(function () { overlay.classList.remove("ativa"); }, 260);
    }, 220);
  }

  function garantirTransicaoDom() {
    if (document.getElementById("universo-transicao-overlay")) return;
    const overlay = document.createElement("div");
    overlay.id = "universo-transicao-overlay";
    overlay.className = "universo-transicao-overlay";
    document.body.appendChild(overlay);
  }

  // ---------------------------------------------------------------------
  // 5) ENTRAR NO UNIVERSO (item 5/7) — reaproveita a exploração já existente.
  // ---------------------------------------------------------------------
  function entrarNoUniverso(id) {
    const universo = obterUniverso(id);
    if (!universo) return false;

    if (!universoDesbloqueado(id)) {
      const boss = obterBoss(obterUniverso(universo.id - 1) || {});
      mostrarDica("🔒 Derrote " + (boss ? boss.nome : "o boss anterior") + " para acessar este universo.", "defeat", { cooldownMs: 1500 });
      return false;
    }

    fecharPreview();

    jogarTransicao(function () {
      universoAtual = id;

      if (typeof show === "function") show("tela-exploracao");
      if (typeof window.iniciarExploracao === "function") window.iniciarExploracao();
      if (universo.spawn && typeof window.definirSpawnExploracao === "function") {
        window.definirSpawnExploracao(universo.spawn.x, universo.spawn.y);
      }

      if (universo.id > 1) {
        mostrarDica("🚧 Universo " + universo.id + " desbloqueado — mundo em construção.", "normal", { chave: "universo-" + universo.id + "-em-construcao", umaVez: true, cooldownMs: 0 });
      }
    });

    return true;
  }

  // ---------------------------------------------------------------------
  // 6) PREVIEW (item 5 da Etapa 15) — pequeno painel de confirmação antes
  //    de entrar. Injetado uma única vez no <body>, reaproveitado sempre.
  // ---------------------------------------------------------------------
  function garantirPreviewDom() {
    if (document.getElementById("universo-preview-overlay")) return;

    const overlay = document.createElement("div");
    overlay.id = "universo-preview-overlay";
    overlay.className = "universo-preview-overlay";
    overlay.innerHTML =
      '<div class="universo-preview-card" role="dialog" aria-modal="true">' +
        '<button type="button" class="universo-preview-fechar" aria-label="Fechar">✕</button>' +
        '<div class="universo-preview-topo">' +
          '<img class="universo-preview-boss-img" alt="">' +
          '<div>' +
            '<div class="universo-preview-numero"></div>' +
            '<h3 class="universo-preview-titulo"></h3>' +
          '</div>' +
        '</div>' +
        '<p class="universo-preview-desc"></p>' +
        '<div class="universo-preview-boss-linha">🧙 Boss: <strong class="universo-preview-boss-nome"></strong></div>' +
        '<button type="button" class="universo-preview-entrar primary-btn">ENTRAR</button>' +
      '</div>';
    document.body.appendChild(overlay);

    overlay.addEventListener("click", function (evento) {
      if (evento.target === overlay) fecharPreview();
    });
    overlay.querySelector(".universo-preview-fechar").addEventListener("click", fecharPreview);
    overlay.querySelector(".universo-preview-entrar").addEventListener("click", function () {
      const id = Number(overlay.dataset.universoId);
      if (id) entrarNoUniverso(id);
    });
  }

  function abrirPreview(id) {
    const universo = obterUniverso(id);
    if (!universo) return;

    garantirPreviewDom();
    const overlay = document.getElementById("universo-preview-overlay");
    const boss = obterBoss(universo);

    overlay.dataset.universoId = String(id);
    overlay.style.setProperty("--universo-cor", universo.cor);

    const imgEl = overlay.querySelector(".universo-preview-boss-img");
    imgEl.src = boss && boss.imagem ? boss.imagem : "";
    imgEl.style.display = boss && boss.imagem ? "block" : "none";

    overlay.querySelector(".universo-preview-numero").textContent = "🌌 UNIVERSO " + universo.id;
    overlay.querySelector(".universo-preview-titulo").textContent = universo.tema || ("Universo " + universo.id);
    overlay.querySelector(".universo-preview-desc").textContent = universo.descricao || "";
    overlay.querySelector(".universo-preview-boss-nome").textContent = boss ? boss.nome : "???";

    overlay.classList.add("ativo");
  }

  function fecharPreview() {
    const overlay = document.getElementById("universo-preview-overlay");
    if (overlay) overlay.classList.remove("ativo");
  }

  // ---------------------------------------------------------------------
  // 7) GALÁXIA VISUAL (item 1/3 da Etapa 15) — mapa com linhas SVG
  //    conectando os 10 planetas, cada um na posição de UNIVERSOS[].pos.
  //    Usa a MESMA imagem do boss (tela de Bosses) como retrato do planeta;
  //    se não existir imagem, cai num círculo colorido com emoji 🌌 (nunca
  //    aponta pra um arquivo inventado).
  // ---------------------------------------------------------------------
  function renderUniversos() {
    const grid = document.getElementById("grid-universos");
    if (!grid) return;

    garantirTransicaoDom();
    garantirPreviewDom();

    // Linhas conectando cada universo ao próximo (ordem 1→2→...→10).
    const linhasSvg = UNIVERSOS.slice(0, -1).map(function (u, i) {
      const proximo = UNIVERSOS[i + 1];
      const desbloqueadoAmbos = universoDesbloqueado(u.id) && universoDesbloqueado(proximo.id);
      return '<line x1="' + u.pos.x + '" y1="' + u.pos.y + '" x2="' + proximo.pos.x + '" y2="' + proximo.pos.y +
        '" class="galaxy-linha ' + (desbloqueadoAmbos ? "ativa" : "") + '" />';
    }).join("");

    const svg =
      '<svg class="galaxy-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">' + linhasSvg + "</svg>";

    const nos = UNIVERSOS.map(function (universo) {
      const boss = obterBoss(universo);
      const nomeBoss = boss ? boss.nome : "???";
      const desbloqueado = universoDesbloqueado(universo.id);
      const concluido = boss ? bossFoiDerrotado(boss.id) : false;
      const ehAtual = universo.id === universoAtual;

      const imagem = boss && boss.imagem
        ? '<img src="' + boss.imagem + '" alt="' + nomeBoss + '" loading="lazy">'
        : '<span class="universo-node-fallback">🌌</span>';

      const estadoClasse = desbloqueado ? (concluido ? "concluido" : "unlocked") : "locked";
      const selo = !desbloqueado ? "🔒" : (concluido ? "✓" : "");

      return (
        '<button type="button" class="universo-node ' + estadoClasse + (ehAtual ? " atual" : "") + '"' +
          ' style="--universo-cor:' + universo.cor + '; left:' + universo.pos.x + '%; top:' + universo.pos.y + '%"' +
          ' data-universo-id="' + universo.id + '"' +
          ' aria-label="Universo ' + universo.id + " — " + nomeBoss + '">' +
          '<span class="universo-node-anel"></span>' +
          '<span class="universo-node-corpo">' + imagem + "</span>" +
          (selo ? '<span class="universo-node-selo">' + selo + "</span>" : "") +
          '<span class="universo-node-label">U' + universo.id + "<br>" + nomeBoss + "</span>" +
        "</button>"
      );
    }).join("");

    grid.innerHTML =
      '<div class="galaxy-fundo"></div>' +
      svg +
      '<div class="galaxy-nos">' + nos + "</div>";
  }
  window.renderUniversos = renderUniversos;

  document.addEventListener("click", function (evento) {
    const no = evento.target.closest(".universo-node[data-universo-id]");
    if (!no) return;
    evento.preventDefault();
    evento.stopPropagation();

    const id = Number(no.dataset.universoId);
    if (no.classList.contains("locked")) {
      entrarNoUniverso(id); // reaproveita a mensagem de bloqueio já existente
      return;
    }
    abrirPreview(id);
  }, true);

  // ---------------------------------------------------------------------
  // 8) NOTIFICAÇÃO DE NOVO UNIVERSO DESBLOQUEADO — inalterado
  // ---------------------------------------------------------------------
  let ultimoSnapshotDesbloqueados = null;
  function snapshotDesbloqueados() {
    return UNIVERSOS.filter(function (u) { return universoDesbloqueado(u.id); }).map(function (u) { return u.id; });
  }

  function aoAtualizarProgresso() {
    const antes = ultimoSnapshotDesbloqueados;
    const depois = snapshotDesbloqueados();
    ultimoSnapshotDesbloqueados = depois;

    if (!antes) return;
    depois.forEach(function (id) {
      if (antes.indexOf(id) === -1) {
        mostrarDica("🔓 Universo " + id + " desbloqueado!", "reward", { chave: "aviso-universo-" + id, umaVez: true, cooldownMs: 0 });
      }
    });
  }

  window.ArcaneUniversos = {
    lista: UNIVERSOS,
    universoAtual: function () { return universoAtual; },
    obterUniverso: obterUniverso,
    obterBoss: obterBoss,
    universoDesbloqueado: universoDesbloqueado,
    entrarNoUniverso: entrarNoUniverso,
    renderUniversos: renderUniversos,
    aoAtualizarProgresso: aoAtualizarProgresso
  };

  document.addEventListener("DOMContentLoaded", function () {
    ultimoSnapshotDesbloqueados = snapshotDesbloqueados();
    garantirTransicaoDom();
    garantirPreviewDom();
  });
})();
