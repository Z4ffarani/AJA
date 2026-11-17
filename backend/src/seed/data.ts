// Dados de exemplo do piloto. As ruas e coordenadas são reais (Pedreira, Subprefeitura Cidade Ademar);
// as barreiras, pessoas e protocolos são simulados e aparecem marcados como exemplo.

export const NEIGHBORHOODS = [
  { slug: 'parque-doroteia', name: 'Parque Doroteia', district: 'Pedreira · Subprefeitura Cidade Ademar', lat: -23.7015, lng: -46.6420, pilot: true },
  { slug: 'parque-primavera', name: 'Parque Primavera', district: 'Pedreira · Subprefeitura Cidade Ademar', lat: -23.6935, lng: -46.6460, pilot: false },
  { slug: 'balneario-sao-francisco', name: 'Balneário São Francisco', district: 'Pedreira · Subprefeitura Cidade Ademar', lat: -23.7005, lng: -46.6495, pilot: false },
]

export type SeedTopic = {
  slug: string
  title: string
  category: string
  audiences: string[]
  address: string
  neighborhood?: string
  at: [number, number, number?]
  summary: string
  proposal: string
  photo: string
  stage: number
  supports: number
  passes: number
  daysAgo: number
  protocol?: { number: string; org: string; openedDaysAgo: number; status: string; next: string }
  dossier?: { number: string; daysAgo: number; sentDaysAgo?: number; version: number }
  conquest?: { before: string; after: string; beforeDate: string; afterDate: string; ratings: number[]; stillOk: number; notOk: number }
  concept?: string
}

export const VOLUNTEER = {
  name: 'Ana L.',
  email: 'ana.voluntaria@aja.exemplo',
  profession: 'Arquiteta e urbanista',
  bio: 'Arquiteta voluntária no Parque Doroteia. Trabalha com desenho universal e acessibilidade em calçadas e travessias.',
  tags: ['Acessibilidade', 'Desenho universal', 'Calçadas'],
  links: [
    { label: 'Site profissional', url: 'https://example.com/ana-arquitetura' },
    { label: 'E-mail profissional', url: 'mailto:contato@example.com' },
  ],
}

export const FLAGSHIP = 'piso-tatil-rua-major-julio-valente'

export const TOPICS: SeedTopic[] = [
  {
    slug: FLAGSHIP,
    title: 'Piso tátil termina antes da faixa de pedestres na Rua Major Júlio Valente',
    category: 'piso',
    audiences: ['visual'],
    address: 'Rua Major Júlio Valente',
    at: [-23.70203, -46.64218, 90],
    summary: 'Pessoas cegas e com baixa visão perdem a referência do piso tátil antes de chegar à faixa e precisam atravessar sem orientação. A falta de piso de alerta junto à guia aumenta o risco de entrar na rua sem perceber.',
    proposal: 'Continuar o piso tátil direcional até a faixa e instalar piso de alerta junto à guia, conforme a norma de sinalização tátil no piso.',
    photo: 'Relato dos moradores: o piso tátil amarelo termina cerca de 3 m antes da faixa de pedestres, sobre calçada irregular, e não há piso de alerta junto à guia.',
    stage: 3, supports: 128, passes: 34, daysAgo: 76,
    protocol: { number: '0000.2026/0001234-5', org: 'Subprefeitura Cidade Ademar · Zeladoria urbana', openedDaysAgo: 23, status: 'Em análise', next: 'Vistoria prevista pela subprefeitura' },
    dossier: { number: 'AJA-0042', daysAgo: 24, sentDaysAgo: 23, version: 2 },
    concept: 'Vista do alto da esquina da Rua Major Júlio Valente. O piso tátil direcional (amarelo, com faixas em relevo) segue junto ao muro e vira em direção à faixa de pedestres. Antes da guia, um piso de alerta (amarelo, com pontos em relevo) avisa onde começa a rua. Do outro lado, outro piso de alerta recebe quem termina a travessia. No poste do semáforo, a botoeira emite um som de localização e um bip durante a travessia, e o foco de pedestres mostra contagem regressiva.',
  },
  {
    slug: 'semaforo-sem-som-e-contagem',
    title: 'Semáforo de pedestres sem sinal sonoro nem contagem visual',
    category: 'travessia',
    audiences: ['visual', 'auditiva'],
    address: 'Rua Doutor Carlos de Rezende Enout',
    at: [-23.70298, -46.63798, 0],
    summary: 'O semáforo de pedestres não tem botoeira sonora, então pessoas cegas não sabem quando podem atravessar. Também não há contagem regressiva, e pessoas surdas não sabem quanto tempo falta para o sinal fechar.',
    proposal: 'Instalar botoeira com som de localização e de travessia e foco de pedestres com contagem regressiva visual.',
    photo: 'Relato dos moradores: foco de pedestres simples, sem contagem numérica, preso a um poste sem botoeira.',
    stage: 2, supports: 86, passes: 21, daysAgo: 30,
    dossier: { number: 'AJA-0047', daysAgo: 2, version: 1 },
  },
  {
    slug: 'ponto-de-onibus-sem-informacao',
    title: 'Ponto de ônibus sem informação em áudio nem em texto',
    category: 'comunicacao',
    audiences: ['visual', 'auditiva'],
    address: 'Rua Juventino Tavares',
    at: [-23.70299, -46.64073, 180],
    summary: 'O ponto não tem painel com as linhas nem aviso sonoro. Pessoas cegas dependem de perguntar a desconhecidos e pessoas surdas não sabem se a linha mudou de itinerário.',
    proposal: 'Placa com linhas em alto contraste e braille, e QR code com as informações em áudio e Libras.',
    photo: 'Relato dos moradores: placa pequena e desbotada, sem braille e sem painel.',
    stage: 1, supports: 41, passes: 12, daysAgo: 12,
  },
  {
    slug: 'placas-de-rua-sem-contraste',
    title: 'Placas de rua apagadas e sem relevo na Rua dos Calangos',
    category: 'sinalizacao',
    audiences: ['visual'],
    address: 'Rua dos Calangos',
    at: [-23.70254, -46.64292, 270],
    summary: 'As placas com o nome da rua estão desbotadas, com letras pequenas e sem nenhuma informação em relevo. Pessoas com baixa visão não conseguem confirmar se chegaram à rua certa.',
    proposal: 'Trocar as placas por outras com alto contraste e letras maiores, e instalar placas com nome em relevo e braille nos postes das esquinas.',
    photo: 'Relato dos moradores: placa azul desbotada, com letras brancas pequenas, a três metros de altura.',
    stage: 4, supports: 63, passes: 18, daysAgo: 140,
    protocol: { number: '0000.2026/0000987-1', org: 'Subprefeitura Cidade Ademar · Zeladoria urbana', openedDaysAgo: 98, status: 'Em execução', next: 'Instalação das novas placas' },
    dossier: { number: 'AJA-0031', daysAgo: 100, sentDaysAgo: 98, version: 3 },
  },
  {
    slug: 'raizes-calcada-rua-miguel-fleta',
    title: 'Raízes levantaram a calçada na Rua Miguel Fleta',
    category: 'calcada',
    audiences: ['visual'],
    address: 'Rua Miguel Fleta',
    at: [-23.70396, -46.64080, 0],
    summary: 'As raízes de duas árvores levantaram as placas da calçada, criando degraus de até 10 cm. Quem usa bengala tropeça e quem usa cadeira de rodas precisa ir pela rua.',
    proposal: 'Readequar a calçada com canteiro maior para as árvores, sem cortar as raízes principais, e piso contínuo e nivelado.',
    photo: 'Relato dos moradores: placas de concreto levantadas e rachadas ao redor do tronco de uma árvore.',
    stage: 1, supports: 27, passes: 9, daysAgo: 8,
  },
  {
    slug: 'entulho-rua-donato-bardi',
    title: 'Entulho bloqueando a calçada na Rua Donato Bardi',
    category: 'obstaculo',
    audiences: ['visual'],
    address: 'Rua Donato Bardi',
    at: [-23.70102, -46.64465, 90],
    summary: 'Sacos de entulho de obra ocupam toda a largura da calçada há mais de uma semana.',
    proposal: 'Remoção do entulho e orientação ao responsável pela obra.',
    photo: 'Relato dos moradores: sacos de entulho empilhados ocupando toda a calçada.',
    stage: 0, supports: 9, passes: 4, daysAgo: 2,
  },
  {
    slug: 'rampa-rua-jose-flavio-pereira',
    title: 'Rampa de acesso refeita na Rua José Flávio Pereira',
    category: 'calcada',
    audiences: ['visual'],
    address: 'Rua José Flávio Pereira',
    at: [-23.70131, -46.64419, 0],
    summary: 'A rampa da esquina estava quebrada, com degrau de 8 cm e sem piso de alerta. Moradores com deficiência visual tropeçavam todos os dias.',
    proposal: 'Refazer a rampa nivelada, com piso de alerta junto à guia.',
    photo: 'Relato dos moradores: rampa nova, nivelada, com piso de alerta amarelo junto à guia.',
    stage: 6, supports: 214, passes: 57, daysAgo: 240,
    protocol: { number: '0000.2026/0000311-9', org: 'Subprefeitura Cidade Ademar · Zeladoria urbana', openedDaysAgo: 220, status: 'Finalizado', next: 'Verificação contínua pela comunidade' },
    dossier: { number: 'AJA-0007', daysAgo: 222, sentDaysAgo: 220, version: 2 },
    conquest: { before: 'Rampa quebrada, com degrau de 8 cm e sem piso de alerta.', after: 'Rampa nova, nivelada, com piso de alerta amarelo junto à guia.', beforeDate: '03/2026', afterDate: '10/2026', ratings: [5, 5, 5, 4, 5, 4, 5, 5, 4, 5, 5, 4, 5, 5, 4, 5, 4, 5, 5, 4, 5, 4, 5, 5, 4, 5, 4, 4, 5, 5, 4], stillOk: 18, notOk: 1 },
  },
  {
    slug: 'botoeira-sonora-rua-jean-delmas',
    title: 'Botoeira sonora instalada na Rua Jean Delmas',
    category: 'travessia',
    audiences: ['visual'],
    address: 'Rua Jean Delmas',
    at: [-23.6999, -46.64029, 180],
    summary: 'A travessia não tinha nenhum recurso sonoro. Pessoas cegas atravessavam guiadas pelo barulho dos carros.',
    proposal: 'Instalar botoeira sonora com som de localização.',
    photo: 'Relato dos moradores: botoeira azul instalada no poste do semáforo, com seta em relevo.',
    stage: 6, supports: 132, passes: 30, daysAgo: 300,
    protocol: { number: '0000.2026/0000102-3', org: 'CET · Sinalização semafórica', openedDaysAgo: 280, status: 'Finalizado', next: 'Verificação contínua pela comunidade' },
    dossier: { number: 'AJA-0003', daysAgo: 282, sentDaysAgo: 280, version: 1 },
    conquest: { before: 'Semáforo sem nenhum recurso sonoro.', after: 'Botoeira com som de localização e bip de travessia.', beforeDate: '01/2026', afterDate: '07/2026', ratings: [5, 5, 4, 5, 5, 5, 4, 5, 5, 5, 4, 5, 5, 5, 4, 5, 5, 5, 4, 5, 5, 5], stillOk: 14, notOk: 0 },
  },
  {
    slug: 'poste-rua-francisco-jose-da-costa',
    title: 'Poste retirado do meio da calçada na Rua Francisco José da Costa',
    category: 'obstaculo',
    audiences: ['visual'],
    address: 'Rua Francisco José da Costa',
    at: [-23.701, -46.64043, 90],
    summary: 'Um poste desativado ficava no meio da calçada estreita, sem piso de alerta ao redor.',
    proposal: 'Retirar o poste desativado e recompor a calçada.',
    photo: 'Relato dos moradores: calçada livre, com o piso recomposto onde ficava o poste.',
    stage: 6, supports: 77, passes: 19, daysAgo: 200,
    protocol: { number: '0000.2026/0000455-0', org: 'Subprefeitura Cidade Ademar · Zeladoria urbana', openedDaysAgo: 180, status: 'Finalizado', next: 'Verificação contínua pela comunidade' },
    dossier: { number: 'AJA-0012', daysAgo: 182, sentDaysAgo: 180, version: 1 },
    conquest: { before: 'Poste desativado no meio da calçada estreita.', after: 'Calçada livre e recomposta.', beforeDate: '04/2026', afterDate: '09/2026', ratings: [5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 4, 5], stillOk: 9, notOk: 0 },
  },
  // Bairros vizinhos (exemplos de como o AJA cresce).
  {
    slug: 'rampa-ausente-rua-wilson-cantoni',
    title: 'Esquina sem rebaixamento de calçada na Rua Wilson Cantoni',
    category: 'calcada',
    audiences: ['visual'],
    address: 'Rua Wilson Cantoni',
    neighborhood: 'parque-primavera',
    at: [-23.69319, -46.64498, 0],
    summary: 'A esquina não tem rampa nem piso de alerta. Quem usa bengala não percebe onde a calçada termina, e quem empurra carrinho ou cadeira de rodas precisa descer pela rua.',
    proposal: 'Construir rampa de acessibilidade nos dois lados da travessia, com piso de alerta junto à guia.',
    photo: 'Relato dos moradores: guia alta, sem rampa e sem piso de alerta.',
    stage: 1, supports: 22, passes: 7, daysAgo: 10,
  },
  {
    slug: 'ponto-sem-abrigo-av-professor-araujo-lima',
    title: 'Ponto de ônibus sem abrigo nem informação na Av. Professor Araújo Lima',
    category: 'comunicacao',
    audiences: ['visual', 'auditiva'],
    address: 'Avenida Professor Araújo Lima',
    neighborhood: 'parque-primavera',
    at: [-23.6928, -46.64642, 90],
    summary: 'O ponto é só um poste com placa. Não há lista de linhas, nem aviso sonoro ou visual de chegada.',
    proposal: 'Abrigo com painel de linhas em alto contraste e braille, e QR code com áudio e Libras.',
    photo: 'Relato dos moradores: poste com placa de ponto, sem abrigo.',
    stage: 0, supports: 6, passes: 3, daysAgo: 3,
  },
  {
    slug: 'travessia-sem-faixa-av-das-garoupas',
    title: 'Travessia sem faixa nem piso de alerta na Avenida das Garoupas',
    category: 'travessia',
    audiences: ['visual', 'auditiva'],
    address: 'Avenida das Garoupas',
    neighborhood: 'balneario-sao-francisco',
    at: [-23.70266, -46.65013, 0],
    summary: 'Moradores atravessam a avenida no caminho para o comércio, mas não há faixa de pedestres nem piso de alerta. Pessoas surdas não ouvem os carros que se aproximam pela curva.',
    proposal: 'Faixa de pedestres elevada, com piso de alerta nos dois lados e sinalização vertical de travessia.',
    photo: 'Relato dos moradores: avenida em curva, sem faixa pintada.',
    stage: 1, supports: 35, passes: 11, daysAgo: 20,
  },
  {
    slug: 'bueiro-aberto-rua-dos-bagres',
    title: 'Bueiro sem tampa na calçada da Rua dos Bagres',
    category: 'obstaculo',
    audiences: ['visual'],
    address: 'Rua dos Bagres',
    neighborhood: 'balneario-sao-francisco',
    at: [-23.6985, -46.64872, 180],
    summary: 'Um bueiro na calçada está sem tampa. Quem usa bengala pode cair no buraco.',
    proposal: 'Recolocar a tampa e sinalizar o local até o conserto.',
    photo: 'Relato dos moradores: buraco aberto no meio da calçada.',
    stage: 0, supports: 12, passes: 5, daysAgo: 1,
  },
]

// Relatos de exemplo. Sem fotos ou vídeos simulados: a evidência visual é a vista do local no Street View.
export const REPORTS: { topic: string; format: string; body: string; caption?: string; passes: boolean }[] = [
  { topic: FLAGSHIP, format: 'texto', body: 'Eu perco a linha do piso e fico sem saber onde começa a faixa.', passes: true },
  { topic: FLAGSHIP, format: 'texto', body: 'Atravesso aqui com meu filho, que é cego. Todo dia é a mesma insegurança.', passes: true },
  { topic: FLAGSHIP, format: 'mapa', body: 'Vista do local no Google Street View, para quem não conhece a rua.', caption: 'Imagem do Google Street View da Rua Major Júlio Valente. Pode ser anterior ao relato.', passes: false },
  { topic: FLAGSHIP, format: 'texto', body: 'Minha mãe tem baixa visão e já tropeçou na guia duas vezes neste ponto.', passes: false },
  { topic: FLAGSHIP, format: 'texto', body: 'Medi com trena: são 3,1 m entre o fim do piso e a faixa.', passes: true },
  { topic: 'semaforo-sem-som-e-contagem', format: 'texto', body: 'Na travessia não tem contagem visual. Eu não sei quanto tempo falta para fechar.', passes: true },
  { topic: 'semaforo-sem-som-e-contagem', format: 'texto', body: 'Não tem botão nem som. Eu espero alguém atravessar para ir junto.', passes: true },
  { topic: 'ponto-de-onibus-sem-informacao', format: 'texto', body: 'Ninguém avisa quando a linha muda de itinerário. Já perdi consulta por isso.', passes: true },
  { topic: 'placas-de-rua-sem-contraste', format: 'texto', body: 'Não consigo ler o nome da rua nem chegando perto da placa.', passes: true },
  { topic: 'raizes-calcada-rua-miguel-fleta', format: 'texto', body: 'Os degraus da calçada chegam a 10 cm perto das árvores.', passes: true },
  { topic: 'entulho-rua-donato-bardi', format: 'texto', body: 'Tive que descer para a rua com a bengala.', passes: true },
  { topic: 'rampa-ausente-rua-wilson-cantoni', format: 'texto', body: 'Empurro o carrinho da minha filha pela rua porque não tem rampa.', passes: true },
  { topic: 'travessia-sem-faixa-av-das-garoupas', format: 'texto', body: 'Sou surdo e não escuto os carros vindo pela curva.', passes: true },
  { topic: 'bueiro-aberto-rua-dos-bagres', format: 'texto', body: 'Quase caí no buraco à noite.', passes: true },
]

type SeedComment = { author: string; badge?: string; kind?: string; body: string; label?: string; helpful: number; hoursAgo: number; replies?: SeedComment[] }

export const COMMENTS: Record<string, SeedComment[]> = {
  [FLAGSHIP]: [
    {
      author: 'Marta S.', badge: 'Passa por ali', body: 'Uso bengala e o piso some uns três passos antes da faixa. Já esbarrei no poste da esquina tentando achar a travessia.', helpful: 31, hoursAgo: 50,
      replies: [
        { author: 'Ana L.', badge: 'Arquiteta voluntária', body: 'Pela norma de sinalização tátil, o piso direcional deveria chegar até o piso de alerta, junto à rampa. Deixei a referência na aba Referências.', helpful: 18, hoursAgo: 26 },
        { author: 'Marta S.', badge: 'Autora', body: 'Obrigada, Ana! Vou anexar uma foto com a medida, como a prefeitura pediu.', helpful: 4, hoursAgo: 20 },
        { author: 'Carlos R.', body: 'Passei hoje e tirei a medida: deu 3,1 m. Já anexei como evidência.', helpful: 7, hoursAgo: 6 },
      ],
    },
    { author: 'João P.', badge: 'Passa por ali', body: 'Sou surdo e uso esse caminho para o trabalho. Sem o piso até a faixa, quem não enxerga fica perdido, e eu não ouço quando alguém tenta avisar.', helpful: 24, hoursAgo: 48 },
    { author: 'Rita C.', body: 'Levo minha mãe ao posto de saúde por esse caminho. Ela tem baixa visão e sempre pede para eu avisar onde acaba a calçada.', helpful: 12, hoursAgo: 72 },
    { author: 'Paulo M.', body: 'Do outro lado da rua também falta piso de alerta. Vale incluir no mesmo pedido?', helpful: 6, hoursAgo: 30,
      replies: [{ author: 'Ana L.', badge: 'Arquiteta voluntária', body: 'Vale, sim: a travessia precisa de piso de alerta nos dois lados. Já incluí na proposta.', helpful: 9, hoursAgo: 28 }] },
  ],
  'semaforo-sem-som-e-contagem': [
    { author: 'Luciana T.', badge: 'Passa por ali', body: 'Sou surda e atravesso aqui todo dia. Sem contagem, eu corro no meio da faixa sem saber se dá tempo.', helpful: 15, hoursAgo: 40 },
    { author: 'Seu Antônio', badge: 'Passa por ali', body: 'Eu espero o barulho dos carros parar para atravessar. Já levei susto com moto.', helpful: 11, hoursAgo: 60 },
  ],
  'ponto-de-onibus-sem-informacao': [
    { author: 'Beatriz F.', body: 'Um QR code com áudio ajudaria muito. Podia ter Libras também.', helpful: 5, hoursAgo: 20 },
  ],
  'rampa-rua-jose-flavio-pereira': [
    { author: 'Dona Cida', badge: 'Passa por ali', body: 'Agora consigo descer a rampa com a bengala sem tropeçar. Fez diferença no caminho da feira.', helpful: 22, hoursAgo: 500 },
  ],
}

export const REFS: Record<string, { kind: string; title: string; source: string; url?: string; why: string; by: string; status?: string }[]> = {
  _piso: [
    { kind: 'norma', title: 'ABNT NBR 16537 · Sinalização tátil no piso', source: 'Associação Brasileira de Normas Técnicas', why: 'define onde o piso direcional e o piso de alerta devem estar, inclusive junto às travessias.', by: 'Conferida por Ana L., arquiteta voluntária' },
    { kind: 'norma', title: 'ABNT NBR 9050 · Acessibilidade a edificações e espaços urbanos', source: 'Associação Brasileira de Normas Técnicas', why: 'traz os critérios gerais de rotas acessíveis e rebaixamento de calçada.', by: 'Conferida por Ana L., arquiteta voluntária' },
  ],
  _leis: [
    { kind: 'lei', title: 'Lei Brasileira de Inclusão (Lei nº 13.146/2015)', source: 'Presidência da República', url: 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm', why: 'garante à pessoa com deficiência o direito à acessibilidade nos espaços públicos.', by: 'Sugerida pelo AJA', status: 'sugerida' },
    { kind: 'lei', title: 'Lei de Acessibilidade (Lei nº 10.098/2000)', source: 'Presidência da República', url: 'https://www.planalto.gov.br/ccivil_03/leis/l10098.htm', why: 'estabelece normas gerais para a promoção da acessibilidade em vias e espaços públicos.', by: 'Sugerida pelo AJA', status: 'sugerida' },
  ],
  _dados: [
    { kind: 'dados', title: 'Pedidos de “obstáculo na calçada” no SP156', source: 'Portal de Dados Abertos da Prefeitura de São Paulo · Dados do SP156, 2020 a 2026', url: 'https://dados.prefeitura.sp.gov.br', why: 'na cidade, a mediana até a finalização é de 266 dias e só 7% saem em até 30 dias. Na Subprefeitura Cidade Ademar, só 3% dos 198 pedidos de 2025–2026 foram finalizados em 30 dias.', by: 'Calculado pelo AJA · conferido pela equipe' },
  ],
}
