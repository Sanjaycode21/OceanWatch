class ReportItem {
  final String id;
  final String? description;
  final double latitude;
  final double longitude;
  final String? imageUrl;
  final String? videoUrl;
  final String reportStatus;
  final double? credibilityScore;
  final String? aiReasoning;
  final String? verificationStatus;
  final DateTime createdAt;

  ReportItem({
    required this.id,
    this.description,
    required this.latitude,
    required this.longitude,
    this.imageUrl,
    this.videoUrl,
    required this.reportStatus,
    this.credibilityScore,
    this.aiReasoning,
    this.verificationStatus,
    required this.createdAt,
  });

  factory ReportItem.fromJson(Map<String, dynamic> json) {
    return ReportItem(
      id: json['id'] as String,
      description: json['description'] as String?,
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      imageUrl: json['image_url'] as String?,
      videoUrl: json['video_url'] as String?,
      reportStatus: json['report_status'] as String,
      credibilityScore: (json['credibility_score'] as num?)?.toDouble(),
      aiReasoning: json['ai_reasoning'] as String?,
      verificationStatus: json['verification_status'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'description': description,
      'latitude': latitude,
      'longitude': longitude,
      'image_url': imageUrl,
      'video_url': videoUrl,
      'report_status': reportStatus,
      'credibility_score': credibilityScore,
      'ai_reasoning': aiReasoning,
      'verification_status': verificationStatus,
      'created_at': createdAt.toIso8601String(),
    };
  }
}
