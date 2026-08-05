import 'package:dio/dio.dart';
import 'package:hive_flutter/hive_flutter.dart';

class ApiClient {
  late final Dio dio;
  final String baseUrl = "http://10.0.2.2:8000/api/v1";

  ApiClient() {
    dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
    ));

    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final authBox = Hive.box('auth');
        final accessToken = authBox.get('access_token');
        if (accessToken != null) {
          options.headers['Authorization'] = 'Bearer $accessToken';
        }
        return handler.next(options);
      },
      onError: (error, handler) async {
        // Handle token refreshes on 401 response codes
        if (error.response?.statusCode == 401) {
          final authBox = Hive.box('auth');
          final refreshToken = authBox.get('refresh_token');
          
          if (refreshToken != null) {
            try {
              final tokenDio = Dio();
              final res = await tokenDio.post(
                "$baseUrl/auth/refresh",
                data: {"refresh_token": refreshToken},
              );
              
              final newAccess = res.data['access_token'];
              final newRefresh = res.data['refresh_token'];
              
              await authBox.put('access_token', newAccess);
              await authBox.put('refresh_token', newRefresh);
              
              error.requestOptions.headers['Authorization'] = 'Bearer $newAccess';
              final retryRes = await dio.fetch(error.requestOptions);
              return handler.resolve(retryRes);
            } catch (e) {
              await authBox.clear();
            }
          }
        }
        return handler.next(error);
      },
    ));
  }
}
