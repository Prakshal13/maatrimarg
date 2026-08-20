"""
Maps a 0-100 risk score (and whether labor has started) to one of four tiers.
"dispatch" only fires when risk is high AND labor has actually started -
a high risk score alone should not trigger a hospital dispatch.
"""


def get_tier(risk_score: float, labor_started: bool = False) -> str:
    if risk_score <= 40:
        return "watch"
    elif risk_score <= 70:
        return "prep"
    else:
        return "dispatch" if labor_started else "prep"
