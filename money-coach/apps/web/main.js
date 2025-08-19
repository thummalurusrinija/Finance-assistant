const fixedList = document.getElementById('fixed-list');
const varList = document.getElementById('var-list');
const goalList = document.getElementById('goal-list');
const addFixed = document.getElementById('add-fixed');
const addVar = document.getElementById('add-var');
const addGoal = document.getElementById('add-goal');
const form = document.getElementById('plan-form');
const incomeInput = document.getElementById('income');
const result = document.getElementById('result');
const allocOutput = document.getElementById('alloc-output');
const tipsDiv = document.getElementById('tips');
const reportPre = document.getElementById('report');

function createItemRow(fields) {
	const row = document.createElement('div');
	row.className = 'item';
	for (const f of fields) {
		const input = document.createElement('input');
		input.type = f.type;
		input.placeholder = f.placeholder;
		input.step = f.step || undefined;
		input.dataset.key = f.key;
		row.appendChild(input);
	}
	return row;
}

function collectList(container, schema) {
	return Array.from(container.children).map((row) => {
		const obj = {};
		for (const input of row.querySelectorAll('input')) {
			const key = input.dataset.key;
			obj[key] = input.type === 'number' ? Number(input.value || 0) : input.value;
		}
		return obj;
	}).filter((o) => Object.values(o).some((v) => v !== '' && v !== 0));
}

addFixed.onclick = () => {
	fixedList.appendChild(createItemRow([
		{ key: 'name', type: 'text', placeholder: 'Rent' },
		{ key: 'amount', type: 'number', step: '0.01', placeholder: '1000' },
	]));
};

addVar.onclick = () => {
	varList.appendChild(createItemRow([
		{ key: 'name', type: 'text', placeholder: 'Groceries' },
		{ key: 'cap', type: 'number', step: '0.01', placeholder: '400' },
	]));
};

addGoal.onclick = () => {
	goalList.appendChild(createItemRow([
		{ key: 'name', type: 'text', placeholder: 'Emergency Fund' },
		{ key: 'target', type: 'number', step: '0.01', placeholder: '3000' },
		{ key: 'current', type: 'number', step: '0.01', placeholder: '0' },
		{ key: 'priority', type: 'number', step: '1', placeholder: '5' },
	]));
};

// Seed a couple example rows
addFixed.onclick();
addVar.onclick();
addGoal.onclick();

form.onsubmit = async (e) => {
	e.preventDefault();
	const payload = {
		income: Number(incomeInput.value || 0),
		fixed: collectList(fixedList),
		variable: collectList(varList),
		goals: collectList(goalList),
	};
	try {
		const resp = await fetch('/api/plan', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		});
		const data = await resp.json();
		allocOutput.textContent = JSON.stringify(data, null, 2);
		result.hidden = false;
		if (data.tips && data.tips.length) {
			tipsDiv.innerHTML = '<h3>Tips</h3>' + data.tips.map(t => `<div>- ${t}</div>`).join('');
		}
	} catch (err) {
		allocOutput.textContent = 'Error generating plan';
		result.hidden = false;
	}
};

(async function loadReport(){
	try {
		const r = await fetch('/api/report/monthly');
		const d = await r.json();
		reportPre.textContent = JSON.stringify(d, null, 2);
	} catch (e) {
		reportPre.textContent = 'Report unavailable';
	}
})();