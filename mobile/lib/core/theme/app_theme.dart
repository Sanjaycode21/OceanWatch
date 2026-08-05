import 'package:flutter/material.dart';

class AppTheme {
  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: const Color(0xFF3B82F6),
        brightness: Brightness.dark,
        background: const Color(0xFF070A10),
        surface: const Color(0xFF0E1422),
        primary: const Color(0xFF3B82F6),
        error: const Color(0xFFEF4444),
      ),
      scaffoldBackgroundColor: const Color(0xFF070A10),
      appBarTheme: const AppBarTheme(
        backgroundColor: Color(0xFF0E1422),
        elevation: 0,
        centerTitle: true,
        titleTextStyle: TextStyle(
          color: Colors.white,
          fontSize: 16,
          fontWeight: FontWeight.bold,
        ),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: Color(0xFF0E1422),
        selectedItemColor: Color(0xFF3B82F6),
        unselectedItemColor: Colors.grey,
        type: BottomNavigationBarType.fixed,
      ),
    );
  }
}
