import 'dart:convert';
import 'dart:io';

import 'package:dio/dio.dart';
import '../constants/c_urls.dart';

class AuthService {
  Dio dio = Dio();

  Future<Response?> login(String email, String password) async {
    try {
      return await dio.post(
        '${CUrls.baseApiUrl}/auth/users/login',
        data: jsonEncode({'email': email, 'password': password}),
        options: Options(
          headers: {HttpHeaders.contentTypeHeader: "application/json"},
        ),
      );
    } on DioException catch (ex) {
      return ex.response;
    }
  }

  Future<Response?> getInfo(String? token) async {
    try {
      return await dio.get('${CUrls.baseApiUrl}/auth/users/me',
          options: Options(headers: {'Authorization': 'Bearer $token'}));
    } on DioException catch (ex) {
      return ex.response;
    }
  }

  Future<Response?> register(
    Map<String, dynamic> data,
  ) async {
    print(data);
    try {
      final res1 = await dio.post(
        '${CUrls.baseApiUrl}/auth/users',
        data: data,
        options: Options(contentType: Headers.jsonContentType),
      );
      return res1;
    } on DioException catch (ex) {
      return ex.response;
    }
  }
}