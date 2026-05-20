import pandas as pd
from sklearn.model_selection import train_test_split

def load_data():
    df = pd.read_csv("data/processed/churn_cleaned.csv")

    X = df.drop("Churn", axis=1)
    y = df["Churn"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print(f" Données chargées — Train: {X_train.shape} | Test: {X_test.shape}")
    return X_train, X_test, y_train, y_test