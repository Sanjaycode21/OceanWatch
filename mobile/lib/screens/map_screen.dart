import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class MapScreen extends ConsumerWidget {
  const MapScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final centerCoords = const LatLng(25.0, -80.0);

    return Scaffold(
      appBar: AppBar(
        title: const Text("GIS HAZARD RADAR"),
      ),
      body: FlutterMap(
        options: MapOptions(
          initialCenter: centerCoords,
          initialZoom: 7.0,
        ),
        children: [
          TileLayer(
            urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            userAgentPackageName: 'com.oceanwatch.citizen',
          ),
          MarkerLayer(
            markers: [
              Marker(
                point: const LatLng(25.10, -80.20),
                width: 40,
                height: 40,
                child: const Icon(
                  Icons.location_on,
                  color: Colors.red,
                  size: 32,
                ),
              ),
              Marker(
                point: const LatLng(24.55, -81.78),
                width: 40,
                height: 40,
                child: const Icon(
                  Icons.location_on,
                  color: Colors.orange,
                  size: 32,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
