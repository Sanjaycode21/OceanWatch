import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:oceanwatch_citizen/providers/report_provider.dart';
import 'package:oceanwatch_citizen/widgets/status_badge.dart';

class HistoryScreen extends ConsumerWidget {
  const HistoryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final reports = ref.watch(reportProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text("SUBMISSION HISTORY"),
      ),
      body: reports.isEmpty
          ? const Center(
              child: Text(
                "No reports submitted yet.",
                style: TextStyle(color: Colors.grey),
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: reports.length,
              itemBuilder: (context, index) {
                final rep = reports[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 16),
                  color: const Color(0xFF0E1422),
                  shape: RoundedRectangleBorder(
                    side: const BorderSide(color: Color(0xFF1F2E4D)),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.between,
                          children: [
                            Text(
                              "Report #${rep.id.substring(0, 8)}",
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                color: Colors.grey,
                                fontSize: 10,
                              ),
                            ),
                            StatusBadge(status: rep.reportStatus),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Text(
                          rep.description ?? "No description provided.",
                          style: const TextStyle(fontSize: 12, color: Colors.white),
                        ),
                        const SizedBox(height: 12),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.between,
                          children: [
                            Text(
                              "${rep.latitude.toStringAsFixed(4)}, ${rep.longitude.toStringAsFixed(4)}",
                              style: const TextStyle(fontSize: 10, color: Colors.grey),
                            ),
                            Text(
                              rep.createdAt.toLocal().toString().substring(0, 16),
                              style: const TextStyle(fontSize: 10, color: Colors.grey),
                            ),
                          ],
                        ),
                        if (rep.aiReasoning != null) ...[
                          const Divider(color: Color(0xFF1F2E4D)),
                          const Text(
                            "AI REASONING LOG:",
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 8, color: Colors.grey),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            rep.aiReasoning!,
                            style: const TextStyle(fontSize: 10, color: Color(0xFF3B82F6)),
                          ),
                        ]
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }
}
