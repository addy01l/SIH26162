import os
import joblib
import pandas as pd
import xgboost as xgb
import logging

logger = logging.getLogger(__name__)
MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")

class FireEyePredictor:
    def __init__(self):
        self.iso_forest = None
        self.xgb_clf = None
        self.load_models()

    def load_models(self):
        iso_path = os.path.join(MODELS_DIR, "iso_forest.pkl")
        xgb_path = os.path.join(MODELS_DIR, "xgb_classifier.json")

        if os.path.exists(iso_path):
            self.iso_forest = joblib.load(iso_path)
            logger.info("Loaded Isolation Forest model.")
        else:
            logger.warning(f"Isolation Forest model not found at {iso_path}")

        if os.path.exists(xgb_path):
            self.xgb_clf = xgb.XGBClassifier()
            self.xgb_clf.load_model(xgb_path)
            logger.info("Loaded XGBoost model.")
        else:
            logger.warning(f"XGBoost model not found at {xgb_path}")

    def predict(self, features: dict) -> dict:
        """
        Features expected: brightness, frp, dist_industrial_m, dist_road_m
        """
        df = pd.DataFrame([features])

        results = {
            "is_anomaly": False,
            "anomaly_score": 0.0,
            "is_wildfire": False,
            "wildfire_probability": 0.0
        }

        if self.iso_forest:
            # -1 for anomaly, 1 for normal
            pred_iso = self.iso_forest.predict(df)[0]
            score_iso = self.iso_forest.decision_function(df)[0]
            results["is_anomaly"] = bool(pred_iso == -1)
            results["anomaly_score"] = float(score_iso)

        if self.xgb_clf:
            pred_xgb = self.xgb_clf.predict(df)[0]
            prob_xgb = self.xgb_clf.predict_proba(df)[0][1]
            results["is_wildfire"] = bool(pred_xgb == 1)
            results["wildfire_probability"] = float(prob_xgb)

        return results

# Singleton instance
predictor = FireEyePredictor()
