import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:oceanwatch_citizen/core/api/api_client.dart';
import 'package:oceanwatch_citizen/providers/auth_provider.dart';

class SOSNotifier extends StateNotifier<AsyncValue<void>> {
  final ApiClient _apiClient;

  SOSNotifier(this._apiClient) : super(const AsyncValue.data(null));

  Future<bool> sendSOS({
    required double latitude,
    required double longitude,
    required String emergencyType,
  }) async {
    state = const AsyncValue.loading();
    try {
      await _apiClient.dio.post(
        "/sos/",
        data: {
          "latitude": latitude,
          "longitude": longitude,
          "emergency_type": emergencyType,
        },
      );
      state = const AsyncValue.data(null);
      return true;
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
      return false;
    }
  }
}

final sosProvider = StateNotifierProvider<SOSNotifier, AsyncValue<void>>((ref) {
  final client = ref.watch(apiClientProvider);
  return SOSNotifier(client);
});
