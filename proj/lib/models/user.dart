class User {
  final String id;
  final String name;
  final String email;
  final String role; // "farmer" or "buyer"

  User({required this.id, required this.name, required this.email, required this.role});

  factory User.fromJson(Map<String, dynamic> parsedJson) {
    return User(
      id: parsedJson['id'].toString(),
      name: parsedJson['name'].toString(),
      email: parsedJson['email'].toString(),
      role: parsedJson['role'].toString(),
    );
  }
}
