import 'package:farmer_app_2/models/chat.dart';
import 'package:farmer_app_2/services/chat_services.dart';
import 'package:flutter/material.dart';

class ChatProvider with ChangeNotifier {
  List<Chat>? _chats;

  List<Chat>? get chats => _chats;

  Future<Chat> createChatWithFarmer(String token, String farmerId) async {
    print("Creating chat with farmer...");
    try {
      final response = await ChatServices().createChatWithFarmer(
        token,
        farmerId,
      );
      print('response: $response');
      if (response != null && response.statusCode == 200) {
        try {
          return Chat.fromJson(response.data);
        } catch (e) {
          throw e.toString();
        }
      } else {
        String errMsg;
        try {
          errMsg = response!.data['detail'];
        } catch (e) {
          errMsg = "Error. Chat was not be created";
        }
        throw errMsg;
      }
    } catch (e) {
      throw e.toString();
    }
  }

  Future<List<Chat>?> getUserChats(String token) async {
    print("Getting all user chats...");
    try {
      final response = await ChatServices().getUserChats(token);
      if (response != null && response.statusCode == 200) {
        try {
          final List<dynamic> list = response.data;
          _chats = list.map((e) => Chat.fromJson(e)).toList();
          return chats;
        } catch (e) {
          throw e.toString();
        }
      } else {
        try {
          throw "Error. Chat was not be created";
        } catch (e) {
          throw 'JSON client side error';
        }
      }
    } catch (e) {
      throw e.toString();
    }
  }

  Future<Chat> getChat(String token, String chatId) async {
    print("Getting individual chat...");
    try {
      final response = await ChatServices().getChat(token, chatId);
      if (response != null && response.statusCode == 200) {
        try {
          Chat chat = Chat.fromJson(response.data);
          return chat;
        } catch (e) {
          throw e.toString();
        }
      } else {
        try {
          throw "Error. Chat could not be fetched";
        } catch (e) {
          throw 'JSON client side error';
        }
      }
    } catch (e) {
      throw e.toString();
    }
  }
}
