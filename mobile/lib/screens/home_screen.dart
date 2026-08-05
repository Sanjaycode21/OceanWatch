import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:oceanwatch_citizen/providers/auth_provider.dart';
import 'package:oceanwatch_citizen/providers/report_provider.dart';
import 'package:oceanwatch_citizen/screens/report_screen.dart';
import 'package:oceanwatch_citizen/screens/sos_screen.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final reports = ref.watch(reportProvider);
    final totalReports = reports.length;
    final verifiedReports = reports.where((e) => e.verificationStatus == "Verified").length;

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          "OCEANWATCH CITIZEN",
          style: TextStyle(letterSpacing: 1.0),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.sync),
            onPressed: () {
              ref.read(reportProvider.notifier).syncOfflineReports();
              ref.read(reportProvider.notifier).fetchReports();
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Status bar
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: const Color(0xFF0E1422),
                border: Border.all(color: const Color(0xFF1F2E4D)),
                borderRadius: BorderRadius.circular(4),
              ),
              child: const Row(
                children: [
                  Icon(Icons.radio_button_checked, color: Colors.emerald, size: 16),
                  SizedBox(width: 8),
                  Text(
                    "RADAR NODE LINKED",
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: Colors.emerald,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Emergency Actions grid
            Row(
              children: [
                Expanded(
                  child: GestureDetector(
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => const ReportHazardScreen()),
                      );
                    },
                    child: Container(
                      height: 140,
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0E1422),
                        border: Border.all(color: const Color(0xFF1F2E4D)),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Column(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Icon(Icons.camera_alt_outlined, color: Color(0xFF3B82F6), size: 32),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                "REPORT HAZARD",
                                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                              ),
                              SizedBox(height: 2),
                              Text(
                                "Upload image/video details",
                                style: TextStyle(color: Colors.grey, fontSize: 10),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: GestureDetector(
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => const SosScreen()),
                      );
                    },
                    child: Container(
                      height: 140,
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: const Color(0xFFEF4444).withOpacity(0.05),
                        border: Border.all(color: const Color(0xFFEF4444).withOpacity(0.3)),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Column(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Icon(Icons.alert_octagon, color: Color(0xFFEF4444), size: 32),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                "SOS DISTRESS",
                                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFFEF4444)),
                              ),
                              SizedBox(height: 2),
                              Text(
                                "One-tap emergency broadcast",
                                style: TextStyle(color: Colors.grey, fontSize: 10),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 32),

            // Reports stats
            const Text(
              "YOUR SUBMISSIONS SUMMARY",
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Colors.grey, letterSpacing: 1.0),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFF0E1422),
                border: Border.all(color: const Color(0xFF1F2E4D)),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildStatColumn("Total Reports", "$totalReports"),
                  _buildStatColumn("Verified Logs", "$verifiedReports"),
                  _buildStatColumn("Trust Index", "85%"),
                ],
              ),
            ),
            const SizedBox(height: 32),

            // Alerts Feed
            const Text(
              "RECENT ACTIVE ALERTS",
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Colors.grey, letterSpacing: 1.0),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF0E1422),
                border: Border.all(color: const Color(0xFF1F2E4D)),
                borderRadius: BorderRadius.circular(4),
              ),
              child: const Row(
                children: [
                  Icon(Icons.warning_amber_rounded, color: Color(0xFFEF4444)),
                  SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          "HIGH WAVE WARNING: SEC-B",
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Colors.white),
                        ),
                        SizedBox(height: 2),
                        Text(
                          "Large swells detected near coastal reef blocks. Exercise caution.",
                          style: TextStyle(color: Colors.grey, fontSize: 10),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatColumn(String label, String val) {
    return Column(
      children: [
        Text(
          val,
          style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF3B82F6)),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: const TextStyle(fontSize: 10, color: Colors.grey),
        ),
      ],
    );
  }
}
