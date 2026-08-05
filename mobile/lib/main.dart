import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:oceanwatch_citizen/core/storage/hive_storage.dart';
import 'package:oceanwatch_citizen/core/theme/app_theme.dart';
import 'package:oceanwatch_citizen/screens/splash_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize local db boxes
  await HiveStorage.init();
  
  runApp(
    const ProviderScope(
      child: OceanWatchApp(),
    ),
  );
}

class OceanWatchApp extends StatelessWidget {
  const OceanWatchApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'OceanWatch Citizen',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: const SplashScreen(),
    );
  }
}
