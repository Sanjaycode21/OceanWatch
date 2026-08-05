from typing import Dict, Any, List
from app.features.ai.interfaces import BaseCredibilityStrategy

class DefaultStrategy(BaseCredibilityStrategy):
    def evaluate(self, evidence: Dict[str, Any]) -> Dict[str, Any]:
        """Calculates default rule evaluations using universal evidence metrics."""
        score = 50.0
        supporting = []
        contradicting = []
        
        # Verify media attachment
        if evidence.get("has_image"):
            score += 15
            supporting.append("✓ Valid image media attached")
        else:
            score -= 20
            contradicting.append("✗ Missing image media attachment")
            
        # Verify timestamp recency
        if evidence.get("is_recent_timestamp"):
            score += 15
            supporting.append("✓ Report timestamp matches recent timeline")
        else:
            score -= 15
            contradicting.append("✗ Report timestamp is delayed")
            
        # Evaluate reporter reputation
        trust = evidence.get("reporter_trust", 50.0)
        if trust >= 70.0:
            score += 10
            supporting.append(f"✓ Reporter trust reputation is high ({trust}%)")
        elif trust < 40.0:
            score -= 15
            contradicting.append(f"✗ Reporter trust reputation is low ({trust}%)")
            
        # Verify spatial overlaps
        if evidence.get("nearby_reports_count", 0) > 0:
            score += 10
            supporting.append("✓ Corroborating reports located nearby")
        else:
            contradicting.append("✗ No corroborating nearby reports found")
            
        score = max(0.0, min(100.0, score))
        
        # Determine verification results
        if score >= 75.0:
            decision = "Verified"
            reasoning = "Universal factors strongly support the validity of the hazard report."
        elif score >= 40.0:
            decision = "Needs Review"
            reasoning = "Factors indicate moderate credibility. Telemetry overlaps are inconclusive."
        else:
            decision = "Rejected"
            reasoning = "Report failed core credibility and authenticity parameters."
            
        return {
            "credibility_score": score,
            "supporting_factors": supporting,
            "contradicting_factors": contradicting,
            "reasoning": reasoning,
            "decision": decision
        }

class OceanWeatherStrategy(DefaultStrategy):
    def evaluate(self, evidence: Dict[str, Any]) -> Dict[str, Any]:
        """Evaluates weather reports, cross-checking weather telemetry matches."""
        res = super().evaluate(evidence)
        score = res["credibility_score"]
        supporting = res["supporting_factors"]
        contradicting = res["contradicting_factors"]
        
        if evidence.get("weather_telemetry_match"):
            score += 10
            supporting.append("✓ Weather telemetry supports meteorological event parameters")
        else:
            score -= 20
            contradicting.append("✗ Weather telemetry contradicts reporting conditions")
            
        score = max(0.0, min(100.0, score))
        res["credibility_score"] = score
        res["supporting_factors"] = supporting
        res["contradicting_factors"] = contradicting
        
        if score >= 75.0:
            res["decision"] = "Verified"
            res["reasoning"] = "Meteorological telemetry and reports strongly support weather hazard validity."
        elif score >= 40.0:
            res["decision"] = "Needs Review"
            res["reasoning"] = "Moderate indicators. Weather telemetry matches but lacks corroborating reports."
        else:
            res["decision"] = "Rejected"
            res["reasoning"] = "Telemetry data contradicts weather reports."
        return res

class PollutionStrategy(DefaultStrategy):
    pass

class MaritimeStrategy(DefaultStrategy):
    pass

class MarineEcosystemStrategy(DefaultStrategy):
    pass

class NavigationStrategy(DefaultStrategy):
    pass

class IllegalActivitiesStrategy(DefaultStrategy):
    def evaluate(self, evidence: Dict[str, Any]) -> Dict[str, Any]:
        """Evaluates suspicious activity, adding weight if video file is present."""
        res = super().evaluate(evidence)
        score = res["credibility_score"]
        supporting = res["supporting_factors"]
        contradicting = res["contradicting_factors"]
        
        if evidence.get("has_video"):
            score += 15
            supporting.append("✓ Video recording provided for illegal activity tracking")
        else:
            contradicting.append("✗ No video evidence attached")
            
        score = max(0.0, min(100.0, score))
        res["credibility_score"] = score
        res["supporting_factors"] = supporting
        res["contradicting_factors"] = contradicting
        return res

class HumanEmergencyStrategy(DefaultStrategy):
    def evaluate(self, evidence: Dict[str, Any]) -> Dict[str, Any]:
        """Evaluates emergency dispatches, prioritizing time recentness and safety margins."""
        res = super().evaluate(evidence)
        score = res["credibility_score"]
        supporting = res["supporting_factors"]
        contradicting = res["contradicting_factors"]
        
        if evidence.get("is_recent_timestamp"):
            score += 15
            supporting.append("✓ Emergency timestamp is within critical timeline limits")
            
        score = max(0.0, min(100.0, score))
        res["credibility_score"] = score
        res["supporting_factors"] = supporting
        res["contradicting_factors"] = contradicting
        
        # Emergencies default to verified on moderate indicators for rescue dispatches
        if score >= 50.0:
            res["decision"] = "Verified"
            res["reasoning"] = "Emergency report indicators verified. Dispatch recommended immediately."
        return res


class CredibilityEngine:
    def __init__(self) -> None:
        self.strategies = {
            "Ocean Weather": OceanWeatherStrategy(),
            "Pollution": PollutionStrategy(),
            "Maritime": MaritimeStrategy(),
            "Marine Ecosystem": MarineEcosystemStrategy(),
            "Navigation": NavigationStrategy(),
            "Illegal Activities": IllegalActivitiesStrategy(),
            "Human Emergency": HumanEmergencyStrategy()
        }
        self.default_strategy = DefaultStrategy()

    def evaluate_credibility(self, category: str, evidence: Dict[str, Any]) -> Dict[str, Any]:
        """Routes evidence checking to target category strategies."""
        strategy = self.strategies.get(category, self.default_strategy)
        return strategy.evaluate(evidence)
