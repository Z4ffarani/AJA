// Dados de exemplo do piloto. Nomes, endereços e protocolos são simulados.

export type SeedTopic = {
  slug: string
  title: string
  category: string
  audiences: string[]
  address: string
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

export const TOPICS: SeedTopic[] = [
  {
    slug: 'piso-tatil-av-cupece',
    title: 'Piso tátil termina antes da faixa de pedestres na Av. Cupecê',
    category: 'piso',
    audiences: ['visual'],
    address: 'Av. Cupecê, altura do nº 5.000',
    summary: 'Pessoas cegas e com baixa visão perdem a referência do piso tátil antes de chegar à faixa e precisam atravessar sem orientação. A falta de piso de alerta junto à guia aumenta o risco de entrar na rua sem perceber.',
    proposal: 'Continuar o piso tátil direcional até a faixa e instalar piso de alerta junto à guia, conforme a norma de sinalização tátil no piso.',
    photo: 'O piso tátil amarelo termina cerca de 3 m antes da faixa de pedestres, sobre calçada irregular. Não há piso de alerta junto à guia.',
    stage: 3, supports: 128, passes: 34, daysAgo: 76,
    protocol: { number: '0000.2026/0001234-5', org: 'Subprefeitura Cidade Ademar · Zeladoria urbana', openedDaysAgo: 23, status: 'Em análise', next: 'Vistoria prevista pela subprefeitura' },
    dossier: { number: 'AJA-0042', daysAgo: 24, sentDaysAgo: 23, version: 2 },
    concept: 'Vista do alto da esquina da Av. Cupecê. O piso tátil direcional (amarelo, com faixas em relevo) segue junto ao muro e vira em direção à faixa de pedestres. Antes da guia, um piso de alerta (amarelo, com pontos em relevo) avisa onde começa a rua. Do outro lado, outro piso de alerta recebe quem termina a travessia. No poste do semáforo, a botoeira emite um som de localização e um bip durante a travessia, e o foco de pedestres mostra contagem regressiva.',
  },
  {
    slug: 'semaforo-sem-som-e-contagem',
    title: 'Semáforo de pedestres sem sinal sonoro nem contagem visual',
    category: 'travessia',
    audiences: ['visual', 'auditiva'],
    address: 'Cruzamento da Rua Jacarandá com a Av. Cupecê',
    summary: 'O semáforo de pedestres não tem botoeira sonora, então pessoas cegas não sabem quando podem atravessar. Também não há contagem regressiva, e pessoas surdas não sabem quanto tempo falta para o sinal fechar.',
    proposal: 'Instalar botoeira com som de localização e de travessia e foco de pedestres com contagem regressiva visual.',
    photo: 'Foco de pedestres simples, sem contagem numérica, preso a um poste sem botoeira.',
    stage: 2, supports: 86, passes: 21, daysAgo: 30,
    dossier: { number: 'AJA-0047', daysAgo: 2, version: 1 },
  },
  {
    slug: 'ponto-de-onibus-sem-informacao',
    title: 'Ponto de ônibus sem informação em áudio nem em texto',
    category: 'comunicacao',
    audiences: ['visual', 'auditiva'],
    address: 'Ponto em frente à Praça do Doroteia',
    summary: 'O ponto não tem painel com as linhas nem aviso sonoro. Pessoas cegas dependem de perguntar a desconhecidos e pessoas surdas não sabem se a linha mudou de itinerário.',
    proposal: 'Placa com linhas em alto contraste e braille, e QR code com as informações em áudio e Libras.',
    photo: 'Abrigo de ônibus com placa pequena e desbotada, sem braille e sem painel.',
    stage: 1, supports: 41, passes: 12, daysAgo: 12,
  },
  {
    slug: 'placas-ubs-sem-contraste',
    title: 'Placas da UBS do bairro sem contraste e sem braille',
    category: 'sinalizacao',
    audiences: ['visual'],
    address: 'UBS do Parque Doroteia, entrada principal',
    summary: 'As placas de orientação da UBS têm letras pequenas, cinza sobre branco, e nenhuma informação em braille ou relevo. Pessoas com baixa visão não encontram a recepção sozinhas.',
    proposal: 'Trocar as placas por outras com alto contraste, letras maiores, braille e mapa tátil na entrada.',
    photo: 'Placa branca com letras cinza-claro indicando “Recepção”, a dois metros de altura.',
    stage: 4, supports: 63, passes: 18, daysAgo: 140,
    protocol: { number: '0000.2026/0000987-1', org: 'Supervisão Técnica de Saúde Cidade Ademar', openedDaysAgo: 98, status: 'Em execução', next: 'Instalação das novas placas' },
    dossier: { number: 'AJA-0031', daysAgo: 100, sentDaysAgo: 98, version: 3 },
  },
  {
    slug: 'raizes-calcada-rua-dos-ipes',
    title: 'Raízes levantaram a calçada na Rua dos Ipês',
    category: 'calcada',
    audiences: ['visual'],
    address: 'Rua dos Ipês, entre os nº 120 e 180',
    summary: 'As raízes de duas árvores levantaram as placas da calçada, criando degraus de até 10 cm. Quem usa bengala tropeça e quem usa cadeira de rodas precisa ir pela rua.',
    proposal: 'Readequar a calçada com canteiro maior para as árvores, sem cortar as raízes principais, e piso contínuo e nivelado.',
    photo: 'Calçada com placas de concreto levantadas e rachadas ao redor do tronco de uma árvore.',
    stage: 1, supports: 27, passes: 9, daysAgo: 8,
  },
  {
    slug: 'entulho-rua-das-flores',
    title: 'Entulho bloqueando a calçada na Rua das Flores',
    category: 'obstaculo',
    audiences: ['visual'],
    address: 'Rua das Flores, nº 45',
    summary: 'Sacos de entulho de obra ocupam toda a largura da calçada há mais de uma semana.',
    proposal: 'Remoção do entulho e orientação ao responsável pela obra.',
    photo: 'Sacos de entulho empilhados ocupando toda a calçada.',
    stage: 0, supports: 9, passes: 4, daysAgo: 2,
  },
  {
    slug: 'rampa-escola-estadual',
    title: 'Rampa de acesso refeita na esquina da escola estadual',
    category: 'calcada',
    audiences: ['visual'],
    address: 'Esquina da escola estadual do bairro',
    summary: 'A rampa da esquina estava quebrada, com degrau de 8 cm e sem piso de alerta. Alunos e moradores com deficiência visual tropeçavam todos os dias.',
    proposal: 'Refazer a rampa nivelada, com piso de alerta junto à guia.',
    photo: 'Rampa nova, nivelada, com piso de alerta amarelo junto à guia.',
    stage: 6, supports: 214, passes: 57, daysAgo: 240,
    protocol: { number: '0000.2026/0000311-9', org: 'Subprefeitura Cidade Ademar · Zeladoria urbana', openedDaysAgo: 220, status: 'Finalizado', next: 'Verificação contínua pela comunidade' },
    dossier: { number: 'AJA-0007', daysAgo: 222, sentDaysAgo: 220, version: 2 },
    conquest: { before: 'Rampa quebrada, com degrau de 8 cm e sem piso de alerta.', after: 'Rampa nova, nivelada, com piso de alerta amarelo junto à guia.', beforeDate: '03/2026', afterDate: '10/2026', ratings: [5, 5, 5, 4, 5, 4, 5, 5, 4, 5, 5, 4, 5, 5, 4, 5, 4, 5, 5, 4, 5, 4, 5, 5, 4, 5, 4, 4, 5, 5, 4], stillOk: 18, notOk: 1 },
  },
  {
    slug: 'botoeira-sonora-rua-natal',
    title: 'Botoeira sonora instalada na Rua Natal',
    category: 'travessia',
    audiences: ['visual'],
    address: 'Travessia da Rua Natal com a Rua Jacarandá',
    summary: 'A travessia não tinha nenhum recurso sonoro. Pessoas cegas atravessavam guiadas pelo barulho dos carros.',
    proposal: 'Instalar botoeira sonora com som de localização.',
    photo: 'Botoeira azul instalada no poste do semáforo, com seta em relevo.',
    stage: 6, supports: 132, passes: 30, daysAgo: 300,
    protocol: { number: '0000.2026/0000102-3', org: 'CET · Sinalização semafórica', openedDaysAgo: 280, status: 'Finalizado', next: 'Verificação contínua pela comunidade' },
    dossier: { number: 'AJA-0003', daysAgo: 282, sentDaysAgo: 280, version: 1 },
    conquest: { before: 'Semáforo sem nenhum recurso sonoro.', after: 'Botoeira com som de localização e bip de travessia.', beforeDate: '01/2026', afterDate: '07/2026', ratings: [5, 5, 4, 5, 5, 5, 4, 5, 5, 5, 4, 5, 5, 5, 4, 5, 5, 5, 4, 5, 5, 5], stillOk: 14, notOk: 0 },
  },
  {
    slug: 'poste-meio-da-calcada',
    title: 'Poste retirado do meio da calçada',
    category: 'obstaculo',
    audiences: ['visual'],
    address: 'Rua Jacarandá, nº 300',
    summary: 'Um poste desativado ficava no meio da calçada estreita, sem piso de alerta ao redor.',
    proposal: 'Retirar o poste desativado e recompor a calçada.',
    photo: 'Calçada livre, com o piso recomposto onde ficava o poste.',
    stage: 6, supports: 77, passes: 19, daysAgo: 200,
    protocol: { number: '0000.2026/0000455-0', org: 'Subprefeitura Cidade Ademar · Zeladoria urbana', openedDaysAgo: 180, status: 'Finalizado', next: 'Verificação contínua pela comunidade' },
    dossier: { number: 'AJA-0012', daysAgo: 182, sentDaysAgo: 180, version: 1 },
    conquest: { before: 'Poste desativado no meio da calçada estreita.', after: 'Calçada livre e recomposta.', beforeDate: '04/2026', afterDate: '09/2026', ratings: [5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 4, 5], stillOk: 9, notOk: 0 },
  },
]

// Relatos de exemplo (viram as evidências de cada tópico).
export const REPORTS: { topic: string; format: string; body: string; caption?: string; passes: boolean }[] = [
  { topic: 'piso-tatil-av-cupece', format: 'audio', body: 'Eu perco a linha do piso e fico sem saber onde começa a faixa.', passes: true },
  { topic: 'piso-tatil-av-cupece', format: 'libras', body: 'Atravesso aqui com meu filho, que é cego. Todo dia é a mesma insegurança.', passes: true },
  { topic: 'piso-tatil-av-cupece', format: 'foto', body: 'O piso termina perto do poste.', caption: 'O piso tátil amarelo termina cerca de 3 m antes da faixa de pedestres.', passes: true },
  { topic: 'piso-tatil-av-cupece', format: 'texto', body: 'Minha mãe tem baixa visão e já tropeçou na guia duas vezes neste ponto.', passes: false },
  { topic: 'piso-tatil-av-cupece', format: 'foto', body: 'Medida feita com trena.', caption: 'Trena estendida no chão marcando 3,1 m entre o fim do piso e a faixa.', passes: true },
  { topic: 'semaforo-sem-som-e-contagem', format: 'libras', body: 'Na travessia não tem contagem visual. Eu não sei quanto tempo falta para fechar.', passes: true },
  { topic: 'semaforo-sem-som-e-contagem', format: 'audio', body: 'Não tem botão nem som. Eu espero alguém atravessar para ir junto.', passes: true },
  { topic: 'ponto-de-onibus-sem-informacao', format: 'texto', body: 'Ninguém avisa quando a linha muda de itinerário. Já perdi consulta por isso.', passes: true },
  { topic: 'placas-ubs-sem-contraste', format: 'foto', body: 'Placa da recepção.', caption: 'Placa branca com letras cinza-claro, a dois metros de altura.', passes: true },
  { topic: 'raizes-calcada-rua-dos-ipes', format: 'foto', body: 'Calçada levantada.', caption: 'Placas de concreto levantadas ao redor do tronco, com degrau de cerca de 10 cm.', passes: true },
  { topic: 'entulho-rua-das-flores', format: 'texto', body: 'Tive que descer para a rua com a bengala.', passes: true },
]

type SeedComment = { author: string; badge?: string; kind?: string; body: string; label?: string; helpful: number; hoursAgo: number; replies?: SeedComment[] }

export const COMMENTS: Record<string, SeedComment[]> = {
  'piso-tatil-av-cupece': [
    {
      author: 'Marta S.', badge: 'Passa por ali', body: 'Uso bengala e o piso some uns três passos antes da faixa. Já esbarrei no poste da esquina tentando achar a travessia.', helpful: 31, hoursAgo: 50,
      replies: [
        { author: 'Ana L.', badge: 'Arquiteta voluntária', body: 'Pela norma de sinalização tátil, o piso direcional deveria chegar até o piso de alerta, junto à rampa. Deixei a referência na aba Referências.', helpful: 18, hoursAgo: 26 },
        { author: 'Marta S.', badge: 'Autora', body: 'Obrigada, Ana! Vou anexar uma foto com a medida, como a prefeitura pediu.', helpful: 4, hoursAgo: 20 },
        { author: 'Carlos R.', body: 'Passei hoje e tirei a medida: deu 3,1 m. Já anexei como evidência.', helpful: 7, hoursAgo: 6 },
      ],
    },
    { author: 'João P.', badge: 'Passa por ali', kind: 'libras', label: 'Vídeo em Libras · 0:36', body: 'Na travessia não tem contagem visual. Eu não sei quanto tempo falta para fechar.', helpful: 24, hoursAgo: 48 },
    { author: 'Rita C.', kind: 'audio', label: '0:52', body: 'Levo minha mãe ao posto de saúde por esse caminho. Ela tem baixa visão e sempre pede para eu avisar onde acaba a calçada.', helpful: 12, hoursAgo: 72 },
    { author: 'Paulo M.', body: 'Do outro lado da avenida também falta piso de alerta. Vale incluir no mesmo pedido?', helpful: 6, hoursAgo: 30,
      replies: [{ author: 'Ana L.', badge: 'Arquiteta voluntária', body: 'Vale, sim: a travessia precisa de piso de alerta nos dois lados. Já incluí na proposta.', helpful: 9, hoursAgo: 28 }] },
  ],
  'semaforo-sem-som-e-contagem': [
    { author: 'Luciana T.', badge: 'Passa por ali', body: 'Sou surda e atravesso aqui todo dia. Sem contagem, eu corro no meio da faixa sem saber se dá tempo.', helpful: 15, hoursAgo: 40 },
    { author: 'Seu Antônio', badge: 'Passa por ali', kind: 'audio', label: '0:40', body: 'Eu espero o barulho dos carros parar para atravessar. Já levei susto com moto.', helpful: 11, hoursAgo: 60 },
  ],
  'ponto-de-onibus-sem-informacao': [
    { author: 'Beatriz F.', body: 'Um QR code com áudio ajudaria muito. Podia ter Libras também.', helpful: 5, hoursAgo: 20 },
  ],
  'rampa-escola-estadual': [
    { author: 'Dona Cida', badge: 'Passa por ali', kind: 'audio', label: '0:31', body: 'Agora consigo descer a rampa com a bengala sem tropeçar. Fez diferença no caminho da escola.', helpful: 22, hoursAgo: 500 },
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
