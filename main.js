/* ═══════════════════════════════════════
   PROGRESS CONSULTING — JAVASCRIPT LOGIC
   ═══════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. EVENTOS DE RASTREAMENTO (CRO / TAGS)
  // ==========================================
  
  // Função auxiliar para registar eventos na consola e Meta Pixel (fbq)
  function trackEvent(eventName, eventData = {}) {
    const timestamp = new Date().toISOString();
    console.group(`[TRACKING EVENT] ${eventName}`);
    console.log(`Hora: ${timestamp}`);
    console.log('Dados:', eventData);
    console.groupEnd();

    // Disparar evento personalizado no Meta Pixel se estiver carregado
    if (typeof fbq === 'function') {
      fbq('trackCustom', eventName, eventData);
    }
  }

  // Registar carregamento da página
  trackEvent('ViewContent', {
    page_title: document.title,
    page_path: window.location.pathname,
    category: 'Formalização de Empresas Moçambique'
  });

  // Rastrear cliques em botões de CTA
  document.querySelectorAll('a[href="#formulario-anchor"]').forEach(button => {
    button.addEventListener('click', (e) => {
      const sourceId = button.id || 'unknown';
      const sourceText = button.textContent.trim().substring(0, 40);
      trackEvent('CTAClick', {
        cta_id: sourceId,
        cta_text: sourceText,
        target_section: 'formulario'
      });
    });
  });

  // Rastrear clique no WhatsApp do footer
  const whatsappFooter = document.getElementById('whatsapp-footer-link');
  if (whatsappFooter) {
    whatsappFooter.addEventListener('click', () => {
      trackEvent('WhatsAppClick', {
        placement: 'footer',
        phone: whatsappFooter.textContent.trim()
      });
    });
  }


  // ==========================================
  // 2. NAVBAR SCROLL & MENU MOBILE HAMBURGER
  // ==========================================
  const navbar = document.getElementById('navbar');
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Adicionar classe scrolled ao navbar ao fazer scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  // Toggle do menu mobile
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', !expanded);
      navMenu.classList.toggle('open');
    });

    // Fechar menu mobile ao clicar num link
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('open');
      });
    });
  }


  // ==========================================
  // 3. ANIMAÇÕES DE REVEAL AO SCROLL
  // ==========================================
  const revealElements = document.querySelectorAll(
    '.scenario-card, .progress-step-card, .stage-item, .deliverable-card, .checklist-card, .faq-item, .vertical-timeline .timeline-step'
  );

  revealElements.forEach((el, index) => {
    el.classList.add('reveal');
    const delay = (index % 3) * 0.1;
    el.style.transitionDelay = `${delay}s`;
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => observer.observe(el));

  // Animar elementos de cabeçalho das secções
  document.querySelectorAll('.section-title, .section-label, .section-desc').forEach((el, index) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${index * 0.05}s`;
    observer.observe(el);
  });


  // ==========================================
  // 4. FAQ ACCORDION
  // ==========================================
  const faqButtons = document.querySelectorAll('.faq-btn');
  faqButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      const panelId = btn.getAttribute('aria-controls');
      const panel = document.getElementById(panelId);

      faqButtons.forEach(otherBtn => {
        if (otherBtn !== btn) {
          otherBtn.setAttribute('aria-expanded', 'false');
          const otherPanelId = otherBtn.getAttribute('aria-controls');
          const otherPanel = document.getElementById(otherPanelId);
          if (otherPanel) otherPanel.classList.remove('open');
        }
      });

      if (isExpanded) {
        btn.setAttribute('aria-expanded', 'false');
        panel.classList.remove('open');
      } else {
        btn.setAttribute('aria-expanded', 'true');
        panel.classList.add('open');
      }
    });
  });


  // ==========================================
  // 5. STICKY CTA MOBILE INTELIGENTE
  // ==========================================
  const stickyCtaMobile = document.getElementById('sticky-cta-mobile');
  const heroSection = document.getElementById('hero');
  const formSection = document.getElementById('formulario');

  if (stickyCtaMobile && heroSection && formSection) {
    window.addEventListener('scroll', () => {
      const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
      const formTop = formSection.offsetTop;
      const formBottom = formSection.offsetTop + formSection.offsetHeight;

      const passedHero = window.scrollY > heroBottom - 200;
      const beforeForm = window.scrollY < formTop - 400;
      const afterForm = window.scrollY > formBottom;

      if (passedHero && (beforeForm || afterForm)) {
        stickyCtaMobile.classList.remove('hidden');
      } else {
        stickyCtaMobile.classList.add('hidden');
      }
    }, { passive: true });
  }


  // ==========================================
  // 6. FORMULÁRIO DE QUALIFICAÇÃO MULTI-STEP
  // ==========================================
  const form = document.getElementById('qualification-form');
  const steps = document.querySelectorAll('.form-step');
  const progressBar = document.getElementById('progress-bar');
  const progressLabel = document.getElementById('progress-label');
  const successView = document.getElementById('success-view');

  let currentStep = 1;
  const totalSteps = steps.length; // 8 etapas
  let formStarted = false;
  
  const formAnswers = {
    motivacao: '',
    perda_oportunidade: '',
    relacao_negocio: '',
    recursos: '',
    prazo: '',
    situacao_atual: '',
    duvida_principal: '',
    contacto: {
      nome_completo: '',
      nome_negocio: '',
      whatsapp: '',
      email: '',
      cidade: ''
    }
  };

  function updateProgress() {
    const percentage = (currentStep / totalSteps) * 100;
    progressBar.style.width = `${percentage}%`;
    progressLabel.textContent = `Pergunta ${currentStep} de ${totalSteps}`;
  }

  function goToStep(stepNum) {
    if (stepNum < 1 || stepNum > totalSteps) return;
    
    document.querySelector('.form-step.active').classList.remove('active');
    const nextStepEl = document.querySelector(`.form-step[data-step="${stepNum}"]`);
    nextStepEl.classList.add('active');
    
    currentStep = stepNum;
    updateProgress();
    
    const formAnchor = document.getElementById('formulario-anchor');
    if (formAnchor) {
      const offset = 100;
      const top = formAnchor.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }

  document.querySelectorAll('.option-card').forEach(card => {
    const radio = card.querySelector('input[type="radio"]');
    
    card.addEventListener('click', (e) => {
      if (e.target !== radio) {
        radio.checked = true;
      }
      
      const name = radio.getAttribute('name');
      document.querySelectorAll(`input[name="${name}"]`).forEach(input => {
        input.closest('.option-card').classList.remove('selected-active');
      });
      
      card.classList.add('selected-active');
      formAnswers[name] = radio.value;

      if (!formStarted) {
        formStarted = true;
        trackEvent('FormStart', {
          first_question: 'motivacao',
          answer: radio.value
        });
      }

      trackEvent('FormStepCompleted', {
        step: currentStep,
        question_name: name,
        answer: radio.value
      });

      setTimeout(() => {
        if (currentStep < totalSteps) {
          goToStep(currentStep + 1);
        }
      }, 350);
    });
  });

  document.querySelectorAll('.btn-next').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      
      if (currentStep === 7) {
        const textarea = document.getElementById('duvida_principal');
        formAnswers.duvida_principal = textarea.value.trim();
        
        trackEvent('FormStepCompleted', {
          step: 7,
          question_name: 'duvida_principal',
          answer: formAnswers.duvida_principal || '(Vazio)'
        });
        
        goToStep(8);
        return;
      }

      const currentStepEl = document.querySelector(`.form-step[data-step="${currentStep}"]`);
      const selectedRadio = currentStepEl.querySelector('input[type="radio"]:checked');
      
      if (!selectedRadio) {
        alert('Por favor, selecione uma opção para continuar.');
        return;
      }
      
      goToStep(currentStep + 1);
    });
  });

  document.querySelectorAll('.btn-prev').forEach(btn => {
    btn.addEventListener('click', () => {
      goToStep(currentStep - 1);
    });
  });

  // Rastrear clique direto no último botão de envio do formulário (#form-submit)
  const submitBtnEl = document.getElementById('form-submit');
  if (submitBtnEl) {
    submitBtnEl.addEventListener('click', () => {
      if (typeof fbq === 'function') {
        fbq('trackCustom', 'CliqueBotaoEnviar', {
          button_id: 'form-submit',
          button_text: 'Submeter e Iniciar Orientação',
          page_location: window.location.href
        });
        console.log('[Meta Pixel] Evento Custom (CliqueBotaoEnviar) disparado ao clicar no botão final.');
      }
      trackEvent('SubmitFormButtonClick', { button_id: 'form-submit' });
    });
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Submissão Final do Formulário — Google Sheets + WhatsApp + Meta Pixel
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nome = document.getElementById('nome_completo').value.trim();
    const negocio = document.getElementById('nome_negocio').value.trim();
    const whatsapp = document.getElementById('whatsapp').value.trim();
    const email = document.getElementById('email').value.trim();
    const cidade = document.getElementById('cidade').value.trim();

    if (!nome || !negocio || !whatsapp || !email || !cidade) {
      alert('Por favor, preencha todos os campos obrigatórios marcados com *.');
      return;
    }

    if (!isValidEmail(email)) {
      alert('Por favor, introduza um endereço de e-mail válido.');
      return;
    }

    formAnswers.contacto = {
      nome_completo: nome,
      nome_negocio: negocio,
      whatsapp: whatsapp,
      email: email,
      cidade: cidade
    };

    const submitBtn = document.getElementById('form-submit');
    const originalBtnHTML = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
      submitBtn.textContent = 'A processar...';
      submitBtn.disabled = true;
    }

    // ── META PIXEL: disparar eventos Lead e SubmitApplication (Facebook Ads) ─────────────
    if (typeof fbq === 'function') {
      fbq('track', 'Lead', {
        content_name: 'Formulário de Qualificação',
        content_category: 'Formalização de Empresas',
        value: 1,
        currency: 'MZN',
        // Dados de contacto para correspondência avançada
        em: formAnswers.contacto.email,
        ph: formAnswers.contacto.whatsapp,
        fn: formAnswers.contacto.nome_completo
      });
      fbq('track', 'SubmitApplication', {
        content_name: 'Formulário de Qualificação'
      });
      console.log('[Meta Pixel] Eventos Lead e SubmitApplication disparados com sucesso.');
    }

    // ── CONSOLE CRO ─────────────────────────────────────────────────
    trackEvent('Lead', formAnswers);

    // ── 1. FORMATAR URL DO WHATSAPP ──────────────────────────────────
    const targetPhone = "258875705880";
    let messageText = `Olá Progress Consulting!\n\nAcabei de preencher o formulário de qualificação na Landing Page. Aqui estão as respostas do meu negócio para a orientação inicial:\n\n`;
    messageText += `*1. Motivação:* ${formAnswers.motivacao}\n`;
    messageText += `*2. Já perdeu oportunidade:* ${formAnswers.perda_oportunidade}\n`;
    messageText += `*3. Relação com o negócio:* ${formAnswers.relacao_negocio}\n`;
    messageText += `*4. Recursos reservados:* ${formAnswers.recursos}\n`;
    messageText += `*5. Quando pretende começar:* ${formAnswers.prazo}\n`;
    messageText += `*6. Situação atual:* ${formAnswers.situacao_atual}\n`;
    messageText += `*7. Principal dúvida:* ${formAnswers.duvida_principal || 'Nenhuma'}\n\n`;
    messageText += `*Dados de Contacto:*\n`;
    messageText += `- *Nome:* ${formAnswers.contacto.nome_completo}\n`;
    messageText += `- *Negócio:* ${formAnswers.contacto.nome_negocio}\n`;
    messageText += `- *WhatsApp:* ${formAnswers.contacto.whatsapp}\n`;
    messageText += `- *E-mail:* ${formAnswers.contacto.email}\n`;
    messageText += `- *Cidade:* ${formAnswers.contacto.cidade}\n`;

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(messageText)}`;

    // ── 2. ABRIR WHATSAPP EM NOVA ABA (síncrono — não é bloqueado) ──
    // IMPORTANTE: window.open aqui é SÍNCRONO dentro do event handler.
    // Browsers só bloqueiam window.open em setTimeout/Promises — aqui funciona sempre.
    window.open(whatsappUrl, '_blank');

    // ── 3. ENVIAR PARA GOOGLE SHEETS ─────────────────────────────────
    // Como não navegamos para fora desta página (WhatsApp abriu em nova aba),
    // o fetch normal completa sem ser interrompido — 100% fiável.
    const googleSheetsScriptUrl = "https://script.google.com/macros/s/AKfycbzDJgxoFkzctspm7bm1w40mCMLcD1rjPY2e0Lyd2e2sGEP0sC20y7rqWTvdD0CP7faLOA/exec";
    fetch(googleSheetsScriptUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formAnswers)
    })
    .then(() => console.log('[Progress] ✅ Dados enviados para Google Sheets com sucesso.'))
    .catch(err => console.error('[Progress] ❌ Erro ao enviar para Google Sheets:', err));

    // ── 4. ATUALIZAR INTERFACE COM SUCESSO ───────────────────────────
    form.style.display = 'none';
    document.querySelector('.progress-bar-container').style.display = 'none';
    document.querySelector('.form-title').textContent = 'Informação Enviada';
    document.querySelector('.form-subtitle').style.display = 'none';
    successView.style.display = 'block';

    const formAnchor = document.getElementById('formulario-anchor');
    if (formAnchor) {
      const top = formAnchor.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: 'smooth' });
    }

    submitBtn.innerHTML = originalBtnHTML;
    submitBtn.disabled = false;
  });

  // ==========================================
  // 7. LINKS DE SCROLL SUAVE PARA ANCORAS
  // ==========================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        
        const offset = 80;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = targetEl.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

});
