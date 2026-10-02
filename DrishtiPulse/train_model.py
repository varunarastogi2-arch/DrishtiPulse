"""
train_model.py
---------------
Trains two models on the case data:
  1. A classifier -> delay-risk % (0-100) per case
  2. A regressor  -> estimated delay duration in days

Then wraps both with a SHAP explainer so every prediction can be traced back
to its top 2-3 drivers (the "Explain" part of Predict -> Explain -> Alert).

Uses XGBoost (gradient-boosted trees) for both models — the same library
named in the tech-stack slide. Everything downstream (SHAP, the API
contract, feature columns) is unaffected by this choice; only the two
`.fit(...)` calls below would need to change if you ever swap algorithms
again.
"""

import joblib
import numpy as np
import pandas as pd
from xgboost import XGBClassifier, XGBRegressor
from sklearn.metrics import (
    accuracy_score, roc_auc_score, mean_absolute_error, classification_report,
)
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder

DATA_PATH = "data/land_acquisition_cases.csv"
MODEL_DIR = "models"

NUMERIC_FEATURES = [
    "num_landowners", "consent_pct", "consent_growth_rate",
    "litigation_flag", "title_dispute_flag", "compensation_gap_pct",
    "pending_approvals", "days_since_notification",
]
CATEGORICAL_FEATURES = ["state", "sector"]


def build_feature_matrix(df, encoder=None, fit=False):
    """One-hot encode state/sector, concat with numeric features."""
    cat = df[CATEGORICAL_FEATURES]
    if fit:
        encoder = OneHotEncoder(handle_unknown="ignore", sparse_output=False)
        cat_encoded = encoder.fit_transform(cat)
    else:
        cat_encoded = encoder.transform(cat)
    cat_cols = encoder.get_feature_names_out(CATEGORICAL_FEATURES)
    cat_df = pd.DataFrame(cat_encoded, columns=cat_cols, index=df.index)
    X = pd.concat([df[NUMERIC_FEATURES].reset_index(drop=True),
                    cat_df.reset_index(drop=True)], axis=1)
    return X, encoder


def main():
    df = pd.read_csv(DATA_PATH)
    print(f"Loaded {len(df)} cases | delay rate: {df['delay_label'].mean():.1%}")

    X, encoder = build_feature_matrix(df, fit=True)
    y_clf = df["delay_label"]
    y_reg = df["delay_days"]

    X_train, X_test, yclf_train, yclf_test, yreg_train, yreg_test = train_test_split(
        X, y_clf, y_reg, test_size=0.2, random_state=42, stratify=y_clf
    )

    # ---- Classifier: delay risk % ----
    # scale_pos_weight balances the classes (delay_label is ~35% positive)
    # the way class_weight="balanced" would for a RandomForest.
    pos_weight = (yclf_train == 0).sum() / (yclf_train == 1).sum()
    clf = XGBClassifier(
        n_estimators=300, max_depth=4, learning_rate=0.05,
        subsample=0.85, colsample_bytree=0.85,
        scale_pos_weight=pos_weight, eval_metric="logloss",
        random_state=42, n_jobs=-1,
    )
    clf.fit(X_train, yclf_train)
    clf_probs = clf.predict_proba(X_test)[:, 1]
    clf_preds = clf.predict(X_test)
    print("\n--- Risk classifier ---")
    print(f"Accuracy: {accuracy_score(yclf_test, clf_preds):.3f}")
    print(f"ROC-AUC:  {roc_auc_score(yclf_test, clf_probs):.3f}")
    print(classification_report(yclf_test, clf_preds, digits=3))

    # ---- Regressor: delay duration (days) ----
    reg = XGBRegressor(
        n_estimators=300, max_depth=4, learning_rate=0.05,
        subsample=0.85, colsample_bytree=0.85,
        random_state=42, n_jobs=-1,
    )
    reg.fit(X_train, yreg_train)
    reg_preds = reg.predict(X_test)
    mae = mean_absolute_error(yreg_test, reg_preds)
    print("\n--- Delay-duration regressor ---")
    print(f"MAE: {mae:.1f} days")

    # ---- Save everything the API needs ----
    joblib.dump(clf, f"{MODEL_DIR}/risk_classifier.joblib")
    joblib.dump(reg, f"{MODEL_DIR}/duration_regressor.joblib")
    joblib.dump(encoder, f"{MODEL_DIR}/encoder.joblib")
    joblib.dump(list(X.columns), f"{MODEL_DIR}/feature_columns.joblib")
    print(f"\nSaved models to {MODEL_DIR}/")

    # ---- Quick SHAP sanity check on a handful of test cases ----
    try:
        import shap
        explainer = shap.TreeExplainer(clf)
        sample = X_test.iloc[:3]
        sv = explainer.shap_values(sample)
        # shap_values shape handling differs by sklearn/shap version
        vals = sv[1] if isinstance(sv, list) else sv
        print("\n--- SHAP sanity check (top driver for first test case) ---")
        row_vals = np.array(vals[0]).flatten()
        top_idx = np.argsort(np.abs(row_vals))[::-1][:3]
        for i in top_idx:
            print(f"  {sample.columns[i]}: shap={row_vals[i]:.3f}")
    except ImportError:
        print("\n(shap not installed yet — run `pip install shap` to enable "
              "explainability; the API needs it, this training script doesn't.)")


if __name__ == "__main__":
    main()
