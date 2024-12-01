import 'package:farmer_app_2/constants/fields.dart';

class CartItem {
  final String id;
  final String userId;
  final String productId;
  final String productName;
  final double price;
  final int quantity;

  CartItem({
    required this.id,
    required this.userId,
    required this.productId,
    required this.productName,
    required this.price,
    required this.quantity,
  });

  factory CartItem.fromJson(Map<String, dynamic> parsedJson) {
    return CartItem(
      id: parsedJson[idField].toString(),
      userId: parsedJson[userIdField].toString(),
      productId: parsedJson[productIdField].toString(),
      productName: parsedJson[productNameField].toString(),
      price: parsedJson[priceField] as double,
      quantity: parsedJson[quantityField] as int,
    );
  }
}
