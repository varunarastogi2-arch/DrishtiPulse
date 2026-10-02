"""
api.py
------
FastAPI service that wraps the trained models. This is the exact contract
your React dashboard will call — one JSON in, one JSON out.

Run:
    uvicorn api:app --reload --port 8000

Then open http://127.0.0.1:8000/docs for the interactive Swagger UI, or:
    curl -X POST http://127.0.0.1:8000/predict -H "Content-Type: application/json" -d @sample_case.json
"""

from typing import List, Literal
import sqlite3
from datetime import datetime

import joblib
import numpy as np
import pandas as pd
import shap
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

MODEL_DIR = "models"

app = FastAPI(title="PredictLand Risk Engine", version="0.1.0")

# Allow the React dev server (localhost:3000 / :5173) to call this API directly.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this to your dashboard's origin before deploying
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Load trained artifacts once at startup ----
clf = joblib.load(f"{MODEL_DIR}/risk_classifier.joblib")
reg = joblib.load(f"{MODEL_DIR}/duration_regressor.joblib")
encoder = joblib.load(f"{MODEL_DIR}/encoder.joblib")
feature_columns = joblib.load(f"{MODEL_DIR}/feature_columns.joblib")
explainer = shap.TreeExplainer(clf)

# ---- Database setup ----
DB_PATH = "predictions.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            case_id TEXT NOT NULL,
            state TEXT NOT NULL,
            sector TEXT NOT NULL,
            risk_pct REAL NOT NULL,
            risk_band TEXT NOT NULL,
            estimated_delay_days INTEGER NOT NULL,
            created_at TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

init_db()

STATES = list(encoder.categories_[0])
SECTORS = list(encoder.categories_[1])


class CaseInput(BaseModel):
    case_id: str = Field(..., example="CASE-00042")
    state: str = Field(..., example="Maharashtra")
    sector: str = Field(..., example="Roads")
    num_landowners: int = Field(..., ge=1, example=24)
    consent_pct: float = Field(..., ge=0, le=100, example=58.0)
    consent_growth_rate: float = Field(..., example=1.2)
    litigation_flag: Literal[0, 1] = Field(..., example=1)
    title_dispute_flag: Literal[0, 1] = Field(..., example=0)
    compensation_gap_pct: float = Field(..., ge=0, le=100, example=35.0)
    pending_approvals: int = Field(..., ge=0, example=3)
    days_since_notification: int = Field(..., ge=0, example=420)


class RiskDriver(BaseModel):
    feature: str
    impact: float  # positive = pushes risk up, negative = pushes risk down


class PredictionResponse(BaseModel):
    case_id: str
    risk_pct: float
    risk_band: Literal["Low", "Medium", "High"]
    estimated_delay_days: int
    top_drivers: List[RiskDriver]


def _row_to_features(case: CaseInput) -> pd.DataFrame:
    df = pd.DataFrame([case.model_dump()])
    cat_encoded = encoder.transform(df[["state", "sector"]])
    cat_cols = encoder.get_feature_names_out(["state", "sector"])
    cat_df = pd.DataFrame(cat_encoded, columns=cat_cols)
    numeric_cols = [
        "num_landowners", "consent_pct", "consent_growth_rate",
        "litigation_flag", "title_dispute_flag", "compensation_gap_pct",
        "pending_approvals", "days_since_notification",
    ]
    X = pd.concat([df[numeric_cols].reset_index(drop=True), cat_df], axis=1)
    return X[feature_columns]  # enforce training-time column order


def _risk_band(pct: float) -> str:
    if pct < 34:
        return "Low"
    if pct < 67:
        return "Medium"
    return "High"


@app.get("/health")
def health():
    return {"status": "ok", "states_supported": STATES, "sectors_supported": SECTORS}


@app.post("/predict", response_model=PredictionResponse)
def predict(case: CaseInput):
    X = _row_to_features(case)

    risk_pct = round(float(clf.predict_proba(X)[0, 1]) * 100, 1)
    delay_days = int(round(reg.predict(X)[0]))

    shap_values = explainer.shap_values(X)
    vals = shap_values[1] if isinstance(shap_values, list) else shap_values
    row_vals = np.array(vals).flatten()

    top_idx = np.argsort(np.abs(row_vals))[::-1][:3]
    drivers = [
        RiskDriver(feature=X.columns[i], impact=round(float(row_vals[i]), 4))
        for i in top_idx
    ]

        # Save this prediction so it shows up in analytics
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        "INSERT INTO predictions (case_id, state, sector, risk_pct, risk_band, estimated_delay_days, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (case.case_id, case.state, case.sector, risk_pct, _risk_band(risk_pct), delay_days, datetime.utcnow().isoformat())
    )
    conn.commit()
    conn.close()

    return PredictionResponse(
        case_id=case.case_id,
        risk_pct=risk_pct,
        risk_band=_risk_band(risk_pct),
        estimated_delay_days=delay_days,
        top_drivers=drivers,
    )

@app.get("/cases/predictions")
def all_case_predictions():
    """Return every prediction officers have actually run, stored in the database."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    rows = conn.execute("SELECT * FROM predictions ORDER BY created_at DESC").fetchall()
    
    results = []
    for r in rows:
        results.append({
            "case_id": r["case_id"],
            "state": r["state"],
            "sector": r["sector"],
            "risk_pct": r["risk_pct"],
            "risk_band": r["risk_band"],
            "estimated_delay_days": r["estimated_delay_days"],
            "created_at": r["created_at"],
        })
    conn.close()
    return {"cases": results}


_cached_df = None

def get_annotated_df():
    global _cached_df
    if _cached_df is not None:
        return _cached_df
        
    try:
        df = pd.read_csv("data/land_acquisition_cases.csv")
    except Exception:
        return pd.DataFrame()

    cat_encoded = encoder.transform(df[["state", "sector"]])
    cat_cols = encoder.get_feature_names_out(["state", "sector"])
    cat_df = pd.DataFrame(cat_encoded, columns=cat_cols)
    numeric_cols = [
        "num_landowners", "consent_pct", "consent_growth_rate",
        "litigation_flag", "title_dispute_flag", "compensation_gap_pct",
        "pending_approvals", "days_since_notification",
    ]
    X = pd.concat([df[numeric_cols].reset_index(drop=True), cat_df], axis=1)
    X = X[feature_columns]

    risk_probs = clf.predict_proba(X)[:, 1] * 100
    delay_days = reg.predict(X)

    # SHAP explainer
    shap_values = explainer.shap_values(X)
    vals = shap_values[1] if isinstance(shap_values, list) else shap_values
    
    # Vectorized extraction of top driver
    top_driver_indices = np.argmax(np.abs(vals), axis=1)
    top_drivers_per_row = [X.columns[i] for i in top_driver_indices]

    df["risk_pct"] = risk_probs
    df["delay_days"] = delay_days
    df["top_bottleneck"] = top_drivers_per_row
    df["high_risk"] = df["risk_pct"] >= 67
    
    def get_risk_level(p):
        if p > 75: return "Critical"
        if p >= 60: return "High"
        if p >= 40: return "Medium"
        return "Low"
    
    df["risk_level"] = df["risk_pct"].apply(get_risk_level)

    # Human readable feature mapping
    feature_map = {
        "litigation_flag": "Court litigation",
        "compensation_gap_pct": "Compensation gap disputes",
        "title_dispute_flag": "Title / ownership disputes",
        "pending_approvals": "Pending approvals",
        "consent_pct": "Low landowner consent",
        "consent_growth_rate": "Low landowner consent",
        "days_since_notification": "Process delay",
        "num_landowners": "High stakeholder volume"
    }
    df["top_bottleneck_human"] = df["top_bottleneck"].map(lambda x: feature_map.get(x, "Other factors"))

    _cached_df = df
    return df


@app.get("/analytics/state-risk")
def analytics_state_risk():
    df = get_annotated_df()
    if df.empty:
        return []

    result = []
    for state, group in df.groupby("state"):
        raw_bn = group["top_bottleneck"].mode()[0]
        # human readable mapping or fallback to raw
        feature_map = {
            "litigation_flag": "Court litigation",
            "compensation_gap_pct": "Compensation gap disputes",
            "title_dispute_flag": "Title / ownership disputes",
            "pending_approvals": "Pending approvals",
            "consent_pct": "Low landowner consent",
            "consent_growth_rate": "Low landowner consent",
            "days_since_notification": "Process delay",
            "num_landowners": "High stakeholder volume"
        }
        human_bn = feature_map.get(raw_bn, "Other factors")

        sector_breakdown = []
        for sector, s_group in group.groupby("sector"):
            sector_breakdown.append({
                "sector": str(sector),
                "cases": int(len(s_group)),
                "avg_risk_pct": float(s_group["risk_pct"].mean())
            })

        result.append({
            "state": str(state),
            "cases": int(len(group)),
            "avg_risk_pct": float(group["risk_pct"].mean()),
            "avg_delay_days": float(group["delay_days"].mean()),
            "high_risk_cases": int(group["high_risk"].sum()),
            "top_bottleneck": human_bn,
            "sector_breakdown": sector_breakdown
        })

    return result

@app.get("/analytics/state-cases")
def analytics_state_cases(state: str, limit: int = 10):
    df = get_annotated_df()
    if df.empty:
        return []
    state_df = df[df["state"].str.lower() == state.lower()]
    state_df = state_df.sort_values(by="risk_pct", ascending=False).head(limit)
    
    cases = []
    for _, row in state_df.iterrows():
        cases.append({
            "case_id": str(row.get("case_id", "")),
            "sector": str(row["sector"]),
            "risk_pct": float(row["risk_pct"]),
            "risk_level": str(row["risk_level"]),
            "expected_delay_days": int(row["delay_days"]),
            "top_driver": str(row["top_bottleneck_human"]),
            "days_since_notification": int(row["days_since_notification"])
        })
    return cases