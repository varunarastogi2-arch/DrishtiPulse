"""
seed_predictions.py
--------------------
One-time script: runs every case in the synthetic dataset through the live
/predict API, so the new predictions.db has realistic starting history
instead of being empty for the demo.

Make sure the API is already running (uvicorn api:app --reload --port 8000)
in another terminal before running this script.

Run:
    python seed_predictions.py
"""

import pandas as pd
import requests

API_URL = "http://127.0.0.1:8000/predict"
DATA_PATH = "data/land_acquisition_cases.csv"

FIELDS = [
    "case_id", "state", "sector", "num_landowners", "consent_pct",
    "consent_growth_rate", "litigation_flag", "title_dispute_flag",
    "compensation_gap_pct", "pending_approvals", "days_since_notification",
]


def main():
    df = pd.read_csv(DATA_PATH)
    total = len(df)
    print(f"Seeding {total} cases into predictions.db via {API_URL} ...")

    success, failed = 0, 0
    for i, row in df.iterrows():
        payload = {field: row[field] for field in FIELDS}
        # JSON can't serialize numpy int64/float64 directly — cast to native types
        payload = {k: (v.item() if hasattr(v, "item") else v) for k, v in payload.items()}

        try:
            resp = requests.post(API_URL, json=payload, timeout=10)
            if resp.status_code == 200:
                success += 1
            else:
                failed += 1
                if failed <= 3:  # only print the first few errors, avoid flooding
                    print(f"  Failed on {payload['case_id']}: {resp.status_code} {resp.text[:200]}")
        except Exception as e:
            failed += 1
            if failed <= 3:
                print(f"  Error on {payload.get('case_id', '?')}: {e}")

        if (i + 1) % 500 == 0:
            print(f"  ...{i + 1}/{total} done")

    print(f"\nDone. Success: {success}, Failed: {failed}")
    print("Your /cases/predictions endpoint should now return this seeded history.")


if __name__ == "__main__":
    main()