import 'package:dio/dio.dart';
import 'package:farmer_app_2/constants/fields.dart';
import 'package:image_picker/image_picker.dart';

class Product {
  final String id;
  final String name;
  final String description;
  final String category;
  final double price;
  final int quantity;
  final String farmerId;
  final String farmerUserId;
  final List<dynamic> images;

  Product({
    required this.id,
    required this.name,
    required this.description,
    required this.category,
    required this.price,
    required this.quantity,
    required this.farmerId,
    required this.farmerUserId,
    required this.images,
  });

  factory Product.fromJson(Map<String, dynamic> parsedJson) {
    return Product(
      id: parsedJson[idField].toString(),
      name: parsedJson[nameField].toString(),
      description: parsedJson[descriptionField].toString(),
      category: parsedJson[categoryField].toString(),
      price: parsedJson[priceField],
      quantity: parsedJson[quantityField],
      farmerId: parsedJson[farmerIdField].toString(),
      farmerUserId: parsedJson[userIdField].toString(),
      images: parsedJson[imagesField].toList(),
    );
  }
}
