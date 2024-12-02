import 'package:farmer_app_2/constants/fields.dart';

class Message {
  final String id;
  final String senderId;
  final String content;
  final DateTime timestamp;
  const Message({
    required this.id,
    required this.senderId,
    required this.content,
    required this.timestamp,
  });
  factory Message.fromJson(Map<String, dynamic> parsedJson) {
    return Message(
      id: parsedJson[idField].toString(),
      senderId: parsedJson[senderIdField].toString(),
      content: parsedJson[contentField].toString(),
      timestamp: DateTime.parse(parsedJson[timestampField]),
    );
  }
}
