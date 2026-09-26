// =============================================================================
// universos.js — Arquitetura de Universos (Etapa: Arquitetura e Progressão)
// -----------------------------------------------------------------------------
// Módulo ADITIVO ao Arcane Clash — Duelo de Magias. Carregado DEPOIS de
// menu.js e exploracao.js (mesma ordem de scripts clássicos, sem módulos ES),
// então este arquivo pode ler livremente variáveis globais já existentes como
// `bosses`, `bossesDerrotados`, `missions`, `claimed`, `mostrarToast` e `show`
// — exatamente como batalha.js/exploracao.js já fazem entre si.
//
// O que este arquivo NÃO faz (de propósito):
// - não duplica dados de boss (nome/vida/imagem) — sempre lê do array `bosses`
//   já existente em menu.js;
// - não cria uma segunda fonte de verdade pra "boss derrotado" — sempre lê
//   `bossesDerrotados`, que já é sincronizado com o servidor em menu.js;
// - não mexe em Supabase, RPC, autenticação, dano, vida, IA de boss ou física;
// - não cria um sistema de missões paralelo — NPCs apenas apontam (missionId)
//   pro array `missions` já existente;
// - não constrói os 10 mundos. Universos 2–10 existem só como CONFIGURAÇÃO
//   (nome/boss/spawn reservado) até que cada mundo seja construído de fato.
//
// Se este arquivo não carregar por algum motivo, o jogo continua funcionando
// exatamente como antes: a Arena abre pela tela de bosses de sempre, e o
// mundo do Universo 1 (exploracao.js) continua 100% intacto.
// =============================================================================
(function () {
  "use strict";

  // ---------------------------------------------------------------------
  // 1) CONFIGURAÇÃO DOS UNIVERSOS (item 1/2/16 do roteiro)
  // ---------------------------------------------------------------------
  // Uma linha por universo. `bossId` referencia o array `bosses` já existente
  // (menu.js) — nome/imagem/rank/skills do boss NUNCA são copiados pra cá.
  // `spawn: null` significa "usa o spawn padrão que o mundo já tem hoje"
  // (é o caso do Universo 1, que é o mundo que já existe em exploracao.js).
  // `cenario: null` é um espaço reservado (item 15/17) — só ganha valor
  // quando aquele universo realmente ganhar um mundo próprio construído.
  // ETAPA 7 (item 13/14) — `tema` é só um texto-guia pra quando cada universo
  // ganhar mundo próprio de verdade; não aciona nada sozinho (nenhum código
  // lê `tema` pra desbloquear/mudar visual ainda). O Universo 9 recebe uma
  // nota própria (item 14) descrevendo a direção pedida, também sem ligar
  // nada automaticamente — só documentação viva dentro da própria config.
  const UNIVERSOS = [
    { id: 1, bossId: 1, cenario: "escola-arlan", spawn: null, tema: "Floresta / mundo escolar" },
    { id: 2, bossId: 2, cenario: null, spawn: null, tema: "Chuva / tempestade" },
    { id: 3, bossId: 3, cenario: null, spawn: null, tema: "Neve / gelo" },
    { id: 4, bossId: 4, cenario: null, spawn: null, tema: "Vulcão / fogo" },
    { id: 5, bossId: 5, cenario: null, spawn: null, tema: "Deserto" },
    { id: 6, bossId: 6, cenario: null, spawn: null, tema: "Planeta destruído" },
    { id: 7, bossId: 7, cenario: null, spawn: null, tema: "Mundo mágico" },
    { id: 8, bossId: 8, cenario: null, spawn: null, tema: "Mundo sobrenatural" },
    { id: 9, bossId: 9, cenario: null, spawn: null, tema: "Liminar/estranho — atmosfera original inspirada em espaços liminares (sem copiar mapas/assets de nenhuma obra existente)" },
    { id: 10, bossId: 10, cenario: null, spawn: null, tema: "Ambiente próprio a definir" }
  ];

  // Universo em que o jogador está agora. Hoje só o Universo 1 existe de
  // fato como mundo jogável, então isso começa (e por ora permanece) em 1.
  let universoAtual = 1;

  // ---------------------------------------------------------------------
  // 2) LEITURA DE PROGRESSO — SEMPRE reaproveitando o que já existe
  // ---------------------------------------------------------------------
  function listaBossesDerrotados() {
    // `bossesDerrotados` é `let` no topo de menu.js — como todos os scripts
    // aqui são clássicos (não-módulo) carregados na mesma página, essa
    // variável já existe no escopo global léxico quando este arquivo roda
    // (menu.js vem antes no <script>). Isso é o MESMO padrão que batalha.js
    // e exploracao.js já usam pra ler `mostrarToast`/`show`/`bosses`.
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

  // Regra de desbloqueio (item 3): Universo 1 sempre aberto; os demais
  // exigem que o boss do universo ANTERIOR já tenha sido derrotado.
  function universoDesbloqueado(id) {
    const universo = obterUniverso(id);
    if (!universo) return false;
    if (universo.id === 1) return true;

    const anterior = obterUniverso(universo.id - 1);
    if (!anterior) return false;
    return bossFoiDerrotado(anterior.bossId);
  }

  // ---------------------------------------------------------------------
  // 3) SISTEMA DE MENSAGENS CURTAS (itens 10/12) — reaproveita mostrarToast
  //    (já existe em menu.js, com CSS/timeout de sumiço já prontos). Aqui só
  //    adicionamos controle de "uma vez" e cooldown, pra nunca virar spam.
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
  // 4) ENTRAR NO UNIVERSO (item 7) — reaproveita a exploração já existente.
  // ---------------------------------------------------------------------
  // Hoje só o Universo 1 tem mundo construído: entrar em qualquer universo
  // desbloqueado abre a MESMA exploração de sempre (nenhum mundo novo é
  // criado aqui). O spawn reservado de cada universo já é aplicado quando
  // existir (via definirSpawnExploracao, exposto por exploracao.js), então
  // no dia em que um universo novo ganhar mundo próprio, só é preciso
  // preencher `spawn`/`cenario` na configuração acima — não reescrever isto.
  function entrarNoUniverso(id) {
    const universo = obterUniverso(id);
    if (!universo) return false;

    if (!universoDesbloqueado(id)) {
      const boss = obterBoss(obterUniverso(universo.id - 1) || {});
      mostrarDica("🔒 Derrote " + (boss ? boss.nome : "o boss anterior") + " para acessar este universo.", "defeat", { cooldownMs: 1500 });
      return false;
    }

    universoAtual = id;

    if (typeof show === "function") show("tela-exploracao");
    if (typeof window.iniciarExploracao === "function") window.iniciarExploracao();
    if (universo.spawn && typeof window.definirSpawnExploracao === "function") {
      window.definirSpawnExploracao(universo.spawn.x, universo.spawn.y);
    }

    if (universo.id > 1) {
      // Universo sem mundo próprio construído ainda (etapa atual: só
      // arquitetura) — avisa com transparência em vez de fingir que há algo
      // novo pra ver.
      mostrarDica("🚧 Universo " + universo.id + " desbloqueado — mundo em construção.", "normal", { chave: "universo-" + universo.id + "-em-construcao", umaVez: true, cooldownMs: 0 });
    }

    return true;
  }

  // ---------------------------------------------------------------------
  // 5) MAPA DOS UNIVERSOS (item 5/6) — tela simples de seleção/progresso.
  // ---------------------------------------------------------------------
  function renderUniversos() {
    const grid = document.getElementById("grid-universos");
    if (!grid) return;

    grid.innerHTML = UNIVERSOS.map(function (universo) {
      const boss = obterBoss(universo);
      const nomeBoss = boss ? boss.nome : "???";
      const desbloqueado = universoDesbloqueado(universo.id);
      const concluido = boss ? bossFoiDerrotado(boss.id) : false;

      let statusTexto;
      if (!desbloqueado) {
        const anterior = obterBoss(obterUniverso(universo.id - 1) || {});
        statusTexto = "🔒 DERROTE " + (anterior ? anterior.nome.toUpperCase() : "?");
      } else if (concluido) {
        statusTexto = "✓ CONCLUÍDO";
      } else {
        statusTexto = "✓ DESBLOQUEADO";
      }

      const atualTag = universo.id === universoAtual ? '<span class="universo-atual-tag">VOCÊ ESTÁ AQUI</span>' : "";

      return (
        '<article class="boss-card universo-card ' + (desbloqueado ? "unlocked" : "locked") + '">' +
          '<div class="universo-numero">🌌 UNIVERSO ' + universo.id + "</div>" +
          atualTag +
          "<h3>" + nomeBoss + "</h3>" +
          (universo.tema ? '<div class="universo-tema">' + universo.tema + "</div>" : "") +
          '<div class="universo-status">' + statusTexto + "</div>" +
          '<button class="small-btn ' + (desbloqueado ? "primary" : "") + '" ' +
            (desbloqueado ? ('data-universo-id="' + universo.id + '"') : "disabled") +
            ' type="button">' + (desbloqueado ? "ENTRAR" : "🔒 BLOQUEADO") + "</button>" +
        "</article>"
      );
    }).join("");
  }
  window.renderUniversos = renderUniversos;

  document.addEventListener("click", function (evento) {
    const botao = evento.target.closest("[data-universo-id]");
    if (botao && botao.dataset.universoId) {
      evento.preventDefault();
      evento.stopPropagation();
      entrarNoUniverso(Number(botao.dataset.universoId));
    }
  }, true);

  // ---------------------------------------------------------------------
  // 6) NOTIFICAÇÃO DE NOVO UNIVERSO DESBLOQUEADO (item 3/10)
  // ---------------------------------------------------------------------
  // Chamado depois de uma vitória de boss já confirmada pelo servidor
  // (aoVencerBatalha, em menu.js — reaproveitado, nenhuma lógica de vitória
  // paralela é criada). Compara o progresso antes/depois só pra saber se um
  // universo NOVO acabou de abrir, e avisa uma única vez.
  let ultimoSnapshotDesbloqueados = null;
  function snapshotDesbloqueados() {
    return UNIVERSOS.filter(function (u) { return universoDesbloqueado(u.id); }).map(function (u) { return u.id; });
  }

  function aoAtualizarProgresso() {
    const antes = ultimoSnapshotDesbloqueados;
    const depois = snapshotDesbloqueados();
    ultimoSnapshotDesbloqueados = depois;

    if (!antes) return; // primeira leitura da sessão: só estabelece a base, sem toast
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

  // Estabelece a base assim que possível (sem disparar toast nenhum), pra que
  // a primeira vitória real da sessão já compare corretamente.
  document.addEventListener("DOMContentLoaded", function () {
    ultimoSnapshotDesbloqueados = snapshotDesbloqueados();
  });
})();
