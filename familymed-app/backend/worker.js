// FamilyMed - backend protótipo v2 (Cloudflare Worker + KV). Sem hash, sem JWT.
const TZ = "America/Sao_Paulo";
const TOLERANCIA_MIN = 30;
const SANGUE = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, x-user-id, x-patient-id",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...CORS } });
const erro = (msg, status = 400) => json({ erro: msg }, status);
const uid = () => Math.random().toString(36).slice(2, 10);

function agora() {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hour12: false,
    }).formatToParts(new Date()).map((x) => [x.type, x.value])
  );
  return { data: `${p.year}-${p.month}-${p.day}`, min: (Number(p.hour) % 24) * 60 + Number(p.minute) };
}
const dataSP = (iso) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(iso));
const horaSP = (iso) =>
  new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
const paraMin = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };

async function lerDb(env) {
  const raw = await env.DB.get("db");
  const db = raw ? JSON.parse(raw) : {};
  for (const k of ["users", "patients", "medications", "doses", "logs", "membros"]) db[k] ||= [];
  return db;
}
const salvarDb = (env, db) => env.DB.put("db", JSON.stringify(db));

function garantirDoses(db, patientId, data) {
  for (const med of db.medications.filter((m) => m.patientId === patientId)) {
    for (const h of med.horarios) {
      if (!db.doses.some((d) => d.medId === med.id && d.data === data && d.horario === h))
        db.doses.push({ id: uid(), patientId, medId: med.id, data, horario: h, status: "pendente" });
    }
  }
}
function statusDose(d, a) {
  if (d.status === "administrada") return "administrada";
  if (d.data < a.data) return "perdido";
  if (d.data > a.data) return "pendente";
  return a.min > paraMin(d.horario) + TOLERANCIA_MIN ? "perdido" : "pendente";
}

function validarPaciente(b) {
  const nome = (b.nome || "").trim();
  if (!nome) return { erro: "O nome do familiar é obrigatório." };
  const idade = Number(b.idade);
  if (!Number.isInteger(idade) || idade <= 0) return { erro: "A idade deve ser um número positivo." };
  if (!SANGUE.includes(b.tipoSanguineo)) return { erro: "Escolha um tipo sanguíneo válido." };
  const num = (v, rotulo) => {
    if (v === null || v === undefined || v === "") return { v: null };
    const n = Number(v);
    if (isNaN(n) || n <= 0) return { erro: `${rotulo} inválido.` };
    return { v: n };
  };
  const peso = num(b.peso, "Peso"); if (peso.erro) return peso;
  const alt = num(b.altura, "Altura"); if (alt.erro) return alt;
  if (alt.v !== null && (alt.v < 50 || alt.v > 250)) return { erro: "Altura inválida (informe em cm, ex.: 165)." };
  const tel = String(b.telefone ?? "").replace(/\D/g, "");
  if (tel && tel.length < 8) return { erro: "Telefone inválido." };
  return {
    dados: {
      nome, idade, sexo: b.sexo === "Masc" ? "Masc" : "Fem", tipoSanguineo: b.tipoSanguineo,
      alergias: (b.alergias || "").trim() || "Nenhuma", telefone: tel || null,
      peso: peso.v, altura: alt.v,
    },
  };
}

export default {
  async fetch(req, env) {
    if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
    const url = new URL(req.url);
    const path = url.pathname;
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const db = await lerDb(env);

    // ---------- públicas ----------
    if (path === "/register" && req.method === "POST") {
      const { nome, email, senha, confirmar, aceite } = body;
      if (!nome || !email || !senha) return erro("Preencha todos os campos.");
      if (!/^\S+@\S+\.\S+$/.test(email)) return erro("E-mail inválido.");
      if (senha !== confirmar) return erro("A confirmação não confere com a senha.");
      if (!aceite) return erro("É obrigatório aceitar os termos.");
      if (db.users.some((u) => u.email === email.toLowerCase())) return erro("Já existe conta com esse e-mail.", 409);
      const user = { id: uid(), nome, email: email.toLowerCase(), senha };
      db.users.push(user);
      await salvarDb(env, db);
      return json({ userId: user.id, nome: user.nome }, 201);
    }
    if (path === "/login" && req.method === "POST") {
      const { email, senha } = body;
      if (!email || !senha) return erro("Informe e-mail e senha.");
      const u = db.users.find((x) => x.email === email.toLowerCase() && x.senha === senha);
      if (!u) return erro("Credenciais inválidas.", 401);
      return json({ userId: u.id, nome: u.nome });
    }

    // ---------- autenticadas ----------
    const user = db.users.find((u) => u.id === req.headers.get("x-user-id"));
    if (!user) return erro("Não autenticado.", 401);
    const meusPacientes = db.patients.filter((p) => p.userId === user.id);

    if (path === "/patients" && req.method === "GET")
      return json(meusPacientes.map(({ id, nome, idade, sexo }) => ({ id, nome, idade, sexo })));

    if (path === "/patients" && req.method === "POST") {
      const r = validarPaciente(body);
      if (r.erro) return erro(r.erro);
      const p = { id: uid(), userId: user.id, ...r.dados };
      db.patients.push(p);
      await salvarDb(env, db);
      return json({ id: p.id, nome: p.nome }, 201);
    }

    if (path === "/patients/remove" && req.method === "POST") {
      const p = meusPacientes.find((x) => x.id === body.id);
      if (!p) return erro("Familiar não encontrado.", 404);
      const medIds = new Set(db.medications.filter((m) => m.patientId === p.id).map((m) => m.id));
      db.patients = db.patients.filter((x) => x.id !== p.id);
      db.medications = db.medications.filter((m) => m.patientId !== p.id);
      db.doses = db.doses.filter((d) => d.patientId !== p.id);
      db.logs = db.logs.filter((l) => !medIds.has(l.medId));
      db.membros = db.membros.filter((m) => m.patientId !== p.id);
      await salvarDb(env, db);
      return json({ ok: true });
    }

    if (path === "/family" && req.method === "GET") {
      const hoje = agora();
      const out = meusPacientes.map((p) => {
        garantirDoses(db, p.id, hoje.data);
        const st = db.doses.filter((d) => d.patientId === p.id && d.data === hoje.data).map((d) => statusDose(d, hoje));
        const ms = db.medications.filter((m) => m.patientId === p.id);
        return {
          id: p.id, nome: p.nome, idade: p.idade, sexo: p.sexo, telefone: p.telefone || null,
          total: st.length, administradas: st.filter((x) => x === "administrada").length,
          perdidas: st.filter((x) => x === "perdido").length,
          estoqueBaixo: ms.filter((m) => m.estoque <= m.estoqueMinimo).length,
        };
      });
      await salvarDb(env, db);
      return json(out);
    }

    const patient = meusPacientes.find((p) => p.id === req.headers.get("x-patient-id")) ?? meusPacientes[0];

    if (path === "/patient" && req.method === "GET") {
      if (!patient) return json({ usuario: { nome: user.nome, email: user.email }, paciente: null, medicamentosRecentes: [] });
      const ms = db.medications.filter((m) => m.patientId === patient.id);
      return json({ usuario: { nome: user.nome, email: user.email }, paciente: patient, medicamentosRecentes: ms.slice(-3).reverse() });
    }

    if (!patient) return erro("Cadastre um familiar primeiro.", 400);
    const meds = db.medications.filter((m) => m.patientId === patient.id);
    const a = agora();

    if (path === "/patient/update" && req.method === "POST") {
      const r = validarPaciente(body);
      if (r.erro) return erro(r.erro);
      Object.assign(patient, r.dados);
      await salvarDb(env, db);
      return json(patient);
    }

    if (path === "/medications" && req.method === "GET") return json(meds);

    if (path === "/medications" && req.method === "POST") {
      const { nome, dosagem, frequencia, horarios, estoque, estoqueMinimo, validade } = body;
      if (!nome || !dosagem || !Array.isArray(horarios) || horarios.length === 0)
        return erro("Nome, dosagem e horários são obrigatórios.");
      if (!horarios.every((h) => /^\d{2}:\d{2}$/.test(h))) return erro("Horário inválido (use HH:MM).");
      const est = Number(estoque ?? 0);
      if (isNaN(est) || est < 0) return erro("Estoque inicial inválido.");
      if (validade && validade < a.data) return erro("A validade não pode estar vencida.");
      const med = {
        id: uid(), patientId: patient.id, nome, dosagem,
        frequencia: frequencia || `${horarios.length}x ao dia`,
        horarios: [...horarios].sort(), estoque: est,
        estoqueMinimo: Number(estoqueMinimo ?? 5), validade: validade || null,
      };
      db.medications.push(med);
      garantirDoses(db, patient.id, a.data);
      await salvarDb(env, db);
      return json(med, 201);
    }

    const rep = path.match(/^\/medications\/([^/]+)\/restock$/);
    if (rep && req.method === "POST") {
      const med = meds.find((m) => m.id === rep[1]);
      if (!med) return erro("Medicamento não encontrado.", 404);
      const qtd = Number(body.quantidade);
      if (!(qtd > 0)) return erro("A quantidade deve ser maior que zero.");
      med.estoque += qtd;
      await salvarDb(env, db);
      return json({ ok: true, estoqueAtual: med.estoque });
    }

    if (path === "/schedule" && req.method === "GET") {
      const data = url.searchParams.get("date") || a.data;
      garantirDoses(db, patient.id, data);
      await salvarDb(env, db);
      const lista = db.doses
        .filter((d) => d.patientId === patient.id && d.data === data)
        .map((d) => {
          const m = db.medications.find((x) => x.id === d.medId);
          return { id: d.id, horario: d.horario, medicamento: m.nome, dosagem: m.dosagem, status: statusDose(d, a) };
        })
        .sort((x, y) => x.horario.localeCompare(y.horario));
      const prox = lista.find((d) => d.status === "pendente");
      if (prox && data === a.data) prox.status = "proximo";
      return json(lista);
    }

    const adm = path.match(/^\/doses\/([^/]+)\/administer$/);
    if (adm && req.method === "POST") {
      const dose = db.doses.find((d) => d.id === adm[1] && d.patientId === patient.id);
      if (!dose) return erro("Dose não encontrada.", 404);
      if (dose.status === "administrada") return erro("A dose já consta como administrada.", 409);
      const med = db.medications.find((m) => m.id === dose.medId);
      const qtd = Number(body.quantidade ?? 1);
      if (!(qtd > 0)) return erro("A quantidade deve ser maior que zero.");
      if (qtd > med.estoque) return erro("Estoque insuficiente. Reponha o medicamento.");
      med.estoque -= qtd;
      dose.status = "administrada";
      db.logs.push({ id: uid(), doseId: dose.id, medId: med.id, userId: user.id, quantidade: qtd, timestamp: new Date().toISOString(), status: "administrada" });
      await salvarDb(env, db);
      return json({ ok: true, estoqueAtual: med.estoque });
    }

    if (path === "/history" && req.method === "GET") {
      const medId = url.searchParams.get("medId");
      const de = url.searchParams.get("de");
      const ate = url.searchParams.get("ate");
      if (de && ate && de > ate) return erro("A data inicial não pode ser posterior à data final.");
      const meus = new Set(meds.map((m) => m.id));
      const lista = db.logs
        .filter((l) => meus.has(l.medId) && (!medId || l.medId === medId))
        .map((l) => {
          const m = db.medications.find((x) => x.id === l.medId);
          const u = db.users.find((x) => x.id === l.userId);
          return {
            id: l.id, medicamento: m.nome, dosagem: m.dosagem, quantidade: l.quantidade,
            timestamp: l.timestamp, data: dataSP(l.timestamp), hora: horaSP(l.timestamp),
            responsavel: u ? u.nome : "—",
          };
        })
        .filter((x) => (!de || x.data >= de) && (!ate || x.data <= ate))
        .sort((x, y) => y.timestamp.localeCompare(x.timestamp));
      return json(lista);
    }

    if (path === "/alerts" && req.method === "GET") {
      const alertas = [];
      for (const m of meds) {
        if (m.estoque <= m.estoqueMinimo)
          alertas.push({ tipo: "estoque", titulo: "ESTOQUE BAIXO", mensagem: `Restam ${m.estoque} unidades de ${m.nome}.`, medId: m.id });
        if (m.validade) {
          const dias = Math.ceil((new Date(m.validade) - new Date(a.data)) / 86400000);
          if (dias < 0) alertas.push({ tipo: "validade", titulo: "MEDICAMENTO VENCIDO", mensagem: `${m.nome} venceu.`, medId: m.id });
          else if (dias <= 7) alertas.push({ tipo: "validade", titulo: "VALIDADE PRÓXIMA", mensagem: `${m.nome} vence em ${dias} dia(s).`, medId: m.id });
        }
      }
      for (const d of db.doses.filter((x) => x.patientId === patient.id && x.data === a.data)) {
        if (statusDose(d, a) === "perdido") {
          const m = db.medications.find((x) => x.id === d.medId);
          alertas.push({ tipo: "atraso", titulo: "DOSE PERDIDA", mensagem: `${m.nome} das ${d.horario} não foi confirmada.`, doseId: d.id });
        }
      }
      return json(alertas);
    }

    // ---------- rede de apoio ----------
    if (path === "/network" && req.method === "GET") {
      const ms = db.membros.filter((m) => m.patientId === patient.id);
      return json({
        familiares: ms.filter((m) => m.tipo === "familiar"),
        profissionais: ms.filter((m) => m.tipo === "profissional"),
      });
    }
    if (path === "/network" && req.method === "POST") {
      const { nome, tipo, vinculo, telefone } = body;
      if (!nome || !vinculo || !telefone) return erro("Preencha nome, vínculo e telefone.");
      if (tipo !== "profissional") return erro("Tipo inválido.");
      const tel = String(telefone).replace(/\D/g, "");
      if (tel.length < 8) return erro("Telefone inválido.");
      if (db.membros.some((m) => m.patientId === patient.id && m.telefone === tel))
        return erro("Esse contato já está na rede.", 409);
      const m = { id: uid(), patientId: patient.id, nome: nome.trim(), tipo, vinculo: vinculo.trim(), telefone: tel };
      db.membros.push(m);
      await salvarDb(env, db);
      return json(m, 201);
    }
    if (path === "/network/remove" && req.method === "POST") {
      const i = db.membros.findIndex((m) => m.id === body.id && m.patientId === patient.id);
      if (i < 0) return erro("Membro não encontrado.", 404);
      db.membros.splice(i, 1);
      await salvarDb(env, db);
      return json({ ok: true });
    }

    return erro("Rota não encontrada.", 404);
  },
};
