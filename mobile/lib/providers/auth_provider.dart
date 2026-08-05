import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive/hive.dart';
import 'package:dio/dio.dart';
import 'package:oceanwatch_citizen/core/api/api_client.dart';

class AuthState {
  final bool isLoading;
  final String? error;
  final String? email;
  final String? role;
  final bool isLoggedIn;

  AuthState({
    this.isLoading = false,
    this.error,
    this.email,
    this.role,
    this.isLoggedIn = false,
  });

  AuthState copyWith({
    bool? isLoading,
    String? error,
    String? email,
    String? role,
    bool? isLoggedIn,
  }) {
    return AuthState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      email: email ?? this.email,
      role: role ?? this.role,
      isLoggedIn: isLoggedIn ?? this.isLoggedIn,
    );
  }
}

final apiClientProvider = Provider((ref) => ApiClient());

class AuthNotifier extends StateNotifier<AuthState> {
  final ApiClient _apiClient;

  AuthNotifier(this._apiClient) : super(AuthState()) {
    _tryRestoreSession();
  }

  Future<void> _tryRestoreSession() async {
    final authBox = Hive.box('auth');
    final token = authBox.get('access_token');
    if (token != null) {
      try {
        final res = await _apiClient.dio.get("/auth/me");
        state = AuthState(
          isLoggedIn: true,
          email: res.data['email'],
          role: res.data['role'],
        );
      } catch (e) {
        await authBox.clear();
        state = AuthState(isLoggedIn: false);
      }
    }
  }

  Future<bool> login(String email, String password) async {
    state = state.copyWith(isLoading: true);
    try {
      final data = FormData.fromMap({
        'username': email,
        'password': password,
      });
      
      final res = await _apiClient.dio.post(
        "/auth/login",
        data: data,
      );
      
      final authBox = Hive.box('auth');
      await authBox.put('access_token', res.data['access_token']);
      await authBox.put('refresh_token', res.data['refresh_token']);
      
      final userRes = await _apiClient.dio.get("/auth/me");
      state = AuthState(
        isLoggedIn: true,
        email: userRes.data['email'],
        role: userRes.data['role'],
      );
      return true;
    } on DioException catch (e) {
      final msg = e.response?.data['detail'] ?? "Login failed. Verify credentials.";
      state = AuthState(error: msg);
      return false;
    } catch (e) {
      state = AuthState(error: "Server connection failed");
      return false;
    }
  }

  Future<bool> register(String email, String password, String name, String phone) async {
    state = state.copyWith(isLoading: true);
    try {
      await _apiClient.dio.post(
        "/auth/signup",
        data: {
          "email": email,
          "password": password,
          "full_name": name,
          "phone": phone,
          "role": "citizen"
        },
      );
      state = AuthState();
      return true;
    } on DioException catch (e) {
      final msg = e.response?.data['detail'] ?? "Signup failed.";
      state = AuthState(error: msg);
      return false;
    } catch (e) {
      state = AuthState(error: "Signup failed: Server error.");
      return false;
    }
  }

  Future<void> logout() async {
    final authBox = Hive.box('auth');
    final refresh = authBox.get('refresh_token');
    if (refresh != null) {
      try {
        await _apiClient.dio.post("/auth/logout", data: {"refresh_token": refresh});
      } catch (_) {}
    }
    await authBox.clear();
    state = AuthState(isLoggedIn: false);
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final client = ref.watch(apiClientProvider);
  return AuthNotifier(client);
});
