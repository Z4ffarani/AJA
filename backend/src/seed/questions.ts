// Repertório do "Pergunte ao AJA": respostas prontas, organizadas por contexto.
// Cada tela mostra as perguntas do seu contexto como caixinhas para tocar.

export type Question = { context: string; question: string; answer: string };

export const QUESTIONS: Question[] = [
  // ── geral ───────────────────────────────────────────────
  { context: 'geral', question: 'O que é o AJA?', answer: 'O AJA é uma plataforma de participação cidadã. Moradores relatam barreiras do bairro, a comunidade apoia e reúne evidências, e o AJA transforma tudo em um dossiê para a prefeitura. Depois, acompanha o protocolo até a barreira ser removida e verificada por quem passa por ali.' },
  { context: 'geral', question: 'Por que começar pelo Parque Doroteia?', answer: 'O piloto acontece no Parque Doroteia, na Subprefeitura Cidade Ademar, com foco em acessibilidade para pessoas com deficiência visual e auditiva. Começar pequeno permite validar a jornada com quem convive com as barreiras antes de levar o AJA para outros bairros.' },
  { context: 'geral', question: 'O AJA substitui o SP156?', answer: 'Não. O SP156 continua sendo o canal oficial da Prefeitura de São Paulo. O AJA organiza os relatos, monta o dossiê, abre o pedido e acompanha a resposta, para que o cidadão não precise fazer isso sozinho.' },
  { context: 'geral', question: 'Preciso de conta para participar?', answer: 'Para ler os tópicos e relatar uma barreira, não. Para apoiar, comentar e acompanhar os seus relatos, sim: basta um e-mail e uma senha.' },
  { context: 'geral', question: 'O que a inteligência artificial faz no AJA?', answer: 'A IA ajuda a organizar: transcreve áudios, legenda vídeos em Libras, descreve fotos para quem usa leitor de tela, agrupa relatos parecidos e redige o dossiê. Ela não decide nada sozinha: as pessoas revisam o que foi escrito, e a decisão técnica continua com a prefeitura.' },
  { context: 'geral', question: 'Quem decide se a obra acontece?', answer: 'O poder público. A subprefeitura e os órgãos técnicos avaliam, aprovam e executam a intervenção. O papel do AJA é garantir que a demanda chegue bem fundamentada e que cada resposta fique registrada e visível.' },

  // ── relatar ─────────────────────────────────────────────
  { context: 'relatar', question: 'Posso relatar por áudio ou em Libras?', answer: 'Sim. Você pode escrever, gravar um áudio, enviar foto ou vídeo, ou gravar um vídeo em Libras. Todos os formatos valem igual. O AJA transcreve o áudio e legenda o vídeo, e você pode corrigir o texto antes de enviar.' },
  { context: 'relatar', question: 'O que conta como evidência?', answer: 'Fotos, vídeos, áudios, medições (por exemplo, a distância entre o fim do piso tátil e a faixa) e documentos. Quanto mais relatos e evidências um tópico reunir, mais forte fica o dossiê enviado à prefeitura.' },
  { context: 'relatar', question: 'Meu relato vira um tópico na hora?', answer: 'Sim. Se já existe um tópico sobre a mesma barreira, o AJA mostra antes de enviar e você pode somar o seu relato a ele como evidência. Se é uma barreira nova, o AJA cria o tópico na hora com o seu relato, e ele vai sendo completado com os próximos relatos.' },
  { context: 'relatar', question: 'Preciso saber o endereço exato?', answer: 'Não. Você pode usar a localização do celular, escrever um ponto de referência (por exemplo, “em frente à escola”) ou marcar no mapa. Moradores e voluntários ajudam a confirmar o local depois.' },
  { context: 'relatar', question: 'E se a barreira já foi relatada?', answer: 'Sem problema. Antes de enviar, o AJA mostra os tópicos parecidos perto do endereço e você escolhe somar o seu relato a um deles. Ele conta como mais uma evidência e mostra que a barreira afeta mais gente e continua lá.' },
  { context: 'relatar', question: 'Posso relatar uma barreira do próprio AJA?', answer: 'Pode e deve. Se algum botão não funciona com o leitor de tela, se falta legenda ou se algo está difícil de entender, relate. O próprio AJA precisa ser acessível.' },

  // ── privacidade ─────────────────────────────────────────
  { context: 'privacidade', question: 'Meu nome aparece no dossiê?', answer: 'Não. O dossiê enviado à prefeitura não leva nomes, rostos nem telefones. Quem relatou aparece como “Morador(a) A, B, C”.' },
  { context: 'privacidade', question: 'Meu vídeo em Libras fica público?', answer: 'Você escolhe. Pode deixar o vídeo público no tópico ou publicar só a legenda. O vídeo nunca vai para o dossiê com o seu rosto sem a sua autorização.' },
  { context: 'privacidade', question: 'O que o AJA guarda sobre mim?', answer: 'Seu nome, e-mail e o que você publicou: relatos, apoios e comentários. A senha é guardada de forma cifrada. Você pode pedir a exclusão da conta e dos seus dados.' },

  // ── apoio ───────────────────────────────────────────────
  { context: 'apoio', question: 'O que acontece depois que eu apoio?', answer: 'Seu apoio entra na contagem do tópico e no dossiê, mostrando quantas pessoas querem a melhoria. Você também passa a receber avisos quando a prefeitura responder.' },
  { context: 'apoio', question: 'Para que serve “Passo por essa barreira”?', answer: 'É uma marcação opcional para quem convive com a barreira. Ela conta como evidência de que o problema existe e continua lá, e ajuda a prefeitura a entender quem é afetado.' },
  { context: 'apoio', question: 'Uma barreira com poucos apoios é ignorada?', answer: 'Não. Apoio mostra mobilização, mas não é condição para uma barreira ser atendida. Uma pessoa cega que relata sozinha um obstáculo perigoso merece a mesma atenção.' },
  { context: 'apoio', question: 'Posso tirar meu apoio?', answer: 'Pode. Toque de novo no botão Apoiar para desfazer. A contagem é atualizada na hora.' },

  // ── prefeitura e protocolo ─────────────────────────────
  { context: 'prefeitura', question: 'Quanto tempo a prefeitura costuma levar?', answer: 'Depende do serviço. Nos dados abertos do SP156 (2020 a 2026), pedidos de “obstáculo na calçada” levaram em mediana 266 dias até a finalização, e só 7% saíram em até 30 dias. Já a manutenção de calçada pública teve mediana de 12 dias. Por isso o AJA acompanha o protocolo por você.' },
  { context: 'prefeitura', question: 'O que é o SP156?', answer: 'É a central de atendimento da Prefeitura de São Paulo, pelo telefone 156, site e aplicativo. Cada pedido recebe um número de protocolo, que permite acompanhar o andamento.' },
  { context: 'prefeitura', question: 'O que é um protocolo?', answer: 'É o número que identifica o pedido na prefeitura. Com ele, o AJA consulta o andamento e mostra no tópico cada mudança, prazo, decisão e justificativa.' },
  { context: 'prefeitura', question: 'Qual subprefeitura cuida do Parque Doroteia?', answer: 'A Subprefeitura Cidade Ademar. Ela é a responsável pela zeladoria do bairro, como vistoria e manutenção de calçadas e áreas públicas.' },
  { context: 'prefeitura', question: 'De quem é a responsabilidade pela calçada?', answer: 'Em São Paulo, a conservação da calçada em frente a um imóvel é, em regra, do proprietário. A prefeitura fiscaliza e cuida das calçadas de áreas públicas, como praças e prédios municipais. O dossiê indica qual é o caso.' },
  { context: 'prefeitura', question: '“Protocolo finalizado” quer dizer que resolveu?', answer: 'Nem sempre. O SP156 registra o encerramento do pedido, que pode acontecer sem a barreira ter sido removida. Por isso, no AJA, uma conquista só é marcada como verificada quando quem passa por ali confirma.' },
  { context: 'prefeitura', question: 'E se a prefeitura pedir mais informações?', answer: 'O pedido aparece como pendência no tópico. Qualquer morador pode ajudar a responder, por exemplo enviando uma foto com medida. O AJA anexa a resposta ao protocolo.' },

  // ── dossiê ──────────────────────────────────────────────
  { context: 'dossie', question: 'O que vai no dossiê?', answer: 'A situação, o local, quem é afetado, as evidências com descrição, a fundamentação (normas, leis e dados públicos) e o pedido de melhoria. Tudo sem dados pessoais.' },
  { context: 'dossie', question: 'Quem escreve o dossiê?', answer: 'O AJA monta o rascunho a partir dos relatos e das referências do tópico. Moradores e voluntários revisam antes do envio. Cada nova evidência gera uma nova versão.' },
  { context: 'dossie', question: 'O dossiê é acessível?', answer: 'Sim. O PDF tem texto de verdade (não é imagem), funciona com leitor de tela e também existe uma versão em texto simples, um resumo em áudio e um resumo em Libras.' },
  { context: 'dossie', question: 'Para quem o dossiê é enviado?', answer: 'Para o órgão responsável pela barreira, normalmente a Subprefeitura Cidade Ademar, pelo SP156. Travessias e semáforos também podem envolver a CET.' },

  // ── piso tátil ──────────────────────────────────────────
  { context: 'piso', question: 'O que é piso tátil direcional?', answer: 'É o piso com faixas em relevo, em linha, que guia o caminho de quem é cego ou tem baixa visão. A pessoa sente o relevo com a bengala ou com os pés e segue a direção das faixas.' },
  { context: 'piso', question: 'O que é piso tátil de alerta?', answer: 'É o piso com pequenos relevos em forma de pontos. Ele avisa que é preciso atenção: início de uma travessia, uma mudança de direção, um obstáculo ou um desnível.' },
  { context: 'piso', question: 'Por que o piso precisa chegar até a faixa?', answer: 'Se o piso direcional termina antes, a pessoa perde a referência justo no ponto mais perigoso: a travessia. Sem piso de alerta junto à guia, ela pode entrar na rua sem perceber.' },
  { context: 'piso', question: 'Por que o piso tátil costuma ser amarelo?', answer: 'Para contrastar com a calçada. Muitas pessoas com baixa visão enxergam cores e contrastes, e o amarelo ajuda a identificar o caminho mesmo sem tocar o piso.' },
  { context: 'piso', question: 'Qual norma fala de piso tátil?', answer: 'A ABNT NBR 16537 trata da sinalização tátil no piso: onde instalar o piso direcional e o de alerta, cores e dimensões. A ABNT NBR 9050 traz os critérios gerais de acessibilidade em espaços urbanos.' },

  // ── travessia ───────────────────────────────────────────
  { context: 'travessia', question: 'O que é um semáforo sonoro?', answer: 'É um semáforo de pedestres com botoeira que emite um som de localização, para a pessoa cega encontrar o botão, e um sinal sonoro durante o tempo de travessia.' },
  { context: 'travessia', question: 'Por que pessoas surdas precisam de contagem visual?', answer: 'Porque o aviso sonoro não chega a elas. A contagem regressiva no foco de pedestres mostra quanto tempo falta para o sinal fechar, e ajuda todo mundo, inclusive idosos e crianças.' },
  { context: 'travessia', question: 'Quem cuida dos semáforos?', answer: 'Em São Paulo, os semáforos são da CET (Companhia de Engenharia de Tráfego). Pedidos de ajuste de tempo ou de semáforo sonoro também podem ser feitos pelo SP156.' },

  // ── libras e comunicação ───────────────────────────────
  { context: 'libras', question: 'Por que vídeo em Libras e não só legenda?', answer: 'Para muitas pessoas surdas, a Libras é a primeira língua e o português escrito é a segunda. Um vídeo em Libras é a forma mais natural de se expressar e de entender.' },
  { context: 'libras', question: 'O que é o VLibras?', answer: 'É uma ferramenta gratuita do governo federal que traduz textos de sites do português para Libras, com um avatar. No AJA, ela pode ser ligada em todas as páginas pelo botão de Libras.' },
  { context: 'libras', question: 'O que é comunicação acessível?', answer: 'É a informação chegando por mais de um caminho: texto, áudio, Libras, legenda e sinal visual. Um aviso só por som exclui pessoas surdas; um aviso só escrito exclui quem não enxerga ou não lê bem.' },

  // ── conquistas ──────────────────────────────────────────
  { context: 'conquista', question: 'O que é uma conquista verificada?', answer: 'É uma barreira removida que foi confirmada por pessoas que passam pelo local. O AJA mostra o antes e o depois, as avaliações e os comentários de quem é afetado.' },
  { context: 'conquista', question: 'Por que continuar verificando depois da obra?', answer: 'Porque melhorias se desgastam: o piso pode quebrar, a botoeira pode parar de tocar. Perguntar de tempos em tempos se a barreira continua resolvida mantém a conquista de pé.' },
  { context: 'conquista', question: 'E se a barreira voltar?', answer: 'Toque em “Voltou a ter problema”. Com algumas confirmações, o tópico é reaberto e volta para o acompanhamento, com todo o histórico preservado.' },

  // ── concept 3D ──────────────────────────────────────────
  { context: 'concept', question: 'O concept 3D é um projeto oficial?', answer: 'Não. É uma visualização conceitual feita por um voluntário para explicar a ideia. A decisão técnica e o projeto executivo são responsabilidade da prefeitura.' },
  { context: 'concept', question: 'Como entender o concept sem enxergar a imagem?', answer: 'Cada concept tem uma descrição completa da cena, que pode ser lida ou ouvida, uma explicação em Libras e, quando possível, um modelo para impressão 3D, para conhecer a proposta pelo toque.' },

  // ── voluntários ─────────────────────────────────────────
  { context: 'voluntario', question: 'Como ser voluntário?', answer: 'Profissionais de arquitetura, engenharia, terapia ocupacional, Libras, direito e outras áreas podem contribuir com orientações, estudos e concepts. O perfil mostra as contribuições e os agradecimentos da comunidade.' },
  { context: 'voluntario', question: 'Posso contratar um voluntário pelo AJA?', answer: 'Não. O AJA não intermedia contratações. O perfil do voluntário mostra os contatos externos para quem quiser falar com ele fora da plataforma.' },

  // ── acessibilidade ──────────────────────────────────────
  { context: 'acessibilidade', question: 'O AJA funciona com leitor de tela?', answer: 'Foi feito para isso: botões e campos têm nomes, as imagens têm descrição, os títulos seguem uma ordem e tudo funciona pelo teclado. Se algo não funcionar, relate.' },
  { context: 'acessibilidade', question: 'Como aumentar o texto?', answer: 'Na tela de Acessibilidade, escolha o tamanho do texto. A escolha fica salva neste aparelho. O zoom do navegador também funciona.' },
  { context: 'acessibilidade', question: 'Como ouvir as páginas?', answer: 'Use os botões “Ouvir” nos tópicos, comentários e respostas. Eles leem o texto em voz alta com a voz do seu aparelho.' },
  { context: 'acessibilidade', question: 'Como usar o modo escuro?', answer: 'Na tela de Acessibilidade, escolha Claro, Escuro ou Automático (segue o aparelho). Os dois modos têm contraste conferido.' },
]
