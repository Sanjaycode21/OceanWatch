import 'package:hive_flutter/hive_flutter.dart';

class HiveStorage {
  static Future<void> init() async {
    await Hive.initFlutter();
    
    // Open system boxes:
    // 'auth' for security tokens
    // 'reports_cache' for reports lists
    // 'offline_queue' for cached hazard uploads
    await Hive.openBox('auth');
    await Hive.openBox('reports_cache');
    await Hive.openBox('offline_queue');
  }
}
