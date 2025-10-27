# ClaudeCode SuperPlugin — Especificação v0.1

> **Proposta:** Consolidar todas as ideias em **um único plugin** para o Claude Code, que integra pesquisa profunda, criação de skills, personas operacionais, orquestração de tarefas, validação anti‑alucinação e gestão de gaps (skills ausentes).

---

## 1) Objetivo

* Entregar **um plugin único** que cubra ponta‑a‑ponta o ciclo de desenvolvimento (planning → delivery → review), com **skills componíveis** e **personas internas**.

---

## 2) Capacidades (Módulos Internos do Plugin)

### 2.1 Research (embutido)

* **Funções:** `research.query`, `research.deep`, `research.summarize`, `research.export`.
* **Saídas:** resumo executivo, fontes citadas, artefatos semente (PRD seed, arquitetura seed, test-plan seed).

### 2.2 Skill Builder (criação de skills)

* **Funções:** `skill.new`, `skill.from-research`, `skill.test`, `skill.publish-local`.
* **Uso:** quando faltar uma skill para uma tecnologia, o plugin **pausa** e sugere criá-la.

### 2.3 Personas (instâncias internas)

* **Perfis:** SM, PO, PM, Frontend Dev, Backend Dev, CLI Dev, DBA, Arquiteto, QA.
* **Acesso a skills:** controlado por stack do projeto e etapa do fluxo.
* **Funções:** `persona.run`, `persona.review`, `persona.capabilities`.

### 2.4 Dev Steps

* **Planning:** brainstorm → centralização da pesquisa → PRD → UX wireframe/outlines → arquitetura (decisões + diagramas conceituais).
* **Development:** execução por story (com critérios de aceite) + testes por story (unit/e2e/QA).
* **Funções:** `dev.plan.*`, `dev.story.implement`, `dev.story.test`.

### 2.5 Orquestração & Workflows

* **Orquestrador interno:** `orchestrate.plan`, `orchestrate.run`, `orchestrate.gap-check`, `orchestrate.review`.
* **Pontos de validação:** gates entre fases; reviewer ≠ executor (instâncias separadas).

### 2.6 Gap Handling + Tech Debt

* **Fluxo:** detectar skill ausente → perguntar **fazer todos / fazer alguns / não fazer** → opções não feitas vão para **Tech Debt**.
* **Funções:** `gap.list`, `gap.resolve`, `techdebt.add`, `techdebt.export`.

---

## 3) UX no Claude Code

* **Comandos rápidos:**

  * `/cc plan` (abre wizard de planejamento guiado)
  * `/cc deep <tema>` (executa pesquisa profunda)
  * `/cc story <id>` (orquestra implementação + testes de uma story)
  * `/cc gaps` (lista skills faltantes e opções)
  * `/cc review` (aciona revisão cruzada por persona adequada)
* **Painéis:**

  * **Overview:** progresso por etapa, pendências, tech debt
  * **Personas:** quais ativas e suas skills
  * **Evidências:** links/trechos usados pelo Research

---

## 4) API do Plugin (Manifesto – Exemplo)

```yaml
name: claude-superplugin
version: 0.1.0
permissions:
  - internet.read
  - repo.read
  - fs.read
  - fs.write
config:
  stack: ["ts", "py", "java"]
  validation: { level: "strict", reviewer_isolation: true }
  telemetry: { enabled: true, pii_redaction: true }
skills:
  - id: research.deep
    inputs: [topic, stack]
    outputs: [summary, sources, artifacts]
  - id: skill.new
    inputs: [name, intent, apis]
    outputs: [scaffold_path]
  - id: dev.story.implement
    inputs: [story_id, persona]
    outputs: [diff, tests]
  - id: dev.story.test
    inputs: [story_id]
    outputs: [report]
  - id: orchestrate.gap-check
commands:
  - id: cc.plan
  - id: cc.deep
  - id: cc.story
  - id: cc.gaps
  - id: cc.review
personas:
  - Frontend Dev
  - Backend Dev
  - QA
  - Arquiteto
```

---

## 5) Fluxos de Trabalho (Templates)

### 5.1 Planejamento

1. `/cc plan` → wizard conduzido por **SM/PO/PM** internos
2. `research.deep` consolida evidências
3. `dev.plan.prd` gera PRD seed
4. `dev.plan.arch` propõe arquitetura → `persona.review(Arquiteto)`

### 5.2 Implementação de Story

1. `orchestrate.plan` → mapeia personas e skills
2. `dev.story.implement` (Frontend/Backend/CLI)
3. `dev.story.test` (QA) → gate de aprovação
4. `persona.review(QA)` + relatório

---

## 6) Anti‑Alucinação

* **Reviewer isolado:** instância distinta (mesmo agente base) com **skill de crítica**.
* **Evidências exigidas:** cada decisão aponta fontes do Research.
* **Auto‑checs:** lint de prompts, detecção de contradições e verificação de critérios de aceite.

---

## 7) Telemetria e Segurança

* **Telemetria:** duração por step, taxa de sucesso, erros por skill, *MTTR* de gaps.
* **Permissões mínimas:** por skill/command; consent screen para acessos externos.
* **Privacidade:** coleta mínima, PII redaction, modos *offline* e *no‑telemetry*.

---

## 8) Roadmap (MVP → Alpha)

* **MVP**: Research Deep, Orquestrador básico, Dev Steps essenciais, Reviewer isolado, Gap Handling c/ Tech Debt.
* **Alpha**: Skill Builder completo, dashboards, export (MD/JSON), integrações com repositório (git PRs).

---

## 9) Exemplos de Artefatos

### 9.1 Registro de Tech Debt (CSV)

```csv
id,type,description,scope,owner,due
TD-001,missing-skill,Adicionar skill p/ framework X,dev,team-a,2025-11-15
```

### 9.2 Workflow de Story (JSON)

```json
{
  "id": "story-impl",
  "steps": [
    {"use": "orchestrate.plan"},
    {"use": "dev.story.implement", "persona": "Backend Dev"},
    {"use": "dev.story.test", "persona": "QA"},
    {"use": "persona.review", "persona": "QA"}
  ],
  "gates": ["tests_passed", "acceptance_criteria_met"]
}
```

---

## 10) Critérios de Aceite (DoR/DoD)

* **DoR (Ready):** tema definido, stack selecionada, critérios de aceite claros, fontes mínimas coletadas.
* **DoD (Done):** evidências anexas, testes verdes, revisão aprovada por persona adequada, gaps tratados/registrados.
