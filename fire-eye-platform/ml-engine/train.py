import pandas as pd
import numpy as np
import os
import joblib
from sklearn.ensemble import IsolationForest
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")

def load_data():
    """
    Mock data loading function. In production, this would query the PostGIS DB
    for historical FIRMS thermal anomalies and OSM intersection features.
    """
    # Generating synthetic data for demonstration
    # Features: brightness, frp (Fire Radiative Power), distance_to_industrial, distance_to_road
    np.random.seed(42)
    n_samples = 1000
    
    data = {
        'brightness': np.random.normal(320, 20, n_samples),
        'frp': np.random.exponential(50, n_samples),
        'dist_industrial_m': np.random.exponential(5000, n_samples),
        'dist_road_m': np.random.exponential(1000, n_samples),
    }
    
    df = pd.DataFrame(data)
    
    # Synthetic labels: 1 for Real Wildfire, 0 for Industrial/False Alarm
    # Real wildfires usually have high brightness, high FRP, and are far from industrial areas
    df['is_wildfire'] = ((df['brightness'] > 330) & 
                         (df['dist_industrial_m'] > 2000)).astype(int)
                         
    return df

def train_isolation_forest(X):
    """
    Unsupervised learning to detect anomalous thermal signatures.
    """
    print("Training Isolation Forest (Anomaly Detection)...")
    clf = IsolationForest(contamination=0.05, random_state=42)
    clf.fit(X)
    
    os.makedirs(MODELS_DIR, exist_ok=True)
    model_path = os.path.join(MODELS_DIR, "iso_forest.pkl")
    joblib.dump(clf, model_path)
    print(f"Isolation Forest model saved to {model_path}")
    return clf

def train_xgboost(X, y):
    """
    Supervised learning to classify if a thermal anomaly is a true wildfire.
    """
    print("Training XGBoost Classifier...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    clf = xgb.XGBClassifier(n_estimators=100, max_depth=4, learning_rate=0.1, random_state=42)
    clf.fit(X_train, y_train)
    
    # Evaluation
    preds = clf.predict(X_test)
    print("XGBoost Classification Report:")
    print(classification_report(y_test, preds))
    
    model_path = os.path.join(MODELS_DIR, "xgb_classifier.json")
    clf.save_model(model_path)
    print(f"XGBoost model saved to {model_path}")
    return clf

if __name__ == "__main__":
    print("Starting ML Engine Training Pipeline...")
    df = load_data()
    
    features = ['brightness', 'frp', 'dist_industrial_m', 'dist_road_m']
    X = df[features]
    y = df['is_wildfire']
    
    train_isolation_forest(X)
    train_xgboost(X, y)
    print("Training complete.")
