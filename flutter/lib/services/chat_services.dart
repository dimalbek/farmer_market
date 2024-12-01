import 'package:dio/dio.dart';
import 'package:farmer_app_2/constants/c_urls.dart';
import 'package:farmer_app_2/models/chat.dart';

class ChatServices {
  Dio dio = Dio();

  Future<Chat?> createChatWithFarmer(String token, String farmerId) async {
    print("Api request...");
    try {
      final response = await dio.post(
        '${CUrls.baseApiUrl}/chats/$farmerId',
        options: Options(
          headers: {'Authorization': 'Bearer $token'},
          contentType: Headers.jsonContentType,
        ),
      );
      print(response.data);
      Chat chat = Chat.fromJson(response.data);
    } on DioException catch (e) {
      throw e.message.toString();
    } catch (e) {
      throw e.toString();
    }
  }
}
