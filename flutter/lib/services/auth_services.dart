import 'dart:convert';
import 'dart:io';

import 'package:dio/dio.dart';
import 'package:farmer_app_2/constants/fields.dart';
import '../constants/c_urls.dart';

class AuthService {
  Dio dio = Dio();

  Future<Response?> login(String email, String password) async {
    try {
      print("Api reuqest...");
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

  Future<Response?> getUser(String userId) async {
    try {
      return await dio.get('${CUrls.baseApiUrl}/auth/users/$userId');
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
      print('Api result: $res1');
      return res1;
    } on DioException catch (ex) {
      print("Exception caught: ${ex.message}");
      return ex.response;
    } catch (e) {
      print("Exception caught: ${e.toString()}");
      throw e.toString();
    }
  }

  Future<Response?> confirmRegister(
    Map<String, dynamic> data,
  ) async {
    try {
      final res1 = await dio.post(
        '${CUrls.baseApiUrl}/auth/users/register/confirm',
        data: data,
        options: Options(contentType: Headers.jsonContentType),
      );
      print('Api result: $res1');
      return res1;
    } on DioException catch (ex) {
      print("Exception caught: ${ex.message}");
      return ex.response;
    } catch (e) {
      print("Exception caught: ${e.toString()}");
      throw e.toString();
    }
  }

  Future<Response?> initiateRegistration(String email) async {
    print('Initiating registration...');
    try {
      return await dio.post(
        '${CUrls.baseApiUrl}/auth/users/register/initiate',
        data: {emailField: email},
        options: Options(contentType: Headers.jsonContentType),
      );
    } on DioException catch (ex) {
      print("Exception caught: ${ex.message}");
      return ex.response;
    } catch (e) {
      print("Exception caught: ${e.toString()}");
      throw e.toString();
    }
  }

  Future<Response?> initiatePasswordReset(String email) async {
    print('Initiating registration...');
    try {
      return await dio.post(
        '${CUrls.baseApiUrl}/auth/users/password-reset/initiate',
        data: {emailField: email},
        options: Options(contentType: Headers.jsonContentType),
      );
    } on DioException catch (ex) {
      print("Exception caught: ${ex.message}");
      return ex.response;
    } catch (e) {
      print("Exception caught: ${e.toString()}");
      throw e.toString();
    }
  }

  Future<Response?> confirmPasswordReset(
    String email,
    String code,
    String newPassword,
  ) async {
    print('Initiating registration...');
    try {
      return await dio.post(
        '${CUrls.baseApiUrl}/auth/users/password-reset/confirm',
        data: {
          emailField: email,
          codeField: code,
          newPasswordField: newPassword,
        },
        options: Options(contentType: Headers.jsonContentType),
      );
    } on DioException catch (ex) {
      print("Exception caught: ${ex.message}");
      return ex.response;
    } catch (e) {
      print("Exception caught: ${e.toString()}");
      throw e.toString();
    }
  }
}
