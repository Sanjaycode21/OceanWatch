import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:oceanwatch_citizen/providers/sos_provider.dart';

class SosScreen extends ConsumerStatefulWidget {
  const SosScreen({super.key});

  @override
  ConsumerState<SosScreen> createState() => _SosScreenState();
}

class _SosScreenState extends ConsumerState<SosScreen> with SingleTickerProviderStateMixin {
  String _emergencyType = "Sinking Vessel";
  Position? _coords;
  bool _locating = false;
  late AnimationController _pulseController;

  final List<String> _types = [
    "Sinking Vessel",
    "Medical Emergency",
    "Man Overboard",
    "Stranded Swimmer",
    "Collision Hazard"
  ];

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
    _getCoords();
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  Future<void> _getCoords() async {
    setState(() => _locating = true);
    try {
      final pos = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high);
      setState(() => _coords = pos);
    } catch (_) {}
    setState(() => _locating = false);
  }

  void _triggerSOS() async {
    if (_coords == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Awaiting GPS location lock.")),
      );
      return;
    }

    final success = await ref.read(sosProvider.notifier).sendSOS(
      latitude: _coords!.latitude,
      longitude: _coords!.longitude,
      emergencyType: _emergencyType,
    );

    if (!mounted) return;

    if (success) {
      showDialog(
        context: context,
        builder: (_) => AlertDialog(
          backgroundColor: const Color(0xFF0E1422),
          title: const Text("SOS BROADCAST ACTIVE", style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
          content: Text("Emergency dispatch coordinates transmitted successfully:\n\nType: $_emergencyType\nLat: ${_coords!.latitude.toStringAsFixed(5)}\nLon: ${_coords!.longitude.toStringAsFixed(5)}\n\nRescue teams are coordinating dispatches."),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
                Navigator.of(context).pop();
              },
              child: const Text("Acknowledge"),
            )
          ],
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Distress transmission failed. Check connection.")),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(sosProvider);

    return Scaffold(
      appBar: AppBar(title: const Text("SOS DISTRESS BEACON")),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            // Select dropdown
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  "SELECT DISTRESS TYPE",
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Colors.grey, letterSpacing: 1.0),
                ),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0E1422),
                    border: Border.all(color: const Color(0xFF1F2E4D)),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: _emergencyType,
                      isExpanded: true,
                      dropdownColor: const Color(0xFF0E1422),
                      items: _types.map((String val) {
                        return DropdownMenuItem<String>(
                          value: val,
                          child: Text(val, style: const TextStyle(fontSize: 13)),
                        );
                      }).toList(),
                      onChanged: (newVal) {
                        if (newVal != null) {
                          setState(() => _emergencyType = newVal);
                        }
                      },
                    ),
                  ),
                ),
              ],
            ),

            // Pulsing button
            GestureDetector(
              onTap: state.isLoading ? null : _triggerSOS,
              child: Stack(
                alignment: Alignment.center,
                children: [
                  AnimatedBuilder(
                    animation: _pulseController,
                    builder: (context, child) {
                      return Container(
                        width: 220 + (25 * _pulseController.value),
                        height: 220 + (25 * _pulseController.value),
                        decoration: BoxDecoration(
                          color: Colors.red.withOpacity(0.08 - (0.05 * _pulseController.value)),
                          shape: BoxShape.circle,
                        ),
                      );
                    },
                  ),
                  Container(
                    width: 180,
                    height: 180,
                    decoration: BoxDecoration(
                      color: const Color(0xFFEF4444),
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.red.withOpacity(0.4),
                          blurRadius: 20,
                          spreadRadius: 2,
                        ),
                      ],
                    ),
                    child: Center(
                      child: state.isLoading
                          ? const CircularProgressIndicator(color: Colors.white)
                          : const Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.emergency, size: 48, color: Colors.white),
                                SizedBox(height: 8),
                                Text(
                                  "TAP TO SIGNAL",
                                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.white),
                                ),
                              ],
                            ),
                    ),
                  ),
                ],
              ),
            ),

            // Position locks indicators
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF0E1422),
                border: Border.all(color: const Color(0xFF1F2E4D)),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.location_on, color: Colors.red),
                  const SizedBox(width: 12),
                  _locating
                      ? const Text("TRIANGULATING POSITION...")
                      : Text(
                          _coords != null
                              ? "GPS POSITION LOCK: ${_coords!.latitude.toStringAsFixed(5)}, ${_coords!.longitude.toStringAsFixed(5)}"
                              : "ACQUIRING POSITION...",
                          style: const TextStyle(fontSize: 10, fontFamily: 'monospace'),
                        ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
