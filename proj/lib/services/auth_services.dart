import 'package:dio/dio.dart';
import 'package:farmer_app_2/constants/c_urls.dart';

class AuthService {
  Dio dio = Dio();

  Future<Response?> login(String email, String password) async {
    try {
      return await dio.post('${CUrls.baseApiUrl}/auth/users/login',
          data: {'email': email, 'password': password},
          options: Options(contentType: Headers.formUrlEncodedContentType));
    } on DioException catch (ex) {
      return ex.response;
    }
  }

  Future<Response?> getInfo(String? token) async {
    try {
      return await dio.get('${CUrls.baseApiUrl}/getinfo',
          options: Options(headers: {'Authorization': 'Bearer $token'}));
    } on DioError catch (ex) {
      return ex.response;
    }
  }

  Future<Response?> registerBuyer(
    Map<String, dynamic> data1,
    Map<String, dynamic> data2,
  ) async {
    final data = {};
    data.addAll(data1);
    data.addAll(data2);
    try {
      final res1 = await dio.post('${CUrls.baseApiUrl}/auth/users',
          data: data1,
          // options: Options(contentType: Headers.jsonContentType),
      );
      return res1;
    } on DioException catch (ex) {
      print(ex);
      return ex.response;
    }
  }

  Future<Response?> registerFarmer(
    Map<String, dynamic> data1,
    Map<String, dynamic> data2,
  ) async {
    final data = {};
    data.addAll(data1);
    data.addAll(data2);
    try {
      final res1 = await dio.post('${CUrls.baseApiUrl}/auth/users',
          data: data, options: Options(contentType: Headers.jsonContentType));
      return res1;
    } on DioException catch (ex) {
      return ex.response;
    }
  }
}
