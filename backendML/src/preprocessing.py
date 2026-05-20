import pandas as pd
from sklearn.preprocessing import StandardScaler

def preprocess():
    df = pd.read_csv("data/raw/WA_Fn-UseC_-Telco-Customer-Churn.csv")

    # Supprimer customerID
    df.drop("customerID", axis=1, inplace=True)

    # TotalCharges : convertir en float
    df["TotalCharges"] = pd.to_numeric(df["TotalCharges"], errors="coerce")
    df.dropna(inplace=True)

    # Encoder la cible
    df["Churn"] = df["Churn"].map({"Yes": 1, "No": 0})

    # Encoder gender
    df["gender"] = df["gender"].map({"Male": 1, "Female": 0})

    # Encoder colonnes binaires Yes/No
    binary_cols = ["Partner", "Dependents", "PhoneService",
                   "PaperlessBilling", "MultipleLines",
                   "OnlineSecurity", "OnlineBackup",
                   "DeviceProtection", "TechSupport",
                   "StreamingTV", "StreamingMovies"]

    for col in binary_cols:
        df[col] = df[col].map({
            "Yes": 1, "No": 0,
            "No phone service": 0,
            "No internet service": 0
        })

    # One-Hot Encoding
    df = pd.get_dummies(df, columns=["InternetService",
                                      "Contract",
                                      "PaymentMethod"])

    # Normalisation
    scaler = StandardScaler()
    df[["tenure", "MonthlyCharges", "TotalCharges"]] = scaler.fit_transform(
        df[["tenure", "MonthlyCharges", "TotalCharges"]]
    )

    # Sauvegarder
    df.to_csv("data/processed/churn_cleaned.csv", index=False)
    print(f" Preprocessing terminé — shape: {df.shape}")
    return df

if __name__ == "__main__":
    preprocess()