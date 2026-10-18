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
    'font: 600 16px sans-serif; color: #0b7f80',
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
  const gallery = $('#gallery');
  const lb = $('#lightbox');
  let fotos = [];
  let atual = 0;

  function abrir(i) {
    atual = (i + fotos.length) % fotos.length;
    $('img', lb).src = fotos[atual].src;
    $('img', lb).alt = fotos[atual].legenda;
    $('figcaption', lb).replaceChildren(...legendaCommit(fotos[atual].src, fotos[atual].legenda));
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function fechar() {
    lb.hidden = true;
    document.body.style.overflow = '';
  }
  $('.lb-close', lb).onclick = fechar;
  $('.lb-prev', lb).onclick = () => abrir(atual - 1);
  $('.lb-next', lb).onclick = () => abrir(atual + 1);
  lb.addEventListener('click', (e) => e.target === lb && fechar());
  document.addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'Escape') fechar();
    if (e.key === 'ArrowLeft') abrir(atual - 1);
    if (e.key === 'ArrowRight') abrir(atual + 1);
  });

  fetch('/api/fotos')
    .then((r) => r.json())
    .then((lista) => {
      fotos = lista;
      if (!fotos.length) {
        const exemplos = ['primeiro dia', 'laboratório', 'turma', 'apresentação do TCC', 'hackathon', 'café com a galera'];
        gallery.append(
          ...exemplos.map((t) =>
            el('figure', { class: 'placeholder' }, [
              el('span', {}, legendaCommit(t, t)),
            ])
          )
        );
        gallery.after(el('p', { class: 'gallery-empty-note', text: '📷 Fotos chegando no próximo commit.' }));
        return;
      }
      gallery.append(
        ...fotos.map((f, i) => {
          const fig = el('figure', { tabindex: '0', class: 'reveal' }, [
            el('img', { src: f.src, alt: f.legenda, loading: 'lazy' }),
            f.legenda && el('figcaption', {}, legendaCommit(f.src, f.legenda)),
          ]);
          fig.onclick = () => abrir(i);
          fig.onkeydown = (e) => e.key === 'Enter' && abrir(i);
          return fig;
        })
      );
      observar();
    });

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
