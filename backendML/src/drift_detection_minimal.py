"""
drift_detection_minimal.py — Minimal drift detection (no external dependencies issues)
====================================================================================
Ultra-lightweight version for initial testing. Tests only core drift detection logic.

Usage:
    python drift_detection_minimal.py
"""

import sys
import os

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import pandas as pd
import numpy as np
from scipy.stats import ks_2samp
import json
from datetime import datetime


def load_data_simple():
    """Load data directly from CSV."""
    try:
        df = pd.read_csv("data/processed/churn_cleaned.csv")
        if df.empty:
            raise ValueError("Data is empty")
        
        X = df.drop("Churn", axis=1)
        y = df["Churn"]
        
        # Simple train/test split
        split_idx = int(len(df) * 0.8)
        X_train, X_test = X[:split_idx], X[split_idx:]
        y_train, y_test = y[:split_idx], y[split_idx:]
        
        print(f"✅ Data loaded: Train {X_train.shape} | Test {X_test.shape}")
        return X_train, X_test, y_train, y_test
    except FileNotFoundError:
        print("❌ File not found: data/processed/churn_cleaned.csv")
        print("   Please run preprocessing first")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error loading data: {e}")
        sys.exit(1)


def simulate_drift(df_test, noise_level=0.3):
    """Simulate drift by shifting means and adding noise."""
    df_drifted = df_test.copy()
    numeric_cols = df_drifted.select_dtypes(include=[np.number]).columns.tolist()
    
    print(f"\n🔧 Simulating drift on {len(numeric_cols)} numeric features...")
    
    for col in numeric_cols:
        std_dev = df_drifted[col].std()
        # Shift mean by 1.5 * std and add noise
        noise = np.random.normal(
            loc=std_dev * 1.5,
            scale=std_dev * noise_level,
            size=len(df_drifted)
        )
        df_drifted[col] = df_drifted[col] + noise
    
    return df_drifted


def detect_drift_ks(df_train, df_test_drifted, p_value_threshold=0.05):
    """Detect drift using Kolmogorov-Smirnov test."""
    numeric_cols = df_train.select_dtypes(include=[np.number]).columns.tolist()
    drifted_columns = []
    ks_details = {}
    
    print(f"\n📊 Running KS-Test on {len(numeric_cols)} features...")
    
    for col in numeric_cols:
        try:
            stat, p_value = ks_2samp(
                df_train[col].dropna(),
                df_test_drifted[col].dropna()
            )
            ks_details[col] = {
                "stat": float(stat),
                "p_value": float(p_value),
                "drifted": bool(p_value < p_value_threshold),
                "significance_level": p_value_threshold
            }
            
            if p_value < p_value_threshold:
                drifted_columns.append(col)
        except Exception as e:
            print(f"   ⚠️  Error on {col}: {e}")
            continue
    
    drift_share = len(drifted_columns) / len(numeric_cols) if numeric_cols else 0
    return drifted_columns, drift_share, ks_details


def save_results(drifted_cols, drift_share, ks_details):
    """Save results to JSON."""
    os.makedirs("reports", exist_ok=True)
    
    results = {
        "timestamp": datetime.now().isoformat(),
        "drift_share": float(drift_share),
        "drifted_features_count": len(drifted_cols),
        "drifted_features": drifted_cols,
        "ks_test_details": ks_details
    }
    
    output_path = "reports/drift_detection_minimal.json"
    with open(output_path, "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"\n💾 Results saved to {output_path}")
    return output_path


def main():
    """Run minimal drift detection."""
    print("="*70)
    print("   🔍 MINIMAL DRIFT DETECTION TEST")
    print("="*70)
    
    # Step 1: Load data
    print("\n[1] Loading data...")
    X_train, X_test, y_train, y_test = load_data_simple()
    
    # Step 2: Simulate drift
    print("\n[2] Simulating data drift...")
    X_current = simulate_drift(X_test, noise_level=0.3)
    
    # Step 3: Detect drift
    print("\n[3] Detecting drift via KS-Test...")
    drifted_cols, drift_share, ks_details = detect_drift_ks(X_train, X_current)
    
    total_features = len(X_train.select_dtypes(include=[np.number]).columns)
    
    # Step 4: Display results
    print("\n" + "="*70)
    print("   📈 RESULTS")
    print("="*70)
    
    print(f"\n✓ Features analyzed: {total_features}")
    print(f"✓ Drifted features: {len(drifted_cols)} ({len(drifted_cols)/total_features*100:.1f}%)")
    print(f"✓ Drift share: {drift_share:.1%}")
    
    if drifted_cols:
        print(f"\n📍 Drifted columns (top 10):")
        for i, col in enumerate(drifted_cols[:10], 1):
            p_value = ks_details[col]["p_value"]
            print(f"   {i:2}. {col:30} (p-value: {p_value:.2e})")
        
        if len(drifted_cols) > 10:
            print(f"   ... and {len(drifted_cols) - 10} more columns")
    
    # Step 5: Save results
    print("\n[4] Saving results...")
    output_path = save_results(drifted_cols, drift_share, ks_details)
    
    # Step 6: Show interpretation
    print("\n" + "="*70)
    print("   📝 INTERPRETATION")
    print("="*70)
    
    print(f"\nDrift level: {drift_share:.1%}")
    if drift_share < 0.15:
        print("→ Status: ✅ STABLE (minimal drift)")
    elif drift_share < 0.30:
        print("→ Status: ⚠️  MODERATE (consider action)")
    else:
        print("→ Status: 🔴 HIGH (retraining recommended)")
    
    print("\nKS-Test p-values interpretation:")
    print("  p-value < 0.05   → Distribution changed (drift detected)")
    print("  p-value ≥ 0.05   → Distribution similar (no drift)")
    
    print("\n" + "="*70)
    print("   ✨ Test completed successfully!")
    print("="*70)
    
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\n\n⏹️  Interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
