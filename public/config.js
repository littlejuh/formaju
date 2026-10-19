// ============================================================
//  Edite aqui os textos do site. Não precisa mexer no resto.
// ============================================================
window.FORMATURA = {
  formanda: 'Juliana Rocha Fernandes',
  curso: 'Sistemas de Informação',

  colacao: {
    titulo: 'Colação de Grau',
    inicio: '2027-02-27T15:00:00-03:00',
    duracaoHoras: 3,
    data: 'Sábado, 27 de fevereiro de 2027',
    horario: '15h00',
    local: 'Anfiteatro Padre Werner',
    endereco: 'Unisinos, Av. Unisinos, 950, São Leopoldo/RS', // confira o endereço
    mapa: 'https://maps.google.com/?q=Anfiteatro+Padre+Werner+Unisinos',
    aviso: 'Entrada somente com ingresso. Os ingressos são limitados e você retira comigo. Se você tem interesse, me manda uma mensagem!',
  },

  festa: {
    titulo: 'Festa de Formatura',
    inicio: '2027-02-28T17:30:00-03:00',
    duracaoHoras: 6,
    data: 'Domingo, 28 de fevereiro de 2027',
    horario: '17h30',
    local: 'BarCoTur (BarCo Lazer Náutico)',
    endereco: 'Av. João Goulart, 551, Cais do Gasômetro, Porto Alegre/RS',
    mapa: 'https://maps.google.com/?q=BarCoTur+BarCo+Lazer+N%C3%A1utico+Av+Jo%C3%A3o+Goulart+551+Porto+Alegre',
    emBreve: 'Maiores informações em breve', // some sozinho quando local/horário forem preenchidos
    traje: 'Confortável',
    aviso: '⏰ Embarque pontual às 17h30: o barco zarpa no horário e não tem como embarcar depois da partida. Chegue com uns 30 minutinhos de antecedência!',
  },

  // Texto de boas-vindas e agradecimentos — cada item vira um parágrafo; use **assim** para negrito e '## ' no início para subtítulo
  boasVindas: [
    "**Que bom ter você aqui!**",
    "Depois de anos entre códigos, bancos de dados, trabalhos em grupo, milhares de exercícios e algumas madrugadas a mais do que eu gostaria de admitir, finalmente chegou a hora de comemorar.",
    "Este site é uma forma de agradecer a cada pessoa que fez parte dessa caminhada, com uma palavra de incentivo, um café na hora certa, uma explicação no momento de desespero ou simplesmente por acreditar em mim quando eu mesma duvidei.",
    "E, olhando para trás, talvez o mais bonito seja lembrar de onde tudo começou.",
    "Eu nunca fui exatamente a aluna que alguém imaginaria chegando até aqui. Repeti de ano **duas vezes no colégio** e, depois, acabei entrando na universidade pelo **ENEM**. Quando comecei a graduação, não tinha ideia de quantas vezes ainda ouviria aquela voz dizendo: “será que eu consigo mesmo?”.",
    "Logo no início, veio um dos primeiros lembretes de que a jornada não seria fácil: **tirei zero na minha primeira prova de Cálculo.** E não parou por aí. Vieram milhares de exercícios de Probabilidade e Estatística, distribuições, fórmulas e a famosa **tabela Z**, que por muito tempo pareceu ter sido criada especificamente para testar a minha paciência.",
    "Nessa parte da história, meu irmão, **Alexandre Davi Rocha Fernandes**, teve um papel enorme. Com muita paciência e generosidade, compartilhou seu conhecimento comigo nos momentos em que eu mais precisava. Aos poucos, aquilo que parecia impossível começou a fazer sentido, e eu superei.",
    "Mas, no meio de tantos momentos de desespero, também vieram momentos de glória.",
    "Lembro do dia em que fiz **meu primeiro algoritmo em uma folha de papel**. Depois vieram as estruturas de dados, e alguma coisa mudou. Eu me apaixonei por aquilo. Descobri que existia beleza em transformar um problema em lógica, organizar ideias e, linha por linha, fazer alguma coisa funcionar.",
    "Foi ali que percebi que eu realmente encontrei o meu lugar.",
    "De lá para cá, foram muitos trabalhos, projetos, provas, códigos, erros, acertos e aprendizados. E, entre todas essas etapas, existe uma que ocupa um lugar especial: **o TCC**.",
    "## Agradecimentos especiais",
    "Aos meus pais, **Marileia Alves Rocha e Gerson Severo Fernandes**, minha gratidão mais profunda. Obrigada por todo o apoio, por acreditarem nas minhas escolhas e por me oferecerem oportunidades para que eu pudesse chegar até aqui. Mãe, obrigada por estar ao meu lado e apoiar constantemente as minhas decisões. Pai, obrigada por me permitir sonhar.",
    "Ao meu irmão, **Alexandre**, obrigada por estar ao meu lado em cada desafio e por ser parte fundamental de quem me tornei hoje.",
    "Ao meu orientador, **Guilherme Lacerda**, pela paciência, pelas orientações e, principalmente, por acreditar em mim durante todo esse processo. Obrigada por estar comigo nos momentos em que eu precisava de direção, por parear comigo no Overleaf quando parecia que aquele trabalho nunca ficaria pronto e por me ajudar a transformar uma ideia em algo que hoje tenho orgulho de apresentar.",
    "Agradeço também aos professores que, em diferentes momentos, me mostraram que havia espaço para mim na vida acadêmica; às pessoas incríveis que tive o privilégio de conhecer ao longo da minha trajetória profissional; aos colegas que dividiram comigo trabalhos, dúvidas, risadas e desesperos; e a toda a comunidade acadêmica que fez parte dessa história, em especial à **FACIN/PUCRS e à Unisinos**.",
    "Hoje, quando olho para tudo isso, vejo que a história não é sobre ter sido uma aluna perfeita.",
    "É sobre ter continuado.",
    "Sobre tirar zero e fazer a próxima prova. Sobre não entender a tabela Z e tentar de novo. Sobre descobrir que um algoritmo escrito em uma folha poderia despertar uma paixão. Sobre chegar ao TCC depois de tudo e perceber que aquela pessoa que um dia duvidou de si mesma conseguiu chegar até aqui.",
    "**Eu me formei.**",
    "E essa conquista é nossa. **Obrigada por fazerem parte da minha história. 💙**",
  ],


  // TCC em destaque na seção "Momentos que ficaram" (PDF em public/docs/)
  tcc: {
    arquivo: '/docs/tcc-juliana-fernandes.pdf',
    titulo: 'Estudo comparativo entre duas diferentes estratégias de construção de páginas web: renderização no server side e renderização no client side',
    subtitulo: 'Impactos no desempenho',
    orientador: 'Prof. Guilherme Lacerda',
    ano: '2025',
    paginas: 30,
    resumo: 'Uma comparação entre renderização server-side e client-side em aplicações web modernas, usando Ruby on Rails com Hotwire e uma implementação equivalente em React. O estudo avalia desempenho, consumo de recursos e experiência do usuário com métricas como LCP, FCP, INP e CLS.',
    tags: ['Ruby on Rails', 'Hotwire', 'React', 'SSR vs CSR', 'Web Vitals'],
  },

  // Seção "Inspirações" — fotos em public/inspiracoes/. Adicione, remova ou troque pessoas à vontade.
  inspiracoes: [
    {
      nome: 'Ada Lovelace',
      anos: '1815–1852',
      foto: '/inspiracoes/ada-lovelace.jpg',
      papel: 'Primeira programadora da história',
      texto: 'Escreveu o primeiro algoritmo pensado para uma máquina, a Máquina Analítica de Babbage, e imaginou computadores criando muito além de cálculos.',
    },
    {
      nome: 'Grace Hopper',
      anos: '1906–1992',
      foto: '/inspiracoes/grace-hopper.jpg',
      papel: 'Pioneira das linguagens de programação',
      texto: 'Criou o primeiro compilador e foi peça-chave no COBOL, aproximando a programação da linguagem humana.',
    },
    {
      nome: 'Margaret Hamilton',
      anos: '1936–',
      foto: '/inspiracoes/margaret-hamilton.jpg',
      papel: 'Engenharia de software da Apollo 11',
      texto: 'Liderou o software que levou a humanidade à Lua e cunhou o termo “engenharia de software”.',
    },
  ],


  agradecimento: 'Obrigada por fazer parte disso. Te espero lá! 💙',
};
