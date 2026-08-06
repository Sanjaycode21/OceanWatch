class GeminiResponse(BaseModel):

    hazard_type: str

    hazard_category: str

    confidence: float

    severity: str

    visible_evidence: list[str]

    possible_impacts: list[str]

    reasoning: str

    recommended_action: str