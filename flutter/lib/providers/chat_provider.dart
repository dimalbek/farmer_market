import 'package:farmer_app_2/models/chat.dart';
import 'package:farmer_app_2/services/chat_services.dart';
import 'package:flutter/material.dart';

class ChatProvider with ChangeNotifier {
  Future<Chat> createChatWithFarmer(String token, String farmerId) async {
    print("Creating chat with farmer...");
    try {
      final Chat? response =
          await ChatServices().createChatWithFarmer(token, farmerId);
      if (response != null) {
        try {
          return response;
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
}
