# DrishtiPulse: AI Early-Warning System for Land Acquisition Delays

Smart India Hackathon 2026 · Problem Statement SIH26017 · Team CodeCrafterz

Predicts delay risk for land acquisition cases, explains why using SHAP,
and shows state-wise bottlenecks on an interactive heatmap so officers know
which cases to review first.

## Features
- ML risk engine (XGBoost / Random Forest) with SHAP explanations
- Analytics dashboard and state-level risk heatmap
- Priority queue of high-risk cases by sector
- What-if simulator and AI action drafter

## Architecture

DrishtiPulse is a three-layer system: a React dashboard, a FastAPI service that
serves predictions and analytics, and an ML engine that scores every case for
delay risk and explains the score.

```mermaid
flowchart LR
    subgraph SRC["Data Sources"]
        S1["Synthetic dataset<br/>(prototype)"]
        S2["LACRRIS · MoSPI · eGazette<br/>e-Courts · Parliament<br/>(planned, via MoU)"]
    end

    subgraph ML["ML Risk Engine"]
        FE["Feature Engineering<br/>consent %, litigation flag,<br/>compensation gap, days since notice"]
        CLF["Classifier<br/>delay risk %"]
        REG["Regressor<br/>expected delay days"]
        SHAP["SHAP<br/>top risk drivers"]
        FE --> CLF
        FE --> REG
        CLF --> SHAP
    end

    subgraph API["FastAPI Backend"]
        P["/predict"]
        A["/analytics/*"]
        DB[("predictions.db")]
        P --> DB
        A --> DB
    end

    subgraph UI["React Dashboard (Vite)"]
        AN["Analysis KPIs & charts"]
        HM["State risk heatmap<br/>+ priority queue"]
        SIM["What-if simulator"]
        DR["AI action drafter"]
        LG["Role-based login"]
    end

    S1 --> FE
    S2 -.-> FE
    CLF --> P
    REG --> P
    SHAP --> P
    UI <-->|"REST / JSON"| API
    DR -->|"LLM draft"| ALERT["Alerts & letters<br/>to the right officer"]
```


## Tech stack
React + Vite, FastAPI, XGBoost, SHAP, SQLite/PostgreSQL

## Run locally
Backend:
    cd DrishtiPulse
    python -m venv venv
    venv\Scripts\activate
    pip install -r requirements.txt
    python train_model.py        # only if models/ is missing
    python seed_predictions.py   # creates predictions.db
    uvicorn api:app --reload --port 8000

Frontend (second terminal):
    cd web
    npm install
    npm run dev

Open http://localhost:5173

### Project structure

```
predictland-ml/
├── DrishtiPulse/            # Backend and ML
│   ├── api.py               # FastAPI app and analytics endpoints
│   ├── train_model.py       # Trains and saves the models
│   ├── seed_predictions.py  # Fills predictions.db from the dataset
│   ├── models/              # Trained model files
│   ├── data/                # Synthetic dataset
│   └── requirements.txt
└── web/                     # Frontend
    ├── public/
    │   └── india-states.json   # State boundaries for the heatmap
    └── src/
        ├── components/         # RiskHeatmap, AIActionDrafter, LoginModal
        ├── App.jsx
        └── main.jsx
```

## Data note
Real land acquisition case records are legally sensitive and access-restricted.
This prototype uses a synthetic dataset modelled on public research (PRAGATI,
LACRRIS). Risk scores are decision-support aids, not legal determinations.