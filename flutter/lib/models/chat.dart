import 'package:farmer_app_2/constants/fields.dart';

class Chat {
  final String id;
  final String buyerId;
  final String farmerId;
  const Chat({
    required this.id,
    required this.buyerId,
    required this.farmerId,
  });
  factory Chat.fromJson(Map<String, dynamic> parsedJson) {
    return Chat(
      id: parsedJson[idField].toString(),
      buyerId: parsedJson[buyerIdField].toString(),
      farmerId: parsedJson[farmerIdField].toString(),
    );
  }
}
