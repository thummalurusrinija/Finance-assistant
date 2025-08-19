from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="Money Coach ML", version="0.1.0")

class FixedItem(BaseModel):
	name: str
	amount: float

class VarItem(BaseModel):
	name: str
	cap: Optional[float] = 0.0

class ScoreRequest(BaseModel):
	income: float
	fixed: List[FixedItem] = []
	variable: List[VarItem] = []

@app.get("/health")
def health():
	return {"status": "ok"}

@app.post("/score")
def score(req: ScoreRequest):
	income = req.income or 0.0
	fixed_total = sum(i.amount for i in req.fixed)
	var_caps = sum((v.cap or 0.0) for v in req.variable)
	
	tips: List[str] = []
	if income <= 0:
		tips.append("Enter income to get tailored allocations.")
	if fixed_total > 0.6 * income and income > 0:
		tips.append("Fixed costs exceed 60% of income—consider negotiating bills or downsizing.")
	if var_caps > 0.35 * income and income > 0:
		tips.append("Discretionary caps look high—try trimming Dining/Shopping by 10% this month.")
	if not tips:
		tips.append("You're on track. Set a no-spend day and boost your top goal by $20.")
	return {"tips": tips}