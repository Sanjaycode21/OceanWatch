import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive/hive.dart';
import 'package:dio/dio.dart';
import 'package:oceanwatch_citizen/core/api/api_client.dart';
import 'package:oceanwatch_citizen/models/report_item.dart';
import 'package:oceanwatch_citizen/providers/auth_provider.dart';

class ReportNotifier extends StateNotifier<List<ReportItem>> {
  final ApiClient _apiClient;

  ReportNotifier(this._apiClient) : super([]) {
    _loadFromCache();
    fetchReports();
  }

  void _loadFromCache() {
    final cacheBox = Hive.box('reports_cache');
    final cached = cacheBox.get('items');
    if (cached != null) {
      final List<dynamic> raw = jsonDecode(cached);
      state = raw.map((e) => ReportItem.fromJson(Map<String, dynamic>.from(e))).toList();
    }
  }

  Future<void> fetchReports() async {
    try {
      final res = await _apiClient.dio.get("/reports/me");
      final List<dynamic> data = res.data;
      final items = data.map((e) => ReportItem.fromJson(e)).toList();
      
      final cacheBox = Hive.box('reports_cache');
      await cacheBox.put('items', jsonEncode(items.map((e) => e.toJson()).toList()));
      
      state = items;
    } catch (_) {
      // Keep cache state on network failures (offline first)
    }
  }

  Future<bool> submitReport({
    required String? description,
    required double latitude,
    required double longitude,
    required String? imagePath,
    required String? videoPath,
  }) async {
    final offlineBox = Hive.box('offline_queue');

    try {
      final Map<String, dynamic> formMap = {
        'latitude': latitude,
        'longitude': longitude,
        'timestamp': DateTime.now().toUtc().toIso8601String(),
      };
      if (description != null) formMap['description'] = description;
      
      if (imagePath != null) {
        formMap['image'] = await MultipartFile.fromFile(imagePath, filename: 'upload.png');
      }
      if (videoPath != null) {
        formMap['video'] = await MultipartFile.fromFile(videoPath, filename: 'upload.mp4');
      }
      
      final data = FormData.fromMap(formMap);
      await _apiClient.dio.post("/reports/", data: data);
      await fetchReports();
      return true;
    } catch (e) {
      // Connection drop: Cache data locally in queue box
      await offlineBox.add({
        'description': description,
        'latitude': latitude,
        'longitude': longitude,
        'image_path': imagePath,
        'video_path': videoPath,
        'timestamp': DateTime.now().toUtc().toIso8601String(),
      });
      return false; 
    }
  }

  Future<void> syncOfflineReports() async {
    final offlineBox = Hive.box('offline_queue');
    if (offlineBox.isEmpty) return;

    final keys = List.from(offlineBox.keys);
    for (final key in keys) {
      final item = Map<String, dynamic>.from(offlineBox.get(key));
      try {
        final Map<String, dynamic> formMap = {
          'latitude': item['latitude'],
          'longitude': item['longitude'],
          'timestamp': item['timestamp'],
        };
        if (item['description'] != null) formMap['description'] = item['description'];
        
        if (item['image_path'] != null) {
          formMap['image'] = await MultipartFile.fromFile(item['image_path'], filename: 'upload.png');
        }
        if (item['video_path'] != null) {
          formMap['video'] = await MultipartFile.fromFile(item['video_path'], filename: 'upload.mp4');
        }

        final data = FormData.fromMap(formMap);
        await _apiClient.dio.post("/reports/", data: data);
        
        await offlineBox.delete(key);
      } catch (e) {
        // Network timeout: Stop sync batch
        break;
      }
    }
    await fetchReports();
  }
}

final reportProvider = StateNotifierProvider<ReportNotifier, List<ReportItem>>((ref) {
  final client = ref.watch(apiClientProvider);
  return ReportNotifier(client);
});
