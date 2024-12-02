import 'package:farmer_app_2/constants/fields.dart';
import 'package:farmer_app_2/models/messages.dart';

class Chat {
  final String id;
  final String buyerId;
  final String farmerId;
  final List<Message>? messages;
  const Chat({
    required this.id,
    required this.buyerId,
    required this.farmerId,
    this.messages,
  });
  factory Chat.fromJson(Map<String, dynamic> parsedJson) {
    return Chat(
      id: parsedJson[idField].toString(),
      buyerId: parsedJson[buyerIdField].toString(),
      farmerId: parsedJson[farmerIdField].toString(),
      messages: convertToList(parsedJson[messagesField]),
    );
  }
}

List<Message>? convertToList(List<dynamic>? list) {
  if (list != null && list.isNotEmpty) {
    return list.map((e) => Message.fromJson(e)).toList();
  }
  return null;
}
