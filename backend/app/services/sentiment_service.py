import os
from transformers import pipeline
from .doc_store import get_doc
sentiment = None

def _ensure_sentiment():
    global sentiment
    if sentiment is not None:
        return sentiment
    try:
        # Skip model init unless explicitly allowed to download
        if os.environ.get("ALLOW_MODEL_DOWNLOAD", "0") not in ("1", "true", "True"):
            sentiment = False
            return None
        if os.environ.get("TRANSFORMERS_OFFLINE") is None:
            os.environ["TRANSFORMERS_OFFLINE"] = "1"
        sentiment = pipeline("sentiment-analysis", model="ProsusAI/finbert")
        return sentiment
    except Exception:
        try:
            sentiment = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")
            return sentiment
        except Exception:
            sentiment = False
            return None

DOCS = {
    "demo_doc": "ACME's management sounded optimistic about revenue growth; some concern about rising costs."
}

def analyze_sentiment(doc_id: str):
    text = get_doc(doc_id)
    if not text:
        return 0.0
    svc = _ensure_sentiment()
    if not svc:
        # simple keyword-based fallback when models cannot be loaded
        pos_words = ["optimistic", "growth", "improved", "increase", "strong", "record", "beat", "positive"]
        neg_words = ["concern", "decline", "decrease", "weak", "loss", "negative", "pressure", "risk"]
        text_l = text.lower()
        pos = sum(w in text_l for w in pos_words)
        neg = sum(w in text_l for w in neg_words)
        total = pos + neg if (pos + neg) > 0 else 1
        return max(min((pos - neg) / total, 1), -1) * 0.4  # scaled mild polarity
    out = svc(text[:512])
    label = out[0]["label"].lower()
    score = out[0]["score"]
    if label == "positive" or label == "pos":
        return score
    elif label == "negative" or label == "neg":
        return -score
    else:
        return 0.0
