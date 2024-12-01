import 'package:farmer_app_2/constants/fields.dart';

class FarmerProfile {
  final String id;
  final String farmName;
  final String location;
  final double farmSize;
  final String userId;
  final bool isApproved;

  const FarmerProfile({
    required this.id,
    required this.farmName,
    required this.location,
    required this.farmSize,
    required this.userId,
    required this.isApproved,
  });

  factory FarmerProfile.fromJson(Map<String, dynamic> parsedJson) {
    return FarmerProfile(
      id: parsedJson[idField].toString(),
      farmName: parsedJson[farmNameField].toString(),
      location: parsedJson[locationField].toString(),
      farmSize: parsedJson[farmSizeField],
      userId: parsedJson[userIdField].toString(),
      isApproved: parsedJson[isApprovedField],
    );
  }
}

class BuyerProfile {
  final String id;
  final String deliveryAddress;
  final String userId;

  const BuyerProfile({
    required this.id,
    required this.deliveryAddress,
    required this.userId,
  });

  factory BuyerProfile.fromJson(Map<String, dynamic> parsedJson) {
    return BuyerProfile(
      id: parsedJson[idField].toString(),
      deliveryAddress: parsedJson[deliveryAddressField].toString(),
      userId: parsedJson[userIdField].toString(),
    );
  }
}
