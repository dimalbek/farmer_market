import 'package:farmer_app_2/constants/fields.dart';

class User {
  final String token;
  final String id;
  final String fullname;
  final String email;
  final String phone;
  final String role; // "farmer" or "buyer"

  User({
    required this.token,
    required this.id,
    required this.fullname,
    required this.email,
    required this.phone,
    required this.role,
  });

  factory User.fromJson(Map<String, dynamic> parsedJson) {
    return User(
      token: parsedJson[tokenField].toString(),
      id: parsedJson[idField].toString(),
      fullname: parsedJson[fullnameField].toString(),
      email: parsedJson[emailField].toString(),
      phone: parsedJson[phoneField].toString(),
      role: parsedJson[roleField].toString(),
    );
  }
}
