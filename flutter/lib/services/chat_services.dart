import 'package:dio/dio.dart';
import 'package:farmer_app_2/constants/c_urls.dart';
import 'package:farmer_app_2/constants/fields.dart';
import 'package:farmer_app_2/models/chat.dart';

class ChatServices {
  Dio dio = Dio();

  Future<Response?> createChatWithFarmer(String token, String farmerId) async {
    print("Api request...");
    try {
      return await dio.post(
        '${CUrls.baseApiUrl}/chat/chats/$farmerId',
        data: {farmerIdField: farmerId},
        options: Options(
          followRedirects: false,
          validateStatus: (status) {
            return status! < 500;
          },
          headers: {'Authorization': 'Bearer $token'},
          contentType: Headers.jsonContentType,
        ),
      );
    } on DioException catch (e) {
      print(e.message.toString());
      throw e.message.toString();
    } catch (e) {
      print(e.toString());
      throw e.toString();
    }
  }

  Future<Response?> getUserChats(String token) async {
    print("Api request...");
    try {
      return await dio.get(
        '${CUrls.baseApiUrl}/chat/chats/',
        options: Options(
          headers: {'Authorization': 'Bearer $token'},
          contentType: Headers.jsonContentType,
        ),
      );
    } on DioException catch (e) {
      throw e.message.toString();
    } catch (e) {
      throw e.toString();
    }
  }

  Future<Response?> getChat(
    String token,
    String chatId,
  ) async {
    print("Api request...");
    try {
      return await dio.get(
        '${CUrls.baseApiUrl}/chat/chats/$chatId',
        options: Options(
          headers: {'Authorization': 'Bearer $token'},
          contentType: Headers.jsonContentType,
        ),
      );
    } on DioException catch (e) {
      throw e.message.toString();
    } catch (e) {
      throw e.toString();
    }
  }
}
