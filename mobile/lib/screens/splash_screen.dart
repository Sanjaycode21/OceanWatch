import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:oceanwatch_citizen/providers/auth_provider.dart';
import 'package:oceanwatch_citizen/screens/login_screen.dart';
import 'package:oceanwatch_citizen/screens/main_navigation.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _checkTransition();
  }

  Future<void> _checkTransition() async {
    // Keep splash visible for 2 seconds to simulate radar links initialization
    await Future.delayed(const Duration(seconds: 2));
    if (!mounted) return;

    final auth = ref.read(authProvider);
    if (auth.isLoggedIn) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const MainNavigation()),
      );
    } else {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.radar_rounded,
              size: 72,
              color: Color(0xFF3B82F6),
            ),
            SizedBox(height: 24),
            Text(
              "OCEANWATCH AI",
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                letterSpacing: 2.0,
                color: Colors.white,
              ),
            ),
            SizedBox(height: 8),
            Text(
              "Citizen Safety Node",
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey,
                letterSpacing: 1.0,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
