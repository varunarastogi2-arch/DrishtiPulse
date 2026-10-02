"""
generate_dataset.py
--------------------
Builds a synthetic training dataset of land-acquisition cases for PredictLand.

Why synthetic, and why "grounded": there is no public, row-level dataset of
individual land-acquisition cases with outcomes (we checked Kaggle, data.gov.in,
eGazette, e-Courts). What IS public are real aggregate statistics:

  - ~35% of PRAGATI-flagged infrastructure project delays are attributed to
    land acquisition (Ministry data reviewed under PRAGATI / MoRTH parliamentary
    reports, 2024-2025).
  - Land-related delays are heavily skewed toward a handful of states
    (Maharashtra, Uttar Pradesh, Bihar, Madhya Pradesh, Karnataka, West Bengal
    consistently top delayed-project lists in MoRTH parliamentary data).
  - Median real-world delay on affected projects runs from several months to
    multiple years, with litigation being a strong multiplier.

This script uses those real, cited parameters to calibrate a synthetic case
generator, instead of picking arbitrary numbers. Swap in real row-level data
later (e.g. via the `datagovindia` package) without changing anything
downstream — the column schema stays the same.
"""

import numpy as np
import pandas as pd

RNG = np.random.default_rng(42)
N_CASES = 6000

# States weighted roughly by their real share of delayed infra projects
# (MoRTH parliamentary data, 2024-25) — heavier weight = more delayed cases.
STATES = [
    "Maharashtra", "Uttar Pradesh", "Bihar", "Madhya Pradesh", "Karnataka",
    "West Bengal", "Andhra Pradesh", "Chhattisgarh", "Rajasthan", "Gujarat",
    "Tamil Nadu", "Odisha", "Haryana", "Punjab", "Telangana",
]
STATE_WEIGHTS = np.array([12, 10, 9, 8, 7, 7, 6, 6, 6, 6, 6, 5, 5, 4, 3], dtype=float)
STATE_WEIGHTS /= STATE_WEIGHTS.sum()

SECTORS = ["Roads", "Railways", "Irrigation", "Power/Transmission", "Urban Metro", "Housing"]
SECTOR_WEIGHTS = np.array([0.30, 0.20, 0.15, 0.15, 0.12, 0.08])


def generate_cases(n=N_CASES, seed=42):
    rng = np.random.default_rng(seed)

    state = rng.choice(STATES, size=n, p=STATE_WEIGHTS)
    sector = rng.choice(SECTORS, size=n, p=SECTOR_WEIGHTS)

    num_landowners = rng.gamma(shape=2.0, scale=15, size=n).astype(int) + 1
    consent_pct = np.clip(rng.beta(2.2, 1.8, size=n) * 100, 0, 100)
    consent_growth_rate = rng.normal(loc=1.5, scale=1.2, size=n)  # % points/month
    consent_growth_rate = np.clip(consent_growth_rate, -1, 6)

    litigation_flag = rng.binomial(1, 0.28, size=n)  # ~28% of cases have active litigation
    title_dispute_flag = rng.binomial(1, 0.18, size=n)
    compensation_gap_pct = np.clip(rng.normal(loc=22, scale=15, size=n), 0, 100)
    pending_approvals = rng.poisson(lam=2.2, size=n)
    days_since_notification = rng.gamma(shape=2.0, scale=180, size=n).astype(int)

    # ---- Ground-truth risk score (0-1) built from a weighted, interpretable
    # combination of the features above, matching the real ~35% land-related
    # delay rate after calibration below.
    z = (
        -0.028 * consent_pct
        + 1.35 * litigation_flag
        + 0.95 * title_dispute_flag
        + 0.020 * compensation_gap_pct
        + 0.18 * pending_approvals
        + 0.0016 * days_since_notification
        + 0.010 * num_landowners
        - 0.20 * consent_growth_rate
        + rng.normal(0, 0.6, size=n)  # irreducible noise
    )
    prob_delay = 1 / (1 + np.exp(-(z - np.quantile(z, 0.74))))  # calibrate ~35% positive rate
    delay_label = rng.binomial(1, prob_delay)

    # Delay duration (days): baseline + extra days driven by the same risk
    # drivers, only really "long" when the case is actually delayed.
    base_days = rng.gamma(shape=2.0, scale=60, size=n)
    extra_days = (
        delay_label * (
            200
            + 260 * litigation_flag
            + 140 * title_dispute_flag
            + 2.2 * compensation_gap_pct
            + 35 * pending_approvals
            + rng.normal(0, 60, size=n)
        )
    )
    delay_days = np.clip(base_days + extra_days, 15, None).astype(int)

    df = pd.DataFrame({
        "case_id": [f"CASE-{i:05d}" for i in range(1, n + 1)],
        "state": state,
        "sector": sector,
        "num_landowners": num_landowners,
        "consent_pct": consent_pct.round(1),
        "consent_growth_rate": consent_growth_rate.round(2),
        "litigation_flag": litigation_flag,
        "title_dispute_flag": title_dispute_flag,
        "compensation_gap_pct": compensation_gap_pct.round(1),
        "pending_approvals": pending_approvals,
        "days_since_notification": days_since_notification,
        "delay_label": delay_label,          # classification target
        "delay_days": delay_days,             # regression target
    })
    return df


if __name__ == "__main__":
    df = generate_cases()
    out_path = "data/land_acquisition_cases.csv"
    df.to_csv(out_path, index=False)
    print(f"Wrote {len(df)} rows to {out_path}")
    print(f"Delay rate: {df['delay_label'].mean():.1%}  (real-world PRAGATI figure: ~35%)")
    print(df.head())
