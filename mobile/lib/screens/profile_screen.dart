import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:oceanwatch_citizen/providers/auth_provider.dart';
import 'package:oceanwatch_citizen/providers/report_provider.dart';
import 'package:oceanwatch_citizen/screens/login_screen.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);
    final reports = ref.watch(reportProvider);
    final totalReports = reports.length;
    final verifiedReports = reports.where((e) => e.verificationStatus == "Verified").length;
    
    final trustVal = totalReports > 0 
        ? ((verifiedReports / totalReports) * 100).toStringAsFixed(1)
        : "50.0";

    return Scaffold(
      appBar: AppBar(title: const Text("USER PROFILE")),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // User Avatar Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFF0E1422),
                border: Border.all(color: const Color(0xFF1F2E4D)),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Row(
                children: [
                  const CircleAvatar(
                    radius: 32,
                    backgroundColor: Color(0xFF172237),
                    child: Icon(Icons.person, size: 36, color: Color(0xFF3B82F6)),
                  ),
                  const SizedBox(width: 20),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          auth.email ?? "operator@ocean.com",
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          "ROLE: ${auth.role?.toUpperCase() ?? 'CITIZEN'}",
                          style: const TextStyle(color: Colors.grey, fontSize: 10),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),

            // Reputation scores
            const Text(
              "TRUST REPUTATION DATA",
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Colors.grey, letterSpacing: 1.0),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFF0E1422),
                border: Border.all(color: const Color(0xFF1F2E4D)),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.between,
                    children: [
                      const Text("TRUST INDEX RATING", style: TextStyle(color: Colors.grey)),
                      Text("$trustVal%", style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF3B82F6))),
                    ],
                  ),
                  const Divider(color: Color(0xFF1F2E4D), height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.between,
                    children: [
                      const Text("Total Ingest Submissions", style: TextStyle(color: Colors.grey)),
                      Text("$totalReports", style: const TextStyle(fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.between,
                    children: [
                      const Text("Verified Submissions", style: TextStyle(color: Colors.grey)),
                      Text("$verifiedReports", style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.green)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),

            // Sync triggers
            const Text(
              "CONSOLE CONFIGURATIONS",
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Colors.grey, letterSpacing: 1.0),
            ),
            const SizedBox(height: 12),
            ListTile(
              tileColor: const Color(0xFF0E1422),
              shape: Border.all(color: const Color(0xFF1F2E4D)),
              title: const Text("Sync offline uploads", style: TextStyle(fontSize: 12)),
              trailing: const Icon(Icons.sync, color: Color(0xFF3B82F6)),
              onTap: () {
                ref.read(reportProvider.notifier).syncOfflineReports();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text("Force syncing cached reports...")),
                );
              },
            ),
            const SizedBox(height: 32),
            
            // Disconnect Action
            SizedBox(
              width: double.infinity,
              height: 50,
              child: OutlinedButton.icon(
                onPressed: () async {
                  await ref.read(authProvider.notifier).logout();
                  if (!context.mounted) return;
                  Navigator.of(context).pushReplacement(
                    MaterialPageRoute(builder: (_) => const LoginScreen()),
                  );
                },
                icon: const Icon(Icons.logout, color: Colors.red),
                label: const Text("DISCONNECT CHANNEL", style: TextStyle(color: Colors.red)),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Colors.red),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
