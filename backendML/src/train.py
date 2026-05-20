import mlflow
import mlflow.sklearn
import warnings
warnings.filterwarnings("ignore")

from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier, AdaBoostClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from xgboost import XGBClassifier
from sklearn.decomposition import PCA
from sklearn.metrics import (accuracy_score, precision_score,
                             recall_score, f1_score)

from data_loader import load_data


# Fonction d'évaluation

def evaluate(model, X_test, y_test):
    y_pred = model.predict(X_test)
    return {
        "accuracy":  accuracy_score(y_test, y_pred),
        "precision": precision_score(y_test, y_pred),
        "recall":    recall_score(y_test, y_pred),
        "f1_score":  f1_score(y_test, y_pred)
    }


# Fonction run MLflow

def run_experiment(model, params, run_name,
                   X_train, X_test, y_train, y_test):

    with mlflow.start_run(run_name=run_name):
        model.fit(X_train, y_train)
        metrics = evaluate(model, X_test, y_test)

        for key, val in params.items():
            mlflow.log_param(key, val)

        for key, val in metrics.items():
            mlflow.log_metric(key, val)

        mlflow.sklearn.log_model(model, "model")

        print(f"  [{run_name}] "
              f"Accuracy={metrics['accuracy']:.4f} | "
              f"F1={metrics['f1_score']:.4f} | "
              f"Recall={metrics['recall']:.4f}")

    return metrics


# MAIN

if __name__ == "__main__":

    X_train, X_test, y_train, y_test = load_data()
    mlflow.set_experiment("Churn_Prediction")

    print("\n" + "="*55)
    print("   EXPÉRIMENTATIONS CHURN — MLflow")
    print("="*55)

    # 1. KNN
    print("\n KNN")
    for k in [3, 5, 7, 11]:
        run_experiment(
            KNeighborsClassifier(n_neighbors=k),
            {"algorithm": "KNN", "k": k},
            f"KNN_k={k}",
            X_train, X_test, y_train, y_test
        )

    # 2. SVM
    print("\n SVM")
    for kernel in ["linear", "rbf", "poly"]:
        run_experiment(
            SVC(kernel=kernel, random_state=42),
            {"algorithm": "SVM", "kernel": kernel},
            f"SVM_kernel={kernel}",
            X_train, X_test, y_train, y_test
        )

    # 3. Random Forest
    print("\n Random Forest")
    for n_trees in [50, 100, 200]:
        for max_depth in [5, 10, None]:
            depth_label = max_depth if max_depth else "None"
            run_experiment(
                RandomForestClassifier(n_estimators=n_trees,
                                       max_depth=max_depth,
                                       random_state=42),
                {"algorithm": "RandomForest",
                 "n_estimators": n_trees,
                 "max_depth": depth_label},
                f"RF_n={n_trees}_depth={depth_label}",
                X_train, X_test, y_train, y_test
            )

    # 4. Logistic Regression
    print("\n Logistic Regression")
    for C in [0.01, 0.1, 1, 10]:
        run_experiment(
            LogisticRegression(C=C, max_iter=1000, random_state=42),
            {"algorithm": "LogisticRegression", "C": C},
            f"LogReg_C={C}",
            X_train, X_test, y_train, y_test
        )

    # 5. PCA + Random Forest
    print("\n PCA + Random Forest")
    for n_components in [5, 10, 15]:
        pca = PCA(n_components=n_components)
        X_train_pca = pca.fit_transform(X_train)
        X_test_pca  = pca.transform(X_test)
        run_experiment(
            RandomForestClassifier(n_estimators=100, random_state=42),
            {"algorithm": "PCA+RandomForest",
             "n_components": n_components,
             "n_estimators": 100},
            f"PCA_{n_components}_RF",
            X_train_pca, X_test_pca, y_train, y_test
        )

    # 6. AdaBoost
    print("\n AdaBoost")
    for n_estimators in [50, 100, 200]:
        for learning_rate in [0.01, 0.1, 1.0]:
            run_experiment(
                AdaBoostClassifier(
                    estimator=DecisionTreeClassifier(max_depth=1),
                    n_estimators=n_estimators,
                    learning_rate=learning_rate,
                    random_state=42
                ),
                {"algorithm": "AdaBoost",
                 "n_estimators": n_estimators,
                 "learning_rate": learning_rate,
                 "base_estimator": "DecisionTree(depth=1)"},
                f"AdaBoost_n={n_estimators}_lr={learning_rate}",
                X_train, X_test, y_train, y_test
            )

    # 7. XGBoost
    print("\n XGBoost")
    for n_estimators in [100, 200, 300]:
        for max_depth in [3, 5, 7]:
            for learning_rate in [0.01, 0.1, 0.3]:
                run_experiment(
                    XGBClassifier(
                        n_estimators=n_estimators,
                        max_depth=max_depth,
                        learning_rate=learning_rate,
                        use_label_encoder=False,
                        eval_metric="logloss",
                        random_state=42
                    ),
                    {"algorithm": "XGBoost",
                     "n_estimators": n_estimators,
                     "max_depth": max_depth,
                     "learning_rate": learning_rate},
                    f"XGB_n={n_estimators}_d={max_depth}_lr={learning_rate}",
                    X_train, X_test, y_train, y_test
                )

    print("\n Tous les runs sont terminés !")