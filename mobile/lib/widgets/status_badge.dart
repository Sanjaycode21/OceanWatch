import 'package:flutter/material.dart';

class StatusBadge extends StatelessWidget {
  final String status;

  const StatusBadge({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    Color bgColor = Colors.grey.withOpacity(0.1);
    Color textColor = Colors.grey;

    switch (status.toLowerCase()) {
      case 'pending_ai_analysis':
        bgColor = Colors.blueGrey.withOpacity(0.15);
        textColor = Colors.blueGrey;
        break;
      case 'ai_processing':
        bgColor = Colors.blue.withOpacity(0.15);
        textColor = Colors.blue;
        break;
      case 'under_verification':
        bgColor = Colors.amber.withOpacity(0.15);
        textColor = Colors.amber;
        break;
      case 'fused':
        bgColor = Colors.purple.withOpacity(0.15);
        textColor = Colors.purple;
        break;
      case 'verified':
        bgColor = Colors.green.withOpacity(0.15);
        textColor = Colors.green;
        break;
      case 'rejected':
        bgColor = Colors.red.withOpacity(0.15);
        textColor = Colors.red;
        break;
      case 'resolved':
        bgColor = Colors.grey.withOpacity(0.2);
        textColor = Colors.grey;
        break;
    }

    final formatted = status.toUpperCase().replaceAll('_', ' ');

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(2),
      ),
      child: Text(
        formatted,
        style: TextStyle(
          color: textColor,
          fontSize: 8,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}
