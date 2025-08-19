import express from "express";
import bodyParser from "body-parser";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import axios from "axios";

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// Serve static web app
const staticCandidates = [
  path.resolve(process.cwd(), "../web"),
  path.resolve(process.cwd(), "../../apps/web"),
];
const staticDir = staticCandidates.find((p) => fs.existsSync(p)) || staticCandidates[0];
app.use(express.static(staticDir));

// C++ engine path candidates
const engineCandidates = [
  path.resolve(process.cwd(), "../../packages/engine/engine"),
  path.resolve(process.cwd(), "../../packages/engine/build/engine"),
];
const mlServiceUrl = process.env.ML_URL || "http://localhost:8000";

function runCppEngineOrFallback(requestPayload) {
  return new Promise((resolve) => {
    const enginePath = engineCandidates.find((p) => fs.existsSync(p));
    if (enginePath) {
      try {
        const child = spawn(enginePath, [], { stdio: ["pipe", "pipe", "pipe"] });
        let output = "";
        let error = "";
        child.stdout.on("data", (data) => (output += data.toString()));
        child.stderr.on("data", (data) => (error += data.toString()));
        child.on("close", () => {
          try {
            const parsed = JSON.parse(output || "{}");
            resolve({ result: parsed, source: "cpp" });
          } catch (e) {
            console.error("Engine JSON parse error:", e, error);
            resolve({ result: jsAllocator(requestPayload), source: "js-fallback" });
          }
        });
        child.stdin.write(JSON.stringify(requestPayload));
        child.stdin.end();
      } catch (e) {
        console.error("Engine spawn error:", e);
        resolve({ result: jsAllocator(requestPayload), source: "js-fallback" });
      }
    } else {
      resolve({ result: jsAllocator(requestPayload), source: "js-fallback" });
    }
  });
}

function sumAmounts(items, field) {
  return (items || []).reduce((acc, item) => acc + Number(item[field] || 0), 0);
}

function jsAllocator(payload) {
  const income = Number(payload?.income || 0);
  const fixed = Array.isArray(payload?.fixed) ? payload.fixed : [];
  const variable = Array.isArray(payload?.variable) ? payload.variable : [];
  const goals = Array.isArray(payload?.goals) ? payload.goals : [];

  const fixedTotal = sumAmounts(fixed, "amount");
  const baseDiscretionary = Math.max(0, income - fixedTotal);

  // 50/30/20 on discretionary portion
  const toGoals = Math.min(baseDiscretionary * 0.2, baseDiscretionary);
  const toVariable = Math.max(0, baseDiscretionary - toGoals);

  // Priority sort goals; distribute toGoals
  const sortedGoals = [...goals].sort((a, b) => (b.priority || 0) - (a.priority || 0));
  let remainingGoals = toGoals;
  const goalAllocations = {};
  for (const goal of sortedGoals) {
    if (remainingGoals <= 0) break;
    const need = Math.max(0, Number(goal.target || 0) - Number(goal.current || 0));
    const slice = Math.min(need, remainingGoals);
    goalAllocations[goal.name] = Math.round(slice * 100) / 100;
    remainingGoals -= slice;
  }

  // Variable categories: proportional to caps if any, else equal
  const variableAllocations = {};
  if (variable.length > 0) {
    const totalCaps = variable.reduce((acc, v) => acc + (Number(v.cap) || 0), 0);
    for (const v of variable) {
      const cap = Number(v.cap) || 0;
      const share = totalCaps > 0 ? cap / totalCaps : 1 / variable.length;
      variableAllocations[v.name] = Math.round(toVariable * share * 100) / 100;
    }
  }

  const allocations = {
    fixed: Object.fromEntries(fixed.map((f) => [f.name, Number(f.amount) || 0])),
    variable: variableAllocations,
    goals: goalAllocations,
  };

  const allocatedVariable = Object.values(variableAllocations).reduce((a, b) => a + b, 0);
  const allocatedGoals = Object.values(goalAllocations).reduce((a, b) => a + b, 0);
  const totalAllocated = fixedTotal + allocatedVariable + allocatedGoals;
  const safeToSpend = Math.max(0, income - totalAllocated);

  return {
    allocations,
    safeToSpend,
    notes: [
      "Applied 50/30/20 to discretionary after covering fixed costs.",
      `Allocated $${allocatedGoals.toFixed(2)} to goals by priority.`,
    ],
  };
}

app.post("/api/plan", async (req, res) => {
  try {
    const payload = req.body || {};
    const { result, source } = await runCppEngineOrFallback(payload);

    let tips = [];
    try {
      const mlResp = await axios.post(`${mlServiceUrl}/score`, {
        income: payload.income,
        fixed: payload.fixed,
        variable: payload.variable,
      }, { timeout: 1500 });
      tips = mlResp.data?.tips || [];
    } catch (e) {
      // ML optional
    }

    res.json({ ...result, source, tips });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "planning_failed" });
  }
});

app.get("/api/report/monthly", (req, res) => {
  res.json({
    month: new Date().toISOString().slice(0, 7),
    saved: 420,
    spendingChangePct: -5,
    alertsResolved: 2,
    categories: [
      { name: "Rent", percent: 35 },
      { name: "Groceries", percent: 18 },
      { name: "Dining", percent: 12 },
    ],
  });
});

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.listen(port, () => {
  console.log(`Money Coach server listening on http://localhost:${port}`);
});