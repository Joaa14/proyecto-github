/**
 * NexusFlow - Interactive Landing Page Logic & Simulation Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeroCopy();
  initCanvasSimulation();
  initNodeModals();
  initFeatureTabs();
  initTemplateFilters();
  initSelfHostTabs();
  initPricingToggle();
  initFaqAccordion();
  initMobileNav();
  initDynamicWires();
});

/* ==========================================================================
   1. Dynamic SVG Connector Wires (Connects nodes accurately)
   ========================================================================== */
function initDynamicWires() {
  const canvasWorkspace = document.getElementById('canvas-workspace');
  if (!canvasWorkspace) return;

  function updateWires() {
    const n1 = document.getElementById('node-1');
    const n2 = document.getElementById('node-2');
    const n3 = document.getElementById('node-3');
    const n4 = document.getElementById('node-4');
    const n5 = document.getElementById('node-5');

    const path12 = document.getElementById('path-1-2');
    const path23 = document.getElementById('path-2-3');
    const path34 = document.getElementById('path-3-4');
    const path35 = document.getElementById('path-3-5');

    if (!n1 || !n2 || !n3 || !n4 || !n5) return;

    // Helper to calculate bezier curve between node right-edge and target left-edge
    function createCurve(elFrom, elTo) {
      const fromX = elFrom.offsetLeft + elFrom.offsetWidth;
      const fromY = elFrom.offsetTop + (elFrom.offsetHeight / 2);
      const toX = elTo.offsetLeft;
      const toY = elTo.offsetTop + (elTo.offsetHeight / 2);

      const dx = Math.abs(toX - fromX) * 0.55;
      return `M ${fromX} ${fromY} C ${fromX + dx} ${fromY}, ${toX - dx} ${toY}, ${toX} ${toY}`;
    }

    if (path12) path12.setAttribute('d', createCurve(n1, n2));
    if (path23) path23.setAttribute('d', createCurve(n2, n3));
    if (path34) path34.setAttribute('d', createCurve(n3, n4));
    if (path35) path35.setAttribute('d', createCurve(n3, n5));
  }

  // Initial draw and update on window resize
  updateWires();
  window.addEventListener('resize', updateWires);
}

/* ==========================================================================
   2. Interactive Workflow Simulation Engine (n8n-like execution)
   ========================================================================== */
function initCanvasSimulation() {
  const btnRun = document.getElementById('btn-run-simulation');
  const btnReset = document.getElementById('btn-reset-flow');
  const statusPill = document.getElementById('flow-status-pill');
  const statusLabel = document.getElementById('flow-status-label');
  const timerDisplay = document.getElementById('exec-timer');
  const logsContainer = document.getElementById('inspector-logs');
  const btnToggleInspector = document.getElementById('btn-toggle-inspector');

  if (!btnRun) return;

  let isRunning = false;
  let timerInterval = null;
  let startTime = 0;

  // Toggle console collapse
  if (btnToggleInspector) {
    btnToggleInspector.addEventListener('click', () => {
      const drawer = document.getElementById('canvas-inspector');
      drawer.classList.toggle('collapsed');
      btnToggleInspector.style.transform = drawer.classList.contains('collapsed') ? 'rotate(180deg)' : 'rotate(0deg)';
    });
  }

  function addLog(tagClass, tagText, message) {
    const now = new Date();
    const timeStr = `[${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(Math.floor(now.getMilliseconds() / 10)).padStart(2, '0')}]`;
    
    const row = document.createElement('div');
    row.className = 'log-entry';
    row.innerHTML = `
      <span class="log-time">${timeStr}</span>
      <span class="log-tag ${tagClass}">${tagText}</span>
      <span>${message}</span>
    `;
    logsContainer.appendChild(row);
    logsContainer.scrollTop = logsContainer.scrollHeight;
  }

  function animatePacket(packetId, pathId, duration) {
    return new Promise(resolve => {
      const packet = document.getElementById(packetId);
      const path = document.getElementById(pathId);
      if (!packet || !path) {
        resolve();
        return;
      }

      path.classList.add('active-wire');
      packet.style.opacity = '1';
      const pathLength = path.getTotalLength();
      const start = performance.now();

      function step(timestamp) {
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / duration, 1);
        const point = path.getPointAtLength(progress * pathLength);
        
        packet.setAttribute('cx', point.x);
        packet.setAttribute('cy', point.y);

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          packet.style.opacity = '0';
          setTimeout(() => path.classList.remove('active-wire'), 400);
          resolve();
        }
      }
      requestAnimationFrame(step);
    });
  }

  function resetFlow() {
    if (isRunning) return;
    clearInterval(timerInterval);
    timerDisplay.textContent = '0.00ms';
    statusPill.className = 'flow-status-pill';
    statusLabel.textContent = 'Listo para ejecutar';

    for (let i = 1; i <= 5; i++) {
      const node = document.getElementById(`node-${i}`);
      const ind = document.getElementById(`ind-${i}`);
      const metric = document.getElementById(`metric-${i}`);
      if (node) node.className = node.className.replace(/\b(executing|success)\b/g, '').trim();
      if (ind) ind.className = 'node-indicator';
      if (metric) {
        metric.classList.remove('status-ok');
        if (i === 1) metric.textContent = 'Esperando evento...';
        if (i === 2) metric.textContent = 'Listo (Node.js runtime)';
        if (i === 3) metric.textContent = 'Evaluar intención & ROI';
        if (i === 4) metric.textContent = 'Conexión cifrada';
        if (i === 5) metric.textContent = 'Notificación instantánea';
      }
    }

    logsContainer.innerHTML = `
      <div class="log-entry log-ready">
        <span class="log-time">[00:00:00]</span>
        <span class="log-tag tag-system">SYSTEM</span>
        <span>Flujo reiniciado. Haz clic en <strong>"Ejecutar Flujo de Prueba"</strong> para iniciar.</span>
      </div>
    `;
  }

  btnReset.addEventListener('click', resetFlow);

  btnRun.addEventListener('click', async () => {
    if (isRunning) return;
    isRunning = true;
    btnRun.classList.add('is-executing');
    btnRun.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="spin"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a10 10 0 0 1 10 10"></path></svg> <span>Ejecutando...</span>`;

    statusPill.className = 'flow-status-pill running';
    statusLabel.textContent = 'Procesando pipeline...';

    // Start Timer
    startTime = performance.now();
    timerInterval = setInterval(() => {
      const diff = performance.now() - startTime;
      timerDisplay.textContent = `${diff.toFixed(1)}ms`;
    }, 30);

    logsContainer.innerHTML = '';
    addLog('tag-system', 'SYSTEM', 'Iniciando pipeline de ejecución #exec-938210...');

    try {
      // Step 1: Webhook Node
      const n1 = document.getElementById('node-1');
      const ind1 = document.getElementById('ind-1');
      const m1 = document.getElementById('metric-1');
      n1.classList.add('executing');
      if (ind1) ind1.className = 'node-indicator active';
      addLog('tag-trigger', 'WEBHOOK', 'Recibido POST /api/v1/leads con payload {"email": "alex@enterprise.io", "company": "Vortex AI"}');
      await new Promise(r => setTimeout(r, 450));
      n1.classList.remove('executing');
      n1.classList.add('success');
      if (ind1) ind1.className = 'node-indicator done';
      m1.textContent = '200 OK (3.2ms)';
      m1.classList.add('status-ok');

      // Packet 1 -> 2
      await animatePacket('packet-1', 'path-1-2', 500);

      // Step 2: Code Node
      const n2 = document.getElementById('node-2');
      const ind2 = document.getElementById('ind-2');
      const m2 = document.getElementById('metric-2');
      n2.classList.add('executing');
      if (ind2) ind2.className = 'node-indicator active';
      addLog('tag-code', 'JS CLEANSE', 'Ejecutando normalizeEmail() y validación MX de dominio en V8 Sandbox.');
      await new Promise(r => setTimeout(r, 400));
      n2.classList.remove('executing');
      n2.classList.add('success');
      if (ind2) ind2.className = 'node-indicator done';
      m2.textContent = 'Validado (8.1ms)';
      m2.classList.add('status-ok');

      // Packet 2 -> 3
      await animatePacket('packet-2', 'path-2-3', 500);

      // Step 3: AI LLM Node
      const n3 = document.getElementById('node-3');
      const ind3 = document.getElementById('ind-3');
      const m3 = document.getElementById('metric-3');
      n3.classList.add('executing');
      if (ind3) ind3.className = 'node-indicator active';
      addLog('tag-ai', 'AI AGENT', 'Consultando Claude 3.5 Sonnet: "Evaluar lead enterprise y estimar presupuesto potencial..."');
      await new Promise(r => setTimeout(r, 750));
      n3.classList.remove('executing');
      n3.classList.add('success');
      if (ind3) ind3.className = 'node-indicator done';
      m3.textContent = 'Score: 95/100 (Tier 1)';
      m3.classList.add('status-ok');
      addLog('tag-ai', 'AI AGENT', 'Respuesta LLM recibida: Score 95/100, Clasificación: Prioridad Crítica (Presupuesto > $50k/año)');

      // Parallel Packets 3 -> 4 and 3 -> 5
      await Promise.all([
        animatePacket('packet-3', 'path-3-4', 500),
        animatePacket('packet-4', 'path-3-5', 500)
      ]);

      // Step 4 & 5: Postgres & Slack in parallel
      const n4 = document.getElementById('node-4');
      const ind4 = document.getElementById('ind-4');
      const m4 = document.getElementById('metric-4');
      const n5 = document.getElementById('node-5');
      const ind5 = document.getElementById('ind-5');
      const m5 = document.getElementById('metric-5');

      n4.classList.add('executing');
      n5.classList.add('executing');
      if (ind4) ind4.className = 'node-indicator active';
      if (ind5) ind5.className = 'node-indicator active';

      addLog('tag-db', 'POSTGRES', 'INSERT INTO qualified_leads (id, company, score) VALUES (\'lead_892\', \'Vortex AI\', 95)');
      addLog('tag-slack', 'SLACK BOT', 'Enviando bloque interactivo a canal #leads-enterprise con botones de acción.');

      await new Promise(r => setTimeout(r, 450));

      n4.classList.remove('executing');
      n4.classList.add('success');
      if (ind4) ind4.className = 'node-indicator done';
      m4.textContent = 'Insert OK (11.4ms)';
      m4.classList.add('status-ok');

      n5.classList.remove('executing');
      n5.classList.add('success');
      if (ind5) ind5.className = 'node-indicator done';
      m5.textContent = 'Notificado (32ms)';
      m5.classList.add('status-ok');

      clearInterval(timerInterval);
      const totalTime = (performance.now() - startTime).toFixed(1);
      timerDisplay.textContent = `${totalTime}ms`;

      statusPill.className = 'flow-status-pill success';
      statusLabel.textContent = `Éxito (5/5 nodos completados en ${totalTime}ms)`;
      addLog('tag-success', 'SUCCESS', `Ejecución finalizada con 0 errores en ${totalTime}ms.`);

      showToast(`✨ Flujo ejecutado con éxito en ${totalTime}ms`);

    } catch (err) {
      console.error(err);
    } finally {
      isRunning = false;
      btnRun.classList.remove('is-executing');
      btnRun.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> <span>Ejecutar Flujo de Prueba</span>`;
    }
  });
}

/* ==========================================================================
   3. Interactive Node Inspector Modal
   ========================================================================== */
function initNodeModals() {
  const modal = document.getElementById('node-modal');
  const btnClose = document.getElementById('btn-close-modal');
  const btnDismiss = document.getElementById('btn-modal-dismiss');
  const btnTestNode = document.getElementById('btn-modal-test');

  const titleEl = document.getElementById('modal-node-title');
  const subEl = document.getElementById('modal-node-sub');
  const iconEl = document.getElementById('modal-node-icon');
  const formEl = document.getElementById('modal-form-fields');
  const jsonInEl = document.getElementById('modal-json-input');
  const jsonOutEl = document.getElementById('modal-json-output');

  // Node Mock Data Dictionary
  const nodeData = {
    webhook: {
      title: 'Webhook Entrada (Trigger)',
      sub: 'node_id: n8n_trigger_webhook_01',
      icon: '⚡',
      params: [
        { label: 'Método HTTP', value: 'POST' },
        { label: 'Ruta del Webhook', value: '/api/v1/leads' },
        { label: 'Autenticación', value: 'Bearer Token (Header)' }
      ],
      input: {
        headers: { "user-agent": "HubSpot-Webhook-Agent/2.4", "x-signature": "sha256=9f83a..." },
        body: { "email": "alex@enterprise.io", "company": "Vortex AI", "interest": "High Scalability Plan" }
      },
      output: {
        body: { "email": "alex@enterprise.io", "company": "Vortex AI", "received_at": 1728678000 }
      }
    },
    code: {
      title: 'Limpieza & Validación JS',
      sub: 'node_id: n8n_code_javascript_transform',
      icon: '⚙️',
      params: [
        { label: 'Runtime', value: 'Node.js 20 (V8 Isolated Sandbox)' },
        { label: 'Modo de Ejecución', value: 'Ejecutar una vez por cada elemento' },
        { label: 'Paquetes Permitidos', value: 'lodash, validator, crypto' }
      ],
      input: {
        item: { "email": " ALEX@Enterprise.IO ", "company": "Vortex AI " }
      },
      output: {
        cleanEmail: "alex@enterprise.io",
        cleanCompany: "Vortex AI",
        domain: "enterprise.io",
        isBusinessEmail: true
      }
    },
    ai: {
      title: 'AI Scoring & Prompt (Claude 3.5)',
      sub: 'node_id: n8n_langchain_agent_llm',
      icon: '🧠',
      params: [
        { label: 'Proveedor de Modelo', value: 'Anthropic Claude 3.5 Sonnet' },
        { label: 'Temperatura', value: '0.15' },
        { label: 'Herramientas (Tools)', value: 'CRM_Lookup, Company_Enrichment' }
      ],
      input: {
        prompt: "Analizar perfil de Vortex AI y asignar puntuación de 1 a 100",
        domain: "enterprise.io"
      },
      output: {
        score: 95,
        qualification: "Enterprise Tier 1",
        reasoning: "Empresa tecnológica con alto crecimiento de empleados y necesidad de orquestación local.",
        suggestedRep: "carolina.ventas@nexusflow.io"
      }
    },
    postgres: {
      title: 'PostgreSQL Upsert',
      sub: 'node_id: n8n_postgres_db_connection',
      icon: '🐘',
      params: [
        { label: 'Host', value: 'db-cluster.internal.vpc:5432' },
        { label: 'Operación', value: 'Upsert (Insert en conflicto Update)' },
        { label: 'Tabla Destino', value: 'qualified_leads' }
      ],
      input: {
        id: "vortex_ai_alex",
        score: 95,
        tier: "Enterprise"
      },
      output: {
        rowsAffected: 1,
        insertedId: 8492,
        status: "RECORD_CREATED"
      }
    },
    slack: {
      title: 'Alerta Slack / WhatsApp',
      sub: 'node_id: n8n_slack_notification_outbound',
      icon: '💬',
      params: [
        { label: 'Canal Destino', value: '#leads-enterprise' },
        { label: 'Tipo de Mensaje', value: 'Rich Block Kit con botones de contacto' },
        { label: 'Menciones', value: '@channel si score >= 90' }
      ],
      input: {
        channel: "#leads-enterprise",
        message: "🚨 Nuevo Lead Calificado: Vortex AI (Score: 95/100)"
      },
      output: {
        ok: true,
        channel: "C0492810",
        ts: "1728678002.000100"
      }
    }
  };

  let currentNodeKey = null;

  // Open modal on click node
  document.querySelectorAll('.flow-node').forEach(nodeEl => {
    nodeEl.addEventListener('click', () => {
      const key = nodeEl.getAttribute('data-node');
      const data = nodeData[key];
      if (!data) return;

      currentNodeKey = key;
      titleEl.textContent = data.title;
      subEl.textContent = data.sub;
      iconEl.textContent = data.icon;

      // Populate form
      formEl.innerHTML = data.params.map(p => `
        <div class="form-group">
          <label>${p.label}</label>
          <input type="text" class="form-input" value="${p.value}" readonly>
        </div>
      `).join('');

      jsonInEl.textContent = JSON.stringify(data.input, null, 2);
      jsonOutEl.textContent = JSON.stringify(data.output, null, 2);

      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
    });
  });

  // Modal tab switching
  document.querySelectorAll('.m-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.m-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.modal-tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      const target = document.getElementById(`mtab-${tab.getAttribute('data-mtab')}`);
      if (target) target.classList.add('active');
    });
  });

  // Close modal
  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }
  btnClose.addEventListener('click', closeModal);
  btnDismiss.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Test individual node
  btnTestNode.addEventListener('click', () => {
    showToast(`⚡ Nodo "${titleEl.textContent}" probado con éxito (Salida 200 OK)`);
    closeModal();
  });
}

/* ==========================================================================
   4. Feature Tabs
   ========================================================================== */
function initFeatureTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      panels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const panelId = tab.getAttribute('data-tab');
      const panel = document.getElementById(panelId);
      if (panel) panel.classList.add('active');
    });
  });
}

/* ==========================================================================
   5. Template Category Filters
   ========================================================================== */
function initTemplateFilters() {
  const chips = document.querySelectorAll('.filter-chip');
  const cards = document.querySelectorAll('.template-card');

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const filter = chip.getAttribute('data-filter');

      cards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || filter === cat) {
          card.style.display = 'flex';
          card.style.animation = 'fade-tab 0.3s ease';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Template "Usar plantilla" buttons
  document.querySelectorAll('.btn-use-template').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const name = btn.getAttribute('data-template');
      showToast(`📥 Plantilla "${name}" clonada en tu cuenta`);
    });
  });
}

/* ==========================================================================
   6. Self-Host Command Switcher
   ========================================================================== */
function initSelfHostTabs() {
  const tabs = document.querySelectorAll('.install-tab');
  const display = document.getElementById('install-command-display');
  const btnCopy = document.getElementById('btn-copy-install');

  const commands = {
    docker: `docker run -it --rm \\
  --name nexusflow \\
  -p 5678:5678 \\
  -v ~/.nexusflow:/home/node/.nexusflow \\
  nexusflow/engine:latest`,
    compose: `version: '3.8'
services:
  nexusflow:
    image: nexusflow/engine:latest
    restart: always
    ports:
      - "5678:5678"
    environment:
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
    volumes:
      - nexusflow_data:/home/node/.nexusflow`,
    k8s: `helm repo add nexusflow https://helm.nexusflow.io
helm repo update
helm install nexusflow-cluster nexusflow/nexusflow \\
  --namespace automation \\
  --create-namespace \\
  --set persistence.size=20Gi`,
    npm: `npm install -g nexusflow
nexusflow start`
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const cmdKey = tab.getAttribute('data-cmd');
      display.textContent = commands[cmdKey] || commands.docker;
    });
  });

  btnCopy.addEventListener('click', () => {
    navigator.clipboard.writeText(display.textContent).then(() => {
      showToast('📋 Comando de instalación copiado al portapapeles');
    });
  });
}

/* ==========================================================================
   7. Pricing Period Toggle (Annual vs Monthly)
   ========================================================================== */
function initPricingToggle() {
  const toggle = document.getElementById('pricing-period-toggle');
  const pricePro = document.getElementById('price-pro');
  const periodPro = document.getElementById('period-pro');

  if (!toggle) return;

  function updatePricing() {
    if (toggle.checked) {
      // Annual (20% discount)
      pricePro.textContent = '24';
      periodPro.textContent = '/ mes (facturado anualmente)';
    } else {
      // Monthly
      pricePro.textContent = '29';
      periodPro.textContent = '/ mes (facturado mensualmente)';
    }
  }

  toggle.addEventListener('change', updatePricing);

  // Buttons select plan
  document.querySelectorAll('.btn-select-plan').forEach(btn => {
    btn.addEventListener('click', () => {
      const plan = btn.getAttribute('data-plan');
      showToast(`🚀 Has seleccionado el plan ${plan}. Redirigiendo a registro...`);
    });
  });
}

/* ==========================================================================
   8. FAQ Accordion
   ========================================================================== */
function initFaqAccordion() {
  const items = document.querySelectorAll('.faq-item');

  items.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');
      items.forEach(i => {
        i.classList.remove('active');
        i.querySelector('.faq-trigger').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('active');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* ==========================================================================
   9. Mobile Menu Toggle
   ========================================================================== */
function initMobileNav() {
  const toggle = document.getElementById('mobile-toggle');
  const nav = document.getElementById('mobile-nav');

  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('.mob-link').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ==========================================================================
   10. Quick Copy in Hero
   ========================================================================== */
function initHeroCopy() {
  const btn = document.getElementById('btn-copy-hero-cmd');
  const text = document.getElementById('hero-cmd-text');
  const tooltip = document.getElementById('hero-cmd-tooltip');
  const terminalBox = document.querySelector('.hero-quick-terminal');

  function copyAction() {
    navigator.clipboard.writeText(text.textContent).then(() => {
      tooltip.classList.add('show');
      showToast('📋 Comando Docker copiado: docker run -it --rm -p 5678:5678 nexusflow/engine');
      setTimeout(() => tooltip.classList.remove('show'), 2000);
    });
  }

  if (btn) btn.addEventListener('click', (e) => {
    e.stopPropagation();
    copyAction();
  });
  if (terminalBox) terminalBox.addEventListener('click', copyAction);
}

/* ==========================================================================
   Toast Notification Helper
   ========================================================================== */
function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span class="toast-dot" style="width:8px;height:8px;border-radius:50%;background:#8b5cf6;"></span>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
