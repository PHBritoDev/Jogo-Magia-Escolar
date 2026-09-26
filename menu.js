const bosses = [
  {id:1,tier:1,nome:'Arlan',rank:'F',imagem:'Arlan.png',skill1:'RelampagoSkill1.gif'},
  {id:2,tier:2,nome:'Marcos',rank:'E',imagem:'Marcos.png',skill1:'SomSkill1.gif'},
  {id:3,tier:3,nome:'Miguel',rank:'C',imagem:'Miguel.png',skill1:'CirculoSkill1.gif'},
  {id:4,tier:4,nome:'Carlos',rank:'B',imagem:'Carlos.png',skill1:'VentoSkill1.gif',skill2:'RaioSkill2.gif'},
  {id:5,tier:5,nome:'Lucas',rank:'A',imagem:'Lucas.png',skill1:'AguaSkill1.gif',skill2:'GeloSkill2.gif'},
  {id:6,tier:6,nome:'Davi',rank:'AA+',imagem:'Davi.png',skill1:'VenenoSkill1.gif',skill2:'FuracaoSkill2.gif'},
  {id:7,tier:7,nome:'Arthur',rank:'S',imagem:'Arthur.png',skill1:'SolSkill1.gif',skill2:'MetalSkill2.gif'},
  {id:8,tier:8,nome:'Vinicius',rank:'SS',imagem:'Vinicius.png',skill1:'MeteoroSkill1.gif',skill2:'MagmaSkill2.gif'},
  {id:9,tier:9,nome:'GuilermeChucro',rank:'SSS+',imagem:'GuilermeChucro.png',skill1:'SolSkill1.gif',skill2:'AbismoSkill2.gif'},
  {id:10,tier:10,nome:'PaulaoDoPneu',rank:'Z+',imagem:'PaulaoDoPneu.png',skill1:'VenenoSkill1.gif',skill2:'EstrelaSkill2.gif'}
];
// Mantido em sincronia com statsPorTier em batalha.js (mesma revisão de balanceamento).
const bossStats={
  1:{vida:1900,moedas:350,diamantes:2},2:{vida:4700,moedas:490,diamantes:4},3:{vida:9800,moedas:890,diamantes:8},
  4:{vida:19000,moedas:2050,diamantes:14},5:{vida:35000,moedas:4500,diamantes:24},6:{vida:57750,moedas:9600,diamantes:40},
  7:{vida:93500,moedas:19500,diamantes:65},8:{vida:147500,moedas:39000,diamantes:100},9:{vida:185000,moedas:89000,diamantes:180},10:{vida:205000,moedas:255000,diamantes:350}
};
// Rótulos com identidade de "inimigo perigoso" (boss não é item). cls/color mantidos
// intocados — são o que o CSS usa pra colorir os cards de boss, então nada visual quebra.
const bossRankInfo={
  F:{label:'RANK F • NORMAL',cls:'rank-f',color:'#2471f4'},E:{label:'RANK E • HOSTIL',cls:'rank-e',color:'#0a692b'},C:{label:'RANK C • PERIGOSO',cls:'rank-c',color:'#063b69'},B:{label:'RANK B • VIOLENTO',cls:'rank-b',color:'#b178ff'},A:{label:'RANK A • BRUTAL',cls:'rank-a',color:'#503d04'},'AA+':{label:'RANK AA+ • IMPLACÁVEL',cls:'rank-aa',color:'#9c3905'},S:{label:'RANK S • SANGUINÁRIO',cls:'rank-s',color:'#66041a'},SS:{label:'RANK SS • DEMONÍACO',cls:'rank-ss',color:'#02565e'},'SSS+':{label:'RANK SSS+ • LENDÁRIO',cls:'rank-sss',color:'#5b0548'},'Z+':{label:'RANK Z+ • APOCALÍPTICO',cls:'rank-z',color:'#51010c'}
};
const rarityInfo={
  comum:{label:'Comum',cls:'rarity-comum tier-baixa'},incomum:{label:'Incomum',cls:'rarity-incomum tier-baixa'},raro:{label:'Raro',cls:'rarity-raro tier-baixa'},epico:{label:'Épico',cls:'rarity-epico tier-media'},
  lendario:{label:'Legendary',cls:'rarity-lendario tier-media'},mitico:{label:'Mytchial',cls:'rarity-mitico tier-media'},secreto:{label:'Secret',cls:'rarity-secreto tier-media'},divino:{label:'Divino',cls:'rarity-divino tier-alta'},
  celestial:{label:'Celestial',cls:'rarity-celestial tier-alta'},supremo:{label:'Supremo',cls:'rarity-supremo tier-alta'},ilimitado:{label:'Ilimitado',cls:'rarity-ilimitado tier-alta'},exclusivo:{label:'Exclusivo',cls:'rarity-exclusivo tier-alta'},indefinido:{label:'Transcendente',cls:'rarity-indefinido tier-alta'},transcendente:{label:'???',cls:'rarity-transcendente tier-alta'},especial:{label:'Especial',cls:'rarity-especial tier-alta'},hunge:{label:'Hunge',cls:'rarity-hunge tier-alta'},secret:{label:'Secret',cls:'rarity-secreto tier-alta'},Arcanjo:{label:'Arcanjo',cls:'rarity-celestial tier-alta'},
  // Raridade própria da SKILL 1 (tema: evolução de técnica) — nomes diferentes dos de Personagens.
  iniciante:{label:'Iniciante',cls:'rarity-iniciante tier-baixa'},aprendiz:{label:'Aprendiz',cls:'rarity-aprendiz tier-baixa'},adepto:{label:'Adepto',cls:'rarity-adepto tier-baixa'},especialista:{label:'Especialista',cls:'rarity-especialista tier-media'},mestre:{label:'Mestre',cls:'rarity-mestre tier-media'},graomestre:{label:'Grão-Mestre',cls:'rarity-graomestre tier-media'},arcano:{label:'Arcano',cls:'rarity-arcano tier-alta'},primordial:{label:'Primordial',cls:'rarity-primordial tier-alta'},
  // Raridade própria da SKILL 2 (tema: poder destrutivo/cataclismo).
  bruto:{label:'Bruto',cls:'rarity-bruto tier-baixa'},carregado:{label:'Carregado',cls:'rarity-carregado tier-baixa'},explosivo:{label:'Explosivo',cls:'rarity-explosivo tier-media'},devastador:{label:'Devastador',cls:'rarity-devastador tier-media'},cataclismico:{label:'Cataclísmico',cls:'rarity-cataclismico tier-media'},apocaliptico:{label:'Apocalíptico',cls:'rarity-apocaliptico tier-alta'},dimensional:{label:'Dimensional',cls:'rarity-dimensional tier-alta'},estelar:{label:'Estelar',cls:'rarity-estelar tier-alta'},cosmico:{label:'Cósmico',cls:'rarity-cosmico tier-alta'},singularidade:{label:'Singularidade',cls:'rarity-singularidade tier-alta'},
  // Raridade própria da ULTIMATE (tema: ascensão mítica).
  faisca:{label:'Faísca',cls:'rarity-faisca tier-baixa'},impulso:{label:'Impulso',cls:'rarity-impulso tier-baixa'},explosao:{label:'Explosão',cls:'rarity-explosao tier-media'},tempestade:{label:'Tempestade',cls:'rarity-tempestade tier-media'},ruptura:{label:'Ruptura',cls:'rarity-ruptura tier-media'},calamidade:{label:'Calamidade',cls:'rarity-calamidade tier-alta'},juizo:{label:'Juízo',cls:'rarity-juizo tier-alta'},ascensao:{label:'Ascensão',cls:'rarity-ascensao tier-alta'},eternidade:{label:'Eternidade',cls:'rarity-eternidade tier-alta'},onipotencia:{label:'Onipotência',cls:'rarity-onipotencia tier-alta'}
};
const personagens = [
{id:'ArthurBanner',nome:'Arthur',tier:'Comum',raridade:'comum',arquivo:'ArthurBanner.webp',peso:50,buff:'+6% dano • +4% resistência'},
{id:'GuilermeChucroBanner',nome:'GuilermeChucro',tier:'Incomum',raridade:'incomum',arquivo:'GuilermeChucroBanner.webp',peso:15,buff:'+9% dano • +4% resistência • +5% recarga'},
{id:'LucasBanner',nome:'Lucas',tier:'Raro',raridade:'raro',arquivo:'LucasBanner.webp',peso:9,buff:'+12% dano • +6% resistência • +7% recarga'},
{id:'MarcosBanner',nome:'Marcos',tier:'Épico',raridade:'epico',arquivo:'MarcosBanner.webp',peso:7,buff:'+16% dano • +8% resistência • +7% recarga'},
{id:'CarlosBanner',nome:'Carlos',tier:'Legendary',raridade:'lendario',arquivo:'CarlosBanner.webp',imagem:'CarlosBanner.webp',peso:5,buff:'+22% dano • +10% resistência • +10% recarga • +6% Ultimate'},
{id:'MiguelBanner',nome:'Miguel',tier:'Mytchial',raridade:'mitico',arquivo:'MiguelBanner.webp',peso:4,buff:'+30% dano • +12% resistência • +12% recarga • +10% Ultimate'},
{id:'JapaBanner',nome:'Japa',tier:'Secret',raridade:'secreto',arquivo:'JapaBanner.webp',peso:3.5,buff:'+35% dano • +14% resistência • +14% recarga • +12% Ultimate • +3% crítico'},
{id:'ArlanBanner',nome:'Arlan',tier:'Secret',raridade:'secreto',arquivo:'ArlanBanner.webp',peso:3,buff:'+40% dano • +16% resistência • +15% recarga • +15% Ultimate • +4% crítico'},
{id:'ViniciusBanner',nome:'Vinicius',tier:'Divino',raridade:'divino',arquivo:'ViniciusBanner.webp',peso:2.5,buff:'+52% dano • +20% resistência • +18% recarga • +20% Ultimate • +6% crítico'},
{id:'JuliaBanner',nome:'Julia',tier:'Celestial',raridade:'celestial',arquivo:'JuliaBanner.webp',bannerImagem:'JuliaBanner.jpg',peso:1.8,buff:'+68% dano • +24% resistência • +21% recarga • +24% Ultimate • +8% crítico'},
{id:'PeidaLeiteBanner',nome:'PeidaLeite',tier:'Supremo',raridade:'supremo',arquivo:'PeidaLeiteBanner.webp',peso:1.4,buff:'+85% dano • +28% resistência • +24% recarga • +28% Ultimate • +10% crítico'},
{id:'KauanBanner',nome:'Kauan',tier:'Exclusivo',raridade:'exclusivo',arquivo:'KauanBanner.mp4',peso:1,buff:'+105% dano • +32% resistência • +27% recarga • +34% Ultimate • +12% crítico'},
{id:'PaulaoDoPneuBanner',nome:'PaulaoDoPneu',tier:'Transcendente',raridade:'transcendente',arquivo:'PaulaoDoPneuBanner.jpg',imagem:'PaulaoDoPneuBanner.jpg',peso:.3,buff:'+125% dano • +36% resistência • +30% recarga • +40% Ultimate • +14% crítico'},
// Versões vendidas na loja de troféus do PvP: mesmo visual/raridade do personagem real,
// mas com buff de UM TIER ABAIXO (nunca igual ao personagem de verdade) — pra não virar
// um jeito garantido e mais barato de conseguir o mesmo poder que sair no banner.
// ID próprio (sufixo "Pvp") pra nunca se misturar/fundir com as cópias tiradas de verdade.
{id:'JuliaBannerPvp',nome:'Julia',tier:'Celestial',raridade:'celestial',arquivo:'JuliaBanner.webp',bannerImagem:'JuliaBanner.jpg',peso:0,buff:'+52% dano • +20% resistência • +18% recarga • +20% Ultimate • +6% crítico'},
{id:'PeidaLeiteBannerPvp',nome:'PeidaLeite',tier:'Supremo',raridade:'supremo',arquivo:'PeidaLeiteBanner.webp',peso:0,buff:'+68% dano • +24% resistência • +21% recarga • +24% Ultimate • +8% crítico'},
{id:'KauanBannerPvp',nome:'Kauan',tier:'Exclusivo',raridade:'exclusivo',arquivo:'KauanBanner.mp4',peso:0,buff:'+85% dano • +28% resistência • +24% recarga • +28% Ultimate • +10% crítico'},
{id:'PaulaoDoPneuBannerPvp',nome:'PaulaoDoPneu',tier:'Transcendente',raridade:'transcendente',arquivo:'PaulaoDoPneuBanner.jpg',imagem:'PaulaoDoPneuBanner.jpg',peso:0,buff:'+105% dano • +32% resistência • +27% recarga • +34% Ultimate • +12% crítico'},
{id:'PetHunge',nome:'Beijo',tier:'Hunge',raridade:'hunge',arquivo:'Beijo.mp4',imagem:'Beijo.png',bannerImagem:'Beijo.png',peso:0,buff:'DANO = melhor personagem equipado +10% • +5% defesa • +5% recarga de Ultimate • +20% moedas • +5% diamantes'},
{id:'ChucroHunge',nome:'Chucro',tier:'Hunge',raridade:'hunge',arquivo:'Chucro.mp4',imagem:'Chucro.png',bannerImagem:'Chucro.png',peso:0,buff:'DANO = melhor personagem equipado +15% • +5% defesa • +10% recarga de Ultimate • +10% moedas • +10% diamantes'}
];
const pesoTotalBanner = personagens.reduce((total, p) => total + p.peso, 0);
personagens.forEach((p) => { p.chance = p.peso / pesoTotalBanner; });
// Personagens comprados na loja de troféus do PvP (sufixo "Pvp" no id) continuam existindo
// aqui só pra loja do PvP conseguir validar/equipar/exibir buffs deles. Mas eles nunca devem
// aparecer nas telas do jogo principal (Info do Banner / Personagens Obtidos): não têm imagem
// própria mapeada em bannerStaticSrc(), então caíam no fallback 'BannerFoto.png' (a arte
// genérica de divulgação com "GIRAR" e 4 rostos) — esse era o bug do card quebrado.
// Este filtro NÃO mexe em weightedPick/fusão/equipar — só no que é LISTADO nessas 2 telas.
const personagensPrincipais = personagens.filter((p) => !p.id.endsWith('Pvp'));
const skills={
  skill1:[
    ['RelampagoSkill1','Relâmpago','iniciante',900,42],['SomSkill1','Som','aprendiz',2200,75],['CirculoSkill1','Círculo','adepto',6500,125],['VentoSkill1','Vento','especialista',17000,210],
    ['AguaSkill1','Água','mestre',45000,340],['VenenoSkill1','Veneno','graomestre',115000,520],['SolSkill1','Sol','arcano',320000,820],['MeteoroSkill1','Meteoro','primordial',800000,1250]
  ].map(x=>({id:x[0],nome:x[1],raridade:x[2],preco:x[3],dano:x[4],gif:x[0]+'.gif'})),
  skill2:[
    // Preços renivelados (13/09) — usando as moedas que os bosses dão como régua.
    // Cada tier custa ~7-9 vitórias do boss de tier equivalente (antes variava de
    // ~5 até 20 vitórias dependendo do tier). Teto ficou igual ao teto da Skill1
    // (~780k-800k) em vez de 2,8M — client (aqui) e servidor (RPC comprar_equipamento
    // no Supabase) foram atualizados juntos, senão a loja mostra um preço e cobra outro.
    ['RaioSkill2','Raio','bruto',1500,145],['GeloSkill2','Gelo','carregado',3300,290],['FuracaoSkill2','Furacão','explosivo',7200,480],['MetalSkill2','Metal','devastador',15500,790],
    ['MagmaSkill2','Magma','cataclismico',34000,1200],['AbismoSkill2','Abismo','apocaliptico',74000,1750],['MeteoroSkill2','Meteoro','dimensional',162000,2350],['SolSkill2','Sol','estelar',355000,3100],
    ['EstrelaSkill2','Estrela Astral','cosmico',780000,4500],['BlackholeSkill2','Blackhole','singularidade',0,6200]
  ].map(x=>({id:x[0],nome:x[1],raridade:x[2],preco:x[3],dano:x[4],gif:x[0]+'.gif'}))
};
const ultimateAudio = [
  'ArlanUltimate.mp3', 'MarcosUltimate.mp3', 'MiguelUltimate.mp3', 'CarlosUltimate.mp3',
  'lucasUltimate.mp3', 'DaviUltimate.mp3', 'ArthurUltimate.mp3', 'ViniciusUltimate.mp3',
  'GuilermeUltimate.mp3', 'pauloUltimate.mp3'
];

const ultimates = bosses.map((boss, index) => ({
  id: 'Ultimate' + boss.id,
  nome: 'Ultimate ' + boss.nome,
  raridade: ['faisca', 'impulso', 'explosao', 'tempestade', 'ruptura', 'calamidade', 'juizo', 'ascensao', 'eternidade', 'onipotencia'][index],
  preco: [2500, 5000, 9000, 16000, 28000, 48000, 85000, 150000, 260000, 450000][index],
  // Pedido: dano base da Ultimate do jogador = 13% da vida do boss correspondente
  // (statsPorTier em batalha.js: 1900,4700,9800,19000,35000,57750,93500,147500,228000,346000).
  dano: [250, 610, 1275, 2470, 4550, 7500, 12150, 19175, 29640, 44980][index],
  video: 'Boss' + boss.id + '.mp4',
  audio: ultimateAudio[index]
}));
const gamepasses=[['2x Money','4,99','Dobra as moedas das vitórias.'],['2x Diamantes','3,99','Dobra os diamantes das vitórias.'],['2x Chance Diamantes','3,49','Dobra a chance de encontrar diamantes.'],['Multi Open','5,99','Girar (4) abre +3 extras: 7 no total.'],['Lucky Raro','1,99','Aumenta em 30% a sorte de todos os personagens Raros (não afeta só o melhor equipado).'],['Extrem Lucky','8,99','PERMANENTE • Dobra a sorte dos personagens Épico ou melhores (combina com a Poção Lucky).'],['VIP','5,99','PERMANENTE • Pequeno bônus de moedas e diamantes + selo especial no perfil.']];
const gamepassNameToKey = {
  '2x Money': '2x_moedas',
  '2x Diamantes': '2x_diamantes',
  '2x Chance Diamantes': '2x_chance_diamante',
  'Multi Open': 'multi_open',
  'Lucky Raro': 'lucky_raro',
  'Extrem Lucky': 'extreme_lucky',
  'VIP': 'vip'
};
function ownsGamepass(nome){
  const chave = gamepassNameToKey[nome];
  return chave ? gamepassesOwned[chave] === true : false;
}
function comprarGamepassPermanente(nome){
  if (ownsGamepass(nome)) { alert('Você já possui esta Game Pass.'); return; }
  alert('Mande Pix para esse numero: 61981946045\n\nDepois mande comprovante para esse numero de ZapZap: 6198220-6185\n\nFale a game pass que você queria e ela cairá na sua conta em alguns momentos 💋');
  renderGamepasses();
}
window.comprarGamepassPermanente = comprarGamepassPermanente;
function podeComprarPocaoLoja(chave){
  const ultima = Number(pocoes[chave + '_ultima_compra'] || 0);
  return (Date.now() - ultima) >= 24 * 60 * 60 * 1000;
}
function comprarPocaoLoja(chave, tipos){
  if (!podeComprarPocaoLoja(chave)) { alert('Você já comprou isso hoje. A oferta volta a ficar disponível em 24 horas.'); return; }
  alert('Mande Pix para esse numero: 61981946045\n\nDepois mande comprovante para esse numero de ZapZap: 6198220-6185\n\nFale a game pass que você queria e ela cairá na sua conta em alguns momentos 💋');
  renderGamepasses();
}
window.comprarPocaoLoja = comprarPocaoLoja;
function comprarExpansaoInventario(qtd){
  alert('Mande Pix para esse numero: 61981946045\n\nDepois mande comprovante para esse numero de ZapZap: 6198220-6185\n\nFale a game pass que você queria e ela cairá na sua conta em alguns momentos 💋');
  renderGamepasses();
}
window.comprarExpansaoInventario = comprarExpansaoInventario;
const SAVE = 'arcaneClashSaveV6';
let bossSelecionadoId = null;
let lifeUpgrades = 0;
let moedasGlobais = 500;
let diamantesGlobais = 10;
let bossesDerrotados = [];
let bossKills = {};
let musicaLigada = true;
let autoSpin = false;
let tutorialStep = 0;
let compraSkill2Obrigatoria = false;
let missionProgress = { boss1: 0 };
let fused = {};
let claimed = {};
let fusionBonuses = {};
let bannerAnimating = false;
let dailySpinAt = 0;
let dailyLoginLastAt = 0;
let dailyLoginDay = 1;
let dailyLoginShown = false;
let dailyWheelAnimating = false;
let dailyWheelRotation = 0;
let redeemedCodes = {};
let bonusFreeSpins = 0;
let dailyPendingReward = null;
let batalhaMusicaLigada = true;
const pocoes = { lucky: 0, damage: 0, coins: 0, diamond: 0 };
const pocoesAtivas = { lucky: 0, damage: 0, coins: 0, diamond: 0 };
let extremLuckyOwned = false;
let vipOwned = false;
let luckyRaroOwned = false;
let moneyX2Owned = false;
let diamondX2Owned = false;
let diamondChanceX2Owned = false;
let multiOpenOwned = false;
const gamepassesOwned = {};
let sincronizacaoInicialFeita = false;
let inventoryBonusCap = 0;
const potionPurchaseTimestamps = {};
function getInventoryMax(){ return 50 + Number(inventoryBonusCap || 0); }
const missionReadyNotified = new Set();
const jogador={nome:'',imagem:'Paulo.jpg'};
const inventario={possuidos:[],equipados:{skill1:null,skill2:null,ultimate:null,imagem:null,tema:null}};
let autoDescarte = {};
const AUTO_DESCARTE_BLOQUEADOS = new Set(['PaulaoDoPneuBanner', 'KauanBanner', 'PeidaLeiteBanner', 'PetHunge', 'ChucroHunge']);
const rarityBuff={comum:{dmg:.05,res:.03,cd:.00,ult:.00,crit:.00,move:.00},incomum:{dmg:.08,res:.04,cd:.05,ult:.00,crit:.00,move:.01},raro:{dmg:.11,res:.06,cd:.07,ult:.02,crit:.01,move:.03},epico:{dmg:.15,res:.08,cd:.07,ult:.06,crit:.02,move:.04},lendario:{dmg:.20,res:.10,cd:.10,ult:.09,crit:.03,move:.05},mitico:{dmg:.27,res:.12,cd:.12,ult:.12,crit:.03,move:.06},secreto:{dmg:.36,res:.16,cd:.15,ult:.16,crit:.04,move:.07},divino:{dmg:.48,res:.20,cd:.17,ult:.20,crit:.06,move:.08},celestial:{dmg:.62,res:.24,cd:.20,ult:.24,crit:.08,move:.09},supremo:{dmg:.78,res:.28,cd:.23,ult:.28,crit:.10,move:.10},ilimitado:{dmg:1.05,res:.34,cd:.27,ult:.36,crit:.13,move:.11},exclusivo:{dmg:1.25,res:.38,cd:.30,ult:.43,crit:.15,move:.12},indefinido:{dmg:1.55,res:.43,cd:.34,ult:.50,crit:.17,move:.13},transcendente:{dmg:1.70,res:.46,cd:.37,ult:.56,crit:.19,move:.14}};
function save(){
  try{
    localStorage.setItem(SAVE, JSON.stringify({
      musicaLigada,
      batalhaMusicaLigada,
      extremLuckyOwned,
      vipOwned,
      inventoryBonusCap,
      potionPurchaseTimestamps
    }));
  }catch(e){}
}

window.salvarProgresso = save;

function load(){
  try{
    const d = JSON.parse(localStorage.getItem(SAVE) || 'null');

    if(!d) return;

    musicaLigada = d.musicaLigada !== false;
    batalhaMusicaLigada = d.batalhaMusicaLigada !== false;
    extremLuckyOwned = d.extremLuckyOwned === true;
    vipOwned = d.vipOwned === true;
    inventoryBonusCap = Number(d.inventoryBonusCap || 0);
    if (d.potionPurchaseTimestamps && typeof d.potionPurchaseTimestamps === 'object') {
      Object.assign(potionPurchaseTimestamps, d.potionPurchaseTimestamps);
    }

  }catch(e){
    console.warn('Configuração local inválida:', e);
  }
}


load();

if (missionProgress.boss1 >= 3 && !inventario.equipados.skill2 && moedasGlobais >= 1500) {
  compraSkill2Obrigatoria = true;
}

const idsPersonagensAtuais = new Set(personagens.map((personagem) => personagem.id));

inventario.possuidos = inventario.possuidos.filter((id) =>
  id === 'BalaMagicaSkill1' ||
  skills.skill1.some((item) => item.id === id) ||
  skills.skill2.some((item) => item.id === id) ||
  ultimates.some((item) => item.id === id) ||
  idsPersonagensAtuais.has(id)
);

if (!idsPersonagensAtuais.has(inventario.equipados.imagem)) {
  inventario.equipados.imagem = null;
}

if(tutorialStep===0 && inventario.possuidos.some(id=>personagens.some(p=>p.id===id)))tutorialStep=1;
if(tutorialStep<2 && inventario.equipados.imagem)tutorialStep=2;
if(tutorialStep<3 && (missionProgress.boss1||0)>=3)tutorialStep=3;
if(tutorialStep<4 && inventario.equipados.skill2)tutorialStep=4;

function fmt(valor) {
  if (valor >= 1e6) {
    return (valor / 1e6).toFixed(valor % 1e6 ? 1 : 0) + 'm';
  }

  if (valor >= 1e4) {
    return (valor / 1e3).toFixed(valor % 1e3 ? 1 : 0) + 'k';
  }

  return String(Math.floor(valor));
}
function rarityColor(raridade) {
  // Cada raridade do jogo (Personagens, Skill1, Skill2, Ultimate) precisa de UMA cor
  // própria aqui. --rarity é aplicado via inline style em cada card (style="--rarity:...")
  // e inline style sempre vence qualquer regra do CSS, não importa o que a gente mude
  // lá — por isso "nenhuma cor mudava": faltavam TODAS as raridades de Skill1/Skill2/
  // Ultimate aqui (caíam no fallback branco #ffffff, por isso pareciam sem cor nenhuma),
  // e várias raridades de Personagem tinham cores quase pretas (celestial, ilimitado,
  // divino, exclusivo, indefinido) que na prática também pareciam "sem cor".
  const cores = {
    // Personagens (fraca → forte)
    comum: '#e7edf7',
    incomum: '#39ff7a',
    raro: '#2ec2ff',
    epico: '#b83bff',
    lendario: '#ffbe0b',
    mitico: '#ff2d55',
    secreto: '#c9c9d9',
    secret: '#c9c9d9',
    divino: '#17e9ff',
    celestial: '#5a7bff',
    supremo: '#ff17d4',
    ilimitado: '#ffffff',
    exclusivo: '#ffd200',
    indefinido: '#c23dff',
    transcendente: '#17ffd0',
    especial: '#ff5cf0',
    Arcanjo: '#ff2b6b',
    hunge: '#ffee00',
    // Skill 1 (fraca → forte)
    iniciante: '#cfd8e3',
    aprendiz: '#7ee787',
    adepto: '#38bdf8',
    especialista: '#a78bfa',
    mestre: '#fbbf24',
    graomestre: '#fb7185',
    arcano: '#22d3ee',
    primordial: '#f0abfc',
    // Skill 2 (fraca → forte)
    bruto: '#9ca3af',
    carregado: '#34d399',
    explosivo: '#fb923c',
    devastador: '#ef4444',
    cataclismico: '#a855f7',
    apocaliptico: '#f43f5e',
    dimensional: '#6366f1',
    estelar: '#facc15',
    cosmico: '#06b6d4',
    singularidade: '#e879f9',
    // Ultimate (fraca → forte)
    faisca: '#fde68a',
    impulso: '#93c5fd',
    explosao: '#fca5a5',
    tempestade: '#60a5fa',
    ruptura: '#c084fc',
    calamidade: '#f87171',
    juizo: '#fbbf24',
    ascensao: '#34d399',
    eternidade: '#f472b6',
    onipotencia: '#fef08a'
  };

  return cores[raridade] || '#ffffff';
}
function contarPersonagensNoInventario() {
  return inventario.possuidos.filter((id) => personagens.some((personagem) => personagem.id === id)).length;
}

function formatarTempoRestante(ms){ const total=Math.max(0,Math.floor(ms/1000)); const h=Math.floor(total/3600),m=Math.floor((total%3600)/60),sec=total%60; return [h,m,sec].map((v,i)=>i===0?String(v).padStart(2,'0'):String(v).padStart(2,'0')).join(':'); }
function updateResources() {
  const moedas = document.getElementById('moedas-menu');
  const diamantes = document.getElementById('diamantes-menu');
  const inventarioLabel = document.getElementById('inventario-banner-label');
  const dailyStatus = document.getElementById('daily-status');
  const giroLabel = document.getElementById('giro-gratis-label');
  const dailyWheelLabel = document.getElementById('daily-wheel-status');

  if (moedas) moedas.textContent = fmt(moedasGlobais);
  if (diamantes) diamantes.textContent = fmt(diamantesGlobais);
  if (inventarioLabel) {
    inventarioLabel.textContent = `Inventário: ${Math.min(getInventoryMax(), contarPersonagensNoInventario())}/${getInventoryMax()}`;
  }


  if (document.getElementById('tela-giro-diario')?.classList.contains('active') && !dailyWheelAnimating) {
  const rewardBox = document.getElementById('daily-wheel-result');

  if (!rewardBox || rewardBox.classList.contains('hidden')) {
    renderDailyWheel();
  }
}
  if (document.getElementById('tela-inventario')?.classList.contains('active')) {
    renderInventory(inventoryActiveTab);
  }

  const giroLivre = Date.now() >= dailySpinAt;
  const giroDiarioLivre = giroLivre;


  if (dailyStatus) {
    dailyStatus.textContent = giroLivre ? 'Disponível' : 'Em espera';
  }

  if (dailyWheelLabel) dailyWheelLabel.textContent = giroDiarioLivre ? 'Disponível agora 🎁' : 'Próximo em '+formatarTempoRestante(dailySpinAt-Date.now());

  if (giroLabel) {
    giroLabel.textContent = giroLivre
      ? '🎁 Giro grátis disponível'
      : '⏳ Próximo giro grátis: ' + formatarTempoRestante(dailySpinAt - Date.now());
  }

}

function criarBadge(elemento, valor) {
  let badge = elemento.querySelector('.ui-notification-badge');

  if (!valor) {
    if (badge) badge.remove();
    return;
  }

  if (!badge) {
    badge = document.createElement('span');
    badge.className = 'ui-notification-badge';
    elemento.appendChild(badge);
  }

  badge.textContent = valor > 9 ? '9+' : String(valor);
}

function updateNotificationBadges() {
  const prontos = missions
    ? missions.filter((mission) => !claimed[mission.id] && mission.check()).length
    : 0;

  const lojaDisponivel = [
    ...skills.skill2,
    ...ultimates
  ].filter((item) => {
    return item.preco > 0 &&
      !inventario.possuidos.includes(item.id) &&
      moedasGlobais >= item.preco;
  }).length;

  const bossesDisponiveis = bosses.filter((boss) => {
    const unlocked = boss.id === 1 || bossesDerrotados.includes(boss.id - 1);
    return unlocked && !bossesDerrotados.includes(boss.id);
  }).length;

  const personagensNovos = contarPersonagensNoInventario();
  const temaDisponivel = inventario.equipados.tema ? 0 : 1;

  document.querySelectorAll('[data-badge-target]').forEach((elemento) => {
    const alvo = elemento.dataset.badgeTarget;
    const valores = {
      banner: 0,
      dailywheel: Date.now() >= dailySpinAt ? 1 : 0,
      loja: lojaDisponivel,
      personagens: personagensNovos,
      missoes: prontos,
      bosses: bossesDisponiveis,
      temas: temaDisponivel,
      melhorias: moedasGlobais >= 900 * (lifeUpgrades + 1) ? 1 : 0,
      inventario: personagensNovos
    };

    criarBadge(elemento, valores[alvo] || 0);
  });
}

function mostrarToast(texto, tipo = 'normal') {
  const area = document.getElementById('toast-area');
  if (!area) return;

  const toast = document.createElement('div');
  toast.className = `game-toast ${tipo}`;
  toast.textContent = texto;
  area.appendChild(toast);

  setTimeout(() => toast.remove(), 3600);
}

function aplicarMusicaLobby(ativada) {
  if (typeof window.setLobbyMusic !== 'function') return;
  window.setLobbyMusic(ativada);
}
document.addEventListener('pointerdown',()=>{if(document.getElementById('tela-menu')?.classList.contains('active')&&musicaLigada)aplicarMusicaLobby(true)},{once:false,passive:true});
function show(id) {
  // A navegação é sempre livre. A missão da Skill 2 informa a condição,
  // mas nunca sequestra os botões de voltar ou outras telas.
  document.querySelectorAll('.screen').forEach((screen) => {
    screen.classList.remove('active');
  });

  const target = document.getElementById(id);
  if (!target) return;

  target.classList.remove('hidden');
  target.classList.add('active');

  if (id === 'tela-bosses' || id === 'tela-boss-info' || id === 'tela-jogo') {
    // Música do lobby só é silenciada na área dos bosses e dentro da batalha.
    aplicarMusicaLobby(false);
  } else {
    aplicarMusicaLobby(musicaLigada);
  }

  if (id === 'tela-banner') renderBanner();
  if (id === 'tela-giro-diario') renderDailyWheel();
  if (id === 'tela-bosses') renderBosses();
  if (id === 'tela-universos' && window.ArcaneUniversos) window.ArcaneUniversos.renderUniversos();
  if (id === 'tela-personagens') renderCharacters();
  if (id === 'tela-missoes') renderMissions();
  if (id === 'tela-gamepass') renderGamepasses();
  if (id === 'tela-loja') renderShop(shopCategory || 'skill1');
  if (id === 'tela-inventario') renderInventory();
  if (id === 'tela-melhorias') renderUpgrades();
  if (id === 'tela-temas') renderThemes();
  if (id === 'tela-boss-info') renderBossInfo();
  if (id === 'tela-top-global') renderTopGlobal();

  if (typeof renderTutorialVisual === 'function') renderTutorialVisual();
}

window.show = show;

async function renderTopGlobal() {
  const el = document.getElementById('top-global-conteudo');
  if (!el) return;
  el.innerHTML = '<div style="text-align:center;color:#9aa3c7;padding:30px 0">Carregando...</div>';

  const { data, error } = await window.supabaseClient.rpc('top_global_moedas_diamantes');
  if (error || !data) { el.innerHTML = '<div style="text-align:center;color:#ff6b6b;padding:30px 0">Não foi possível carregar o ranking.</div>'; return; }

  const medalha = (i) => i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '#' + (i + 1);
  const corPos = (i) => i === 0 ? '#ffd166' : i === 1 ? '#c7d0da' : i === 2 ? '#c07a3e' : '#7b5cff';
  const nomeSeguro = (n) => (!n || n.includes('@')) ? (n ? n.split('@')[0] : 'Jogador') : n;

  const linha = (nome, avatar, avatarUrl, cor, valor, unidade, i, userId) => `
    <div onclick="abrirPerfilPublicoLobby('${userId}')" style="cursor:pointer;display:flex;align-items:center;gap:10px;padding:10px 12px;margin-bottom:8px;border-radius:14px;
      background:linear-gradient(135deg, rgba(123,92,255,.10), rgba(66,239,255,.06));
      border:1px solid ${corPos(i)};box-shadow:0 0 12px ${corPos(i)}33">
      <div style="width:30px;text-align:center;font-weight:900;font-size:15px;color:${corPos(i)};text-shadow:0 0 8px ${corPos(i)}">${medalha(i)}</div>
      <div style="width:46px;height:46px;border-radius:50%;background:#12142a;border:2px solid ${corPos(i)};
        display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;overflow:hidden">${avatarUrl ? `<img src="${avatarUrl}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%">` : (avatar || '🧙')}</div>
      <div style="flex:1;overflow:hidden">
        <div style="font-weight:700;font-size:13px;color:${cor || '#fff'};overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${nome || 'Jogador'}</div>
        ${i < 5 ? `<div style="font-size:9px;font-weight:800;color:#3dffa0">TOP 5</div>` : ''}
      </div>
      <div style="font-weight:900;font-size:13px;color:${corPos(i)};white-space:nowrap">${Number(valor||0).toLocaleString('pt-BR')} ${unidade}</div>
    </div>`;

  const moedas = data.moedas || [];
  const diamantes = data.diamantes || [];

  el.innerHTML =
    `<div style="font-weight:900;letter-spacing:1px;margin:6px 0 10px;color:#ffd166;text-shadow:0 0 10px #ffd16688">💰 TOP 10 MOEDAS</div>` +
    moedas.map((p,i) => linha(nomeSeguro(p.username), p.avatar_emoji, p.avatar_image_url, p.name_color, p.coins, '🪙', i, p.user_id)).join('') +
    `<div style="font-weight:900;letter-spacing:1px;margin:18px 0 10px;color:#7ee8ff;text-shadow:0 0 10px #7ee8ff88">💎 TOP 10 DIAMANTES</div>` +
    diamantes.map((p,i) => linha(nomeSeguro(p.username), p.avatar_emoji, p.avatar_image_url, p.name_color, p.diamante, '💎', i, p.user_id)).join('');
}
window.renderTopGlobal = renderTopGlobal;

const RANK_LABEL_PUBLICO = { bronze:'Bronze', prata:'Prata', ouro:'Ouro', diamante:'Diamante', desafiante:'Desafiante' };
const RANK_COR_PUBLICO = { bronze:'#c07a3e', prata:'#c7d0da', ouro:'#ffd166', diamante:'#7ee8ff', desafiante:'#ff5cf0' };

function fecharModalPerfilPublico() {
  const el = document.getElementById('modal-perfil-publico');
  if (el) el.remove();
}
window.fecharModalPerfilPublico = fecharModalPerfilPublico;

function renderModalPerfilPublico(data) {
  fecharModalPerfilPublico();

  const rankCor = RANK_COR_PUBLICO[data.rank_pvp] || '#7b5cff';
  const rankLabel = RANK_LABEL_PUBLICO[data.rank_pvp] || data.rank_pvp || 'Bronze';
  const horas = Math.floor((data.playtime_seconds || 0) / 3600);
  const nome = (data.username || 'Jogador');
  const cor = data.name_color || '#ffffff';
  const bio = (data.bio || '').trim();

  const div = document.createElement('div');
  div.className = 'overlay';
  div.id = 'modal-perfil-publico';
  div.onclick = (e) => { if (e.target === div) fecharModalPerfilPublico(); };

  div.innerHTML = `
    <div class="modal-box" style="max-width:340px;text-align:center;${data.vip ? 'box-shadow:0 0 30px rgba(255,209,102,.35),var(--shadow);border-color:#ffd166' : ''}">
      <button class="modal-close" onclick="fecharModalPerfilPublico()">✕</button>

      <div style="width:88px;height:88px;border-radius:50%;margin:6px auto 10px;background:#12142a;
        border:3px solid ${data.vip ? '#ffd166' : rankCor};box-shadow:0 0 22px ${data.vip ? '#ffd16688' : rankCor + '55'};
        display:flex;align-items:center;justify-content:center;font-size:42px;overflow:hidden">
        ${data.avatar_image_url ? `<img src="${data.avatar_image_url}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%">` : (data.avatar_emoji || '🧙')}
      </div>

      <div style="font-weight:900;font-size:18px;color:${cor};text-shadow:0 0 10px ${cor}55">
        ${nome}${data.vip ? ' <span style="color:#ffd166">👑</span>' : ''}
      </div>

      ${bio ? `<div style="margin-top:6px;font-size:12px;color:#9aa3c7;font-style:italic">"${bio.replace(/</g,'&lt;')}"</div>` : ''}

      <div style="margin-top:14px;display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:20px;
        background:${rankCor}22;border:1px solid ${rankCor};color:${rankCor};font-weight:800;font-size:13px">
        🏅 ${rankLabel} • Nv. ${data.nivel_pvp ?? 1}
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:16px">
        <div style="background:rgba(255,255,255,.05);border-radius:12px;padding:10px">
          <div style="font-size:11px;color:#9aa3c7">Vitórias PvP</div>
          <div style="font-weight:900;font-size:15px;color:#3dffa0">${data.vitorias ?? 0}</div>
        </div>
        <div style="background:rgba(255,255,255,.05);border-radius:12px;padding:10px">
          <div style="font-size:11px;color:#9aa3c7">Derrotas PvP</div>
          <div style="font-weight:900;font-size:15px;color:#ff6b6b">${data.derrotas ?? 0}</div>
        </div>
        <div style="background:rgba(255,255,255,.05);border-radius:12px;padding:10px">
          <div style="font-size:11px;color:#9aa3c7">Troféus atuais</div>
          <div style="font-weight:900;font-size:15px;color:#ffd166">🏆 ${data.trofeus_atuais ?? 0}</div>
        </div>
        <div style="background:rgba(255,255,255,.05);border-radius:12px;padding:10px">
          <div style="font-size:11px;color:#9aa3c7">Troféus histórico</div>
          <div style="font-weight:900;font-size:15px;color:#ffd166">🏆 ${data.trofeus_totais_historico ?? 0}</div>
        </div>
      </div>

      <div style="margin-top:10px;font-size:12px;color:#9aa3c7">⏱ Tempo jogado: ${horas}h</div>
    </div>`;

  document.body.appendChild(div);
}

async function abrirPerfilPublicoLobby(userId) {
  const { data, error } = await window.supabaseClient.rpc('perfil_publico', { p_user_id: userId });
  if (error || !data) { alert('Não foi possível carregar o perfil.'); return; }
  renderModalPerfilPublico(data);
}
window.abrirPerfilPublicoLobby = abrirPerfilPublicoLobby;

async function entrarNoJogo() {
  const loadingScreen = document.getElementById('tela-loading');
  const menuScreen = document.getElementById('tela-menu');
  // ETAPA 14 (World-First): a tela principal depois do login deixou de ser
  // o dashboard (tela-menu) e passou a ser Universos. O dashboard continua
  // existindo e sendo preparado normalmente (recursos, música, etc.) — ele
  // só não é mais a tela ativa/inicial. Nenhum sistema foi removido, apenas
  // a tela de entrada mudou.
  const universosScreen = document.getElementById('tela-universos');

  if (!menuScreen) return;

  document.querySelectorAll('.screen').forEach((screen) => {
    screen.classList.remove('active');
  });

  if (loadingScreen) loadingScreen.classList.remove('active');

  // tela-menu fica preparada (visível internamente) mas não como a tela ativa,
  // pra manter compatível qualquer código que dependa dela existir no DOM.
  menuScreen.classList.remove('hidden');

  await garantirPerfilUsuario();
  await sincronizarEstadoDoServidor();

  updateResources();

  if (universosScreen && typeof show === 'function') {
    show('tela-universos');
  } else {
    // Fallback de segurança: se por algum motivo a tela de Universos não
    // existir no DOM, preserva o comportamento antigo (vai pro dashboard).
    menuScreen.classList.add('active');
  }

  aplicarMusicaLobby(musicaLigada);
  setTimeout(showDailyLogin, 500);

  if (typeof renderTutorialVisual === 'function') renderTutorialVisual();
}

window.entrarNoJogo = entrarNoJogo;




function bindNavigation() {
  
}


document.addEventListener('click', (event) => {
  const bossButton = event.target.closest('[data-boss-id]');
  if (bossButton && bossButton.dataset.bossId) {
    event.preventDefault();
    event.stopPropagation();
    startBoss(Number(bossButton.dataset.bossId));
    return;
  }

  const back = event.target.closest('[data-voltar]');
  if (back) {
    event.preventDefault();
    event.stopPropagation();
    show(back.dataset.voltar);
    return;
  }

  const nav = event.target.closest('[data-tela]');
  if (nav && !nav.id?.startsWith('btn-')) {
    event.preventDefault();
    show(nav.dataset.tela);
  }
}, true);

function loading() {
  const bar = document.getElementById('barra-loading');
  const text = document.getElementById('loading-percent');
  const button = document.getElementById('btn-entrar');

  if (!bar || !text || !button) return;

  let progress = 0;

  const timer = setInterval(() => {
    progress = Math.min(100, progress + 8 + Math.random() * 12);
    bar.style.width = progress + '%';
    text.textContent = Math.floor(progress) + '%';

    if (progress >= 100) {
      clearInterval(timer);
      button.classList.remove('hidden');
      button.disabled = false;
      text.textContent = '100%';
    }
  }, 120);
}

bindNavigation();
loading();
updateResources();
// Banner
function renderBanner(){
  updateResources();
  const autoButton=document.getElementById('btn-auto'),autoState=document.getElementById('auto-state');
  const invLabel=document.getElementById('inventario-banner-label');
  if(autoButton)autoButton.classList.toggle('active',autoSpin);
  if(autoState)autoState.textContent=autoSpin?'LIGADO':'DESLIGADO';
  if(invLabel)invLabel.textContent=`Inventário: ${contarPersonagensNoInventario()}/${getInventoryMax()}`;
}

function weightedPick() {
  const lucky = potionAtiva('lucky');
  const pesos = personagens.map(p => {
    let mult = 1;
    if (rareLuckyRarities.has(p.raridade)) {
      if (lucky) mult *= 1.5;
      if (extremLuckyOwned) mult *= 2;
      if (luckyRaroOwned && p.raridade === 'raro') mult *= 1.3;
    }
    return {p, peso: p.peso * mult};
  });
  const total = pesos.reduce((a,x)=>a+x.peso,0);
  const sorteio = Math.random()*total;
  let acumulado=0;
  for(const item of pesos){ acumulado += item.peso; if(sorteio <= acumulado) return item.p; }
  return pesos[pesos.length-1].p;
}
function setBannerButtons(desativado) {
  ['btn-girar-1', 'btn-girar-4', 'btn-auto'].forEach((id) => {
    const elemento = document.getElementById(id);
    if (elemento) elemento.disabled = desativado && id !== 'btn-auto';
  });
}
function startBannerAnimation(resultados, concluido) {
  bannerAnimating = true;
  setBannerButtons(true);

  const stage = document.querySelector('.banner-stage');
  const resultBox = document.getElementById('gacha-result');

  if (!stage || !resultBox) {
    bannerAnimating = false;
    setBannerButtons(false);
    return;
  }

  stage.classList.remove('banner-spinning');
  void stage.offsetWidth;
  stage.classList.add('banner-spinning');

  resultBox.classList.remove('hidden');
  resultBox.classList.add('gacha-revealing');
  resultBox.innerHTML = `
    <div class="gacha-spinner">
      <span>✦</span>
      <b>INVOCANDO...</b>
      <small>O destino está sendo decidido</small>
    </div>
  `;

  setTimeout(() => {
    try {
      stage.classList.remove('banner-spinning');
      resultBox.classList.remove('gacha-revealing');

      // Libera os botões ANTES de mostrar o resultado.
      bannerAnimating = false;
      setBannerButtons(false);

      showResults(resultados);

      if (typeof concluido === 'function') {
        concluido();
      }

    } catch (erro) {
      console.error('Erro ao finalizar animação da roleta:', erro);

      bannerAnimating = false;
      setBannerButtons(false);
      stage.classList.remove('banner-spinning');
      resultBox.classList.remove('gacha-revealing');

      resultBox.innerHTML = `
        <div class="gacha-spinner">
          <b>Resultado recebido!</b>
          <small>Abra o inventário para conferir.</small>
        </div>
      `;
    }
  }, 1250);
}

function bannerStaticSrc(p){
  if(!p) return 'BannerFoto.png';

  const staticBanner = {
    ArthurBanner: 'ArthurBanner_static.webp',
    GuilermeChucroBanner: 'GuilermeChucroBanner_static.webp',
    LucasBanner: 'LucasBanner_static.webp',
    MarcosBanner: 'MarcosBanner_static.webp',
    CarlosBanner: 'CarlosBanner_static.webp',
    MiguelBanner: 'MiguelBanner_static.webp',
    JapaBanner: 'JapaBanner_static.webp',
    ArlanBanner: 'ArlanBanner_static.webp',
    ViniciusBanner: 'ViniciusBanner_static.webp',
    JuliaBanner: 'JuliaBanner_static.webp',
    PeidaLeiteBanner: 'PeidaLeiteBanner_static.webp',
    KauanBanner: 'KauanBanner_static.webp',
    PaulaoDoPneuBanner: 'PaulaoDoPneuBanner.jpg',

    PetHunge: 'Beijo.png',
    ChucroHunge: 'Chucro.png'
  };

  return staticBanner[p.id] || 'BannerFoto.png';
}

async function pull(count){
  if(bannerAnimating) return;

  const quantidade = count === 4 ? 4 : 1;

  const espacosUsados = contarPersonagensNoInventario();

  if(espacosUsados + quantidade > getInventoryMax()){
    alert(
      quantidade === 4
        ? 'Você precisa de pelo menos 4 espaços no inventário para GIRAR (4).'
        : `Inventário cheio (${getInventoryMax()}/${getInventoryMax()}). Exclua personagens antes de girar.`
    );

    autoSpin = false;
    renderBanner();
    return;
  }

  bannerAnimating = true;
  setBannerButtons(true);

  try{
    const { data, error } = await window.supabaseClient.rpc(
      'girar_personagem',
      {
        p_quantidade: quantidade
      }
    );

    if(error) throw error;

    const resultadosIds = Array.isArray(data?.resultados)
      ? data.resultados
      : [];

    const resultados = resultadosIds
      .map(id => personagens.find(p => p.id === id))
      .filter(Boolean);

    if(!resultados.length){
      throw new Error('O servidor não retornou o personagem sorteado.');
    }

    moedasGlobais = Number(data.coins || 0);

    if (data.missionProgress && typeof data.missionProgress === 'object') {
  missionProgress = data.missionProgress;
    }
    
    if(data.inventory && typeof data.inventory === 'object'){
      inventario.possuidos = Array.isArray(data.inventory.possuidos)
        ? data.inventory.possuidos
        : inventario.possuidos;
    }

    if(tutorialStep === 0){
      tutorialStep = 1;
    }

    if (typeof avancarTutorialVisual === 'function') avancarTutorialVisual(1);

    updateResources();

    renderCharacters();
    renderInventory();
    renderMissions();

    startBannerAnimation(resultados, () => {

      renderCharacters();
      renderInventory();
      renderMissions();

      if(!autoSpin){
        renderBanner();
        return;
      }

      const proximoCusto = quantidade === 1 ? 500 : 1800;
      const espacoLivre =
        contarPersonagensNoInventario() + quantidade <= getInventoryMax();

      if(
        moedasGlobais >= proximoCusto &&
        espacoLivre
      ){
        setTimeout(() => {
          pull(quantidade);
        }, 650);
      }else{
        autoSpin = false;
        renderBanner();
      }
    });

  }catch(erro){
    console.error('Erro ao girar banner:', erro);

    bannerAnimating = false;
    setBannerButtons(false);

    const mensagemErro = String(erro?.message || '');
    if (!avisarSaldoInsuficiente(mensagemErro)) {
      alert(mensagemErro || 'Não foi possível realizar o giro.');
    }

    renderBanner();
  }
}

function mostrarCelebracaoRaro(personagem) {
  if (!personagem) return;

  const overlay = document.createElement('div');
  overlay.className = 'rare-pull-celebration';
  overlay.innerHTML = `
    <style>
      .rare-pull-celebration{
        position:fixed; inset:0; z-index:9999;
        display:flex; align-items:center; justify-content:center;
        background:rgba(0,0,0,.72);
        opacity:0; animation:rareFadeIn .25s ease-out forwards;
        pointer-events:none;
      }
      .rare-pull-celebration .rare-pull-card{
        display:flex; flex-direction:column; align-items:center; gap:10px;
        padding:26px 34px; border-radius:20px;
        background:radial-gradient(circle at 50% 20%, rgba(255,255,255,.12), rgba(10,10,20,.9));
        border:2px solid var(--rarity, #ffd166);
        box-shadow:0 0 60px var(--rarity, #ffd166), 0 0 140px var(--rarity, #ffd166);
        transform:scale(.7);
        animation:rarePop .6s cubic-bezier(.2,1.4,.4,1) forwards;
      }
      .rare-pull-card img{
        width:150px; height:150px; object-fit:cover; border-radius:14px;
        box-shadow:0 0 30px var(--rarity, #ffd166);
      }
      .rare-pull-card .rare-title{
        font-size:13px; letter-spacing:.15em; color:var(--rarity, #ffd166);
        font-weight:800; text-transform:uppercase;
      }
      .rare-pull-card .rare-name{
        font-size:22px; font-weight:900; color:#fff; text-align:center;
      }
      .rare-pull-card .rare-tier{
        font-size:13px; color:#cfd3ff; text-align:center;
      }
      @keyframes rareFadeIn{ to{ opacity:1; } }
      @keyframes rarePop{
        0%{ transform:scale(.6); }
        60%{ transform:scale(1.08); }
        100%{ transform:scale(1); }
      }
      .rare-pull-celebration.rare-fade-out{
        animation:rareFadeIn .35s ease-in reverse forwards;
      }
    </style>
    <div class="rare-pull-card" style="--rarity:${rarityColor(personagem.raridade)}">
      <div class="rare-title">✨ Invocação Raríssima ✨</div>
      <img src="${bannerStaticSrc(personagem)}" alt="${personagem.nome}" draggable="false" onerror="this.style.display='none';">
      <div class="rare-name">${personagem.nome}</div>
      <div class="rare-tier">${personagem.tier}</div>
    </div>
  `;

  document.body.appendChild(overlay);

  setTimeout(() => {
    overlay.classList.add('rare-fade-out');
    setTimeout(() => overlay.remove(), 400);
  }, 2200);
}

function showResults(resultados) {
  const box = document.getElementById('gacha-result');
  if (!box) return;

  const raros = resultados.filter((p) => AUTO_DESCARTE_BLOQUEADOS.has(p.id) && p.id !== 'PetHunge' && p.id !== 'ChucroHunge');
  raros.forEach((personagem, index) => {
    setTimeout(() => mostrarCelebracaoRaro(personagem), index * 2600);
  });

  box.classList.remove('hidden');

  box.innerHTML = `
    <div class="gacha-results-grid">
      ${resultados.map((personagem, index) => {
        const imagem = bannerStaticSrc(personagem);
        const video = personagem?.arquivo || '';
        const temVideo = /\.(mp4|webm|mov|ogg)$/i.test(video);

        return `
          <div
            class="pull-card ${rarityInfo[personagem.raridade]?.cls || ''}"
            style="
              --rarity:${rarityColor(personagem.raridade)};
              --delay:${index * 0.12}s
            "
          >
            <div class="result-media">
              <img
                class="pull-static-media"
                src="${imagem}"
                alt="${personagem.nome}"
                draggable="false"
                onerror="this.onerror=null;this.src='BannerFoto.png';"
              >

              ${temVideo ? `
                <video
                  class="pull-result-video"
                  src="${video}"
                  muted
                  loop
                  autoplay
                  playsinline
                  preload="metadata"
                  poster="${imagem}"
                  onerror="this.style.display='none';"
                ></video>
              ` : ''}
            </div>

            <div class="rarity-label">
              ${personagem.tier}
            </div>

            <b>${personagem.nome}</b>
            <small>${personagem.buff}</small>
          </div>
        `;
      }).join('')}
    </div>
  `;
}
            


const btnGirar1 = document.getElementById('btn-girar-1');
const btnGirar4 = document.getElementById('btn-girar-4');
const btnAuto = document.getElementById('btn-auto');
const btnBannerInfo = document.getElementById('btn-banner-info');

if (btnGirar1) {
  btnGirar1.onclick = () => {
    if (bannerAnimating) return;
    pull(1, false);
  };
}

if (btnGirar4) {
  btnGirar4.onclick = () => pull(4, false);
}

if (btnAuto) {
  btnAuto.onclick = () => {
    if (bannerAnimating) return;
    autoSpin = !autoSpin;
    renderBanner();
  };
}

document.addEventListener('click', (event) => {
  const infoButton = event.target.closest('#btn-banner-info');
  if (!infoButton) return;
  event.preventDefault();
  event.stopPropagation();
  renderBannerInfo();
}, true);
async function toggleAutoDescarte(id) {
  if (AUTO_DESCARTE_BLOQUEADOS.has(id)) return;

  const ativoAntes = !!autoDescarte[id];
  const novoValor = !ativoAntes;

  autoDescarte[id] = novoValor;
  renderBannerInfo();

  try {
    const { error } = await window.supabaseClient.rpc(
      'definir_auto_descarte',
      { p_personagem_id: id, p_ativo: novoValor }
    );
    if (error) throw error;
  } catch (erro) {
    console.error('Erro ao salvar auto-descarte:', erro);
    autoDescarte[id] = ativoAntes;
    renderBannerInfo();
    alert(erro.message || 'Não foi possível salvar essa preferência.');
  }
}
window.toggleAutoDescarte = toggleAutoDescarte;

function renderBannerInfo(){
  const s = document.getElementById('tela-banner-info');

  if(!s){
    console.error('Tela de Info do Banner não encontrada: #tela-banner-info');
    return;
  }

  const luckyPocaoAtiva = potionAtiva('lucky');

  const pesoEfetivo = (p) => {
    let mult = 1;
    if (rareLuckyRarities.has(p.raridade)) {
      if (luckyPocaoAtiva) mult *= 1.5;
      if (extremLuckyOwned) mult *= 2;
    }
    if (p.raridade === 'raro' && luckyRaroOwned) mult *= 1.3;
    return Number(p.peso || 0) * mult;
  };

  const totalPeso = personagens.reduce((total, p) => total + pesoEfetivo(p), 0);

  s.innerHTML = `
    <style>
      .character-card{position:relative;}
      .auto-descarte-x{
        position:absolute; top:8px; right:8px; z-index:5;
        width:28px; height:28px; border-radius:50%;
        border:2px solid rgba(255,255,255,.5);
        background:rgba(0,0,0,.55); color:#fff;
        font-weight:700; font-size:15px; line-height:1;
        cursor:pointer; display:flex; align-items:center; justify-content:center;
        transition:background .15s,border-color .15s,transform .15s;
      }
      .auto-descarte-x:hover{ transform:scale(1.1); }
      .auto-descarte-x.ativo{
        background:#e0263f; border-color:#ff8a97;
        box-shadow:0 0 10px rgba(224,38,63,.7);
      }
      .character-card.auto-descarte-marcado{
        outline:2px solid #e0263f;
        box-shadow:0 0 14px rgba(224,38,63,.55);
      }
      .auto-descarte-badge{
        position:absolute; left:0; right:0; bottom:0; z-index:4;
        background:rgba(224,38,63,.88); color:#fff;
        font-size:11px; font-weight:700; text-align:center;
        padding:4px 6px; letter-spacing:.02em;
      }
    </style>

    <button class="back-btn" data-voltar="tela-banner">←</button>

    <div class="panel-head">
      <div>
        <small>PROBABILIDADES E BUFFS</small>
        <h2>INFO DO BANNER</h2>
        <small class="muted">Clique no ✕ de um personagem pra excluí-lo automaticamente sempre que ganhar ele de novo. Clique de novo pra cancelar. Os 3 melhores personagens não podem ser marcados.</small>
      </div>
    </div>

    <div class="characters-grid banner-info-grid">
      ${personagensPrincipais.map(p => {
        const peso = pesoEfetivo(p);
        const chance = totalPeso > 0 ? (peso / totalPeso) * 100 : 0;
        const temSorteAumentada = peso > Number(p.peso || 0);

        const bloqueado = AUTO_DESCARTE_BLOQUEADOS.has(p.id);
        const marcado = !bloqueado && !!autoDescarte[p.id];

        return `
          <article
            class="character-card ${rarityInfo[p.raridade]?.cls || ''} ${temSorteAumentada ? 'lucky-boosted' : ''} ${marcado ? 'auto-descarte-marcado' : ''}"
            style="--rarity:${rarityColor(p.raridade)}"
          >
            ${temSorteAumentada ? `<div class="lucky-boost-badge">🍀 Sorte aumentada</div>` : ''}

            ${bloqueado ? '' : `
              <button
                type="button"
                class="auto-descarte-x ${marcado ? 'ativo' : ''}"
                title="${marcado ? 'Cancelar exclusão automática' : 'Excluir automaticamente ao ganhar'}"
                onclick="toggleAutoDescarte('${p.id}')"
              >✕</button>
            `}

            ${marcado ? `<div class="auto-descarte-badge">Será excluído ao ganhar</div>` : ''}

            <img
              src="${bannerStaticSrc(p)}"
              alt="${p.nome}"
              class="character-static-media"
              draggable="false"
            >

            <h3>${p.nome}</h3>

            <div class="rarity-label">
              ${p.tier}
            </div>

            <div class="chance">
              ${chance.toFixed(chance < 0.01 ? 3 : 2)}% de chance
            </div>

            <div class="muted">
              ${p.buff}
            </div>
          </article>
        `;
      }).join('')}
    </div>
  `;

  show('tela-banner-info');
}


const dailyWheelRewards=[
{id:'lucky',label:'🧪 Poção Lucky x1',chance:10,type:'potion',rarity:'raro',give:1},
{id:'damage',label:'⚔️ Poção Damage x1',chance:5,type:'potion',rarity:'epico',give:1},
{id:'coins100',label:'🪙 100 Moedas',chance:50,type:'coins',rarity:'comum',give:100},
{id:'coins500',label:'🪙 500 Moedas',chance:20,type:'coins',rarity:'incomum',give:500},
{id:'coins1k',label:'🪙 1.000 Moedas',chance:10,type:'coins',rarity:'raro',give:1000},
{id:'pet',label:'🐾 BEIJO',chance:1,type:'pet',rarity:'secreto',give:1},
{id:'doubleCoins',label:'🪙 2x Moedas',chance:2,type:'coinsMultiplier',rarity:'epico',give:1},
{id:'bonusSpin',label:'🎁 +1 Giro',chance:2,type:'bonusSpin',rarity:'raro',give:1}
];

function weightedDailyReward(){ const r=Math.random()*100; let a=0; for(const x of dailyWheelRewards){a+=x.chance;if(r<=a)return x;} return dailyWheelRewards[dailyWheelRewards.length-1]; }

function canDailySpin(){return Date.now()>=dailySpinAt;}
function renderDailyWheel(){
  const c=document.getElementById('daily-wheel-content'); if(!c)return;
  const dailyReady=canDailySpin();
  const bonus=Math.max(0,Number(bonusFreeSpins||0));
  const sectors=dailyWheelRewards.map((r,i)=>{
    const chanceClass = r.chance>=50?'chance-50':r.chance>=20?'chance-20':r.chance>=10?'chance-10':r.chance>=5?'chance-5':r.chance>=2?'chance-2':'chance-1';
    return `<div class="daily-wheel-sector sector-${i} ${chanceClass}" title="${r.chance}%"><span>${r.label}</span><b>${r.chance}%</b></div>`;
  }).join('');
  const freeButton = dailyReady
    ? '<button class="daily-spin-btn free-ready" id="daily-spin-free" type="button">🎁 RESGATAR GIRO GRÁTIS</button>'
    : `<button class="daily-spin-btn free-cooldown" id="daily-spin-free" type="button" disabled>⏳ PRÓXIMO GIRO <b>${formatarTempoRestante(dailySpinAt-Date.now())}</b></button>`;
  const bonusButton = bonus>0
    ? `<button class="bonus-spin-btn" id="daily-spin-bonus" type="button">🎰 GIRAR <b>1 GIRO</b><small>Você tem ${bonus}</small></button>`
    : '<button class="bonus-spin-btn no-spins" id="daily-spin-bonus" type="button">🎰 SEM GIROS BÔNUS<small>Toque para ver como conseguir</small></button>';
  c.innerHTML=`
    <div class="daily-wheel-layout">
      <aside class="daily-wheel-odds"><div class="wheel-side-title">CHANCES DOS PRÊMIOS</div>${dailyWheelRewards.map((r,i)=>`<div class="wheel-odd wheel-odd-${i}"><span>${r.label}</span><b>${r.chance}%</b></div>`).join('')}</aside>
      <main class="daily-wheel-main">
        <div class="wheel-topline"><div class="wheel-badge">🎡 GIRO DIÁRIO</div><div class="wheel-spin-counter" id="daily-spin-counter">🎰 ${bonus}</div></div>
        <div class="wheel-wrap"><div class="wheel-pointer">▼</div><div class="daily-wheel" id="daily-wheel">${sectors}<div class="wheel-center"><span>ARCANE</span><b>🎁</b><small>CLASH</small></div></div></div>
        <div class="daily-wheel-status-line" id="daily-wheel-status">${dailyReady?'Giro grátis disponível!':'Próximo giro grátis em '+formatarTempoRestante(dailySpinAt-Date.now())}</div>
        <div class="daily-wheel-actions">${freeButton}${bonusButton}</div>
        <div class="daily-buy-hint">Sem giro bônus? <b>Compre giros</b> nos pacotes abaixo. Ao ganhar um giro por code/recompensa, ele aparece automaticamente em <b>🎰 ${bonus}</b>.</div>
        <div class="daily-wheel-packs">
          <button class="paid-spin-btn" type="button" onclick="alert('Mande Pix para esse numero: 61981946045\n\nDepois mande comprovante para esse numero de ZapZap: 6198220-6185\n\nFale a game pass que você queria e ela cairá na sua conta em alguns momentos 💋')"><b>+1 GIRO</b><small>R$ 1,99</small></button>
          <button class="paid-spin-btn" type="button" onclick="alert('Mande Pix para esse numero: 61981946045\n\nDepois mande comprovante para esse numero de ZapZap: 6198220-6185\n\nFale a game pass que você queria e ela cairá na sua conta em alguns momentos 💋')"><b>+5 GIROS</b><small>R$ 8,99</small></button>
          <button class="paid-spin-btn" type="button" onclick="alert('Mande Pix para esse numero: 61981946045\n\nDepois mande comprovante para esse numero de ZapZap: 6198220-6185\n\nFale a game pass que você queria e ela cairá na sua conta em alguns momentos 💋')"><b>+10 GIROS</b><small>R$ 16,99</small></button>
        </div>
      </main>
      <aside class="daily-wheel-feature"><div class="feature-title">PRÊMIO ESPECIAL</div><img src="Beijo.png" alt="Hunge Beijo"><strong>🐾 BEIJO</strong><span>1% • Hunge</span><small>Melhor que seu personagem mas forte +10% Dano • +5% defesa • +20% moedas • +5% diamantes • Ultimate 5% mais rápida</small></aside>
    </div>
    <section class="daily-login-preview">
      <div class="daily-login-preview-head"><div><small>SEQUÊNCIA DE ENTRADA</small><h3>🎁 LOGIN DIÁRIO</h3></div><span>Dia ${dailyLoginDay}/7</span></div>
      <div class="daily-login-preview-grid">${dailyLoginRewards.map(r=>`<div class="daily-preview-day ${r.day===dailyLoginDay?'current':''} ${r.day<dailyLoginDay?'past':''}"><b>DIA ${r.day}</b><div class="daily-preview-icon">${r.day===7?'<img src="Chucro.png" alt="Chucro">':r.icon}</div><small>${r.title}</small></div>`).join('')}</div>
      <div class="daily-next-reward"><div class="daily-next-label">PRÓXIMA RECOMPENSA</div><div class="daily-next-main">${dailyLoginDay===7?'<img src="Chucro.png" alt="Chucro">':`<span>${dailyLoginRewards[dailyLoginDay-1].icon}</span>`}<div><b>${dailyLoginRewards[dailyLoginDay-1].title}</b><small>${dailyLoginRewards[dailyLoginDay-1].desc}</small></div></div></div>
    </section><div id="daily-wheel-result" class="daily-wheel-result hidden"></div>`;
  const free=document.getElementById('daily-spin-free'); if(free&&dailyReady)free.onclick=()=>spinDailyWheel('daily');
  const bonusBtn=document.getElementById('daily-spin-bonus'); if(bonusBtn)bonusBtn.onclick=()=>spinDailyWheel('bonus');

  if(dailyPendingReward){
    const premioId = typeof dailyPendingReward === 'string'
      ? dailyPendingReward
      : (dailyPendingReward.premio || dailyPendingReward.id);
    const pendente = dailyWheelRewards.find(r => r.id === premioId);
    if(pendente) showDailyWheelReward(pendente);
  }
}


async function spinDailyWheel(source='daily'){
  if(dailyWheelAnimating)return;

  if(source==='daily' && !canDailySpin()){
    renderDailyWheel();
    return;
  }

  if(source==='bonus' && Number(bonusFreeSpins||0)<=0){
    alert('Você não tem giros bônus agora. Resgate o giro grátis de 24h ou compre um pacote de giros.');
    return;
  }

  dailyWheelAnimating=true;

  try{
    const { data, error } = await window.supabaseClient.rpc(
      'girar_roleta_diaria',
      { p_tipo: source }
    );

    if(error) throw error;

    const premioId = data.premio;

    const reward = dailyWheelRewards.find(
      r => r.id === premioId
    );

    if(!reward){
      throw new Error('Prêmio da roleta não encontrado.');
    }

    dailyPendingReward = data.daily_pending_reward || premioId;
    dailySpinAt = Number(data.daily_spin_at || 0);

    const wheel=document.getElementById('daily-wheel');

    if(!wheel){
      dailyWheelAnimating=false;
      return;
    }

    const idx=dailyWheelRewards.indexOf(reward);
    const sectorAngle=360/dailyWheelRewards.length;

    const target=360*6 + (
      360-(idx*sectorAngle+sectorAngle/2)
    );

    dailyWheelRotation+=target;

    wheel.style.setProperty(
      '--wheel-rotation',
      dailyWheelRotation+'deg'
    );

    wheel.classList.add('is-spinning');

    setTimeout(()=>{
      wheel.classList.remove('is-spinning');
      dailyWheelAnimating=false;
      renderDailyWheel();
      showDailyWheelReward(reward);
    },4200);

  }catch(erro){
    console.error('Erro ao girar roleta diária:',erro);

    dailyWheelAnimating=false;

    alert(
      erro.message ||
      'Não foi possível girar a roleta.'
    );

    // Se o bloqueio foi por recompensa pendente não coletada, mostra o card de
    // "RECEBER" na hora — sem isso o giro grátis só ficava escondido atrás do
    // prêmio parado, parecendo pro jogador que o giro tinha sumido/sido gasto à toa.
    if (String(erro?.message || '').toLowerCase().includes('recompensa anterior') && dailyPendingReward) {
      const premioId = typeof dailyPendingReward === 'string' ? dailyPendingReward : (dailyPendingReward.premio || dailyPendingReward.id);
      const pendente = dailyWheelRewards.find(r => r.id === premioId);
      if (pendente) showDailyWheelReward(pendente);
    }

    renderDailyWheel();
  }
}


function applyDailyReward(reward){
  if(reward.type==='coins')moedasGlobais+=reward.give;
  if(reward.type==='potion')pocoes[reward.id]=(pocoes[reward.id]||0)+reward.give;
  if(reward.type==='pet'&&!inventario.possuidos.includes('PetHunge'))inventario.possuidos.push('PetHunge');
  if(reward.type==='coinsMultiplier')pocoes.coins=(pocoes.coins||0)+1;
  if(reward.type==='bonusSpin')bonusFreeSpins+=reward.give;
  save();updateResources();renderInventory();
}

async function showDailyWheelReward(reward){
  const box=document.getElementById('daily-wheel-result');
  if(!box)return;

  const ultra=reward.chance<=2;
  const text=reward.type==='pet'?'🐾 BEIJO DESBLOQUEADO!':reward.label;
  const detail=reward.type==='pet'
    ?'DANO = melhor personagem equipado +10% • +5% defesa • +20% moedas • +5% diamantes • Ultimate 5% mais rápida'
    :reward.type==='potion'
    ?'Poção adicionada ao Inventário • dura 5 minutos'
    :reward.type==='coinsMultiplier'
    ?'1,5x moedas por 5 minutos'
    :reward.type==='bonusSpin'
    ?'+1 giro bônus'
    :'Recompensa adicionada à sua conta';

  box.className='daily-wheel-result '+(ultra?'ultra-reward':'rare-reward');

  box.innerHTML=`
    <div class="reward-burst">${'✦'.repeat(18)}</div>
    <div class="reward-result-card">
      <div class="reward-chance">${reward.chance}% DE CHANCE</div>
      ${reward.type==='pet'
        ?'<img src="Beijo.png" alt="Beijo">'
        :'<div class="reward-big-icon">'+
          (reward.type==='potion'?'🧪':reward.type==='bonusSpin'?'🎰':'🪙')+
          '</div>'}
      <small>RECOMPENSA DISPONÍVEL</small>
      <h2>${text}</h2>
      <p>${detail}</p>
      <button class="small-btn primary" id="daily-reward-claim">
        RECEBER
      </button>
    </div>`;

  box.classList.remove('hidden');

  const claim=document.getElementById('daily-reward-claim');

  if(claim){
    claim.onclick=async()=>{
      if(claim.disabled)return;

      claim.disabled=true;
      claim.textContent='RECEBENDO...';

      try{
        const {data,error}=await window.supabaseClient.rpc(
          'resgatar_roleta_diaria'
        );

        if(error)throw error;

        moedasGlobais=Number(data.coins||0);
        bonusFreeSpins=Number(data.bonus_free_spins||0);

        Object.assign(pocoes,data.pocoes||{});

        if(data.inventory && typeof data.inventory==='object'){
          inventario.possuidos=Array.isArray(data.inventory.possuidos)
            ? data.inventory.possuidos
            : inventario.possuidos;
        }

        updateResources();
        renderInventory();

        dailyPendingReward = null;
        box.classList.add('hidden');

      }catch(erro){
        console.error('Erro ao receber recompensa da roleta:',erro);
        alert(erro.message||'Não foi possível receber a recompensa.');
        claim.disabled=false;
        claim.textContent='RECEBER';
      }
    };
  }
}
const dailyLoginRewards=[
 {day:1,icon:'🪙',title:'500 Moedas',desc:'Comece sua jornada com um reforço.',give:()=>{moedasGlobais+=500}},
 {day:2,icon:'💎',title:'100 Diamantes',desc:'Moeda premium para sua progressão.',give:()=>{diamantesGlobais+=100}},
 {day:3,icon:'🍀',title:'Poção de Lucky',desc:'Aumenta apenas as chances de raros ou melhores por 5 minutos.',give:()=>{pocoes.lucky++}},
 {day:4,icon:'⚔️',title:'Poção de Damage',desc:'1,5x dano por 5 minutos.',give:()=>{pocoes.damage++}},
 {day:5,icon:'🪙',title:'Poção de Moedas',desc:'1,5x moedas por 5 minutos.',give:()=>{pocoes.coins++}},
 {day:6,icon:'🪙💎',title:'10K Moedas + 100 Diamantes',desc:'Recompensa de veterano.',give:()=>{moedasGlobais+=10000;diamantesGlobais+=100}},
 {day:7,icon:'🐾',title:'ChucroHunge',desc:'Personagem exclusivo da sequência de 7 dias • jogável na arena.',give:()=>{if(!inventario.possuidos.includes('ChucroHunge'))inventario.possuidos.push('ChucroHunge')}}
];
function dailyLoginReady(){return !dailyLoginLastAt || Date.now()-dailyLoginLastAt>=24*60*60*1000;}
function prepareDailyLoginDay(){
  if(dailyLoginLastAt && Date.now()-dailyLoginLastAt>=48*60*60*1000) dailyLoginDay=1;
  dailyLoginDay=Math.min(7,Math.max(1,dailyLoginDay));
}
function showDailyLogin(){
  if (dailyLoginShown) return;
  prepareDailyLoginDay();
  dailyLoginShown = true;
  let old=document.getElementById('daily-login-overlay'); if(old)old.remove();

  const ready = dailyLoginReady();
  const firstVisit = !dailyLoginLastAt;
  const reward=dailyLoginRewards[dailyLoginDay-1];
  const overlay=document.createElement('div');
  overlay.id='daily-login-overlay';
  overlay.className='daily-login-overlay';

  overlay.innerHTML=`<div class="daily-login-modal">
    <div class="login-top"><span>🎁 RECOMPENSA DIÁRIA</span><b>DIA ${reward.day} / 7</b><button class="daily-login-x" type="button" onclick="closeDailyLogin()" aria-label="Fechar">×</button></div>
    <h2>${firstVisit ? 'BEM-VINDO!' : 'LOGIN DIÁRIO'}</h2>
    <p>${ready ? 'Sua recompensa está disponível. Colete para continuar sua sequência.' : 'Sua próxima recompensa já está garantida. Volte quando o tempo resetar.'}</p>
    <div class="login-days">${dailyLoginRewards.map(r=>`<div class="login-day ${r.day===reward.day?'today':''} ${r.day<reward.day?'past':''}">
      <b>DIA ${r.day}</b><span>${r.day===7?'<img src="Chucro.png" alt="Chucro">':r.icon}</span><small>${r.title}</small>
    </div>`).join('')}</div>
    <div class="login-today"><div class="login-reward-icon">${reward.day===7?'<img class="login-character-reward" src="Chucro.png" alt="Chucro">':reward.icon}</div>
      <div><small>${ready?'SUA RECOMPENSA DE HOJE':'PRÓXIMA RECOMPENSA'}</small><h3>${reward.title}</h3><p>${reward.desc}</p></div>
    </div>
    ${ready
      ? '<button class="daily-login-claim" onclick="claimDailyLogin()">✓ COLETAR RECOMPENSA</button>'
      : '<button class="daily-login-close" onclick="closeDailyLogin()">CONTINUAR</button>'}
  </div>`;
  document.body.appendChild(overlay);
}
function closeDailyLogin(){
  dailyLoginShown=false;
  document.getElementById('daily-login-overlay')?.remove();
  if (typeof renderTutorialVisual === 'function') renderTutorialVisual();
}
window.closeDailyLogin=closeDailyLogin;
async function claimDailyLogin(){
  if(!window.supabaseClient) return;

  try{
    const {data,error}=await window.supabaseClient.rpc(
      'resgatar_login_diario'
    );

    if(error)throw error;

    dailyLoginLastAt=Number(data.daily_login_last_at||Date.now());
    dailyLoginDay=Number(data.daily_login_day||1);

    moedasGlobais=Number(data.coins||0);
    diamantesGlobais=Number(data.diamante||0);

    if(data.pocoes){
      Object.assign(pocoes,data.pocoes);
    }

    if(data.inventory?.possuidos){
      inventario.possuidos=data.inventory.possuidos;
    }

    save();
    updateResources();
    renderInventory();

    dailyLoginShown=false;
    document.getElementById('daily-login-overlay')?.remove();
    if (typeof renderTutorialVisual === 'function') renderTutorialVisual();

    mostrarToast(
      '🎁 '+data.reward+' coletado!',
      'reward'
    );

  }catch(erro){
    console.error('Erro ao resgatar login diário:',erro);

    const mensagem=String(erro?.message||erro||'');

    if(mensagem.includes('Login diário ainda não disponível')){
      alert('A recompensa diária ainda não está disponível.');
    }else{
      alert('Não foi possível resgatar a recompensa diária.');
    }
  }
}
window.claimDailyLogin=claimDailyLogin;

// Characters
function count(id) {
  return inventario.possuidos.filter((itemId) => itemId === id).length;
}
function renderCharacters() {
  const total = contarPersonagensNoInventario();
  const ownedIds = [...new Set(
    inventario.possuidos.filter((id) =>
      personagensPrincipais.some((p) => p.id === id)
    )
  )];

  const el = document.getElementById('personagens-contador');
  if (el) el.textContent = `${total}/${getInventoryMax()}`;

  const c = document.getElementById('personagens-conteudo');
  if (!c) return;

  if (!ownedIds.length) {
    c.innerHTML = `<div class="empty-state character-empty alive-empty"><div class="empty-icon">🎴</div><b>SUA COLEÇÃO ESTÁ ESPERANDO</b><span>Gire o Banner para obter seu primeiro personagem.</span><button class="small-btn primary" onclick="show('tela-banner')">ABRIR BANNER</button></div>`;
    return;
  }

  const cards = ownedIds.map((id) => {
    const p = personagens.find((x) => x.id === id);
    if (!p) return '';

    const n = count(id);
    const info = rarityInfo[p.raridade] || rarityInfo.comum;
    const fusedCount = Number(fused[id] || 0);
    const eq = inventario.equipados.imagem === id;
    const dano = danoAtualPercent(p, fusedCount > 0);

    const media = /\.(mp4|webm|mov|ogg)$/i.test(p.arquivo || '')
      ? `<video src="${p.arquivo}" muted loop autoplay playsinline preload="metadata" class="character-static-media"></video>`
      : `<img src="${bannerStaticSrc(p)}" alt="${p.nome}" class="character-static-media" draggable="false" onerror="this.onerror=null;this.src='${p.arquivo || 'BannerFoto.png'}'">`;

    return `
      <article class="character-card owned-only ${info.cls} ${eq ? 'equipped' : ''}" style="--rarity:${rarityColor(p.raridade)}">
        <div class="rarity-label">${p.tier}</div>
        <span class="copy-number">CÓPIAS: ${n}</span>
        ${fusedCount > 0 ? `<div class="fused-badge">★ ${fusedCount} FUNDIDA${fusedCount > 1 ? 'S' : ''}</div>` : ''}
        <div class="asset-frame character-asset">
          ${media}
        </div>
        ${eq ? '<div class="equipped-label">✓ ÚNICO PERSONAGEM EQUIPADO</div>' : ''}
        <h3>${p.nome}</h3>
        <div class="muted">${p.buff}</div>
        <div class="current-damage">⚔ Dano atual: +${dano}%</div>
        <button class="small-btn ${eq ? 'primary' : ''}" onclick="equipCharacter('${id}')">${eq ? '✓ EQUIPADO' : 'EQUIPAR'}</button>
        <button class="small-btn danger-soft" onclick="deleteCharacter('${id}')">EXCLUIR 1 CÓPIA</button>
        ${n - fusedCount >= 5 ? `<button class="small-btn fusion-btn" onclick="fuseCharacter('${id}')">FUNDIR 5 CÓPIAS</button>` : ''}
      </article>`;
  }).join('');

  const fusionControls = ownedIds.some((id) => count(id) - Number(fused[id] || 0) >= 5)
    ? '<small>Você pode fundir 5 cópias iguais para fortalecer o personagem.</small>'
    : '<small>Tenha 5 cópias não fundidas do mesmo personagem para liberar a fusão.</small>';

  c.innerHTML = `
    <div class="collection-head">
      <div><b>PERSONAGENS OBTIDOS</b><span>${total}/${getInventoryMax()} cópias • ${ownedIds.length}/${personagensPrincipais.length} tipos</span></div>
      <div class="collection-toolbar-actions"><button class="small-btn best-equip-btn" onclick="equiparMelhores()">⭐ EQUIPAR MELHORES</button><button class="small-btn primary" onclick="show('tela-banner')">🎴 IR PARA O BANNER</button></div>
      <div class="fusion-toolbar">${fusionControls}</div>
    </div>
    <div class="characters-grid owned-characters-grid">${cards}</div>`;
}

function melhorPersonagemPossuido(){
  const ownedIds = [...new Set(inventario.possuidos.filter((id) => personagens.some((p) => p.id === id)))];
  let melhor = null, melhorScore = -1;
  ownedIds.forEach((id) => {
    const p = personagens.find((x) => x.id === id);
    if (!p) return;
    const fusedCount = fused[id] || 0;
    const isFused = fusedCount > 0;
    const score = getCharacterStats(p).dmg * (isFused ? (fusionBonuses[id] || 1) : 1);
    if (score > melhorScore) { melhorScore = score; melhor = id; }
  });
  return melhor;
}
function melhorItemPossuido(lista){
  let melhor = null, melhorScore = -1;
  lista.forEach((item) => {
    if (!inventario.possuidos.includes(item.id)) return;
    if (item.dano > melhorScore) { melhorScore = item.dano; melhor = item.id; }
  });
  return melhor;
}


    async function equiparMelhores(){
  let algo = false;

  const melhorPersonagem = melhorPersonagemPossuido();

  try {
    // PERSONAGEM
    if (melhorPersonagem && inventario.equipados.imagem !== melhorPersonagem) {
      const { data, error } = await window.supabaseClient.rpc(
        'equipar_personagem',
        { p_personagem_id: melhorPersonagem }
      );

      if (error) throw error;

      inventario.equipados.imagem = melhorPersonagem;

      if (data?.equipped && typeof data.equipped === 'object') {
        inventario.equipados = Object.assign(
          {},
          inventario.equipados,
          data.equipped,
          { imagem: melhorPersonagem }
        );
      }

      tutorialStep = Math.max(tutorialStep, 2);
      algo = true;
    }

    // SKILL 1, SKILL 2 E ULTIMATE
    const melhoresItens = [
      ['skill1', melhorItemPossuido(skills.skill1)],
      ['skill2', melhorItemPossuido(skills.skill2)],
      ['ultimate', melhorItemPossuido(ultimates)]
    ];

    for (const [tipo, itemId] of melhoresItens) {
      if (!itemId || inventario.equipados[tipo] === itemId) continue;

      const { data, error } = await window.supabaseClient.rpc(
        'equipar_item',
        {
          p_tipo: tipo,
          p_item_id: itemId
        }
      );

      if (error) throw error;

      inventario.equipados[tipo] = itemId;

      if (data?.equipped && typeof data.equipped === 'object') {
        inventario.equipados = Object.assign(
          {},
          inventario.equipados,
          data.equipped,
          { [tipo]: itemId }
        );
      }

      algo = true;
    }

    if (inventario.equipados.skill2) {
      tutorialStep = Math.max(tutorialStep, 4);
      compraSkill2Obrigatoria = false;
    }

    renderCharacters();
    renderInventory();
    renderMissions();

    mostrarToast(
      algo
        ? '✓ Melhores equipados!'
        : 'Você já está com os melhores equipados.',
      'reward'
    );

  } catch (erro) {
    console.error('Erro ao equipar melhores:', erro);
    alert(
      erro?.message ||
      'Não foi possível equipar os melhores itens.'
    );
  }
    }



window.equiparMelhores = equiparMelhores;

async function equipCharacter(id) {
  const personagem = personagens.find((item) => item.id === id);
  if (!personagem || !inventario.possuidos.includes(id)) return;

  try {
    const { data, error } = await window.supabaseClient.rpc(
      'equipar_personagem',
      { p_personagem_id: id }
    );

    if (error) throw error;

    if (data?.equipped) {
      inventario.equipados = Object.assign(
        inventario.equipados,
        data.equipped
      );
    }

    tutorialStep = Math.max(tutorialStep, 2);
    if (typeof avancarTutorialVisual === 'function') avancarTutorialVisual(2);

    renderCharacters();
    renderInventory();
    renderMissions();

    mostrarToast('✓ ' + personagem.nome + ' equipado!', 'reward');

  } catch (erro) {
    console.error('Erro ao equipar personagem:', erro);
    alert(erro.message || 'Não foi possível equipar o personagem.');
  }
}

async function deleteCharacter(id) {
  if (inventario.equipados.imagem === id) {
    alert('Desequipe esse personagem antes de excluir.');
    return;
  }

  if (!inventario.possuidos.includes(id)) return;

  try {
    const { data, error } = await window.supabaseClient.rpc(
      'excluir_personagem',
      { p_personagem_id: id }
    );

    if (error) throw error;

    if (data?.inventory) {
      inventario.possuidos = Array.isArray(data.inventory.possuidos)
        ? data.inventory.possuidos
        : [];
    }

    renderCharacters();
    renderInventory();
    updateResources();

  } catch (erro) {
    console.error('Erro ao excluir personagem:', erro);
    alert(
      erro.message ||
      'Não foi possível excluir o personagem.'
    );
  }
}

function getCharacterStats(p) {
  const text = String(p?.buff || '');
  const read = (regex) => {
    const match = text.match(regex);
    return match ? Number(match[1]) / 100 : 0;
  };

  if (!p || p.raridade === 'hunge') {
    const h = hungeBuffs[p?.id] || {};
    return {
      dmg: Number(h.damage || 0),
      res: Number(h.defense || 0),
      cd: 0,
      ult: Number(h.ultimate || 0),
      crit: 0,
      move: 0
    };
  }

  return {
    dmg: read(/([+\d.]+)%\s*dano/i),
    res: read(/([+\d.]+)%\s*resistência/i),
    cd: read(/([+\d.]+)%\s*recarga/i),
    ult: read(/([+\d.]+)%\s*Ultimate/i),
    crit: read(/([+\d.]+)%\s*crítico/i),
    move: 0
  };
}

function danoAtualPercent(p, isFused){
  if(!p) return 0;

  if(p.raridade === 'hunge'){
    const melhor = getBestBaseCharacter();
    const melhorDano = melhor ? getCharacterStats(melhor).dmg : 0;
    return Math.round((melhorDano + (hungeBuffs[p.id]?.damage || 0)) * 1000) / 10;
  }

  const base = getCharacterStats(p).dmg;
  const mult = isFused ? (fusionBonuses[p.id] || 1) : 1;
  return Math.round(((1 + base) * mult - 1) * 1000) / 10;
}

function mostrarFusaoVisual(p, bonusPercent){
  const overlay = document.createElement('div');
  overlay.className = 'fusion-overlay';
  overlay.innerHTML = `
    <div class="fusion-overlay-card ${rarityInfo[p?.raridade]?.cls || ''}" style="--rarity:${rarityColor(p?.raridade)}">
      <div class="fusion-shine"></div>
      <div class="fusion-sparkles">${'✦'.repeat(14)}</div>
      <div class="fusion-portrait-frame">
        <img src="${bannerStaticSrc(p)}" alt="${p?.nome || ''}" draggable="false">
      </div>
      <small>FUSÃO CONCLUÍDA</small>
      <h2>${p?.nome || ''}</h2>
      <div class="fusion-bonus">+${bonusPercent}% DE DANO</div>
      <p>As 5 cópias foram combinadas em uma versão fortalecida.</p>
      <button class="small-btn primary" onclick="this.closest('.fusion-overlay').remove()">CONTINUAR</button>
    </div>`;
  document.body.appendChild(overlay);
}

async function fuseCharacter(id){
  const jaFundidas = fused[id] || 0;
  const naoFundidas = count(id) - jaFundidas;
  if (naoFundidas < 5) return;

  try {
    const { data, error } = await window.supabaseClient.rpc(
      'fundir_personagem',
      { p_personagem_id: id }
    );

    if (error) throw error;

    if (data?.inventory?.possuidos) {
      inventario.possuidos = data.inventory.possuidos;
    }
    if (data?.fused) {
      Object.keys(fused).forEach(k => delete fused[k]);
      Object.assign(fused, data.fused);
    }
    if (data?.fusion_bonuses) {
      Object.keys(fusionBonuses).forEach(k => delete fusionBonuses[k]);
      Object.assign(fusionBonuses, data.fusion_bonuses);
    }

    const p = personagens.find(x => x.id === id);
    save(); renderCharacters(); renderInventory(); updateResources();
    mostrarFusaoVisual(p, Math.round((fusionBonuses[id] - 1) * 100));

  } catch (erro) {
    console.error('Erro ao fundir personagem:', erro);
    alert(erro.message || 'Não foi possível fundir o personagem.');
  }
}

document.getElementById('btn-fundir').onclick=()=>{const id=[...new Set(inventario.possuidos)].find(x=>count(x)>=5&&!fused[x]);if(id)fuseCharacter(id);else alert('Tenha 5 cópias iguais e ainda não fundidas.')};
const hungeBuffs = {
  PetHunge: { damage: .10, defense: .05, ultimate: .05, coins: .20, diamonds: .05 },
  ChucroHunge: { damage: .15, defense: .05, ultimate: .10, coins: .10, diamonds: .10 }
};
const rareLuckyRarities = new Set(['epico','lendario','mitico','secreto','divino','celestial','supremo','ilimitado','exclusivo','indefinido','transcendente']);
function potionAtiva(tipo) { return Number(pocoesAtivas[tipo] || 0) > Date.now(); }
function tempoPocao(tipo) { return Math.max(0, Number(pocoesAtivas[tipo] || 0) - Date.now()); }
function potionMultiplier(tipo) { return potionAtiva(tipo) ? 1.5 : 1; }
function getEquippedHungeBuff() { const id=inventario.equipados?.imagem; return id ? (hungeBuffs[id] || null) : null; }
function getPlayerCoinRewardMultiplier(){ const b=getEquippedHungeBuff(); return (1+(b?.coins||0))*potionMultiplier('coins')*(vipOwned?1.05:1)*(moneyX2Owned?2:1); }
function getPlayerDiamondRewardMultiplier(){ const b=getEquippedHungeBuff(); return (1+(b?.diamonds||0))*potionMultiplier('diamond')*(vipOwned?1.05:1)*(diamondX2Owned?2:1); }

async function consumirPocao(tipo) {
  const nomes = {
    lucky: 'Poção de Lucky',
    damage: 'Poção de Damage',
    coins: 'Poção de Moedas',
    diamond: 'Poção de Diamond'
  };

  if (!pocoes[tipo]) return;

  if (!confirm(
    'Certeza que deseja consumir essa poção?\n\n' +
    nomes[tipo] +
    ' ficará ativa por 5 minutos.'
  )) return;

  try {
    const { data, error } = await window.supabaseClient.rpc(
      'consumir_pocao',
      { p_tipo: tipo }
    );

    if (error) throw error;

    Object.assign(pocoes, data.pocoes || {});
    Object.assign(pocoesAtivas, data.pocoes_ativas || {});

    renderInventory('potions');
    renderPocoesAtivasHUD();

    mostrarToast(
      '🧪 ' + nomes[tipo] + ' ativada por 5 minutos!',
      'reward'
    );

  } catch (erro) {
    console.error('Erro ao consumir poção:', erro);
    alert(erro.message || 'Não foi possível consumir a poção.');
  }
}

window.consumirPocao = consumirPocao;;

// ===== HUD DE POÇÕES ATIVAS (estilo buffs) =====
const POTION_HUD_META = {
  lucky: { icone: '🧪', nome: 'Lucky' },
  damage: { icone: '⚔️', nome: 'Damage' },
  coins: { icone: '🪙', nome: 'Coins' },
  diamond: { icone: '💎', nome: 'Diamond' }
};

function garantirPocoesHud() {
  let hud = document.getElementById('pocoes-ativas-hud');
  if (!hud) {
    hud = document.createElement('div');
    hud.id = 'pocoes-ativas-hud';
    hud.style.position = 'fixed';
    hud.style.top = '12px';
    hud.style.right = '12px';
    hud.style.zIndex = '99998';
    hud.style.display = 'flex';
    hud.style.flexDirection = 'column';
    hud.style.gap = '6px';
    hud.style.pointerEvents = 'none';
    document.body.appendChild(hud);
  }
  return hud;
}

function renderPocoesAtivasHUD() {
  const hud = garantirPocoesHud();
  const tipos = Object.keys(POTION_HUD_META).filter((tipo) => potionAtiva(tipo));

  if (!tipos.length) {
    hud.innerHTML = '';
    hud.style.display = 'none';
    return;
  }

  hud.style.display = 'flex';
  hud.innerHTML = tipos.map((tipo) => {
    const meta = POTION_HUD_META[tipo];
    return `<div class="pocao-hud-item" style="pointer-events:auto;display:flex;align-items:center;gap:8px;background:rgba(10,12,25,.82);border:1px solid rgba(255,255,255,.18);border-radius:10px;padding:6px 10px;color:#fff;font-family:system-ui,sans-serif;box-shadow:0 0 12px rgba(66,239,255,.25)"><span style="font-size:18px">${meta.icone}</span><span style="display:flex;flex-direction:column;line-height:1.1"><b style="font-size:13px">${meta.nome}</b><span style="font-size:12px;color:#8ea2ff">${formatarTempoRestante(tempoPocao(tipo))}</span></span></div>`;
  }).join('');
}

setInterval(renderPocoesAtivasHUD, 1000);
window.renderPocoesAtivasHUD = renderPocoesAtivasHUD;

function getEquippedCharacter() {
  const idEquipado = inventario.equipados.imagem;
  // Guarda de segurança: o campo de "equipado" é compartilhado com a loja do PvP
  // (mesma coluna no servidor). Se o jogador equipou um pet ali (id termina em "Pvp"),
  // isso NUNCA deve valer dano/resistência/recarga no jogo principal — tratamos como
  // "nenhum personagem equipado" aqui, que é um estado que todo o resto do código já
  // sabe lidar normalmente (personagem null). Não muda a lógica de equipar em si.
  if (idEquipado && idEquipado.endsWith('Pvp')) return null;
  return personagens.find((personagem) => personagem.id === idEquipado) || null;
}
function getBestBaseCharacter(){
  return [...new Set(inventario.possuidos)]
    .map(id => personagens.find(p => p.id === id))
    .filter(Boolean)
    .filter(p => p.raridade !== 'hunge')
    .sort((a,b) => getCharacterStats(b).dmg - getCharacterStats(a).dmg)[0] || null;
}

function getPlayerDamageMultiplier(){
  const personagem = getEquippedCharacter();
  const hunge = getEquippedHungeBuff();
  let multiplicador = 1;

  if(hunge){
    const melhor = getBestBaseCharacter();
    const melhorDano = melhor ? getCharacterStats(melhor).dmg : 0;
    multiplicador = 1 + melhorDano + (hunge.damage || 0);
  } else if(personagem && personagem.raridade !== 'hunge') {
    multiplicador = 1 + getCharacterStats(personagem).dmg;
  }

  if(personagem && fusionBonuses[personagem.id]) {
    multiplicador *= fusionBonuses[personagem.id];
  }

  return multiplicador * potionMultiplier('damage');
}

function getPlayerResistanceMultiplier() {
  const personagem = getEquippedCharacter();
  const personagemRes = personagem && personagem.raridade !== 'hunge'
    ? getCharacterStats(personagem).res
    : 0;
  const hungeRes = getEquippedHungeBuff()?.defense || 0;
  return (1 - personagemRes) * (1 - hungeRes);
}

function getPlayerCooldownMultiplier() {
  const personagem = getEquippedCharacter();
  const cd = personagem && personagem.raridade !== 'hunge'
    ? getCharacterStats(personagem).cd
    : 0;
  // Nerf pequeno adicional (pedido): piso de 0.85 → 0.90. Os personagens muito raros
  // (24-30% de recarga) já batiam no piso antigo; agora o corte máximo cai de 15% pra
  // 10% de redução no cooldown do ataque automático. Lógica/timer intocados — só este número.
  return Math.max(0.90, 1 - cd);
}

function getPlayerUltimateChargeMultiplier(){
  const personagem = getEquippedCharacter();
  const hunge = getEquippedHungeBuff();
  const baseChar = hunge ? getBestBaseCharacter() : personagem;
  const base = baseChar && baseChar.raridade !== 'hunge'
    ? getCharacterStats(baseChar).ult
    : 0;
  return (1 + base) * (1 + (hunge?.ultimate || 0));
}

function getPlayerMoveMultiplier(){
  const personagem = getEquippedCharacter();
  return 1 + (personagem && personagem.raridade !== 'hunge'
    ? getCharacterStats(personagem).move
    : 0);
}

function getPlayerCritChance(){
  const personagem = getEquippedCharacter();
  return personagem && personagem.raridade !== 'hunge'
    ? getCharacterStats(personagem).crit
    : 0;
}

let danoPendenteServidor = 0;
let enviandoDanoServidor = false;

async function registrarDanoMissao(dano) {
  const valor = Number(dano || 0);

  if (!Number.isFinite(valor) || valor <= 0) return;

  danoPendenteServidor += valor;

  if (enviandoDanoServidor) return;

  enviandoDanoServidor = true;

  try {
    while (danoPendenteServidor > 0) {
      const danoEnviar = danoPendenteServidor;
      danoPendenteServidor = 0;

      const { data, error } = await window.supabaseClient.rpc(
        'registrar_dano',
        { p_dano: danoEnviar }
      );

      if (error) throw error;

      if (data) {
        if (data.damage_total !== undefined) {
          // O valor oficial continua sendo o do servidor.
        }

        if (data.mission_proguess) {
          missionProgress = data.mission_proguess;
        }
      }

      renderMissions();
    }
  } catch (erro) {
    console.error('Erro ao registrar dano no servidor:', erro);
  } finally {
    enviandoDanoServidor = false;
  }
}

window.registrarDanoMissao = registrarDanoMissao;

const missionTiers = {
  facil:   { label:'MISSÕES FÁCEIS',   rarity:'#39ff7a', cls:'tier-baixa' },
  media:   { label:'MISSÕES MÉDIAS',   rarity:'#2ec2ff', cls:'tier-media' },
  dificil: { label:'MISSÕES DIFÍCEIS', rarity:'#ffbe0b', cls:'tier-alta'  }
};
const missions=[

{id:'tutorial-spin',tier:'facil',title:'1 • Primeiro giro',desc:'Faça seu primeiro giro no Banner.',reward:'🪙 500',check:()=>tutorialStep>=1 || Number(missionProgress.tutorial_spin||0)>=1},
{id:'tutorial-equip',tier:'facil',title:'2 • Primeira vitória',desc:'Derrote Arlan 1 vez.',reward:'🪙 500',check:()=>(bossKills[1]||0)>=1},
{id:'tutorial-boss',tier:'facil',title:'3 • Primeira caça',desc:'Derrote Arlan 3 vezes.',reward:'🪙 700',check:()=>(bossKills[1]||0)>=3},
{id:'tutorial-skill',tier:'facil',title:'4 • Novo poder',desc:'Compre e equipe uma Skill 2.',reward:'🪙 1.000',check:()=>!!inventario.equipados.skill2},
{id:'damage25k',tier:'facil',title:'Sem piedade',desc:'Cause 25.000 de dano total.',reward:'🪙 500',check:()=>Number(missionProgress.damage25k||0)>=25000},
{id:'battleVanessa',tier:'facil',title:'A batalha Pela Vanessa',desc:'Entre em uma batalha.',reward:'🪙 400',check:()=>Number(missionProgress.battleVanessa||0)>=1},

{id:'boss3-miguel',tier:'media',title:'Caçador de Miguel',desc:'Derrote Miguel 5 vezes.',reward:'🪙 1.000',check:()=>(bossKills[3]||0)>=5},
{id:'boss4-carlos',tier:'media',title:'Caçador de Carlos',desc:'Derrote Carlos 3 vezes.',reward:'🪙 2.000',check:()=>(bossKills[4]||0)>=3},
{id:'boss5-lucas',tier:'media',title:'Caçador de Lucas',desc:'Derrote Lucas 5 vezes.',reward:'🪙 5.000',check:()=>(bossKills[5]||0)>=5},
{id:'boss6-davi',tier:'media',title:'Caçador de Davi',desc:'Derrote Davi 5 vezes.',reward:'🪙 10.000',check:()=>(bossKills[6]||0)>=5},

{id:'boss7-arthur',tier:'dificil',title:'Caçador de Arthur',desc:'Derrote Arthur 6 vezes.',reward:'🪙 15.000',check:()=>(bossKills[7]||0)>=6},
{id:'boss8-vinicius',tier:'dificil',title:'Caçador de Vinicius',desc:'Derrote Vinicius 7 vezes.',reward:'🪙 20.000',check:()=>(bossKills[8]||0)>=7},
{id:'boss9-guilerme',tier:'dificil',title:'Caçador de Guilherme',desc:'Derrote Guilherme 10 vezes.',reward:'🪙 100.000',check:()=>(bossKills[9]||0)>=10},
{id:'damage100k',tier:'dificil',title:'Fúria Arcana',desc:'Cause 100.000 de dano total.',reward:'🪙 500',check:()=>Number(missionProgress.damage100k||0)>=100000},
{id:'damage1m',tier:'dificil',title:'Devastador',desc:'Cause 1.000.000 de dano total.',reward:'🪙 100.000 + 🧪 Poção da Sorte + 🧪 Poção de Dano + 🧪 Poção de Moedas',check:()=>Number(missionProgress.damage1m||0)>=1000000,extra:{pocoes:{lucky:1,damage:1,coins:1}}},
{id:'boss10-paulao',tier:'dificil',title:'O Fim do Pneu',desc:'Derrote Paulão do Pneu 8 vezes.',reward:'🪙 500.000 + todas as Poções + 15 Giros',check:()=>(bossKills[10]||0)>=8,extra:{pocoes:{lucky:3,damage:3,coins:3},spins:15}}
];
updateNotificationBadges();
function obterProgressoMissao(mission){
  const id = mission?.id;
  const total = mission?.id === 'tutorial-spin' ? 1
    : mission?.id === 'tutorial-equip' ? 1
    : mission?.id === 'tutorial-boss' ? 3
    : mission?.id === 'tutorial-skill' ? 1
    : mission?.id === 'damage25k' ? 25000
    : mission?.id === 'battleVanessa' ? 1
    : mission?.id === 'boss3-miguel' ? 5
    : mission?.id === 'boss4-carlos' ? 3
    : mission?.id === 'boss5-lucas' ? 5
    : mission?.id === 'boss6-davi' ? 5
    : mission?.id === 'boss7-arthur' ? 6
    : mission?.id === 'boss8-vinicius' ? 7
    : mission?.id === 'boss9-guilerme' ? 10
    : mission?.id === 'damage100k' ? 100000
    : mission?.id === 'damage1m' ? 1000000
    : mission?.id === 'boss10-paulao' ? 8
    : 1;

  let atual = 0;
  if(id === 'tutorial-spin') atual = Math.min(1, Number(missionProgress.tutorial_spin || tutorialStep >= 1 ? 1 : 0));
  else if(id === 'tutorial-equip') atual = Math.min(1, Number(bossKills[1] || 0));
  else if(id === 'tutorial-boss') atual = Number(bossKills[1] || 0);
  else if(id === 'tutorial-skill') atual = inventario.equipados.skill2 ? 1 : 0;
  else if(id === 'damage25k' || id === 'damage100k' || id === 'damage1m') atual = Number(missionProgress[id] || 0);
  else if(id === 'battleVanessa') atual = Number(missionProgress.battleVanessa || 0);
  else if(/^boss(3|4|5|6|7|8|9|10)-/.test(id)) atual = Number(bossKills[Number(id.match(/^boss(\d+)/)[1])] || 0);

  atual = Math.max(0, Math.min(total, atual));
  const percentual = total > 0 ? Math.min(100, (atual / total) * 100) : 0;
  return { atual, total, percentual };
}

function renderMissions() {
  const container = document.getElementById('missoes-conteudo');
  if (!container) return;

  const grupos = ['facil','media','dificil'].map((tierKey) => {
    const info = missionTiers[tierKey];
    const cards = missions.filter((m) => m.tier === tierKey).map((mission) => {
      const done = mission.check();
      const claimedMission = claimed[mission.id];
      const progresso = obterProgressoMissao(mission);

      if (done && !claimedMission && !missionReadyNotified.has(mission.id)) {
        missionReadyNotified.add(mission.id);
        setTimeout(() => mostrarToast('✓ Missão concluída: ' + mission.title, 'mission'), 80);
      }

      return `
        <article class="mission-card ${info.cls} ${done && !claimedMission ? 'ready' : ''}" style="--rarity:${info.rarity}">
          <div>
            <h3>${mission.title}</h3>
            <p>${mission.desc}</p>
            <div class="mission-progress">
              <i style="width:${progresso.percentual}%"></i>
            </div>
            <small class="mission-progress-text">${progresso.atual.toLocaleString('pt-BR')} / ${progresso.total.toLocaleString('pt-BR')} • ${progresso.percentual.toFixed(progresso.percentual % 1 ? 1 : 0)}%</small>
          </div>
          <div class="mission-reward">
            ${claimedMission
              ? '✓ CONCLUÍDA'
              : done
                ? `<button class="small-btn primary" onclick="claimMission('${mission.id}')">RESGATAR</button>`
                : mission.reward}
          </div>
        </article>
      `;
    }).join('');

    return `<div class="mission-tier-group"><h3 class="mission-tier-title" style="--rarity:${info.rarity}">${info.label}</h3><div class="missions-list">${cards}</div></div>`;
  }).join('');

  container.innerHTML = grupos;
  updateNotificationBadges();
}
let missionClaiming = {};
async function claimMission(id){
  if(claimed[id]) return;
  if(missionClaiming[id]) return;
  missionClaiming[id] = true;

  try{
    const { data, error } = await window.supabaseClient.rpc(
      'resgatar_missao',
      { p_mission_id: id }
    );

    if(error) throw error;

    if(data?.claimed_missions){
      claimed = data.claimed_missions;
    }else{
      claimed[id] = true;
    }

    moedasGlobais = Number(data?.coins ?? moedasGlobais);
    diamantesGlobais = Number(data?.diamante ?? diamantesGlobais);

    if(data?.pocoes && typeof data.pocoes === 'object'){
      Object.assign(pocoes, data.pocoes);
    }

    if(data?.pocoes_ativas && typeof data.pocoes_ativas === 'object'){
      Object.assign(pocoesAtivas, data.pocoes_ativas);
    }

    if(data?.bonus_free_spins !== undefined){
      bonusFreeSpins = Number(data.bonus_free_spins || 0);
    }else if(Number(data?.spins || 0) > 0){
      bonusFreeSpins += Number(data.spins || 0);
    }

    await sincronizarEstadoDoServidor();

    updateResources();
    renderMissions();

    mostrarToast(
      `🎁 Missão resgatada! +${fmt(Number(data?.reward || 0))} moedas`,
      'reward'
    );

    missionClaiming[id] = false;

  }catch(erro){
    console.error('Erro ao resgatar missão:', erro);

    const mensagem = String(
      erro?.message || erro?.details || erro || ''
    );

    if(mensagem.includes('Missão já resgatada')){
      claimed[id] = true;
      missionClaiming[id] = false;
      await sincronizarEstadoDoServidor();
      renderMissions();
      return;
    }

    missionClaiming[id] = false;

    alert(
      mensagem || 'Não foi possível resgatar a missão.'
    );
  }
}

// Shop
let shopCategory='skill1';
function renderShop(cat = 'skill1') {
  shopCategory = cat;
  const all = cat === 'skill1' ? skills.skill1 : cat === 'skill2' ? skills.skill2 : ultimates;
  const c = document.getElementById('loja-conteudo');
  if (!c) return;

  const cards = all.map((item) => {
    const owned = item.id === 'RelampagoSkill1' || inventario.possuidos.includes(item.id);
    const key = cat === 'skill1' ? 'skill1' : cat === 'skill2' ? 'skill2' : 'ultimate';
    const eq = inventario.equipados[key] === item.id || (item.id === 'RelampagoSkill1' && !inventario.equipados[key]);
    const info = rarityInfo[item.raridade] || { label: item.raridade, cls: 'rarity-divino' };
    const media = item.gif || item.video;
    const diamondCost = item.preco ? Math.max(5, Math.ceil(item.preco / 5000)) : 0;
    return `
      <article class="shop-card ${info.cls}" style="--rarity:${rarityColor(item.raridade)}">
        <div class="asset-frame shop-asset">
          ${/\.mp4$/i.test(media || '') ? `<video src="${media}" muted loop autoplay playsinline preload="metadata"></video>` : `<img src="${media || 'BannerFoto.png'}" alt="${item.nome}" onerror="this.style.display='none';this.nextElementSibling.classList.remove('hidden')">`}
          <div class="asset-fallback hidden"><strong>${item.nome.slice(0,2).toUpperCase()}</strong><span>${item.nome}</span></div>
        </div>
        <h3>${item.nome}</h3>
        <div class="rarity-label">${info.label}</div>
        <div class="stat-line">Dano <b>${item.dano}</b></div>
        <div class="stat-line">Preço <b>${owned ? 'GRÁTIS' : item.preco ? `${fmt(item.preco)} 🪙 + ${diamondCost} 💎` : 'DROP BOSS 9 • 5%'}</b></div>
        <button class="small-btn ${eq ? 'primary' : ''}" onclick="buyEquip('${cat}','${item.id}')">${eq ? 'EQUIPADO' : owned ? 'EQUIPAR' : item.preco ? 'COMPRAR' : 'DROP EXCLUSIVO'}</button>
      </article>`;
  }).join('');

  const lifeCost = 900 * (lifeUpgrades + 1);
  const lifeTotal = 800 + calcularBonusVidaPermanente();
  c.innerHTML = `
    <div class="shop-tabs">
      <button class="shop-tab ${cat === 'skill1' ? 'active' : ''}" onclick="renderShop('skill1')">SKILL 1</button>
      <button class="shop-tab ${cat === 'skill2' ? 'active' : ''}" onclick="renderShop('skill2')">SKILL 2</button>
      <button class="shop-tab ${cat === 'ultimate' ? 'active' : ''}" onclick="renderShop('ultimate')">ULTIMATES</button>
      <button class="shop-tab" onclick="show('tela-melhorias')">❤️ MELHORIAS</button>
    </div>
    <div class="shop-grid">${cards}</div>
    <div class="life-upgrade featured-upgrade">
      <div><b>❤️ MELHORIAS DE VIDA</b><span>Vida atual: <strong>${fmt(lifeTotal)}</strong> • Nível ${lifeUpgrades}</span><small>Cada melhoria aumenta sua vida máxima em +500.</small></div>
      <button class="small-btn primary" onclick="buyLifeUpgrade()">+500 VIDA • 🪙 ${fmt(lifeCost)}</button>
    </div>`;
}

async function buyEquip(cat,id){
  const key=cat==='skill1'?'skill1':cat==='skill2'?'skill2':'ultimate';
  const list=cat==='skill1'?skills.skill1:cat==='skill2'?skills.skill2:ultimates;
  const item=list.find(x=>x.id===id);
  if(!item)return;

  if(id==='RelampagoSkill1' || inventario.possuidos.includes(id)){
    const equipadoAntes = inventario.equipados[key];
    inventario.equipados[key]=id;
    save();
    renderShop(cat);
    renderMissions();
    renderInventory();

    // Qualquer item já possuído (incluindo RelampagoSkill1, a skill1 padrão/gratuita)
    // precisa persistir no servidor, senão a sincronização periódica
    // (sincronizarEstadoDoServidor, a cada 20s) sobrescreve de volta pro último item
    // comprado — era isso que causava "equipar skill fraca e o jogo trocar pra melhor
    // sozinho". O servidor (RPC equipar_item) já tem uma exceção especial que permite
    // equipar RelampagoSkill1 mesmo sem estar na lista de possuídos.
    try{
      const {error}=await window.supabaseClient.rpc(
        'equipar_item',
        { p_tipo:key, p_item_id:id }
      );
      if(error)throw error;
    }catch(erro){
      console.error('Erro ao salvar equipamento no servidor:',erro);
      // Reverte localmente pra não deixar cliente e servidor dessincronizados
      // (senão a próxima sincronização periódica troca de novo sem avisar o jogador).
      inventario.equipados[key]=equipadoAntes;
      save();
      renderShop(cat);
      renderMissions();
      renderInventory();
      alert('Não foi possível salvar esse equipamento no servidor. Tente novamente.');
    }
    return;
  }

  if(id==='BlackholeSkill2'){
    alert('Blackhole só pode cair do Boss 9: 5% por vitória no Boss 9.');
    return;
  }

  try{
    const {data,error}=await window.supabaseClient.rpc(
      'comprar_equipamento',
      {
        p_item_id:id,
        p_categoria:cat
      }
    );

    if(error)throw error;

    moedasGlobais=Number(data.coins||0);
    diamantesGlobais=Number(data.diamante||0);

    inventario.possuidos.push(id);
    inventario.equipados[key]=id;

    if(window.playCoinsSound)playCoinsSound();

    if(cat==='skill2'){
      tutorialStep=Math.max(tutorialStep,4);
      compraSkill2Obrigatoria=false;
    }

    if (cat === 'skill1' && typeof avancarTutorialVisual === 'function') avancarTutorialVisual(4);

    save();
    updateResources();
    renderShop(cat);
    renderMissions();
    renderInventory();

  }catch(erro){
    console.error('Erro ao comprar equipamento:',erro);

    const mensagem=String(erro?.message||erro||'');

    if(mensagem.includes('Item já possuído')){
      alert('Você já possui este item.');
    }else if(!avisarSaldoInsuficiente(mensagem)){
      alert('Não foi possível realizar a compra.');
    }
  }
}

function calcularBonusVidaPermanente(){return lifeUpgrades*500}

async function buyLifeUpgrade(){
  try{
    const { data, error } = await window.supabaseClient.rpc(
      'comprar_melhoria_vida'
    );

    if(error) throw error;

    moedasGlobais = Number(data.coins || 0);
    diamantesGlobais = Number(data.diamante || 0);
    lifeUpgrades = Number(data.life_upgrades || 0);

    if(window.playCoinsSound) playCoinsSound();

    if (typeof avancarTutorialVisual === 'function') avancarTutorialVisual(5);

    updateResources();
    renderShop(shopCategory);
    renderUpgrades();

  }catch(erro){
    console.error('Erro ao comprar melhoria de vida:', erro);

    const mensagem = String(
  erro?.message ||
  erro?.details ||
  erro?.hint ||
  erro ||
  ''
);

console.error('Detalhes completos do erro do code:', erro);

    if(!avisarSaldoInsuficiente(mensagem)){
      alert('Não foi possível comprar a melhoria de vida.');
    }
  }
}
window.itensLoja={ultimate:ultimates};
let inventoryActiveTab = 'all';
function renderInventory(tab = inventoryActiveTab) {
  inventoryActiveTab = tab;
  const container = document.getElementById('inventario-conteudo');
  if (!container) return;
  const equipados = inventario.equipados || {};
  const ownedCharacterIds = [...new Set(inventario.possuidos.filter((id) => personagensPrincipais.some((p) => p.id === id)))];
  const ownedSkills1 = skills.skill1.filter((item) => inventario.possuidos.includes(item.id));
  const ownedSkills2 = skills.skill2.filter((item) => inventario.possuidos.includes(item.id));
  const ownedUltimates = ultimates.filter((item) => inventario.possuidos.includes(item.id));
  const equippedCharacter = getEquippedCharacter();
  const equippedS1 = skills.skill1.find((x) => x.id === equipados.skill1);
  const equippedS2 = skills.skill2.find((x) => x.id === equipados.skill2);
  const equippedUlt = ultimates.find((x) => x.id === equipados.ultimate);

  const mediaCard = (src, fallback) => {
    const ehVideo = /\.(mp4|webm|mov|ogg)$/i.test(String(src || ''));
    const media = ehVideo
      ? `<video src="${src}" muted loop autoplay playsinline preload="metadata" onerror="this.style.display='none';this.nextElementSibling.style.opacity='1'"></video>`
      : `<img src="${src}" alt="${fallback}" onerror="this.style.display='none';this.nextElementSibling.style.opacity='1'">`;
    return `<div class="inventory-media">${media}<span class="media-fallback">${fallback}</span></div>`;
  };

  const loadout = (label, item, icon) => `<article class="loadout-card alive-loadout ${item ? (rarityInfo[item.raridade] || rarityInfo.comum).cls : 'empty-loadout'}" style="--rarity:${item ? rarityColor(item.raridade) : '#54dcff'}">
    <div class="loadout-icon">${icon}</div><div class="loadout-copy"><small>${label}</small><b>${item?.nome || 'NÃO EQUIPADO'}</b><span>${item?.buff || item?.tier || 'Escolha um item obtido'}</span></div></article>`;

  // DEPOIS
  const characterUnits = ownedCharacterIds.flatMap((id) => {
    const p = personagens.find((x) => x.id === id);
    const qty = count(id);
    const fusedCount = fused[id] || 0;
    return Array.from({length: qty}, (_, index) => {
      const isFused = index >= qty - fusedCount;
      return `<article class="pet-style-card inventory-unit ${rarityInfo[p.raridade]?.cls || ''} ${equipados.imagem === id ? 'equipped' : ''} ${isFused ? 'character-fused' : ''}" style="--rarity:${rarityColor(p.raridade)}">
      <div class="pet-card-top"><span class="rarity-label">${p.tier}</span><span class="pet-count">#${index + 1}</span></div>
      ${isFused ? '<div class="fused-badge">★ FUNDIDO</div>' : ''}
      <div class="pet-media asset-frame">${mediaCard(p.id === 'KauanBanner' ? 'KauanBanner_static.webp' : p.arquivo, p.nome.slice(0,2).toUpperCase())}</div>
      <div class="pet-name-row"><h3>${p.nome}</h3>${equipados.imagem === id ? '<span class="equipped-mini">✓ EQUIPADO</span>' : ''}</div>
      <div class="pet-rarity">${p.tier}</div><p>${p.buff}</p>
      <div class="current-damage">⚔ Dano atual: +${danoAtualPercent(p, isFused)}%</div>
      <button class="small-btn ${equipados.imagem === id ? 'primary' : ''}" onclick="equipCharacter('${p.id}')">${equipados.imagem === id ? '✓ EQUIPADO' : 'EQUIPAR'}</button>
    </article>`;
    });
  }).join('');

  const skillUnits = [...ownedSkills1, ...ownedSkills2].map((item) => `<article class="inventory-item-card ${rarityInfo[item.raridade]?.cls || ''}" style="--rarity:${rarityColor(item.raridade)}">
    ${mediaCard(item.gif, '⚡')}<span class="item-type">${skills.skill1.includes(item) ? 'SKILL 1' : 'SKILL 2'}</span><h3>${item.nome}</h3><b>DANO ${item.dano}</b><button class="small-btn ${equipados.skill1 === item.id || equipados.skill2 === item.id ? 'primary' : ''}" onclick="buyEquip('${skills.skill1.includes(item) ? 'skill1' : 'skill2'}','${item.id}')">${equipados.skill1 === item.id || equipados.skill2 === item.id ? '✓ EQUIPADA' : 'EQUIPAR'}</button>
  </article>`).join('');

  const ultimateUnits = ownedUltimates.map((item) => `<article class="inventory-item-card ultimate-owned ${rarityInfo[item.raridade]?.cls || ''}" style="--rarity:${rarityColor(item.raridade)}">
    ${mediaCard(item.video, 'ULT')}<span class="item-type">ULTIMATE</span><h3>${item.nome}</h3><b>DANO ${item.dano}</b><small>VÍDEO: ${item.video}</small><button class="small-btn ${equipados.ultimate === item.id ? 'primary' : ''}" onclick="buyEquip('ultimate','${item.id}')">${equipados.ultimate === item.id ? '✓ EQUIPADA' : 'EQUIPAR'}</button>
  </article>`).join('');

  const potionCard = (tipo,icon,nome,desc) => `<article class="potion-card ${potionAtiva(tipo)?'potion-active':''}"><div class="potion-icon">${icon}</div><div class="potion-copy"><small>POÇÃO</small><h3>${nome}</h3><p>${desc}</p><b>Quantidade: ${pocoes[tipo]||0}</b>${potionAtiva(tipo)?`<span class="potion-timer">ATIVA • ${formatarTempoRestante(tempoPocao(tipo))}</span>`:''}</div><button class="small-btn ${pocoes[tipo]?'primary':''}" onclick="consumirPocao('${tipo}')" ${pocoes[tipo]?'':'disabled'}>${potionAtiva(tipo)?'ADICIONAR +5 MIN':'CONSUMIR'}</button></article>`;
  const potionsHTML=`<section class="inventory-section potion-section"><div class="section-ribbon">🧪 POÇÕES</div><div class="potion-grid">${potionCard('lucky','🍀','Poção de Lucky','1,5x sorte • afeta somente personagens Épico ou melhores.')}${potionCard('damage','⚔️','Poção de Damage','1,5x dano durante 5 minutos.')}${potionCard('coins','🪙','Poção de Moedas','1,5x moedas recebidas durante 5 minutos.')}${potionCard('diamond','💎','Poção de Diamond','1,5x diamantes recebidos durante 5 minutos.')}</div></section>`;
  const skillCount = ownedSkills1.length + ownedSkills2.length;
  container.innerHTML = `
    <section class="inventory-hero bright-hero"><div class="inventory-title-wrap"><div class="inventory-logo">🎒</div><div><small>ARSENAL VIVO</small><h3>MINHA COLEÇÃO</h3><p>${ownedCharacterIds.length} personagens • ${skillCount} skills • ${ownedUltimates.length} ultimates</p></div></div><div class="inventory-hero-actions"><button class="small-btn best-equip-btn" onclick="equiparMelhores()">⭐ EQUIPAR MELHORES</button><div class="inventory-capacity"><strong>${contarPersonagensNoInventario()}/${getInventoryMax()}</strong><span>CÓPIAS</span><small>${ownedCharacterIds.length}/${personagensPrincipais.length} personagens</small></div></div></section>
    <div class="inventory-tabs"><button class="inventory-tab ${tab==='all'?'active':''}" onclick="renderInventory('all')">🎒 TUDO</button><button class="inventory-tab ${tab==='characters'?'active':''}" onclick="renderInventory('characters')">👤 PERSONAGENS</button><button class="inventory-tab ${tab==='skills'?'active':''}" onclick="renderInventory('skills')">⚡ SKILLS</button><button class="inventory-tab ${tab==='potions'?'active':''}" onclick="renderInventory('potions')">🧪 POÇÕES</button></div>
    ${tab==='potions'?potionsHTML:`<section class="inventory-loadout-grid">${loadout('PERSONAGEM', equippedCharacter, '♟')}${loadout('SKILL 1', equippedS1, '⚡')}${loadout('SKILL 2', equippedS2, '✦')}${loadout('ULTIMATE', equippedUlt, '☄')}</section>
    ${tab==='all'||tab==='characters'?`<section class="inventory-section alive-section"><div class="section-ribbon">👤 PERSONAGENS • ${contarPersonagensNoInventario()} CÓPIAS</div><div class="inventory-pet-grid">${characterUnits || '<div class="empty-state">Gire o Banner para obter personagens.</div>'}</div></section>`:''}
    ${tab==='all'||tab==='skills'?`<section class="inventory-section alive-section"><div class="section-ribbon">⚡ SKILLS OBTIDAS • ${skillCount}</div><div class="inventory-item-grid">${skillUnits || '<div class="empty-state">Você ainda não possui Skills.</div>'}</div></section><section class="inventory-section alive-section"><div class="section-ribbon">☄ ULTIMATES OBTIDAS • ${ownedUltimates.length}</div><div class="inventory-item-grid">${ultimateUnits || '<div class="empty-state">Derrote bosses para encontrar Ultimates.</div>'}</div></section>`:''}`}
    <div class="inventory-shortcuts"><button class="small-btn primary" onclick="show('tela-giro-diario')">🎡 GIRO DIÁRIO</button><button class="small-btn primary" onclick="show('tela-personagens')">👤 PERSONAGENS</button><button class="small-btn primary" onclick="show('tela-loja')">⚡ LOJA DE SKILLS</button></div>`;
  // Inventário e Personagens mostram a mídia normal (com vídeo quando houver);
  // apenas o Banner força imagem estática. Por isso NÃO removemos vídeos aqui.
}

function equippedClass(equipado) {
  return equipado ? 'equipped' : '';
}

function renderUpgrades() {
  const c = document.getElementById('melhorias-conteudo');
  if (!c) return;
  const atual = 800 + calcularBonusVidaPermanente();
  const proximoCusto = 900 * (lifeUpgrades + 1);
  const pode = moedasGlobais >= proximoCusto;
  const niveis = Array.from({ length: 12 }, (_, i) => {
    const nivel = lifeUpgrades + i + 1;
    const custo = 900 * nivel;
    const liberado = i === 0 ? pode : false;
    return `<div class="upgrade-node ${i === 0 && pode ? 'ready' : ''}"><span>NÍVEL ${nivel}</span><b>+500 ❤️</b><small>🪙 ${fmt(custo)}</small></div>`;
  }).join('');
  c.innerHTML = `
    <div class="upgrade-hero">
      <div class="upgrade-icon">❤️‍🔥</div>
      <div><small>VIDA DO HERÓI</small><h3>${fmt(atual)} HP</h3><p>Mais resistência para sobreviver às Ultimates e aos bosses mais fortes.</p></div>
      <button class="small-btn primary big-upgrade" onclick="buyLifeUpgrade()">MELHORAR • 🪙 ${fmt(proximoCusto)}</button>
    </div>
    <div class="upgrade-summary"><b>NÍVEL ATUAL ${lifeUpgrades}</b><span>+${fmt(calcularBonusVidaPermanente())} HP acumulado</span><span>${pode ? '✅ PRÓXIMA MELHORIA DISPONÍVEL' : '🔒 JUNTE MAIS MOEDAS'}</span></div>
    <div class="upgrade-tree">${niveis}</div>`;
}

function renderThemes(){document.getElementById('temas-conteudo').innerHTML='<div class="shop-grid">'+bosses.map(b=>`<article class="shop-card theme-card" style="--rarity:${(bossRankInfo[b.rank]||{}).color||'#53eaff'}"><div class="asset-frame"><img src="Boss${b.id}Img.png" alt="Arena ${b.id}" onerror="this.style.display='none';this.nextElementSibling.classList.remove('hidden')"><div class="asset-fallback hidden"><strong>ARENA ${b.id}</strong><span>Cenário ${b.nome}</span></div></div><h3>ARENA ${b.id} • ${b.rank}</h3><p class="muted">Cenário de ${b.nome}</p><button class="small-btn primary" onclick="equiparTema('Boss${b.id}Img')">EQUIPAR</button></article>`).join('')+'</div>'}


async function equiparTema(temaId){
  try{
    const { data, error } = await window.supabaseClient.rpc(
      'equipar_tema',
      { p_tema_id: temaId }
    );

    if(error) throw error;

    if(data?.equipped){
      inventario.equipados = Object.assign(
        inventario.equipados,
        data.equipped
      );
    }

    alert('Cenário equipado!');

  }catch(erro){
    console.error('Erro ao equipar cenário:', erro);
    alert(
      erro.message ||
      'Não foi possível equipar o cenário.'
    );
  }
}

window.equiparTema = equiparTema;

function renderBosses(){const c=document.getElementById('grid-bosses');c.innerHTML=bosses.map(b=>{const unlocked=b.id===1||bossesDerrotados.includes(b.id-1),r=bossRankInfo[b.rank],s=bossStats[b.id];return `<article class="boss-card ${r.cls}" style="--rank:${r.color};--rarity:${r.color}"><div class="boss-rank">${r.label}</div><div class="asset-frame boss-asset"><img class="boss-select-image" src="${b.imagem}" alt="${b.nome}" onerror="this.style.display='none';this.nextElementSibling.classList.remove('hidden')"><div class="asset-fallback hidden"><strong>${b.nome.slice(0,2).toUpperCase()}</strong><span>${b.nome}</span></div></div><h3>BOSS ${b.id} • ${b.nome}</h3><div class="boss-meta"><span>❤️ ${fmt(s.vida)}</span><span>🪙 ${fmt(s.moedas)}</span></div><div class="boss-skills">${b.skill1}${b.skill2?' • '+b.skill2:''}</div><button class="small-btn ${unlocked?'primary':''}" data-boss-id="${unlocked ? b.id : ''}" type="button">${unlocked?'ENTRAR NA ARENA':'🔒 DERROTE O ANTERIOR'}</button></article>`}).join('')}

let startBossEmAndamento = false;

async function startBoss(id) {
  if (startBossEmAndamento) return false;

  const boss = bosses.find((item) => item.id === Number(id));
  if (!boss) { mostrarToast('Boss não encontrado.', 'defeat'); return false; }
  const unlocked = boss.id === 1 || bossesDerrotados.includes(boss.id - 1);
  if (!unlocked) { mostrarToast('🔒 Derrote o boss anterior primeiro.', 'defeat'); return false; }

  startBossEmAndamento = true;

  try {
    bossSelecionadoId = boss.id;
    compraSkill2Obrigatoria = false;

    try { window.pararBatalha?.(); } catch (_) {}

    try {
      const { data, error } = await window.supabaseClient.rpc(
        'iniciar_batalha',
        { p_boss_id: boss.id }
      );
      if (error) throw error;
      if (!data) throw new Error('O servidor não retornou o ID da batalha.');

      window.arcaneBattleId = data;
      window.arcaneBattleStartedAt = Date.now();
    } catch (erro) {
      console.error('Erro ao iniciar batalha no servidor:', erro);
      mostrarToast(erro.message || '⚠️ Não foi possível iniciar esta batalha.', 'defeat');
      return false;
    }

    aplicarMusicaLobby(false);
    document.querySelectorAll('.screen').forEach((screen) => screen.classList.remove('active'));
    const fight = document.getElementById('tela-jogo');
    if (!fight) { mostrarToast('Tela de batalha não encontrada.', 'defeat'); return false; }
    fight.classList.remove('hidden');
    fight.classList.add('active');

    try {
      if (typeof window.iniciarIntroDeLuta !== 'function') throw new Error('Intro da batalha não carregou');
      window.iniciarIntroDeLuta(boss);
      return true;
    } catch (erro) {
      console.error('Falha ao iniciar intro:', erro);
      try {
        if (typeof window.iniciarBatalha !== 'function') throw erro;
        const jogador = typeof getEquippedCharacter === 'function' ? getEquippedCharacter() : personagens[0];
        window.iniciarBatalha(boss, jogador, inventario, rarityColor(jogador?.raridade || 'comum'));
        return true;
      } catch (erroFinal) {
        console.error('Falha ao iniciar batalha:', erroFinal);
        mostrarToast('⚠️ Não foi possível iniciar esta batalha.', 'defeat');
        return false;
      }
    }
  } finally {
    startBossEmAndamento = false;
  }
}
window.startBoss = startBoss;
window.renderBosses = renderBosses;

const btnPlay = document.getElementById('btn-play');
if (btnPlay) {
  btnPlay.addEventListener('click', () => {
    renderBosses();
    show('tela-bosses');
  });
}

function renderBossInfo(){
  const c=document.getElementById('boss-info-conteudo');
  if(!c)return;
  c.innerHTML=`<div class="encyclopedia-intro"><b>📖 ENCICLOPÉDIA DOS 10 BOSSES</b><span>Vida, recompensa, habilidades, cenário, música e Ultimate de cada Boss.</span></div><div class="boss-grid encyclopedia-grid">${bosses.map(b=>{const r=bossRankInfo[b.rank],s=bossStats[b.id];return `<article class="boss-card ${r.cls}" style="--rank:${r.color};--rarity:${r.color}"><div class="boss-rank">${r.label}</div><div class="asset-frame boss-asset"><img src="${b.imagem}" alt="${b.nome}" onerror="this.style.display='none';this.nextElementSibling.classList.remove('hidden')"><div class="asset-fallback hidden"><strong>${b.nome.slice(0,2).toUpperCase()}</strong><span>${b.nome}</span></div></div><h3>BOSS ${b.id} • ${b.nome}</h3><div class="boss-meta"><span>❤️ ${fmt(s.vida)}</span><span>🪙 ${fmt(s.moedas)}</span><span>💎 ${s.diamantes}</span></div><div class="boss-skills">⚡ ${b.skill1}${b.skill2?' • '+b.skill2:''}</div><div class="encyclopedia-data"><span>🌌 Cenário: Boss${b.id}Img.png</span><span>🎵 Música: Boss${b.id}Music.mp3</span><span>☄ Ultimate: Boss${b.id}.mp4</span></div></article>`}).join('')}</div>`;
}

function renderGamepasses(){
  const c=document.getElementById('gamepass-conteudo'); if(!c)return;
  const passIcons={'2x Money':'🪙','2x Diamantes':'💎','2x Chance Diamantes':'💎','Multi Open':'🥚','2x Lucky':'🍀','Extrem Lucky':'🟣','VIP':'👑'};
  const passColors={'2x Money':'#ffd34e','2x Diamantes':'#5ecbff','2x Chance Diamantes':'#7ee7ff','Multi Open':'#ff9d4d','Lucky Raro':'#39ff7a','Extrem Lucky':'#a63bff','VIP':'#ffd700'};
  const coinPacks=[['1.000 Moedas','3,99','🪙','5,99'],['5.000 Moedas','14,00','🪙','19,90'],['15.000 Moedas','34,90','🪙','49,90'],['35.000 Moedas','69,90','🪙','89,90'],['100.000 Moedas','149,90','🪙','199,90']];
  const diamondPacks=[['100 Diamantes','4,99','💎','6,99'],['500 Diamantes','19,90','💎','27,90'],['1.200 Diamantes','39,90','💎','54,90'],['2.800 Diamantes','79,90','💎','99,90'],['7.000 Diamantes','159,90','💎','199,90']];
  const buy=()=>alert('Mande Pix para esse numero: 61981946045\n\nDepois mande comprovante para esse numero de ZapZap: 6198220-6185\n\nFale a game pass que você queria e ela cairá na sua conta em alguns momentos 💋');
  const moneyCard=x=>`<article class="store-product-card"><div class="store-product-icon">${x[2]}</div><div class="store-product-info"><small>PACOTE</small><h3>${x[0]}</h3><p>Recurso para sua progressão.</p><div class="store-price-line"><s>R$ ${x[3]}</s><strong>R$ ${x[1]}</strong></div></div><button class="small-btn primary store-buy-btn" onclick="(${buy.toString()})()">COMPRAR</button></article>`;
  const passes=gamepasses.map(g=>{
    const possui = ownsGamepass(g[0]);
    const onclick = `comprarGamepassPermanente('${g[0]}')`;
    return `<article class="store-product-card store-pass-card" style="--pass-color:${passColors[g[0]]||'#53eaff'}"><div class="store-product-icon">${passIcons[g[0]]||'⭐'}</div><div class="store-product-info"><small>GAME PASS</small><h3>${g[0]}</h3><p>${g[2]}</p><div class="store-price-line"><strong>R$ ${g[1]}</strong></div></div><button class="small-btn primary store-buy-btn" ${possui?'disabled':''} onclick="${onclick}">${possui?'ADQUIRIDO':'COMPRAR'}</button></article>`;
  }).join('');
  const pocaoUnidades=[
    {chave:'lucky',icone:'🧪',nome:'1 Poção Lucky',preco:'1,59',tipos:['lucky']},
    {chave:'damage',icone:'⚔️',nome:'1 Poção Damage',preco:'2,19',tipos:['damage']},
    {chave:'diamond',icone:'💎',nome:'1 Poção Diamond',preco:'1,99',tipos:['diamond']},
    {chave:'coins',icone:'🪙',nome:'1 Poção Coins',preco:'2,29',tipos:['coins']}
  ];
  const pocaoCard=(p)=>{
    const disponivel = podeComprarPocaoLoja(p.chave);
    return `<article class="store-product-card"><div class="store-product-icon">${p.icone}</div><div class="store-product-info"><small>POÇÃO • 5 MIN</small><h3>${p.nome}</h3><p>${disponivel?'Disponível hoje.':'Já comprada hoje. Volta em 24h.'}</p><div class="store-price-line"><strong>R$ ${p.preco}</strong></div></div><button class="small-btn primary store-buy-btn" ${disponivel?'':'disabled'} onclick="comprarPocaoLoja('${p.chave}', ${JSON.stringify(p.tipos).replace(/"/g,'&quot;')})">${disponivel?'COMPRAR':'INDISPONÍVEL'}</button></article>`;
  };
  const bundleDisponivel = podeComprarPocaoLoja('bundle');
  const bundleCard = `<article class="store-product-card"><div class="store-product-icon">🎁</div><div class="store-product-info"><small>PACOTE • 5 MIN CADA</small><h3>Pacote com as 4 Poções</h3><p>${bundleDisponivel?'Disponível hoje.':'Já comprado hoje. Volta em 24h.'}</p><div class="store-price-line"><strong>R$ 7,99</strong></div></div><button class="small-btn primary store-buy-btn" ${bundleDisponivel?'':'disabled'} onclick="comprarPocaoLoja('bundle', ${JSON.stringify(['lucky','damage','diamond','coins']).replace(/"/g,'&quot;')})">${bundleDisponivel?'COMPRAR':'INDISPONÍVEL'}</button></article>`;
  const inventarioPacks=[
    {qtd:50,preco:'1,99'},
    {qtd:100,preco:'3,99'}
  ];
  const inventarioCard=(p)=>`<article class="store-product-card"><div class="store-product-icon">🎒</div><div class="store-product-info"><small>PERMANENTE</small><h3>+${p.qtd} Inventário</h3><p>Aumenta permanentemente sua capacidade máxima de personagens.</p><div class="store-price-line"><strong>R$ ${p.preco}</strong></div></div><button class="small-btn primary store-buy-btn" onclick="comprarExpansaoInventario(${p.qtd})">COMPRAR</button></article>`;
  c.innerHTML=`<div class="store-page-shell"><section class="store-section"><div class="store-section-head"><div class="store-section-icon">🎟️</div><div><small>VANTAGENS PREMIUM</small><h3>GAME PASSES</h3></div></div><div class="store-product-list">${passes}</div></section><section class="store-section"><div class="store-section-head"><div class="store-section-icon">🧪</div><div><small>CONSUMÍVEIS • 1x POR DIA</small><h3>POÇÕES</h3></div></div><div class="store-product-list">${pocaoUnidades.map(pocaoCard).join('')}${bundleCard}</div></section><section class="store-section"><div class="store-section-head"><div class="store-section-icon">🎒</div><div><small>EXPANSÃO</small><h3>INVENTÁRIO (ATUAL: ${getInventoryMax()})</h3></div></div><div class="store-product-list">${inventarioPacks.map(inventarioCard).join('')}</div></section><section class="store-section"><div class="store-section-head"><div class="store-section-icon">🪙</div><div><small>MOEDA PRINCIPAL</small><h3>MOEDAS</h3></div></div><div class="store-product-list">${coinPacks.map(moneyCard).join('')}</div></section><section class="store-section"><div class="store-section-head"><div class="store-section-icon">💎</div><div><small>MOEDA PREMIUM</small><h3>DIAMANTES</h3></div></div><div class="store-product-list">${diamondPacks.map(moneyCard).join('')}</div></section><section class="store-section"><div class="store-section-head"><div class="store-section-icon">🔑</div><div><small>RECOMPENSAS</small><h3>CODES</h3></div></div><div class="store-code-box"><input id="store-code-input" class="code-input" placeholder="Digite seu code"><button class="modal-action store-code-btn" onclick="redeemStoreCode()">RESGATAR CODE</button></div></section></div>`;
}
async function redeemCodeValue(raw){
  const code = (raw || '').trim().toLowerCase();

  if(!code){
    return {ok:false, msg:'Digite um code.'};
  }

  try{
    const { data, error } = await window.supabaseClient.rpc(
      'resgatar_code',
      { p_code: code }
    );

    if(error) throw error;

    moedasGlobais = Number(data.coins || 0);
    diamantesGlobais = Number(data.diamante || 0);
    bonusFreeSpins = Number(data.bonus_free_spins || 0);

    if(data.mission_proguess){
      missionProgress = data.mission_proguess;
    }

    updateResources();
    renderMissions();

    if(code === 'update1'){
      return {
        ok:true,
        msg:'UPDATE1 resgatado! +500 🪙'
      };
    }

    if(code === 'release'){
      return {
        ok:true,
        msg:'RELEASE resgatado! +500 🪙 +10 💎 +1 giro 🎁'
      };
    }

    return {
      ok:true,
      msg:'Code resgatado com sucesso!'
    };

  }catch(erro){
  console.error('ERRO COMPLETO AO RESGATAR CODE:', erro);

  const mensagem = String(
    erro?.message ||
    erro?.details ||
    erro?.hint ||
    erro ||
    ''
  );

  return {
    ok:false,
    msg: mensagem || 'Erro desconhecido ao resgatar o code.'
  };
  }
    }

async function redeemStoreCode(){
  const input = document.getElementById('store-code-input');
  const r = await redeemCodeValue(input?.value);

  alert(r.msg);

  if(r.ok && input){
    input.value = '';
  }
}
// Configurações
const config=document.getElementById('modal-config');document.getElementById('btn-config').onclick=()=>config.classList.remove('hidden');document.getElementById('btn-fechar-config').onclick=()=>config.classList.add('hidden');document.querySelectorAll('[data-config]').forEach(b=>b.onclick=()=>showConfig(b.dataset.config));

function showConfig(type){
  const c=document.getElementById('config-detalhe');if(!c)return;
  if(type==='updates')c.innerHTML='<div class="config-detail"><h3>📜 Registro de Atualizações</h3><p class="muted"><b>Update1</b><br>🎡 Giro Diário • 🐾 Pet Hunge • 🐾 ChucroHunge • 🧪 Poções • 🎁 Login Diário • 🎵 áudio separado • 🛠️ correções de Banner e coleção • 🐞 correção das imagens de batalha de GuilermeChucro e PaulaoDoPneu • 🔊 áudios de Ultimate de PaulaoDoPneu, Lucas e GuilermeChucro conectados • ⚖️ nerf no bônus de recarga (velocidade de Skill) dos personagens • 👹 boss em FÚRIA abaixo de 50% de vida • 📏 ajuste de tamanho de bosses e Skills • 🎨 cores nas frases de Ultimate.</p><p class="muted"><b>Codes:</b><br>🔑 UPDATE1 → 500 🪙<br>🔑 RELEASE → 500 🪙 + 10 💎 + 1 🎁 giro<br>Cada code pode ser usado uma vez.</p></div>';
  if(type==='codes')c.innerHTML='<div class="config-detail"><h3>🔑 CODES</h3><input id="code-input" class="code-input" placeholder="Digite seu code"><button class="modal-action" onclick="redeemCode()">RESGATAR</button></div>';
  if(type==='feedback')c.innerHTML='<div class="config-detail"><textarea id="feedback-input" class="feedback-input" placeholder="Sugestões, melhorias ou bugs..."></textarea><button class="modal-action" onclick="sendFeedback()">ENVIAR FEEDBACK</button></div>';
  // O perfil agora usa a tela própria (#tela-perfil-grande).
}

async function mudarConta() {
  await window.supabaseClient.auth.signOut();
  window.location.href = 'login.html';
}

async function deletarConta() {
  if (!confirm('Tem certeza que quer deletar sua conta? Isso apaga todo o seu progresso.')) return;
  if (!confirm('Essa ação NÃO pode ser desfeita. Confirma mesmo assim?')) return;
  const digitado = prompt('Digite EXCLUIR (em maiúsculas) para confirmar de vez:');
  if (digitado !== 'EXCLUIR') return alert('Cancelado.');

  await window.supabaseClient.from('Player').delete().eq('user_id', window.currentUserId);
  await window.supabaseClient.auth.signOut();
  alert('Conta deletada.');
  window.location.href = 'login.html';
}


async function redeemCode(){
  const r = await redeemCodeValue(
    document.getElementById('code-input')?.value
  );

  alert(r.msg);

  if(r.ok){
    const i = document.getElementById('code-input');
    if(i) i.value = '';
  }
}


function sendFeedback(){
  const el = document.getElementById('feedback-input');
  const text = (el && el.value || '').trim();
  if(!text) return;
  const link = document.createElement('a');
  link.href = 'mailto:paulaoprogramador@gmail.com?subject=' + encodeURIComponent('Arcane Clash Feedback') + '&body=' + encodeURIComponent(text);
  document.body.appendChild(link);
  link.click();
  link.remove();
  if (el) el.value = '';
  mostrarToast('📨 Abrindo seu app de e-mail...', 'reward');
}
document.getElementById('btn-silenciar-lobby').onclick=()=>{musicaLigada=!musicaLigada;document.getElementById('btn-silenciar-lobby').textContent=musicaLigada?'🔊 Música: ligada':'🔇 Música: desligada';aplicarMusicaLobby(musicaLigada);save()};
function avisarSaldoInsuficiente(mensagem) {
  const semMoedas = mensagem.includes('Moedas insuficientes');
  const semDiamantes = mensagem.includes('Diamantes insuficientes');
  if (!semMoedas && !semDiamantes) return false;
  alert(semMoedas ? 'Moedas insuficientes! Vamos te levar pra loja para comprar mais.' : 'Diamantes insuficientes! Vamos te levar pra loja para comprar mais.');
  setTimeout(() => { show('tela-gamepass'); if (typeof renderGamepasses === 'function') renderGamepasses(); }, 200);
  return true;
}

function ativarCompraSkill2SePronto() {
  if (missionProgress.boss1 >= 3 && !inventario.equipados.skill2 && moedasGlobais >= 1500) {
    if (!compraSkill2Obrigatoria) mostrarToast('⚡ Você alcançou 1500 moedas! A compra da Skill 2 é obrigatória agora.', 'mission');
    compraSkill2Obrigatoria = true;
    setTimeout(() => { show('tela-loja'); renderShop('skill2'); }, 450);
  }
}

async function sincronizarEstadoDoServidor() {
  if (!window.currentUserId) return false;

  try {
    const { data, error } = await window.supabaseClient
      .from('Player')
      .select(`
        coins,
        diamante,
        bosses_derrotados,
        boss_kills,
        mission_proguess,
        claimed_missions,
        inventory,
        equipped,
        fused,
        fusion_bonuses,
        life_upgrades,
        damage_total,
        daily_spin_at,
        bonus_free_spins,
        daily_pending_reward,
        pocoes,
        pocoes_ativas,
        daily_login_last_at,
        daily_login_day,
        musica_ligada,
        batalha_musica_ligada,
        gamepasses,
        inventory_extra_slots,
        auto_descarte
      `)
      .eq('user_id', window.currentUserId)
      .single();

    if (error) throw error;

    moedasGlobais = Number(data.coins || 0);
    diamantesGlobais = Number(data.diamante || 0);

    bossesDerrotados = Array.isArray(data.bosses_derrotados)
      ? data.bosses_derrotados.map(Number)
      : [];

    bossKills = data.boss_kills || {};
    missionProgress = data.mission_proguess || { boss1: 0 };
    claimed = data.claimed_missions || {};
    fused = data.fused || {};
    fusionBonuses = data.fusion_bonuses || {};
    autoDescarte = data.auto_descarte || {};

    lifeUpgrades = Number(data.life_upgrades || 0);

    dailySpinAt = Number(data.daily_spin_at || 0);
    bonusFreeSpins = Number(data.bonus_free_spins || 0);
    dailyPendingReward = data.daily_pending_reward || null;

    dailyLoginLastAt = Number(data.daily_login_last_at || 0);
    dailyLoginDay = Math.min(
      7,
      Math.max(1, Number(data.daily_login_day || 1))
    );

    Object.assign(pocoes, data.pocoes || {});
    Object.assign(pocoesAtivas, data.pocoes_ativas || {});

    if (data.inventory && typeof data.inventory === 'object') {
      inventario.possuidos = Array.isArray(data.inventory.possuidos)
        ? data.inventory.possuidos
        : [];

      inventario.equipados = Object.assign(
        inventario.equipados,
        data.inventory.equipados || {}
      );
    }

    if (data.equipped && typeof data.equipped === 'object') {
      inventario.equipados = Object.assign(
        inventario.equipados,
        data.equipped
      );
    }

    musicaLigada = data.musica_ligada !== false;
    batalhaMusicaLigada = data.batalha_musica_ligada !== false;

    inventoryBonusCap = Number(data.inventory_extra_slots || 0);

    const gamepassesAnteriores = Object.assign({}, gamepassesOwned);
    Object.assign(gamepassesOwned, data.gamepasses || {});

    extremLuckyOwned = gamepassesOwned.extreme_lucky === true;
    vipOwned = gamepassesOwned.vip === true;
    luckyRaroOwned = gamepassesOwned.lucky_raro === true;
    moneyX2Owned = gamepassesOwned['2x_moedas'] === true;
    diamondX2Owned = gamepassesOwned['2x_diamantes'] === true;
    diamondChanceX2Owned = gamepassesOwned['2x_chance_diamante'] === true;
    multiOpenOwned = gamepassesOwned.multi_open === true;

    if (!sincronizacaoInicialFeita) {
      const passesAtivos = Object.keys(gamepassesOwned)
        .filter((chave) => gamepassesOwned[chave] === true)
        .map((chave) => Object.keys(gamepassNameToKey).find((n) => gamepassNameToKey[n] === chave) || chave);
      if (passesAtivos.length) {
        mostrarToast(`🎟️ Bônus ativado: ${passesAtivos.join(', ')}`, 'reward');
      }
      sincronizacaoInicialFeita = true;
    } else {
      Object.keys(gamepassesOwned).forEach((chave) => {
        if (gamepassesOwned[chave] === true && gamepassesAnteriores[chave] !== true) {
          const nomePass = Object.keys(gamepassNameToKey).find((n) => gamepassNameToKey[n] === chave) || chave;
          mostrarToast(`🎉 Você recebeu ${nomePass}! Obrigado pela compra.`, 'reward');
        }
      });
    }

    if (document.getElementById('tela-gamepass')?.classList.contains('active') && typeof renderGamepasses === 'function') {
      renderGamepasses();
    }

    updateResources();
    renderMissions();
    renderBosses();

    return true;

  } catch (erro) {
    console.error('Erro ao sincronizar estado do servidor:', erro);
    return false;
  }
}

window.sincronizarEstadoDoServidor = sincronizarEstadoDoServidor;
// Alias: o login.html/supabaseClient.js chama por esse outro nome.
window.sincronizarSaldoDoServidor = sincronizarEstadoDoServidor;
// Verifica a cada 20s se o admin liberou alguma compra (game pass, poção, moedas, diamantes) via Supabase.
setInterval(() => {
  // Não sincronizar enquanto uma batalha de boss está rolando: a sincronização
  // sobrescreve o mesmo objeto `inventario` usado ao vivo pela batalha
  // (inventarioAtual = inventario, é a mesma referência), o que podia
  // reverter skill1/skill2/ultimate pro valor salvo antes no meio da luta.
  if (typeof jogoAtivo !== 'undefined' && jogoAtivo) return;
  sincronizarEstadoDoServidor();
}, 20000);

async function aoVencerBatalha(bossId, moedas, diamantes) {
  if (window.arcaneVictoryInProgress) return;
  window.arcaneVictoryInProgress = true;

  if (window.stopBossMusic) stopBossMusic();
  if (window.playVictorySound) playVictorySound();

  try {
    const inicio = Number(window.arcaneBattleStartedAt || 0);
    const restante = 10000 - (Date.now() - inicio);
    if (restante > 0) await new Promise(resolve => setTimeout(resolve, restante));

    const pendentes = Array.from(window.arcaneDamagePromises || []);
    if (pendentes.length) await Promise.allSettled(pendentes);

    const battleId = window.arcaneBattleId;
    if (!battleId) throw new Error('ID da batalha não encontrado.');

    const { data, error } = await window.supabaseClient.rpc(
      'registrar_vitoria_boss',
      { p_battle_id: battleId }
    );
    if (error) throw error;

    if (data?.inventory && typeof data.inventory === 'object') {
      if (Array.isArray(data.inventory.possuidos)) {
        inventario.possuidos = data.inventory.possuidos;
      }
      if (data.inventory.equipados && typeof data.inventory.equipados === 'object') {
        inventario.equipados = Object.assign({}, inventario.equipados, data.inventory.equipados);
      }
    }

    window.arcaneBattleId = null;
    window.arcaneBattleStartedAt = 0;

    await sincronizarEstadoDoServidor();

    // Deixa a arquitetura de universos (universos.js) detectar se um novo
    // universo acabou de abrir com este boss derrotado. Reaproveita
    // bossesDerrotados já atualizado por sincronizarEstadoDoServidor() acima
    // — nenhuma lógica de vitória/progresso nova é criada aqui.
    if (window.ArcaneUniversos && typeof window.ArcaneUniversos.aoAtualizarProgresso === 'function') {
      window.ArcaneUniversos.aoAtualizarProgresso();
    }

    if (Number(bossId) === 1 && typeof avancarTutorialVisual === 'function') avancarTutorialVisual(3);

    mostrarToast(
      `🏆 Vitória #${Number(data?.boss_kills?.[String(bossId)] ?? bossKills[bossId] ?? 1)}! +${fmt(Number(data?.reward ?? moedas ?? 0))} moedas${Number(data?.diamantes_ganhos ?? diamantes ?? 0) ? ' e +' + Number(data?.diamantes_ganhos ?? diamantes ?? 0) + ' diamantes' : ''}`,
      'victory'
    );

    ativarCompraSkill2SePronto();
    if (compraSkill2Obrigatoria) {
      setTimeout(() => { show('tela-loja'); renderShop('skill2'); }, 250);
    } else {
      // ETAPA 14 (World-First): a Arena (tela-bosses) é o ponto de entrada da
      // batalha vindo do mundo, então ao vencer volta pra lá (e não mais pro
      // dashboard tela-menu, que deixou de ser o centro do jogo).
      show('tela-bosses');
    }
  } catch (erro) {
    console.error('Erro ao confirmar vitória:', erro);
    alert('A batalha terminou, mas o servidor não confirmou a vitória.\n\n' + (erro?.message || 'Tente novamente.'));
  } finally {
    window.arcaneVictoryInProgress = false;
  }
}

function aoPerderBatalha(){if(window.stopBossMusic)stopBossMusic();if(window.playDefeatSound)playDefeatSound();mostrarToast('☠ Derrota! Tente novamente.', 'defeat');show('tela-bosses')}
function iniciarIntroDeLuta(boss){const overlay=document.getElementById('tela-fight-intro'),el=document.getElementById('fight-intro-numero');if(!overlay||!el){iniciarBatalha(boss,jogador,inventario,rarityColor(boss.rank));return}overlay.classList.remove('hidden');let seq=['3','2','1','FIGHT!'],i=0;const next=()=>{if(i>=seq.length){overlay.classList.add('hidden');iniciarBatalha(boss,jogador,inventario,rarityColor(boss.rank));return}el.textContent=seq[i++];setTimeout(next,500)};next()}
// Pause
 document.getElementById('btn-pause').onclick=()=>{document.getElementById('modal-pause').classList.remove('hidden');if(typeof pausarBatalha==='function')pausarBatalha()};document.getElementById('btn-continuar').onclick=()=>{document.getElementById('modal-pause').classList.add('hidden');if(typeof continuarBatalha==='function')continuarBatalha()};document.getElementById('btn-musica').onclick=e=>{
  batalhaMusicaLigada=!batalhaMusicaLigada;
  e.currentTarget.textContent=batalhaMusicaLigada?'🔊 Música: ligada':'🔇 Música: desligada';
  if(window.setBattleMusicEnabled)window.setBattleMusicEnabled(batalhaMusicaLigada,bossSelecionadoId);
  save();
};document.getElementById('btn-sair').onclick=()=>{document.getElementById('modal-pause').classList.add('hidden');document.getElementById('modal-confirmar-saida').classList.remove('hidden')};document.getElementById('btn-cancelar-sair').onclick=()=>{document.getElementById('modal-confirmar-saida').classList.add('hidden');document.getElementById('modal-pause').classList.remove('hidden')};document.getElementById('btn-confirmar-sair').onclick=async()=>{document.getElementById('modal-confirmar-saida').classList.add('hidden');try{const battleId=window.arcaneBattleId;if(battleId&&window.supabaseClient){const{error}=await window.supabaseClient.rpc('encerrar_batalha',{p_battle_id:battleId});if(error)throw error;}}catch(e){console.error('Erro ao encerrar batalha no servidor:',e);}finally{window.arcaneBattleId=null;if(typeof pararBatalha==='function')pararBatalha();if(window.stopBossMusic)stopBossMusic();show('tela-bosses')}};
window.addEventListener('error', (event) => {
  console.error('Arcane Clash runtime error:', event.error || event.message);
});

setInterval(()=>{ updateResources(); if(document.getElementById('tela-inventario')?.classList.contains('active')) { const activePotionTab=document.querySelector('.inventory-tab.active'); if(activePotionTab?.textContent.includes('POÇÕES')) renderInventory('potions'); } },1000);

window.addEventListener('load', () => {
  updateResources();
  try{renderDailyWheel();}catch(e){console.error('Giro Diário:',e);}
  renderMissions();
  // Pré-renderiza os painéis principais para que nenhum menu fique vazio.
  renderCharacters();
  renderShop('skill1');
  renderThemes();
  renderUpgrades();
  renderInventory();
  renderGamepasses();
});


window.renderCharacters = renderCharacters;
window.renderInventory = renderInventory;
window.renderShop = renderShop;
window.renderUpgrades = renderUpgrades;
window.renderThemes = renderThemes;
window.renderDailyWheel = renderDailyWheel;
window.renderGamepasses = renderGamepasses;

document.getElementById('btn-perfil-topo')?.addEventListener('click', () => {
  document.getElementById('modal-config').classList.remove('hidden');
  showConfig('player');
});

async function garantirPerfilUsuario() {
  if (!window.supabaseClient) return false;
  if (!window.currentUserId) {
    const { data, error } = await window.supabaseClient.auth.getUser();
    if (error || !data?.user?.id) return false;
    window.currentUserId = data.user.id;
  }
  return true;
}

function colocarAvatarNoElemento(el, imageUrl, emoji = '🧙') {
  if (!el) return;
  el.textContent = '';
  if (imageUrl) {
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = 'Avatar do jogador';
    img.loading = 'eager';
    img.onerror = () => {
      el.textContent = emoji;
    };
    el.appendChild(img);
  } else {
    el.textContent = emoji;
  }
}

function garantirControleImagemPerfil() {
  const avatar = document.getElementById('pg-avatar');
  const wrap = avatar?.closest('.perfil-avatar-wrap');
  if (!avatar || !wrap) return;
  if (document.getElementById('btn-escolher-avatar')) return;

  const area = document.createElement('div');
  area.className = 'perfil-imagem-area';
  area.innerHTML = `
    <button id="btn-escolher-avatar" type="button" class="perfil-imagem-btn">📷 Escolher imagem da galeria</button>
    <input id="input-avatar-imagem" type="file" accept="image/jpeg,image/png,image/webp" hidden>
  `;
  wrap.insertAdjacentElement('afterend', area);

  const btn = document.getElementById('btn-escolher-avatar');
  const input = document.getElementById('input-avatar-imagem');
  btn?.addEventListener('click', () => input?.click());
  input?.addEventListener('change', async () => {
    const file = input.files?.[0];
    input.value = '';
    if (file) await enviarImagemPerfil(file);
  });
}

async function aplicarPerfilNoJogo() {
  if (!(await garantirPerfilUsuario())) return;

  const { data: player, error } = await window.supabaseClient
    .from('Player')
    .select('username, name_color, avatar_emoji, avatar_image_url')
    .eq('user_id', window.currentUserId)
    .single();

  if (error || !player) return;

  const nome = player.username;
  const cor = player.name_color || '#ffffff';
  const avatar = player.avatar_emoji || 'P';
  const imagem = player.avatar_image_url || '';
  jogador.nome = nome;

  const btnPerfilTopo = document.getElementById('btn-perfil-topo');
  colocarAvatarNoElemento(btnPerfilTopo, imagem, avatar);

  const avatarHeroMini = document.getElementById('avatar-hero-mini');
  colocarAvatarNoElemento(avatarHeroMini, imagem, avatar);
  const heroNome = document.getElementById('hero-profile-nome');
  if (heroNome) { heroNome.textContent = nome; heroNome.style.color = cor; }

  const nomeMenu = document.getElementById('nome-menu');
  if (nomeMenu) { nomeMenu.textContent = nome; nomeMenu.style.color = cor; }

  const nomeHud = document.getElementById('nome-player-hud');
  if (nomeHud) { nomeHud.textContent = nome; nomeHud.style.color = cor; }

  const avatarEl = document.querySelector('.profile-avatar');
  colocarAvatarNoElemento(avatarEl, imagem, avatar);

  aplicarSeloVip(nomeMenu);
  aplicarSeloVip(nomeHud);
}

function aplicarSeloVip(elementoNome){
  if (!elementoNome || !elementoNome.parentNode) return;
  let selo = elementoNome.parentNode.querySelector('.selo-vip-badge');
  if (vipOwned) {
    if (!selo) {
      selo = document.createElement('span');
      selo.className = 'selo-vip-badge';
      selo.textContent = '👑 VIP';
      selo.style.marginLeft = '6px';
      selo.style.fontSize = '11px';
      selo.style.fontWeight = '900';
      selo.style.color = '#1a1200';
      selo.style.background = 'linear-gradient(135deg,#ffd34e,#ffb347)';
      selo.style.padding = '2px 7px';
      selo.style.borderRadius = '8px';
      selo.style.boxShadow = '0 0 8px rgba(255,211,78,.6)';
      elementoNome.insertAdjacentElement('afterend', selo);
    }
  } else if (selo) {
    selo.remove();
  }
}
window.aplicarSeloVip = aplicarSeloVip;

window.addEventListener('load', aplicarPerfilNoJogo);
window.atualizarPerfilVisual = aplicarPerfilNoJogo;

let segundosDeSessao = 0;
let ultimaContagemSessao = Date.now();
let salvandoTempoDeJogo = false;

function atualizarTempoDeSessao() {
  const agora = Date.now();
  if (document.visibilityState === 'visible') {
    const delta = Math.floor((agora - ultimaContagemSessao) / 1000);
    if (delta > 0) segundosDeSessao += Math.min(delta, 5);
  }
  ultimaContagemSessao = agora;
}

async function salvarTempoDeJogo() {
  atualizarTempoDeSessao();

  if (salvandoTempoDeJogo || segundosDeSessao <= 0) return;
  if (!(await garantirPerfilUsuario())) return;

  salvandoTempoDeJogo = true;

  try {
    const { data, error } = await window.supabaseClient.rpc(
      'registrar_tempo_jogo'
    );

    if (error) throw error;

    const segundosSalvos = Number(data || 0);

    if (segundosSalvos > 0) {
      segundosDeSessao = Math.max(
        0,
        segundosDeSessao - segundosSalvos
      );
    }
  } catch (erro) {
    console.error('Erro ao salvar tempo de jogo:', erro);
  } finally {
    salvandoTempoDeJogo = false;
  }
}

setInterval(atualizarTempoDeSessao, 1000);
setInterval(salvarTempoDeJogo, 30000);
document.addEventListener('visibilitychange', () => {
  atualizarTempoDeSessao();
  if (document.visibilityState === 'hidden') salvarTempoDeJogo();
});
window.addEventListener('pagehide', salvarTempoDeJogo);
window.addEventListener('beforeunload', salvarTempoDeJogo);

async function renderPerfilGrande() {
  if (!(await garantirPerfilUsuario())) return;
  atualizarTempoDeSessao();

  const { data: player } = await window.supabaseClient
    .from('Player')
    .select('username, avatar_emoji, avatar_image_url, name_color, playtime_seconds')
    .eq('user_id', window.currentUserId)
    .single();

  const avatar = player?.avatar_emoji || '🧙';
  const imagem = player?.avatar_image_url || '';
  const nome = player?.username;
  const cor = player?.name_color || '#ffffff';
  const segundos = Number(player?.playtime_seconds || 0) + segundosDeSessao;
  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);

  colocarAvatarNoElemento(document.getElementById('pg-avatar'), imagem, avatar);
  document.getElementById('pg-nome').textContent = nome;
  document.getElementById('pg-nome').style.color = cor;
  aplicarSeloVip(document.getElementById('pg-nome'));
  const pgGrande = document.getElementById('tela-perfil-grande');
  if (pgGrande) pgGrande.classList.toggle('perfil-vip', vipOwned);
  document.getElementById('pg-id').textContent = 'ID: ' + window.currentUserId.slice(0, 8);
  document.getElementById('pg-cor-input').value = cor;
  document.getElementById('pg-tempo').textContent = `⏱️ Tempo jogado: ${horas}h ${minutos}min`;
  try {
    const { data: pvp } = await window.supabaseClient.from('pvp_profile').select('rank').eq('user_id', window.currentUserId).maybeSingle();
    const nomes = {bronze:'Bronze',prata:'Prata',ouro:'Ouro',diamante:'Diamante',desafiante:'Desafiante'};
    document.getElementById('pg-patente').textContent = '⚔️ Patente PvP: ' + (nomes[pvp?.rank] || 'Bronze (não iniciado)');
  } catch (e) {}
  garantirControleImagemPerfil();
  document.getElementById('tela-perfil-grande').classList.add('active');
}

function fecharPerfilGrande() {
  document.getElementById('tela-perfil-grande').classList.remove('active');
}

async function enviarImagemPerfil(file) {
  if (!(await garantirPerfilUsuario())) return;
  const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
  if (!tiposPermitidos.includes(file.type)) {
    mostrarToast('❌ Escolha uma imagem JPG, PNG ou WEBP. GIF não é permitido.', 'defeat');
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    mostrarToast('❌ A imagem deve ter no máximo 5 MB.', 'defeat');
    return;
  }

  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const caminho = `${window.currentUserId}/${crypto.randomUUID()}.${ext}`;
  const btn = document.getElementById('btn-escolher-avatar');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Enviando imagem...'; }

  try {
    const { error: uploadError } = await window.supabaseClient.storage
      .from('avatars')
      .upload(caminho, file, { contentType: file.type, upsert: false });
    if (uploadError) throw uploadError;

    const { data: publicData } = window.supabaseClient.storage.from('avatars').getPublicUrl(caminho);
    const imageUrl = publicData?.publicUrl;
    if (!imageUrl) throw new Error('Não foi possível obter a URL da imagem.');

    const { error: updateError } = await window.supabaseClient
      .from('Player')
      .update({ avatar_image_url: imageUrl })
      .eq('user_id', window.currentUserId);
    if (updateError) {
      await window.supabaseClient.storage.from('avatars').remove([caminho]);
      throw updateError;
    }

    await aplicarPerfilNoJogo();
    await renderPerfilGrande();
    mostrarToast('✅ Foto de perfil salva!', 'reward');
  } catch (error) {
    console.error('Erro ao enviar avatar:', error);
    const detalhe = error?.message ? `\n${error.message}` : '';
    mostrarToast('❌ Não foi possível salvar a imagem.' + detalhe, 'defeat');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '📷 Escolher imagem da galeria'; }
  }
}

async function mudarAvatarGrande(emoji) {
  if (!(await garantirPerfilUsuario())) return;
  await window.supabaseClient
    .from('Player')
    .update({ avatar_emoji: emoji, avatar_image_url: null })
    .eq('user_id', window.currentUserId);
  await aplicarPerfilNoJogo();
  await renderPerfilGrande();
}

async function mudarCorNomeGrande(cor) {
  if (!(await garantirPerfilUsuario())) return;
  document.getElementById('pg-nome').style.color = cor;
  await window.supabaseClient.from('Player').update({ name_color: cor }).eq('user_id', window.currentUserId);
  await aplicarPerfilNoJogo();
}

document.getElementById('btn-perfil-topo')?.addEventListener('click', renderPerfilGrande);
document.getElementById('btn-perfil-hero')?.addEventListener('click', renderPerfilGrande);
// ===== TUTORIAL VISUAL (não bloqueador, estado separado do tutorialStep de missões) =====
const TUTORIAL_VISUAL_KEY = 'arcaneVisualTutorialV1';

let visualTutorialStep = 0;
try {
  const salvoTutorialVisual = Number(localStorage.getItem(TUTORIAL_VISUAL_KEY));
  visualTutorialStep = Number.isFinite(salvoTutorialVisual) && salvoTutorialVisual >= 0 ? salvoTutorialVisual : 0;
} catch (_) {}

const tutorialVisualPassos = [
  { mensagem: '🎰 Faça seu primeiro giro no Banner!', seletor: '[data-tela="tela-banner"]' },
  { mensagem: '👤 Agora equipe o personagem que você conseguiu!', seletor: '[data-tela="tela-personagens"]' },
  { mensagem: '⚔️ Agora é hora da sua primeira batalha! Derrote Arlan.', seletor: '#btn-play' },
  { mensagem: '💰 Junte moedas para comprar sua Skill 1!', seletor: '[data-tela="tela-loja"]' },
  { mensagem: '❤️ Agora compre uma melhoria de Vida para ficar mais forte!', seletor: '[data-tela="tela-melhorias"]' }
];

function avancarTutorialVisual(novoPasso) {
  if (novoPasso <= visualTutorialStep) return;
  visualTutorialStep = novoPasso;
  try { localStorage.setItem(TUTORIAL_VISUAL_KEY, String(visualTutorialStep)); } catch (_) {}
  renderTutorialVisual();
}

function limparDestaqueTutorialVisual() {
  document.querySelectorAll('.tutorial-target-glow').forEach((el) => el.classList.remove('tutorial-target-glow'));
  const banner = document.getElementById('tutorial-hint-banner');
  if (banner) banner.remove();
}

function renderTutorialVisual() {
  limparDestaqueTutorialVisual();

  if (visualTutorialStep >= tutorialVisualPassos.length) return;

  const menuScreen = document.getElementById('tela-menu');
  if (!menuScreen || !menuScreen.classList.contains('active')) return;

  const passo = tutorialVisualPassos[visualTutorialStep];
  const alvo = document.querySelector(passo.seletor);
  if (alvo) alvo.classList.add('tutorial-target-glow');

  const banner = document.createElement('div');
  banner.id = 'tutorial-hint-banner';
  banner.className = 'tutorial-hint-banner';
  banner.textContent = passo.mensagem;
  document.body.appendChild(banner);
}

window.avancarTutorialVisual = avancarTutorialVisual;
window.renderTutorialVisual = renderTutorialVisual;