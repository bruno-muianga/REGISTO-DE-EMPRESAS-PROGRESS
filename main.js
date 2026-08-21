/* ═══════════════════════════════════════════════════════
   PROGRESS CONSULTING — QUIZ LOGIC & QUALIFICAÇÃO
   ═══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ── 1. RASTREIO & META PIXEL ──
  function trackEvent(eventName, eventData = {}) {
    const timestamp = new Date().toISOString();
    console.group(`[PROGRESS ANALYTICS] ${eventName}`);
    console.log(`Hora: ${timestamp}`);
    console.log('Dados:', eventData);
    console.groupEnd();

    if (typeof fbq === 'function') {
      fbq('trackCustom', eventName, eventData);
    }
  }

  trackEvent('QuizView', {
    page: document.title,
    theme: 'Lead Qualification Quiz'
  });

  // ── 2. ESTADO DO QUIZ ──
  let currentStep = 1;
  const totalSteps = 6;

  const quizState = {
    necessidade: '',
    actividade: '',
    socios: '',
    autoridade: '',
    prazo: '',
    contacto: {
      nome_completo: '',
      nome_empresa: '',
      whatsapp: '',
      celular: '',
      cidade: '',
      email: ''
    }
  };

  // DOM Elements
  const steps = document.querySelectorAll('.quiz-step');
  const stepCounter = document.getElementById('step-counter');
  const stepPercentage = document.getElementById('step-percentage');
  const progressBar = document.getElementById('progress-bar');
  const form = document.getElementById('qualification-quiz-form');
  const resultScreen = document.getElementById('result-screen');
  const resultTitle = document.getElementById('result-title');
  const resultMessage = document.getElementById('result-message');
  const recommendationCard = document.getElementById('recommendation-card');
  const btnWhatsappAction = document.getElementById('btn-whatsapp-action');

  // ── 3. ATUALIZAR PROGRESSO ──
  function updateProgress() {
    const pct = Math.round((currentStep / totalSteps) * 100);
    if (stepCounter) stepCounter.textContent = `Pergunta ${currentStep} de ${totalSteps}`;
    if (stepPercentage) stepPercentage.textContent = `${pct}%`;
    if (progressBar) progressBar.style.width = `${pct}%`;
  }

  // ── 4. NAVEGAÇÃO ENTRE ETAPAS ──
  function goToStep(targetStep) {
    if (targetStep < 1 || targetStep > totalSteps) return;

    steps.forEach(s => s.classList.remove('active'));

    const nextStepEl = document.querySelector(`.quiz-step[data-step="${targetStep}"]`);
    if (nextStepEl) {
      nextStepEl.classList.add('active');
      currentStep = targetStep;
      updateProgress();

      const card = document.getElementById('quiz-card');
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  // ── 5. SELEÇÃO DE OPÇÕES (AVANÇO AUTOMÁTICO SUAVE) ──
  document.querySelectorAll('.option-item').forEach(item => {
    const radio = item.querySelector('input[type="radio"]');

    item.addEventListener('click', (e) => {
      if (!radio) return;

      if (e.target !== radio) {
        radio.checked = true;
      }

      const name = radio.getAttribute('name');
      const container = item.closest('.options-list') || item.closest('.options-grid-2col');

      // Limpar seleção anterior do grupo
      container.querySelectorAll('.option-item').forEach(opt => opt.classList.remove('selected'));
      item.classList.add('selected');

      // Guardar resposta
      quizState[name] = radio.value;

      // Habilitar botão Continuar desta etapa
      const currentStepEl = item.closest('.quiz-step');
      const continueBtn = currentStepEl.querySelector('.btn-next');
      if (continueBtn) {
        continueBtn.disabled = false;
      }

      trackEvent('QuizStepAnswered', {
        step: currentStep,
        field: name,
        value: radio.value
      });

      // Avanço automático nas etapas 1 a 5
      if (currentStep < 6) {
        setTimeout(() => {
          goToStep(currentStep + 1);
        }, 300);
      }
    });
  });

  // ── 6. BOTÕES CONTINUAR & VOLTAR ──
  document.querySelectorAll('.btn-next').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = parseInt(btn.getAttribute('data-goto'), 10);
      if (target) goToStep(target);
    });
  });

  document.querySelectorAll('.btn-back').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = parseInt(btn.getAttribute('data-goto'), 10);
      if (target) goToStep(target);
    });
  });

  // ── 7. MOTOR DE RECOMENDAÇÃO CONDICIONAL ──
  function buildRecommendation(state) {
    let title = "Diagnóstico Estratégico de Formalização";
    let desc = "Preparámos a melhor estratégia documental e societária para o seu negócio em Moçambique.";
    let checklist = [
      "Certidão Comercial na Conservatória",
      "Atribuição de NUIT Colectivo",
      "Alvará / Licença de Actividade",
      "Inscrição no INSS e Finanças"
    ];

    if (state.necessidade.includes("contrato") || state.necessidade.includes("cliente")) {
      title = "Regularização Prioritária para Responder a Clientes";
      desc = `Com a exigência documental imediata no sector de <strong>${state.actividade}</strong>, a nossa equipa dará prioridade à certidão expressa e NUIT para desbloquear o seu contrato.`;
      checklist = [
        "Tramitação expressa de Certidão Comercial",
        "Registo de NUIT de pessoa colectiva",
        "Declaração comprovativa para fornecedores",
        "Enquadramento fiscal ágil"
      ];
    } else if (state.necessidade.includes("Constituir uma nova empresa")) {
      title = "Constituição de Nova Empresa com Estrutura Adequada";
      desc = `Para o seu novo projeto no ramo de <strong>${state.actividade}</strong> com <strong>${state.socios}</strong>, estruturamos os estatutos societários com máxima protecção do património.`;
      checklist = [
        "Reserva de Denominação Comercial",
        "Elaboração de Estatutos Sociais",
        "Publicação no Boletim da República",
        "Apoio na abertura de conta bancária empresarial"
      ];
    } else if (state.actividade.includes("Construção") || state.actividade.includes("Transporte")) {
      title = "Licenciamento Setorial & Enquadramento Operacional";
      desc = `Para operações no ramo de <strong>${state.actividade}</strong>, tratamos das autorizações ministeriais e alvarás obrigatórios para actuar no mercado com segurança.`;
      checklist = [
        "Alvará de Construção / Transporte",
        "Registo de Entidade Empregadora no INSS",
        "Inscrição na Repartição de Finanças",
        "Homologação de Horário de Trabalho"
      ];
    }

    return { title, desc, checklist };
  }

  // ── 8. SUBMISSÃO FINAL (ETAPA 6) ──
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const nomeInp = document.getElementById('inp-nome');
      const empresaInp = document.getElementById('inp-empresa');
      const telInp = document.getElementById('inp-whatsapp');
      const celInp = document.getElementById('inp-celular');
      const cidadeInp = document.getElementById('inp-cidade');
      const emailInp = document.getElementById('inp-email');
      const consentInp = document.getElementById('inp-consent');

      const nome = nomeInp.value.trim();
      const empresa = empresaInp.value.trim();
      const whatsapp = telInp.value.trim();
      const celular = celInp.value.trim();
      const cidade = cidadeInp.value.trim();
      const email = emailInp.value.trim();

      if (!nome || !empresa || !whatsapp || !celular || !cidade) {
        alert('Por favor, preencha todos os campos obrigatórios assinalados com *.');
        return;
      }

      if (!consentInp.checked) {
        alert('Por favor, confirme a autorização para o contacto.');
        return;
      }

      quizState.contacto = {
        nome_completo: nome,
        nome_empresa: empresa,
        whatsapp: whatsapp,
        celular: celular,
        cidade: cidade,
        email: email || 'Não informado'
      };

      const submitBtn = document.getElementById('btn-submit');
      if (submitBtn) {
        submitBtn.querySelector('span').textContent = 'A estruturar o seu parecer...';
        submitBtn.disabled = true;
      }

      // ── Meta Pixel Lead Tracking ──
      if (typeof fbq === 'function') {
        fbq('track', 'Lead', {
          content_name: 'Quiz Qualificação Progress Consulting',
          content_category: 'Formalização de Empresas Moçambique',
          value: 1,
          currency: 'MZN',
          fn: quizState.contacto.nome_completo,
          ph: quizState.contacto.celular || quizState.contacto.whatsapp,
          em: quizState.contacto.email
        });
        fbq('track', 'SubmitApplication', {
          content_name: 'Lead Qualificado'
        });
      }

      trackEvent('LeadFormSubmitted', quizState);

      const rec = buildRecommendation(quizState);

      // ── Formatar Mensagem WhatsApp ──
      const targetPhone = "258875705880";
      let msg = `Olá Progress Consulting!\n\nAcabei de concluir a Avaliação de Formalização no vosso site.\n\n`;
      msg += `*Nome:* ${quizState.contacto.nome_completo}\n`;
      msg += `*Empresa/Projeto:* ${quizState.contacto.nome_empresa}\n`;
      msg += `*WhatsApp:* ${quizState.contacto.whatsapp}\n`;
      msg += `*Celular / Chamadas:* ${quizState.contacto.celular}\n`;
      msg += `*Cidade:* ${quizState.contacto.cidade}\n\n`;
      msg += `*— Resumo da Avaliação —*\n`;
      msg += `*Necessidade:* ${quizState.necessidade}\n`;
      msg += `*Actividade:* ${quizState.actividade}\n`;
      msg += `*Sócios:* ${quizState.socios}\n`;
      msg += `*Decisão:* ${quizState.autoridade}\n`;
      msg += `*Prazo:* ${quizState.prazo}\n\n`;
      msg += `*Orientação Recomendada:* ${rec.title}\n`;
      msg += `Gostaria de saber os próximos passos e custos.`;

      const whatsappUrl = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(msg)}`;

      if (btnWhatsappAction) {
        btnWhatsappAction.href = whatsappUrl;
      }

      // Abrir WhatsApp sincronamente
      window.open(whatsappUrl, '_blank');

      // ── Envio Assíncrono para Google Sheets CRM ──
      const googleSheetsUrl = "https://script.google.com/macros/s/AKfycbzDJgxoFkzctspm7bm1w40mCMLcD1rjPY2e0Lyd2e2sGEP0sC20y7rqWTvdD0CP7faLOA/exec";
      fetch(googleSheetsUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quizState)
      })
      .then(() => console.log('[Progress] ✅ Dados enviados com sucesso para a base de dados.'))
      .catch(err => console.error('[Progress] ❌ Erro de envio:', err));

      // ── Exibir Ecrã de Resultado no mesmo painel ──
      if (resultTitle) resultTitle.textContent = rec.title;
      if (resultMessage) resultMessage.innerHTML = rec.desc;

      if (recommendationCard) {
        let checklistHTML = rec.checklist.map(item => `
          <div class="rec-check-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <span>${item}</span>
          </div>
        `).join('');

        recommendationCard.innerHTML = `
          <span class="rec-title">PARECER RECOMENDADO</span>
          <p class="rec-body">${rec.desc}</p>
          <div class="rec-checklist-grid">
            ${checklistHTML}
          </div>
        `;
      }

      form.style.display = 'none';
      document.querySelector('.progress-section').style.display = 'none';
      resultScreen.style.display = 'block';

      const card = document.getElementById('quiz-card');
      if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // Inicializar barra de progresso
  updateProgress();
});
