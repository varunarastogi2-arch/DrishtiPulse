# PredictLand — ML Risk Engine

This folder is the whole backend: synthetic (but statistically grounded)
training data, two XGBoost models, and a FastAPI service ready for the
React dashboard to call.

## 1. Open this folder in Antigravity

Antigravity is a VS Code fork, so this is identical to opening a folder in
VS Code: `File → Open Folder` → select `predictland-ml`. Its built-in
terminal works the same way too.

## 2. Create a virtual environment and install dependencies

In the Antigravity terminal:

```bash
python3 -m venv venv
source venv/bin/activate        # on Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## 3. Generate the training data

```bash
python data/generate_dataset.py
```

This writes `data/land_acquisition_cases.csv` (6,000 synthetic cases,
calibrated so ~35% show a land-acquisition delay — matching the real
PRAGATI figure). Open the CSV to sanity-check it if you like.

## 4. Train the models

```bash
python train_model.py
```

This prints accuracy/ROC-AUC for the risk classifier and MAE for the
delay-duration regressor, then saves everything to `models/`.

## 5. Run the API

```bash
uvicorn api:app --reload --port 8000
```

Open **http://127.0.0.1:8000/docs** — that's an interactive Swagger UI
where you can send a test case and see the JSON response with no extra
tools needed.

Or from a second terminal:

```bash
curl -X POST http://127.0.0.1:8000/predict \
  -H "Content-Type: application/json" \
  -d @sample_case.json
```

You should get back something like:

```json
{
  "case_id": "CASE-00042",
  "risk_pct": 71.4,
  "risk_band": "High",
  "estimated_delay_days": 612,
  "top_drivers": [
    {"feature": "litigation_flag", "impact": 0.081},
    {"feature": "consent_pct", "impact": -0.052},
    {"feature": "compensation_gap_pct", "impact": 0.033}
  ]
}
```

## 6. What the React dashboard needs to know

- **Endpoint:** `POST http://127.0.0.1:8000/predict`
- **Request body:** see `sample_case.json` for the exact shape.
- **Response:** `risk_pct`, `risk_band` (Low/Medium/High — good for your
  heatmap colors), `estimated_delay_days`, and `top_drivers` (feed this
  straight into the chatbot's "why is this case high-risk" explanation).
- **Valid `state` / `sector` values:** call `GET /health` — it returns the
  exact lists the model was trained on.
- CORS is already open (`allow_origins=["*"]`) so your dev server can call
  it directly with no proxy setup. Tighten this before any real deployment.

## Next step

Once you share the dashboard's color/design theme, the React side is just
`fetch('http://127.0.0.1:8000/predict', {...})` and rendering this JSON —
no more ML surprises at that point.
