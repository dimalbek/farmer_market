import 'package:dio/dio.dart';
import 'package:farmer_app_2/constants/c_urls.dart';

class ProfileServices {
  Dio dio = Dio();

  Future<Response?> createFarmerProfile(
    Map<String, dynamic> profileData,
    String token,
  ) async {
    try {
      print("API request...");
      final res = await dio.post(
        '${CUrls.baseApiUrl}/profiles/farmer/',
        data: profileData,
        options: Options(
          headers: {'Authorization': 'Bearer $token'},
        ),
      );
      print("Result: $res");
      return res;
    } on DioException catch (ex) {
      return ex.response;
    }
  }

  Future<Response?> createBuyerProfile(
    Map<String, dynamic> profileData,
    String token,
  ) async {
    try {
      print("API request...");
      final res = await dio.post(
        '${CUrls.baseApiUrl}/profiles/buyer/',
        data: profileData,
        options: Options(
          headers: {'Authorization': 'Bearer $token'},
        ),
      );
      print("Result: $res");
      return res;
    } on DioException catch (ex) {
      return ex.response;
    }
  }

  Future<Response?> getMyProfile(String token) async {
    print("Api Request...");
    Response? response = await dio.get(
      '${CUrls.baseApiUrl}/profiles/me',
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
    print(response.toString());
    return response;
  }
}
