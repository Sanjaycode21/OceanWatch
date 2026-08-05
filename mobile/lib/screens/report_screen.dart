import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:image_picker/image_picker.dart';
import 'package:oceanwatch_citizen/providers/report_provider.dart';

class ReportHazardScreen extends ConsumerStatefulWidget {
  const ReportHazardScreen({super.key});

  @override
  ConsumerState<ReportHazardScreen> createState() => _ReportHazardScreenState();
}

class _ReportHazardScreenState extends ConsumerState<ReportHazardScreen> {
  final _descriptionController = TextEditingController();
  final _picker = ImagePicker();
  
  XFile? _imageFile;
  Position? _currentPosition;
  bool _isLocating = false;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _determinePosition();
  }

  @override
  void dispose() {
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _determinePosition() async {
    setState(() => _isLocating = true);
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        throw Exception("Location services are disabled.");
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          throw Exception("Location permissions are denied.");
        }
      }

      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );
      setState(() => _currentPosition = position);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("GPS coordinates error: ${e.toString()}")),
      );
    } finally {
      setState(() => _isLocating = false);
    }
  }

  Future<void> _captureMedia() async {
    try {
      final img = await _picker.pickImage(source: ImageSource.camera, imageQuality: 80);
      if (img != null) {
        setState(() => _imageFile = img);
      }
    } catch (_) {}
  }

  void _submit() async {
    if (_currentPosition == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Acquiring GPS coordinates. Please wait.")),
      );
      return;
    }

    setState(() => _isSubmitting = true);
    
    final success = await ref.read(reportProvider.notifier).submitReport(
      description: _descriptionController.text.trim(),
      latitude: _currentPosition!.latitude,
      longitude: _currentPosition!.longitude,
      imagePath: _imageFile?.path,
      videoPath: null,
    );

    if (!mounted) return;
    setState(() => _isSubmitting = false);

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Report uploaded successfully to radar network.")),
      );
      Navigator.of(context).pop();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Network disconnected. Report queued offline for auto-sync.")),
      );
      Navigator.of(context).pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("REPORT HAZARD")),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Media Preview
            GestureDetector(
              onTap: _captureMedia,
              child: Container(
                width: double.infinity,
                height: 200,
                decoration: BoxDecoration(
                  color: const Color(0xFF0E1422),
                  border: Border.all(color: const Color(0xFF1F2E4D)),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: _imageFile != null
                    ? ClipRRect(
                        borderRadius: BorderRadius.circular(3),
                        child: Image.file(
                          File(_imageFile!.path),
                          fit: BoxFit.cover,
                          width: double.infinity,
                        ),
                      )
                    : const Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.add_a_photo_outlined, size: 48, color: Color(0xFF3B82F6)),
                          SizedBox(height: 12),
                          Text("TAP TO CAPTURE IMAGE", style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold, fontSize: 11)),
                        ],
                      ),
              ),
            ),
            const SizedBox(height: 24),

            // Coordinates box
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF0E1422),
                border: Border.all(color: const Color(0xFF1F2E4D)),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Row(
                children: [
                  const Icon(Icons.location_on, color: Color(0xFF3B82F6)),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text("GPS POSITION DATA", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Colors.grey)),
                        const SizedBox(height: 4),
                        _isLocating
                            ? const Text("TRIANGULATING...", style: TextStyle(fontSize: 12))
                            : Text(
                                _currentPosition != null
                                    ? "${_currentPosition!.latitude.toStringAsFixed(6)}, ${_currentPosition!.longitude.toStringAsFixed(6)}"
                                    : "COORDINATES MISSING",
                                style: const TextStyle(fontSize: 12),
                              ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.refresh),
                    onPressed: _isLocating ? null : _determinePosition,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Description input
            const Text("DESCRIPTION LOG", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Colors.grey)),
            const SizedBox(height: 8),
            TextField(
              controller: _descriptionController,
              maxLines: 4,
              decoration: const InputDecoration(
                hintText: "Enter hazard description, weather notes, or debris markers...",
                border: OutlineInputBorder(),
                fillColor: Color(0xFF0E1422),
                filled: true,
              ),
            ),
            const SizedBox(height: 32),

            // Submit button
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: _isSubmitting ? null : _submit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF3B82F6),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                ),
                child: _isSubmitting
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text("TRANSMIT HAZARD LOG"),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
