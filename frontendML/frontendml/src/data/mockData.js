// ===== TELCO CUSTOMER CHURN DATASET MOCK DATA =====

export const ALGORITHMS = [
  {
    id: 'logistic_regression',
    name: 'Logistic Regression',
    category: 'Linear',
    icon: '📈',
    description: 'A linear model that predicts the probability of a binary outcome using a logistic function. Best for linearly separable data.',
    pros: ['Simple and interpretable', 'Fast training', 'Good baseline'],
    cons: ['Assumes linear decision boundary', 'May underfit complex data'],
    hyperparams: [
      { key: 'C', label: 'Regularization (C)', type: 'number', default: 1.0, min: 0.001, max: 100, step: 0.1, tooltip: 'Inverse of regularization strength. Smaller values = stronger regularization.' },
      { key: 'max_iter', label: 'Max Iterations', type: 'number', default: 100, min: 10, max: 10000, step: 10, tooltip: 'Maximum iterations for solver convergence.' },
      { key: 'solver', label: 'Solver', type: 'select', default: 'lbfgs', options: ['lbfgs', 'liblinear', 'newton-cg', 'sag', 'saga'], tooltip: 'Algorithm used for optimization.' },
      { key: 'penalty', label: 'Penalty', type: 'select', default: 'l2', options: ['l1', 'l2', 'elasticnet', 'none'], tooltip: 'Regularization penalty type.' },
    ]
  },
  {
    id: 'random_forest',
    name: 'Random Forest',
    category: 'Ensemble',
    icon: '🌲',
    description: 'An ensemble of decision trees trained on random subsets of data. Reduces overfitting through bagging and feature randomization.',
    pros: ['Handles non-linear data', 'Feature importance', 'Robust to outliers'],
    cons: ['Can be slow with many trees', 'Less interpretable'],
    hyperparams: [
      { key: 'n_estimators', label: 'Number of Trees', type: 'number', default: 100, min: 10, max: 1000, step: 10, tooltip: 'Number of decision trees in the forest.' },
      { key: 'max_depth', label: 'Max Depth', type: 'number', default: 10, min: 1, max: 50, step: 1, tooltip: 'Maximum depth of each tree. Controls model complexity.' },
      { key: 'min_samples_split', label: 'Min Samples Split', type: 'number', default: 2, min: 2, max: 20, step: 1, tooltip: 'Minimum samples to split a node.' },
      { key: 'min_samples_leaf', label: 'Min Samples Leaf', type: 'number', default: 1, min: 1, max: 20, step: 1, tooltip: 'Minimum samples at a leaf node.' },
      { key: 'criterion', label: 'Criterion', type: 'select', default: 'gini', options: ['gini', 'entropy', 'log_loss'], tooltip: 'Function to measure split quality.' },
    ]
  },
  {
    id: 'svm',
    name: 'Support Vector Machine',
    category: 'Kernel',
    icon: '🎯',
    description: 'Finds the optimal hyperplane that maximally separates classes. Effective in high-dimensional spaces with kernel trick.',
    pros: ['Effective in high dimensions', 'Memory efficient', 'Versatile kernels'],
    cons: ['Slow on large datasets', 'Sensitive to scaling'],
    hyperparams: [
      { key: 'C', label: 'Regularization (C)', type: 'number', default: 1.0, min: 0.001, max: 100, step: 0.1, tooltip: 'Trade-off between margin width and misclassification.' },
      { key: 'kernel', label: 'Kernel', type: 'select', default: 'rbf', options: ['linear', 'poly', 'rbf', 'sigmoid'], tooltip: 'Kernel type for decision boundary.' },
      { key: 'gamma', label: 'Gamma', type: 'select', default: 'scale', options: ['scale', 'auto'], tooltip: 'Kernel coefficient. Scale = 1/(n_features * variance).' },
      { key: 'degree', label: 'Polynomial Degree', type: 'number', default: 3, min: 1, max: 10, step: 1, tooltip: 'Degree for poly kernel only.' },
    ]
  },
  {
    id: 'knn',
    name: 'K-Nearest Neighbors',
    category: 'Instance',
    icon: '🔍',
    description: 'Classifies based on majority vote of K nearest training examples in the feature space.',
    pros: ['No training phase', 'Simple to understand', 'Non-parametric'],
    cons: ['Slow prediction on large data', 'Sensitive to irrelevant features'],
    hyperparams: [
      { key: 'n_neighbors', label: 'K (Neighbors)', type: 'number', default: 5, min: 1, max: 50, step: 1, tooltip: 'Number of neighbors to consider.' },
      { key: 'weights', label: 'Weights', type: 'select', default: 'uniform', options: ['uniform', 'distance'], tooltip: 'How to weight neighbor contributions.' },
      { key: 'metric', label: 'Distance Metric', type: 'select', default: 'minkowski', options: ['minkowski', 'euclidean', 'manhattan', 'chebyshev'], tooltip: 'Metric for distance computation.' },
      { key: 'algorithm', label: 'Algorithm', type: 'select', default: 'auto', options: ['auto', 'ball_tree', 'kd_tree', 'brute'], tooltip: 'Algorithm for nearest neighbor computation.' },
    ]
  },
  {
    id: 'gradient_boosting',
    name: 'Gradient Boosting',
    category: 'Ensemble',
    icon: '🚀',
    description: 'Builds an ensemble of weak learners sequentially, each correcting errors of the previous. XGBoost-style.',
    pros: ['State-of-art performance', 'Handles mixed types', 'Feature importance'],
    cons: ['Can overfit', 'Slower to train', 'Many hyperparameters'],
    hyperparams: [
      { key: 'n_estimators', label: 'Number of Boosting Stages', type: 'number', default: 100, min: 10, max: 1000, step: 10, tooltip: 'Number of sequential boosting stages.' },
      { key: 'learning_rate', label: 'Learning Rate', type: 'number', default: 0.1, min: 0.001, max: 1, step: 0.01, tooltip: 'Shrinkage to prevent overfitting. Lower = more boosting stages needed.' },
      { key: 'max_depth', label: 'Max Depth', type: 'number', default: 3, min: 1, max: 20, step: 1, tooltip: 'Maximum depth of individual trees.' },
      { key: 'subsample', label: 'Subsample Ratio', type: 'number', default: 1.0, min: 0.1, max: 1.0, step: 0.1, tooltip: 'Fraction of samples used for fitting each tree.' },
      { key: 'min_samples_leaf', label: 'Min Samples Leaf', type: 'number', default: 1, min: 1, max: 20, step: 1, tooltip: 'Minimum samples at a leaf node.' },
    ]
  },
  {
    id: 'neural_network',
    name: 'Neural Network (MLP)',
    category: 'Deep Learning',
    icon: '🧠',
    description: 'Multi-Layer Perceptron with backpropagation. Can model complex non-linear relationships.',
    pros: ['Models complex patterns', 'Flexible architecture', 'Universal approximator'],
    cons: ['Requires more data', 'Black box', 'Computationally expensive'],
    hyperparams: [
      { key: 'hidden_layers', label: 'Hidden Layers', type: 'text', default: '128,64,32', tooltip: 'Comma-separated layer sizes, e.g. "128,64,32".' },
      { key: 'activation', label: 'Activation Function', type: 'select', default: 'relu', options: ['relu', 'tanh', 'sigmoid', 'leaky_relu'], tooltip: 'Non-linear activation for hidden layers.' },
      { key: 'learning_rate', label: 'Learning Rate', type: 'number', default: 0.001, min: 0.0001, max: 0.1, step: 0.0001, tooltip: 'Step size for weight updates.' },
      { key: 'epochs', label: 'Epochs', type: 'number', default: 50, min: 1, max: 500, step: 1, tooltip: 'Number of full passes over the training data.' },
      { key: 'batch_size', label: 'Batch Size', type: 'number', default: 32, min: 8, max: 256, step: 8, tooltip: 'Number of samples per gradient update.' },
      { key: 'dropout', label: 'Dropout Rate', type: 'number', default: 0.2, min: 0, max: 0.8, step: 0.05, tooltip: 'Fraction of units to drop for regularization.' },
      { key: 'optimizer', label: 'Optimizer', type: 'select', default: 'adam', options: ['adam', 'sgd', 'rmsprop', 'adamw'], tooltip: 'Optimization algorithm.' },
    ]
  },
];

export const DATASET_COLUMNS = [
  { name: 'customerID', type: 'string', description: 'Unique customer identifier' },
  { name: 'gender', type: 'categorical', description: 'Male or Female', values: ['Male', 'Female'] },
  { name: 'SeniorCitizen', type: 'binary', description: '1 if senior citizen, 0 otherwise' },
  { name: 'Partner', type: 'categorical', description: 'Whether has partner', values: ['Yes', 'No'] },
  { name: 'Dependents', type: 'categorical', description: 'Whether has dependents', values: ['Yes', 'No'] },
  { name: 'tenure', type: 'numeric', description: 'Months with company', min: 0, max: 72 },
  { name: 'PhoneService', type: 'categorical', description: 'Phone service subscription', values: ['Yes', 'No'] },
  { name: 'MultipleLines', type: 'categorical', description: 'Multiple phone lines', values: ['Yes', 'No', 'No phone service'] },
  { name: 'InternetService', type: 'categorical', description: 'Internet provider type', values: ['DSL', 'Fiber optic', 'No'] },
  { name: 'OnlineSecurity', type: 'categorical', description: 'Online security add-on', values: ['Yes', 'No', 'No internet service'] },
  { name: 'OnlineBackup', type: 'categorical', description: 'Online backup add-on', values: ['Yes', 'No', 'No internet service'] },
  { name: 'DeviceProtection', type: 'categorical', description: 'Device protection add-on', values: ['Yes', 'No', 'No internet service'] },
  { name: 'TechSupport', type: 'categorical', description: 'Tech support add-on', values: ['Yes', 'No', 'No internet service'] },
  { name: 'StreamingTV', type: 'categorical', description: 'Streaming TV service', values: ['Yes', 'No', 'No internet service'] },
  { name: 'StreamingMovies', type: 'categorical', description: 'Streaming movies service', values: ['Yes', 'No', 'No internet service'] },
  { name: 'Contract', type: 'categorical', description: 'Contract type', values: ['Month-to-month', 'One year', 'Two year'] },
  { name: 'PaperlessBilling', type: 'categorical', description: 'Paperless billing', values: ['Yes', 'No'] },
  { name: 'PaymentMethod', type: 'categorical', description: 'Payment method', values: ['Electronic check', 'Mailed check', 'Bank transfer (automatic)', 'Credit card (automatic)'] },
  { name: 'MonthlyCharges', type: 'numeric', description: 'Monthly charge amount', min: 18.25, max: 118.75 },
  { name: 'TotalCharges', type: 'numeric', description: 'Total charges to date', min: 18.8, max: 8684.8 },
  { name: 'Churn', type: 'target', description: 'Whether customer churned', values: ['Yes', 'No'] },
];

// Generate realistic sample data rows
export const generateSampleData = (count = 50) => {
  const contracts = ['Month-to-month', 'One year', 'Two year'];
  const payments = ['Electronic check', 'Mailed check', 'Bank transfer (automatic)', 'Credit card (automatic)'];
  const internet = ['DSL', 'Fiber optic', 'No'];
  const yesNo = ['Yes', 'No'];

  return Array.from({ length: count }, (_, i) => {
    const tenure = Math.floor(Math.random() * 72) + 1;
    const monthlyCharges = +(18 + Math.random() * 100).toFixed(2);
    const totalCharges = +(monthlyCharges * tenure * (0.8 + Math.random() * 0.4)).toFixed(2);
    const contract = contracts[Math.floor(Math.random() * contracts.length)];
    const churn = contract === 'Month-to-month' ? (Math.random() > 0.55 ? 'Yes' : 'No') : (Math.random() > 0.85 ? 'Yes' : 'No');

    return {
      customerID: `${7590 + i}-${String.fromCharCode(65 + (i % 26))}${String.fromCharCode(65 + ((i * 7) % 26))}${String.fromCharCode(65 + ((i * 3) % 26))}${String.fromCharCode(65 + ((i * 11) % 26))}`,
      gender: Math.random() > 0.5 ? 'Male' : 'Female',
      SeniorCitizen: Math.random() > 0.84 ? 1 : 0,
      Partner: yesNo[Math.floor(Math.random() * 2)],
      Dependents: yesNo[Math.floor(Math.random() * 2)],
      tenure,
      PhoneService: Math.random() > 0.1 ? 'Yes' : 'No',
      InternetService: internet[Math.floor(Math.random() * internet.length)],
      Contract: contract,
      PaperlessBilling: yesNo[Math.floor(Math.random() * 2)],
      PaymentMethod: payments[Math.floor(Math.random() * payments.length)],
      MonthlyCharges: monthlyCharges,
      TotalCharges: totalCharges,
      Churn: churn,
    };
  });
};

// Mock model results for comparison
export const MOCK_RESULTS = {
  logistic_regression: {
    accuracy: 0.7965,
    precision: 0.6632,
    recall: 0.5417,
    f1: 0.5963,
    auc_roc: 0.8412,
    training_time: '2.3s',
    confusion_matrix: { tp: 195, fp: 99, fn: 165, tn: 951 },
    roc_curve: Array.from({ length: 50 }, (_, i) => ({
      fpr: i / 49,
      tpr: Math.min(1, (i / 49) ** 0.45 + Math.random() * 0.03),
    })),
    pr_curve: Array.from({ length: 50 }, (_, i) => ({
      recall: i / 49,
      precision: Math.max(0.2, 1 - (i / 49) ** 0.7 + Math.random() * 0.03),
    })),
    feature_importance: [
      { feature: 'tenure', importance: 0.28 },
      { feature: 'MonthlyCharges', importance: 0.22 },
      { feature: 'Contract', importance: 0.18 },
      { feature: 'TotalCharges', importance: 0.12 },
      { feature: 'InternetService', importance: 0.08 },
      { feature: 'PaymentMethod', importance: 0.05 },
      { feature: 'PaperlessBilling', importance: 0.04 },
      { feature: 'SeniorCitizen', importance: 0.03 },
    ],
  },
  random_forest: {
    accuracy: 0.8234,
    precision: 0.7102,
    recall: 0.5833,
    f1: 0.6406,
    auc_roc: 0.8701,
    training_time: '8.7s',
    confusion_matrix: { tp: 210, fp: 86, fn: 150, tn: 964 },
    roc_curve: Array.from({ length: 50 }, (_, i) => ({
      fpr: i / 49,
      tpr: Math.min(1, (i / 49) ** 0.38 + Math.random() * 0.03),
    })),
    pr_curve: Array.from({ length: 50 }, (_, i) => ({
      recall: i / 49,
      precision: Math.max(0.25, 1 - (i / 49) ** 0.6 + Math.random() * 0.03),
    })),
    feature_importance: [
      { feature: 'tenure', importance: 0.31 },
      { feature: 'MonthlyCharges', importance: 0.21 },
      { feature: 'TotalCharges', importance: 0.16 },
      { feature: 'Contract', importance: 0.14 },
      { feature: 'InternetService', importance: 0.07 },
      { feature: 'OnlineSecurity', importance: 0.04 },
      { feature: 'TechSupport', importance: 0.04 },
      { feature: 'PaymentMethod', importance: 0.03 },
    ],
  },
  svm: {
    accuracy: 0.8089,
    precision: 0.6845,
    recall: 0.5556,
    f1: 0.6134,
    auc_roc: 0.8523,
    training_time: '15.2s',
    confusion_matrix: { tp: 200, fp: 92, fn: 160, tn: 958 },
    roc_curve: Array.from({ length: 50 }, (_, i) => ({
      fpr: i / 49,
      tpr: Math.min(1, (i / 49) ** 0.42 + Math.random() * 0.03),
    })),
    pr_curve: Array.from({ length: 50 }, (_, i) => ({
      recall: i / 49,
      precision: Math.max(0.22, 1 - (i / 49) ** 0.65 + Math.random() * 0.03),
    })),
    feature_importance: [
      { feature: 'tenure', importance: 0.25 },
      { feature: 'MonthlyCharges', importance: 0.23 },
      { feature: 'Contract', importance: 0.17 },
      { feature: 'TotalCharges', importance: 0.14 },
      { feature: 'InternetService', importance: 0.09 },
      { feature: 'PaymentMethod', importance: 0.06 },
      { feature: 'OnlineSecurity', importance: 0.04 },
      { feature: 'SeniorCitizen', importance: 0.02 },
    ],
  },
  knn: {
    accuracy: 0.7812,
    precision: 0.6234,
    recall: 0.5139,
    f1: 0.5634,
    auc_roc: 0.8187,
    training_time: '0.5s',
    confusion_matrix: { tp: 185, fp: 112, fn: 175, tn: 938 },
    roc_curve: Array.from({ length: 50 }, (_, i) => ({
      fpr: i / 49,
      tpr: Math.min(1, (i / 49) ** 0.5 + Math.random() * 0.03),
    })),
    pr_curve: Array.from({ length: 50 }, (_, i) => ({
      recall: i / 49,
      precision: Math.max(0.18, 1 - (i / 49) ** 0.75 + Math.random() * 0.03),
    })),
    feature_importance: [
      { feature: 'tenure', importance: 0.20 },
      { feature: 'MonthlyCharges', importance: 0.19 },
      { feature: 'TotalCharges', importance: 0.18 },
      { feature: 'Contract', importance: 0.15 },
      { feature: 'InternetService', importance: 0.10 },
      { feature: 'PaymentMethod', importance: 0.08 },
      { feature: 'OnlineSecurity', importance: 0.06 },
      { feature: 'SeniorCitizen', importance: 0.04 },
    ],
  },
  gradient_boosting: {
    accuracy: 0.8356,
    precision: 0.7345,
    recall: 0.6111,
    f1: 0.6673,
    auc_roc: 0.8892,
    training_time: '12.1s',
    confusion_matrix: { tp: 220, fp: 80, fn: 140, tn: 970 },
    roc_curve: Array.from({ length: 50 }, (_, i) => ({
      fpr: i / 49,
      tpr: Math.min(1, (i / 49) ** 0.35 + Math.random() * 0.03),
    })),
    pr_curve: Array.from({ length: 50 }, (_, i) => ({
      recall: i / 49,
      precision: Math.max(0.3, 1 - (i / 49) ** 0.55 + Math.random() * 0.03),
    })),
    feature_importance: [
      { feature: 'tenure', importance: 0.30 },
      { feature: 'MonthlyCharges', importance: 0.20 },
      { feature: 'Contract', importance: 0.16 },
      { feature: 'TotalCharges', importance: 0.13 },
      { feature: 'InternetService', importance: 0.08 },
      { feature: 'OnlineSecurity', importance: 0.05 },
      { feature: 'TechSupport', importance: 0.05 },
      { feature: 'PaymentMethod', importance: 0.03 },
    ],
  },
  neural_network: {
    accuracy: 0.8178,
    precision: 0.7012,
    recall: 0.5694,
    f1: 0.6286,
    auc_roc: 0.8634,
    training_time: '45.3s',
    confusion_matrix: { tp: 205, fp: 88, fn: 155, tn: 962 },
    roc_curve: Array.from({ length: 50 }, (_, i) => ({
      fpr: i / 49,
      tpr: Math.min(1, (i / 49) ** 0.4 + Math.random() * 0.03),
    })),
    pr_curve: Array.from({ length: 50 }, (_, i) => ({
      recall: i / 49,
      precision: Math.max(0.25, 1 - (i / 49) ** 0.62 + Math.random() * 0.03),
    })),
    feature_importance: [
      { feature: 'tenure', importance: 0.26 },
      { feature: 'MonthlyCharges', importance: 0.24 },
      { feature: 'Contract', importance: 0.15 },
      { feature: 'TotalCharges', importance: 0.13 },
      { feature: 'InternetService', importance: 0.09 },
      { feature: 'OnlineSecurity', importance: 0.05 },
      { feature: 'PaymentMethod', importance: 0.05 },
      { feature: 'SeniorCitizen', importance: 0.03 },
    ],
  },
};

// Mock experiment history
export const EXPERIMENT_HISTORY = [
  {
    id: 'exp-001',
    timestamp: '2026-03-04T14:23:00Z',
    model: 'gradient_boosting',
    modelName: 'Gradient Boosting',
    version: 'v1.3.0',
    dataset: 'telco_churn_v2.csv',
    datasetVersion: 'v2.1',
    accuracy: 0.8356,
    f1: 0.6673,
    auc: 0.8892,
    status: 'success',
    params: { n_estimators: 200, learning_rate: 0.05, max_depth: 5 },
    notes: 'Best model so far. Used cleaned dataset with feature engineering.',
  },
  {
    id: 'exp-002',
    timestamp: '2026-03-04T12:10:00Z',
    model: 'random_forest',
    modelName: 'Random Forest',
    version: 'v1.2.1',
    dataset: 'telco_churn_v2.csv',
    datasetVersion: 'v2.1',
    accuracy: 0.8234,
    f1: 0.6406,
    auc: 0.8701,
    status: 'success',
    params: { n_estimators: 150, max_depth: 12, min_samples_split: 3 },
    notes: 'Good baseline. Feature importance reveals tenure as top predictor.',
  },
  {
    id: 'exp-003',
    timestamp: '2026-03-03T18:45:00Z',
    model: 'neural_network',
    modelName: 'Neural Network (MLP)',
    version: 'v1.1.0',
    dataset: 'telco_churn_v2.csv',
    datasetVersion: 'v2.0',
    accuracy: 0.8178,
    f1: 0.6286,
    auc: 0.8634,
    status: 'success',
    params: { hidden_layers: '128,64,32', learning_rate: 0.001, epochs: 100, dropout: 0.3 },
    notes: 'MLP with 3 hidden layers. Good but slower training.',
  },
  {
    id: 'exp-004',
    timestamp: '2026-03-03T15:30:00Z',
    model: 'svm',
    modelName: 'SVM',
    version: 'v1.0.0',
    dataset: 'telco_churn_v1.csv',
    datasetVersion: 'v1.0',
    accuracy: 0.8089,
    f1: 0.6134,
    auc: 0.8523,
    status: 'success',
    params: { C: 1.0, kernel: 'rbf', gamma: 'scale' },
    notes: 'SVM with RBF kernel. Slow on full dataset.',
  },
  {
    id: 'exp-005',
    timestamp: '2026-03-02T20:15:00Z',
    model: 'logistic_regression',
    modelName: 'Logistic Regression',
    version: 'v1.0.0',
    dataset: 'telco_churn_v1.csv',
    datasetVersion: 'v1.0',
    accuracy: 0.7965,
    f1: 0.5963,
    auc: 0.8412,
    status: 'success',
    params: { C: 0.5, solver: 'lbfgs', max_iter: 200 },
    notes: 'Simple baseline. Quick to train. Decent AUC.',
  },
  {
    id: 'exp-006',
    timestamp: '2026-03-02T16:00:00Z',
    model: 'knn',
    modelName: 'KNN',
    version: 'v1.0.0',
    dataset: 'telco_churn_v1.csv',
    datasetVersion: 'v1.0',
    accuracy: 0.7812,
    f1: 0.5634,
    auc: 0.8187,
    status: 'success',
    params: { n_neighbors: 7, weights: 'distance', metric: 'minkowski' },
    notes: 'KNN with distance weighting. Lowest performing model.',
  },
  {
    id: 'exp-007',
    timestamp: '2026-03-01T22:00:00Z',
    model: 'gradient_boosting',
    modelName: 'Gradient Boosting',
    version: 'v1.0.0',
    dataset: 'telco_churn_v1.csv',
    datasetVersion: 'v1.0',
    accuracy: 0.8012,
    f1: 0.6100,
    auc: 0.8502,
    status: 'warning',
    params: { n_estimators: 50, learning_rate: 0.1, max_depth: 3 },
    notes: 'Initial GB run. Underfitting detected — need more estimators.',
  },
];

// Model versions for MLOps
export const MODEL_VERSIONS = [
  { id: 'v1.3.0', model: 'Gradient Boosting', date: '2026-03-04', accuracy: 0.8356, status: 'production', tag: 'latest' },
  { id: 'v1.2.1', model: 'Random Forest', date: '2026-03-04', accuracy: 0.8234, status: 'staging', tag: 'candidate' },
  { id: 'v1.1.0', model: 'Neural Network', date: '2026-03-03', accuracy: 0.8178, status: 'archived', tag: '' },
  { id: 'v1.0.0', model: 'Logistic Regression', date: '2026-03-02', accuracy: 0.7965, status: 'archived', tag: 'baseline' },
];
