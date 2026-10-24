# FamilyMed

> Gerenciamento de medicamentos em família: agenda de doses, estoque, validade, histórico e alertas, tudo em um só lugar.

![Expo](https://img.shields.io/badge/Expo-React%20Native-000020?logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white)
![Status](https://img.shields.io/badge/status-protótipo-blue)

O **FamilyMed**, produto da empresa fictícia **BioSoft**, é um aplicativo para famílias e cuidadores que acompanham o tratamento contínuo de idosos e pessoas com doenças crônicas. Ele substitui anotações em papel e grupos de mensagens por uma plataforma única, em que todos os responsáveis veem, em tempo real, o que já foi tomado, o que está atrasado e o que está acabando.

Este repositório contém o **protótipo funcional** (aplicativo Android + API), desenvolvido para a disciplina de *Engenharia de Software e Arquitetura de Sistemas* (FECAP, Ciência da Computação).

---

## Sumário

- [Funcionalidades](#funcionalidades)
- [Telas](#telas)
- [Arquitetura](#arquitetura)
- [Tecnologias](#tecnologias)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Como executar](#como-executar)
- [API](#api)
- [Rastreabilidade com os casos de uso](#rastreabilidade-com-os-casos-de-uso)
- [Limitações do protótipo](#limitações-do-protótipo)
- [Próximos passos](#próximos-passos)
- [Equipe](#equipe)

---

## Funcionalidades

- **Conta e família:** cadastro e login; uma conta pode ter vários **familiares** (cada um com perfil próprio) e alternar entre eles pelo topo do app.
- **Perfil do familiar:** nome, idade, sexo, tipo sanguíneo, alergias, telefone, peso e altura, com **IMC calculado automaticamente** e classificação.
- **Medicamentos:** cadastro com nome, dosagem, vários horários, estoque inicial, estoque mínimo e validade.
- **Agenda diária:** doses do dia com status (pendente, próximo, perdido, administrada), geradas automaticamente a partir dos horários.
- **Registro de administração:** confirma a dose, baixa o estoque e impede registro duplicado ou acima do estoque disponível.
- **Alertas:** estoque baixo, validade próxima (até 7 dias) ou vencida e dose perdida, com ações de reposição de estoque e de ligar para outro familiar.
- **Histórico:** registros de administração com filtro por medicamento e período, e exportação (CSV compartilhável).
- **Visão da família:** resumo do dia de cada familiar (doses tomadas, perdidas, estoque baixo) em uma única tela.
- **Profissionais de apoio:** médicos e cuidadores de cada familiar, com ligação e SMS em um toque.
- **Tema claro e escuro**, com preferência salva no aparelho.

## Telas

| Área | Telas |
|---|---|
| Acesso | Login, Cadastro (com Termos de Uso e Política de Privacidade) |
| Abas | Dashboard, Medicações, Agenda, Família |
| Fluxos | Novo/Editar familiar, Novo medicamento, Novo profissional, Histórico, Alertas |

O layout segue as telas prototipadas no Stitch (azul-marinho, cartões com borda lateral colorida e barra inferior de navegação).

## Arquitetura

```
┌──────────────────────────┐        HTTPS / JSON        ┌───────────────────────────┐
│  App Android (Expo Go /  │ ─────────────────────────► │  Cloudflare Worker (API)  │
│  APK) – React Native     │ ◄───────────────────────── │  worker.js                │
└──────────────────────────┘   x-user-id, x-patient-id  └─────────────┬─────────────┘
                                                                      │ leitura / escrita
                                                          ┌───────────▼─────────────┐
                                                          │  Cloudflare KV          │
                                                          │  chave "db" (JSON único)│
                                                          └─────────────────────────┘
```

Para manter o protótipo simples, o backend é **um único Worker** sem framework, que guarda todos os dados em um documento JSON no KV (`users`, `patients`, `medications`, `doses`, `logs`, `membros`). A sessão é identificada pelo header `x-user-id`, e o familiar selecionado, por `x-patient-id`.

## Tecnologias

**Aplicativo**
- [Expo](https://expo.dev) + React Native + TypeScript
- [Expo Router](https://docs.expo.dev/router/introduction/) (navegação por arquivos)
- `@react-native-async-storage/async-storage` (sessão e tema)
- `@expo/vector-icons` (ícones)

**Backend**
- [Cloudflare Workers](https://workers.cloudflare.com) (JavaScript)
- [Cloudflare KV](https://developers.cloudflare.com/kv/) (armazenamento)
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/) (deploy)

## Estrutura do projeto

> Ajuste os nomes das pastas conforme o seu repositório.

```
.
├── backend/
│   ├── worker.js            # API completa
│   └── wrangler.toml        # configuração do Worker e do KV
└── app/                     # projeto Expo
    ├── app/                 # rotas (Expo Router)
    │   ├── (auth)/          # login e cadastro
    │   ├── (tabs)/          # dashboard, medicações, agenda, família
    │   ├── alertas.tsx
    │   ├── historico.tsx
    │   ├── novo-medicamento.tsx
    │   ├── novo-paciente.tsx      # cadastro de familiar
    │   ├── editar-paciente.tsx    # edição/remoção de familiar
    │   └── novo-membro.tsx        # cadastro de profissional
    └── src/
        ├── api.ts           # cliente HTTP (URL da API)
        ├── session.tsx      # sessão e familiar selecionado
        ├── theme.ts         # paletas clara e escura
        ├── ThemeContext.tsx # provedor e hooks de tema
        ├── useApiData.ts    # carregamento de dados por familiar
        └── components/      # campos, botões, avatar, cabeçalho, etc.
```

## Como executar

### Pré-requisitos

- Node.js 18 ou superior
- Conta gratuita na [Cloudflare](https://dash.cloudflare.com) e na [Expo](https://expo.dev)
- Aplicativo **Expo Go** no Android (use a versão compatível com a SDK do projeto, disponível em [expo.dev/go](https://expo.dev/go))

### 1. Backend

```bash
cd backend
npx wrangler login
npx wrangler kv namespace create DB
```

Copie o `id` retornado para o `wrangler.toml`:

```toml
name = "familymed-api"
main = "worker.js"
compatibility_date = "2025-01-01"

[[kv_namespaces]]
binding = "DB"
id = "COLE_AQUI_O_ID_DO_KV"
```

Publique:

```bash
npx wrangler deploy
```

Anote a URL gerada (`https://familymed-api.<seu-usuario>.workers.dev`).

### 2. Aplicativo

```bash
cd app
npm install
```

Edite `src/api.ts` e aponte para a sua API:

```ts
export const API_URL = 'https://familymed-api.<seu-usuario>.workers.dev';
```

Inicie o projeto e escaneie o QR code com o Expo Go:

```bash
npx expo start -c
```

### 3. Gerar o APK

Crie o arquivo `eas.json` na raiz do app:

```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    }
  }
}
```

Depois:

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

Ao final, o EAS fornece o link para baixar o `.apk` e instalar no celular.

## API

Todas as rotas respondem JSON e aceitam CORS. As rotas autenticadas exigem `x-user-id`; as que dependem do familiar usam `x-patient-id` (se ausente, é usado o primeiro familiar da conta).

| Método | Rota | Descrição |
|---|---|---|
| POST | `/register` | Cria conta (valida e-mail único, senhas iguais e aceite dos termos) |
| POST | `/login` | Retorna `userId` e nome |
| GET | `/patients` | Lista os familiares da conta |
| POST | `/patients` | Cadastra familiar |
| POST | `/patients/remove` | Remove familiar e todos os dados dele |
| GET | `/family` | Resumo do dia de cada familiar (doses, perdidas, estoque baixo) |
| GET | `/patient` | Perfil do familiar selecionado e medicamentos recentes |
| POST | `/patient/update` | Atualiza o perfil do familiar |
| GET | `/medications` | Lista medicamentos |
| POST | `/medications` | Cadastra medicamento e gera as doses do dia |
| POST | `/medications/:id/restock` | Registra reposição de estoque |
| GET | `/schedule?date=AAAA-MM-DD` | Agenda do dia com status de cada dose |
| POST | `/doses/:id/administer` | Registra administração (valida duplicidade e estoque) |
| GET | `/history?medId=&de=&ate=` | Histórico com filtros |
| GET | `/alerts` | Alertas de estoque, validade e dose perdida |
| GET | `/network` | Profissionais de apoio do familiar |
| POST | `/network` | Adiciona profissional |
| POST | `/network/remove` | Remove profissional |

**Regras de negócio implementadas:** dose não pode ser registrada em duplicidade; quantidade deve ser maior que zero e não exceder o estoque; a baixa de estoque e o registro no log ocorrem na mesma operação; alerta de estoque quando `estoque <= estoque mínimo`; alerta de validade quando faltam 7 dias ou menos; dose é considerada perdida após 30 minutos de tolerância; validade não pode estar vencida no cadastro.

## Rastreabilidade com os casos de uso

| Caso de uso | Situação |
|---|---|
| UC001 Cadastrar usuário | Implementado |
| UC002 Efetuar login | Implementado |
| UC003 Recuperar senha | Pendente |
| UC004 Dashboard do paciente | Implementado (adaptado para "familiar") |
| UC005 Editar perfil | Implementado |
| UC006 Histórico de administração | Implementado (filtros e exportação) |
| UC007 Agenda diária | Implementado |
| UC008 Registrar administração | Implementado |
| UC009 / UC010 Editar e cancelar registro | Pendente |
| UC011 Cadastrar medicamento | Implementado |
| UC012 Central de notificações | Parcial (alertas calculados na hora, sem push) |
| UC013 Modo emergência | Parcial (alerta de dose perdida com ligação a outro familiar; sem escalonamento automático) |
| UC014 Alerta de estoque baixo | Implementado (com reposição) |
| UC015 Preferências de notificação | Pendente |
| UC016 / UC017 / UC019 Rede de apoio | Implementado (familiares e profissionais) |
| UC018 Nível de permissão | Pendente |
| UC020 Efetuar logout | Implementado |

## Limitações do protótipo

Este projeto é **acadêmico** e não deve ser usado com dados reais de saúde.

- Senhas armazenadas em texto puro e sessão por `x-user-id`, **sem hash (bcrypt) e sem JWT**; os requisitos RNF06 e RNF26 ficam para a versão final.
- Armazenamento em um único documento JSON no KV, sem banco relacional e sem controle de concorrência.
- Sem notificações push reais e sem sincronização em tempo real entre aparelhos (os dados são atualizados ao abrir a tela ou puxar para atualizar).
- Sem conformidade formal com a LGPD: dados de saúde são sensíveis e exigem consentimento explícito e proteção adequada em produção.

## Próximos passos

- Autenticação segura (hash de senha, JWT com expiração) e migração para banco de dados (por exemplo, Cloudflare D1).
- Notificações push (Firebase Cloud Messaging) e job agendado para lembretes e Modo Emergência com escalonamento por prioridade.
- Sincronização em tempo real entre familiares (WebSocket ou polling curto).
- Recuperação de senha, edição e cancelamento de registros, preferências de notificação e níveis de permissão.
- Log de auditoria e registro de consentimento (LGPD).

## Equipe

Projeto desenvolvido na **FECAP**, curso de Ciência da Computação (noturno), disciplina *Engenharia de Software e Arquitetura de Sistemas*, sob orientação do professor **Luis Fernando dos Santos Pires**.

- Bruno Rodrigues Da Costa
- Eric Aloise de Sousa
- João Pedro Da Silva
- Stefany Samira De Oliveira Cubertino
