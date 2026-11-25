(() => {
  const cfg = window.FORMATURA;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const el = (tag, attrs = {}, children = []) => {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'text') node.textContent = v;
      else if (k === 'class') node.className = v;
      else node.setAttribute(k, v);
    }
    for (const c of [].concat(children)) if (c) node.append(c);
    return node;
  };

  // Recado para quem abrir o console 👩‍💻
  console.log(
    '%c🎓 Oi, dev!%c\nSe você chegou até aqui, já sabe que eu vou adorar te ver na formatura.\nCódigo e projetos: https://github.com/littlejuh',
    'font: 600 16px sans-serif; color: #0050a8',
    'font: 13px monospace'
  );

  // ---------- Textos da config ----------
  $$('[data-cfg]').forEach((n) => (n.textContent = cfg[n.dataset.cfg] || ''));
  // Parágrafo com **negrito** (monta os nós na mão, sem innerHTML)
  const comNegrito = (t) => t.split(/\*\*(.+?)\*\*/g).map((parte, i) => (i % 2 ? el('strong', { text: parte }) : parte)).filter(Boolean);
  $('#boas-vindas-texto').append(
    ...cfg.boasVindas.map((t) => (t.startsWith('## ') ? el('h3', { text: t.slice(3) }) : el('p', {}, comNegrito(t))))
  );
  $('#agradecimento').textContent = cfg.agradecimento;

  // ---------- Inspirações ----------
  $('#inspiracoes-lista').append(
    ...(cfg.inspiracoes || []).map((p) =>
      el('article', { class: 'inspiracao reveal' }, [
        el('div', { class: 'insp-foto' }, [
          el('img', { src: p.foto, alt: `Retrato de ${p.nome}`, loading: 'lazy' }),
        ]),
        el('div', { class: 'insp-body' }, [
          el('h3', { text: p.nome }),
          el('p', { class: 'insp-meta', text: [p.papel, p.anos].filter(Boolean).join(' · ') }),
          el('p', { text: p.texto }),
          p.citacao && el('blockquote', { text: `“${p.citacao}”` }),
        ]),
      ])
    )
  );

  // Preferências só deste navegador (pode falhar em aba anônima)
  const guardado = {
    ler(chave) {
      try { return JSON.parse(localStorage.getItem(chave)); } catch { return null; }
    },
    salvar(chave, valor) {
      try { localStorage.setItem(chave, JSON.stringify(valor)); } catch {}
    },
  };

  // ---------- Nav ----------
  const nav = $('#topo');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Destaca no menu a seção que está na tela (a última cujo topo já passou de 40% da altura)
  const linksNav = $$('.nav nav a[href^="#"]');
  const secoesNav = linksNav.map((a) => $(a.getAttribute('href'))).filter(Boolean);
  let agendado = false;
  function marcarSecao() {
    agendado = false;
    const linha = window.innerHeight * 0.4;
    const fim = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    const atual = fim ? secoesNav.at(-1) : secoesNav.filter((s) => s.getBoundingClientRect().top <= linha).at(-1);
    linksNav.forEach((a) => a.toggleAttribute('aria-current', !!atual && a.getAttribute('href') === '#' + atual.id));
  }
  // ordem do documento, não do menu
  secoesNav.sort((x, y) => (x.compareDocumentPosition(y) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
  window.addEventListener('scroll', () => agendado || ((agendado = true), requestAnimationFrame(marcarSecao)), { passive: true });
  marcarSecao();

  // ---------- Contagem regressiva ----------
  const alvo = new Date(cfg.colacao.inicio).getTime();
  const cd = $('#countdown');
  const pad = (n) => String(n).padStart(2, '0');
  function tick() {
    const diff = alvo - Date.now();
    if (diff <= 0) {
      cd.classList.add('done');
      cd.textContent = 'Formada! 🎓';
      return clearInterval(timer);
    }
    const s = Math.floor(diff / 1000);
    $('[data-cd=dias]', cd).textContent = Math.floor(s / 86400);
    $('[data-cd=horas]', cd).textContent = pad(Math.floor((s % 86400) / 3600));
    $('[data-cd=min]', cd).textContent = pad(Math.floor((s % 3600) / 60));
    $('[data-cd=seg]', cd).textContent = pad(s % 60);
  }
  const timer = setInterval(tick, 1000);
  tick();

  // ---------- Cards do evento + calendário ----------
  const temHorario = (ev) => ev.inicio.includes('T');
  const fmtUtc = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const fmtDia = (d) => d.toISOString().slice(0, 10).replace(/-/g, '');

  function datasCalendario(ev) {
    if (temHorario(ev)) {
      const ini = new Date(ev.inicio);
      const fim = new Date(ini.getTime() + (ev.duracaoHoras || 3) * 3600e3);
      return { ini: fmtUtc(ini), fim: fmtUtc(fim) };
    }
    const ini = new Date(ev.inicio + 'T00:00:00Z');
    const fim = new Date(ini.getTime() + 86400e3);
    return { ini: fmtDia(ini), fim: fmtDia(fim) };
  }

  function googleCalendar(ev) {
    const { ini, fim } = datasCalendario(ev);
    const p = new URLSearchParams({
      action: 'TEMPLATE',
      text: `${ev.titulo} · ${cfg.formanda} (${cfg.curso})`,
      dates: `${ini}/${fim}`,
      location: [ev.local, ev.endereco].filter(Boolean).join(', '),
      details: `${ev.titulo} de ${cfg.formanda} em ${cfg.curso}. Confirme sua presença: ${location.origin}`,
    });
    return 'https://calendar.google.com/calendar/render?' + p;
  }

  const linksAgenda = (ev) => [
    el('a', { href: googleCalendar(ev), target: '_blank', rel: 'noopener', text: 'Adicionar ao Google Agenda' }),
  ];

  const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

  function eventCard(ev, tag, rsvp) {
    const [ano, mes, dia] = ev.inicio.slice(0, 10).split('-').map(Number);
    const diaSemana = ev.data.split(',')[0];
    const info = (rotulo, valor, extra) =>
      el('div', { class: 'event-row' }, [el('dt', { text: rotulo }), el('dd', {}, [el('strong', { text: valor }), extra && el('span', { text: extra })])]);
    return el('article', { class: 'event' }, [
      el('div', { class: 'event-date' }, [
        el('p', { class: 'event-tag', text: tag }),
        el('span', { class: 'event-day', text: String(dia) }),
        el('span', { class: 'event-month' }, [el('strong', { text: `${MESES[mes - 1]} ${ano}` }), el('span', { text: diaSemana })]),
      ]),
      el('div', { class: 'event-body' }, [
        el('dl', { class: 'event-info' }, [
          info('Horário', ev.horario || 'A definir'),
          info('Local', ev.local || 'A definir', ev.endereco),
          ev.traje && info('Traje', ev.traje),
        ]),
        !ev.local && !ev.horario && ev.emBreve && el('p', { class: 'event-note', text: ev.emBreve }),
        ev.aviso && el('p', { class: 'event-note', text: ev.aviso }),
        el('div', { class: 'event-actions' }, [
          rsvp && el('a', { class: 'btn btn-primary', id: 'cta-festa', href: '#presenca', text: 'Confirmar presença na festa' }),
          el('span', { class: 'event-links' }, [
            ...linksAgenda(ev),
          ]),
          ev.mapa && el('a', { class: 'event-map', href: ev.mapa, target: '_blank', rel: 'noopener', text: 'Como chegar' }),
        ]),
      ]),
    ]);
  }
  $('#eventos-lista').append(eventCard(cfg.colacao, '🎓 Colação de grau'), eventCard(cfg.festa, '🎉 Festa', true));

  // ---------- TCC ----------
  if (cfg.tcc) {
    const t = cfg.tcc;
    $('#tcc').replaceWith(
      el('article', { class: 'tcc-card reveal' }, [
        el('a', { class: 'tcc-cover', href: t.arquivo, target: '_blank', rel: 'noopener', 'aria-label': 'Abrir o TCC em PDF' }, [
          el('span', { class: 'tcc-cover-tag', text: 'TCC · ' + t.ano }),
          el('span', { class: 'tcc-cover-title', text: t.subtitulo || 'Trabalho de Conclusão' }),
          el('span', { class: 'tcc-cover-pdf', text: 'PDF · ' + t.paginas + ' páginas' }),
        ]),
        el('div', { class: 'tcc-body' }, [
          el('p', { class: 'kicker', text: '📄 Trabalho de Conclusão de Curso' }),
          el('h3', { text: t.titulo }),
          t.subtitulo && el('p', { class: 'tcc-sub', text: t.subtitulo }),
          el('p', { class: 'tcc-meta', text: `Orientador: ${t.orientador}` }),
          el('p', { class: 'tcc-resumo', text: t.resumo }),
          el('div', { class: 'actions' }, [
            el('a', { class: 'btn btn-primary', href: t.arquivo, target: '_blank', rel: 'noopener', text: 'Ler o TCC' }),
            el('a', { class: 'btn btn-outline', href: t.arquivo, download: '', text: 'Baixar PDF' }),
          ]),
        ]),
      ])
    );
  }

  // ---------- Galeria ----------
  // Hash curto estilo commit do git (estável para o mesmo texto)
  const hashCommit = (txt) => {
    let h = 0x811c9dc5;
    for (const c of txt) h = Math.imul(h ^ c.codePointAt(0), 16777619) >>> 0;
    return h.toString(16).padStart(8, '0').slice(0, 7);
  };
  const legendaCommit = (src, legenda) => [el('code', { text: hashCommit(src) }), ' ' + (legenda || '')];
  const lb = $('#lightbox');
  let aberta = []; // lista que está na tela cheia
  let atual = 0;
  let focoAntes = null;

  // Foto do ensaio: o navegador escolhe entre as versões AVIF; a reserva é um JPEG
  const LADOS = [720, 1440, 2560, 3840];
  const srcset = (f) =>
    LADOS.map((l) => `/ensaio/${l}/${f.id}.avif ${Math.round(f.w * Math.min(1, l / Math.max(f.w, f.h)))}w`).join(', ');
  const reserva = (f) => `/ensaio/reserva/${f.id}.jpg`;
  const tamanhoNaTela = (f) => `min(92vw, calc((100vh - 140px) * ${(f.w / f.h).toFixed(4)}))`;
  const picture = (f, sizes, attrs) =>
    el('picture', {}, [
      el('source', { type: 'image/avif', srcset: srcset(f), sizes }),
      el('img', { src: reserva(f), alt: f.legenda, width: f.w, height: f.h, decoding: 'async', ...attrs }),
    ]);

  // Miniatura de qualquer item: foto do ensaio, foto da jornada ou vídeo (com capa)
  function miniatura(f, sizes, attrs) {
    if (f.id) return [picture(f, sizes, attrs)];
    const capa = f.video ? f.capa : f.src;
    const m = capa
      ? el('img', { src: capa, alt: f.legenda, decoding: 'async', ...attrs })
      : el('video', { src: f.src + '#t=0.1', muted: '', playsinline: '', preload: 'metadata' });
    // as dimensões dessas fotos só são conhecidas quando carregam
    m.addEventListener(capa ? 'load' : 'loadedmetadata', () => {
      f.w = m.naturalWidth || m.videoWidth;
      f.h = m.naturalHeight || m.videoHeight;
      m.closest('button')?.style.setProperty('--prop', f.w / f.h);
    });
    return [
      m,
      f.video && el('span', { class: 'play-badge', 'aria-hidden': 'true', text: '▶' }),
      el('span', { class: 'mini-legenda' }, legendaCommit(f.src, f.legenda)),
    ];
  }

  // Enquanto uma janela está aberta, o que fica atrás não rola nem recebe foco
  function atualizarFundo() {
    const album = $('#album');
    const temJanela = !lb.hidden || !album.hidden;
    document.body.style.overflow = temJanela ? 'hidden' : '';
    $$('body > header, body > main, body > footer').forEach((n) => (n.inert = temJanela));
    album.inert = !lb.hidden;
  }

  // Traz as vizinhas antes, na resolução que esta tela vai pedir
  function adiantar(f) {
    if (!f?.id) return;
    picture(f, tamanhoNaTela(f), {});
  }

  function abrir(i, lista = aberta) {
    if (lb.hidden) focoAntes = document.activeElement;
    aberta = lista;
    atual = (i + lista.length) % lista.length;
    const f = lista[atual];
    const pic = $('picture', lb);
    const img = $('img', lb);
    const fonte = $('source', lb);
    const video = $('video', lb);
    const original = $('.lb-original', lb);
    video.pause();
    pic.hidden = f.video;
    video.hidden = !f.video;
    if (f.video) {
      fonte.removeAttribute('srcset');
      img.removeAttribute('src');
      video.src = f.src;
      if (f.capa) video.poster = f.capa;
      else video.removeAttribute('poster');
      video.play().catch(() => {});
    } else {
      video.removeAttribute('src');
      if (f.id) {
        fonte.sizes = tamanhoNaTela(f);
        fonte.srcset = srcset(f);
        img.width = f.w;
        img.height = f.h;
        img.style.setProperty('--lb-largura', tamanhoNaTela(f));
        img.style.background = f.cor;
        adiantar(lista[(atual + 1) % lista.length]);
        adiantar(lista[(atual - 1 + lista.length) % lista.length]);
      } else {
        fonte.removeAttribute('srcset');
        img.removeAttribute('width');
        img.removeAttribute('height');
        img.removeAttribute('style');
      }
      img.classList.toggle('lb-ensaio', Boolean(f.id));
      img.src = f.src;
      img.alt = f.legenda;
    }
    original.hidden = !f.original;
    if (f.original) original.href = `/ensaio/originais/${f.id}.jpg`;
    $('.lb-contador', lb).textContent = `${atual + 1} / ${lista.length}`;
    $('figcaption', lb).replaceChildren(...legendaCommit(f.src, f.legenda));
    const abrindo = lb.hidden;
    lb.hidden = false;
    atualizarFundo();
    if (abrindo) $('.lb-close', lb).focus();
  }
  function fechar() {
    $('video', lb).pause();
    lb.hidden = true;
    atualizarFundo();
    focoAntes?.focus();
  }
  $('.lb-close', lb).onclick = fechar;
  $('.lb-prev', lb).onclick = () => abrir(atual - 1);
  $('.lb-next', lb).onclick = () => abrir(atual + 1);
  lb.addEventListener('click', (e) => e.target === lb && fechar());
  document.addEventListener('keydown', (e) => {
    if (lb.hidden) {
      if (e.key === 'Escape' && !$('#album').hidden) fecharAlbum();
      return;
    }
    if (e.key === 'Escape') fechar();
    if (e.key === 'ArrowLeft') abrir(atual - 1);
    if (e.key === 'ArrowRight') abrir(atual + 1);
  });
  // Arrastar com o dedo troca de foto (com dois dedos é zoom: não mexe)
  let toque = null;
  lb.addEventListener('touchstart', (e) => {
    toque = e.touches.length === 1 && e.target.tagName !== 'VIDEO' ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null;
  }, { passive: true });
  lb.addEventListener('touchend', (e) => {
    if (!toque || e.touches.length || (window.visualViewport?.scale || 1) > 1.05) return;
    const dx = e.changedTouches[0].clientX - toque.x;
    const dy = e.changedTouches[0].clientY - toque.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) abrir(atual + (dx < 0 ? 1 : -1));
    toque = null;
  }, { passive: true });

  // ---------- Carrossel (jornada + ensaio) e álbum em tela cheia ----------
  const faixa = $('#ensaio-faixa');
  const barra = $('#ensaio-barra');
  const album = $('#album');
  let ensaio = []; // fotos do álbum selecionado
  let focoAlbum = null;

  // '612-648, 701' → função que diz se o número final do arquivo está na lista
  const noIntervalo = (texto) => {
    const partes = texto.split(',').map((p) => p.trim().split('-').map(Number));
    return (n) => partes.some(([de, ate = de]) => n >= de && n <= ate);
  };

  function fecharAlbum() {
    album.hidden = true;
    $('#album-grade').replaceChildren();
    atualizarFundo();
    focoAlbum?.focus();
  }
  function abrirAlbum(nome) {
    focoAlbum = document.activeElement;
    $('#album-titulo').textContent = `${nome} (${ensaio.length})`;
    $('#album-grade').replaceChildren(
      ...ensaio.map((f, i) => {
        const b = el('button', { type: 'button', 'aria-label': `${f.video ? 'Ver vídeo' : 'Ampliar foto'} ${i + 1}: ${f.legenda}`, style: `--prop:${f.w / f.h};background:${f.cor}` },
          miniatura(f, `${Math.round(260 * f.w / f.h)}px`, { loading: 'lazy' })
        );
        b.onclick = () => abrir(i, ensaio);
        return b;
      })
    );
    album.hidden = false;
    album.scrollTop = 0;
    atualizarFundo();
    $('#album-titulo').focus();
  }
  $('#album-fechar').onclick = fecharAlbum;

  // Foto mais à esquerda entre as visíveis (no fim da faixa, a última)
  const inicioDe = (n) => n.offsetLeft - parseFloat(getComputedStyle(faixa).paddingLeft);
  function posicao() {
    if (faixa.scrollLeft + faixa.clientWidth >= faixa.scrollWidth - 4) return ensaio.length - 1;
    const recuo = parseFloat(getComputedStyle(faixa).paddingLeft);
    const i = [...faixa.children].findIndex((n) => n.offsetLeft - recuo + n.offsetWidth / 2 > faixa.scrollLeft);
    return Math.max(0, i);
  }
  function marcarPosicao() {
    const i = posicao();
    barra.value = i;
    barra.setAttribute('aria-valuetext', `Foto ${i + 1} de ${ensaio.length}`);
    barra.style.setProperty('--p', `${ensaio.length > 1 ? (i / (ensaio.length - 1)) * 100 : 100}%`);
    $('#ensaio-contador').textContent = `${i + 1} / ${ensaio.length}`;
    $('#ensaio-prev').disabled = faixa.scrollLeft <= 4;
    $('#ensaio-next').disabled = faixa.scrollLeft + faixa.clientWidth >= faixa.scrollWidth - 4;
  }
  const suave = () => (matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth');
  const andar = (dir) => faixa.scrollBy({ left: dir * faixa.clientWidth * 0.8, behavior: suave() });
  $('#ensaio-prev').onclick = () => andar(-1);
  $('#ensaio-next').onclick = () => andar(1);
  barra.oninput = () => {
    const i = Number(barra.value);
    const alvoScroll = i >= ensaio.length - 1 ? faixa.scrollWidth : inicioDe(faixa.children[i]);
    faixa.scrollTo({ left: alvoScroll, behavior: 'instant' });
  };
  let marcando = false;
  faixa.addEventListener('scroll', () => {
    if (marcando) return;
    marcando = true;
    requestAnimationFrame(() => { marcando = false; marcarPosicao(); });
  }, { passive: true });
  window.addEventListener('resize', () => ensaio.length && marcarPosicao());

  function montarFaixa(lista) {
    ensaio = lista;
    faixa.replaceChildren(
      ...lista.map((f, i) => {
        const b = el('button', { type: 'button', 'aria-label': `${f.video ? 'Ver vídeo' : 'Ampliar foto'} ${i + 1}: ${f.legenda}`, style: `--prop:${f.w / f.h};background:${f.cor}` },
          // mesma conta de --faixa-h no CSS (o atributo sizes não aceita variáveis)
          miniatura(f, `calc(min(520px, (100vw - 32px) / 1.5, 68vh) * ${(f.w / f.h).toFixed(4)})`, { loading: 'lazy', draggable: 'false' })
        );
        b.onclick = () => abrir(i, ensaio);
        return b;
      })
    );
    faixa.scrollTo({ left: 0, behavior: 'instant' });
    barra.max = Math.max(0, lista.length - 1);
    marcarPosicao();
  }

  if (cfg.ensaio) {
    Promise.all(['/api/fotos', '/api/ensaio'].map((u) => fetch(u).then((r) => r.json()).catch(() => [])))
      .then(([jornada, lista]) => {
        if (!jornada.length && !lista.length) return;
        jornada.forEach((f) => Object.assign(f, { w: 1, h: 1, cor: 'var(--line)' }));
        const albuns = (cfg.ensaio.albuns || []).map((a) => ({ nome: a.nome, tem: noIntervalo(a.fotos) }));
        const todas = lista.map((f) => {
          const n = Number(f.id.slice(-3));
          return { ...f, n, video: false, src: reserva(f), legenda: albuns.find((a) => a.tem(n))?.nome || cfg.ensaio.titulo };
        });
        const opcoes = [
          { nome: 'Todas', fotos: [...jornada, ...todas] },
          { nome: cfg.ensaio.jornada || 'A jornada', fotos: jornada },
          ...albuns.map((a) => ({ nome: a.nome, fotos: todas.filter((f) => a.tem(f.n)).map((f) => ({ ...f, legenda: a.nome })) })),
        ].filter((o) => o.fotos.length);

        let escolhida = opcoes[0];
        const chips = opcoes.map((o) => {
          const b = el('button', { type: 'button', class: 'chip' }, [o.nome, el('span', { text: String(o.fotos.length) })]);
          b.onclick = () => escolher(o);
          return b;
        });
        function escolher(o) {
          escolhida = o;
          chips.forEach((c, i) => c.setAttribute('aria-pressed', String(opcoes[i] === o)));
          $('#ensaio-todas').textContent = `Ver as ${o.fotos.length} juntas`;
          montarFaixa(o.fotos);
        }
        $('#ensaio-titulo').textContent = cfg.ensaio.titulo;
        $('#ensaio-texto').textContent = cfg.ensaio.texto || '';
        $('#ensaio-albuns').append(...chips);
        $('#ensaio-todas').onclick = () => abrirAlbum(escolhida === opcoes[0] ? cfg.ensaio.titulo : escolhida.nome);
        $('#ensaio').hidden = false;
        escolher(opcoes[0]);
      });
  }

  // ---------- Helpers de formulário ----------
  function msg(form, texto, tipo) {
    const p = $('.form-msg', form);
    p.textContent = texto;
    p.className = 'form-msg ' + (tipo || '');
  }
  // Erro exibido logo abaixo do campo (fica visível mesmo se o botão estiver longe)
  function erroCampo(input, texto) {
    let aviso = input.parentElement.querySelector('.field-err');
    if (!aviso) {
      aviso = el('span', { class: 'field-err', role: 'alert' });
      input.after(aviso);
      input.addEventListener('input', () => {
        input.removeAttribute('aria-invalid');
        aviso.textContent = '';
      });
    }
    aviso.textContent = texto;
    input.setAttribute('aria-invalid', 'true');
    const r = input.getBoundingClientRect();
    if (r.top < 90 || r.bottom > window.innerHeight) {
      window.scrollTo({ top: window.scrollY + r.top - window.innerHeight / 3, behavior: 'instant' });
    }
    input.focus({ preventScroll: true });
  }
  async function enviar(url, dados) {
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dados) });
    const json = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(json.erro || 'Não foi possível enviar. Tente novamente.');
    return json;
  }

  // ---------- Lista de presença ----------
  const rsvpForm = $('#rsvp-form');
  const rsvpDone = $('#rsvp-done');
  const CHAVE_RSVP = 'formatura:presenca';
  const pessoas = (n) => (Number(n) ? `você + ${n} ${Number(n) === 1 ? 'pessoa' : 'pessoas'}` : 'só você');

  function mostrarConfirmado(dados, focar) {
    const primeiro = dados.nome.trim().split(' ')[0];
    $('#rsvp-done-titulo').textContent = `Presença confirmada, ${primeiro}! 🎉`;
    $('#rsvp-done-texto').textContent = `Te espero na festa no ${cfg.festa.data.toLowerCase()} (${pessoas(dados.acompanhantes)}${dados.vegetariano ? ', cardápio vegetariano' : ''}).`;
    $('#rsvp-done-actions').replaceChildren(...linksAgenda(cfg.festa));
    rsvpForm.hidden = true;
    rsvpDone.hidden = false;
    if (focar) rsvpDone.focus();
    const cta = $('#cta-festa');
    if (cta) {
      cta.textContent = '✅ Presença confirmada';
      cta.className = 'btn btn-outline';
    }
  }

  $('#rsvp-editar').onclick = () => {
    const dados = guardado.ler(CHAVE_RSVP) || {};
    const f = rsvpForm.elements;
    f.nome.value = dados.nome || '';
    f.contato.value = dados.contato || '';
    f.mensagem.value = dados.mensagem || '';
    f.acompanhantes.value = String(dados.acompanhantes || 0);
    f.vegetariano.checked = Boolean(dados.vegetariano);
    msg(rsvpForm, '');
    rsvpDone.hidden = true;
    rsvpForm.hidden = false;
    f.nome.focus();
  };

  const jaConfirmou = guardado.ler(CHAVE_RSVP);
  if (jaConfirmou?.nome) mostrarConfirmado(jaConfirmou);

  async function confirmar() {
    const f = rsvpForm.elements;
    const dados = {
      nome: f.nome.value,
      contato: f.contato.value,
      colacao: false,
      festa: true,
      acompanhantes: f.acompanhantes.value,
      vegetariano: f.vegetariano.checked,
      mensagem: f.mensagem.value,
      site: f.site.value,
    };
    if (dados.nome.trim().length < 2) {
      msg(rsvpForm, 'Preencha seu nome no início do formulário.', 'err');
      return erroCampo(f.nome, 'Me conta seu nome 🙂');
    }
    const btn = $('button[type=submit]', rsvpForm);
    btn.disabled = true;
    btn.textContent = 'Enviando…';
    try {
      await enviar('/api/presencas', dados);
      guardado.salvar(CHAVE_RSVP, { nome: dados.nome, contato: dados.contato, acompanhantes: dados.acompanhantes, vegetariano: dados.vegetariano, mensagem: dados.mensagem });
      mostrarConfirmado(dados, true);
    } catch (e) {
      msg(rsvpForm, e.message, 'err');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Confirmar presença';
    }
  }
  rsvpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    confirmar();
  });

  // ---------- Mural de recados ----------
  const mural = $('#mural');
  const recadoForm = $('#recado-form');
  const fmtData = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

  function cardRecado(r, novo) {
    return el('article', { class: 'recado' + (novo ? ' novo' : '') }, [
      el('p', { text: r.texto }),
      el('footer', {}, [el('strong', { text: r.nome }), el('time', { datetime: r.criadoEm, text: fmtData.format(new Date(r.criadoEm)) })]),
    ]);
  }
  function muralVazio() {
    mural.replaceChildren(el('p', { class: 'mural-empty', text: 'Nenhum recado ainda. Que tal ser a primeira pessoa a escrever?' }));
  }

  const contador = $('#recado-contador');
  const atualizarContador = () => (contador.textContent = `${recadoForm.elements.texto.value.length}/600`);
  recadoForm.elements.texto.addEventListener('input', atualizarContador);

  fetch('/api/recados')
    .then((r) => r.json())
    .then((lista) => (lista.length ? mural.replaceChildren(...lista.map((r) => cardRecado(r))) : muralVazio()));

  recadoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = recadoForm.elements;
    if (f.nome.value.trim().length < 2) return erroCampo(f.nome, 'Coloque seu nome.');
    if (f.texto.value.trim().length < 2) return erroCampo(f.texto, 'Escreva um recado 🙂');
    const btn = $('button[type=submit]', recadoForm);
    btn.disabled = true;
    try {
      const r = await enviar('/api/recados', { nome: f.nome.value, texto: f.texto.value, site: f.site.value });
      f.texto.value = '';
      atualizarContador();
      msg(recadoForm, 'Recado enviado! Ele aparece no mural assim que eu aprovar 💙', 'ok');
    } catch (err) {
      msg(recadoForm, err.message, 'err');
    } finally {
      btn.disabled = false;
    }
  });

  // ---------- Animação ao rolar ----------
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => entries.forEach((en) => en.isIntersecting && (en.target.classList.add('in'), io.unobserve(en.target))), { threshold: 0.12 })
    : null;
  function observar() {
    $$('.reveal:not(.in)').forEach((n) => (io ? io.observe(n) : n.classList.add('in')));
  }
  observar();
})();
