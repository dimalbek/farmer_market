import 'package:dio/dio.dart';
import 'package:farmer_app_2/constants/fields.dart';
import 'package:farmer_app_2/constants/routes.dart';
import 'package:farmer_app_2/widgets/toast_message.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/user.dart';
import '../services/auth_services.dart';
import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';

class AuthProvider with ChangeNotifier {
  Future<User?>? _futureUser;
  late final FlutterSecureStorage storage;

  User? _user;

  AuthProvider() {
    storage = const FlutterSecureStorage();
    initialData();
  }

  bool _isLoading = false;

  void triggerLoad() {
    _isLoading = !_isLoading;
    notifyListeners();
  }

  User? get user => _user;

  bool get isLoading => _isLoading;

  void initialData() async {
    var value = await (storage.read(key: tokenField));
    if (value != null) {
      _futureUser = getUserInfo(value);
      notifyListeners();
    }
  }

  Future<String> login(
    String username,
    String password,
    BuildContext? context,
  ) async {
    triggerLoad();
    Response? userdata = await AuthService().login(username, password);
    String token = '';
    print(userdata);
    if (userdata == null || userdata.statusCode != 200) {
      String errMsg = "";
      try {
        errMsg = userdata!.data["detail"];
      } catch (_) {
        errMsg = "JSON parse error (client side)";
      }
      Fluttertoast.showToast(
        msg: errMsg,
        toastLength: Toast.LENGTH_SHORT,
        gravity: ToastGravity.CENTER,
        timeInSecForIosWeb: 1,
        backgroundColor: Colors.red,
        textColor: Colors.white,
        fontSize: 16.0,
      );
    } else {
      // User exists
      // Get his jwt token
      token = userdata.data['access_token'];

      _futureUser = AuthProvider().getUserInfo(token);
      _user = await _futureUser;
      notifyListeners();

      // Navigate user to page
      if (context != null && context.mounted) {
        Navigator.of(context).pushNamedAndRemoveUntil(
          rootRoute,
          (route) => false,
        );
      }
    }
    triggerLoad();
    return token;
  }

  Future<bool> register(Map<String, dynamic> loginData) async {
    triggerLoad();
    Response? userdata = await AuthService().register(loginData);
    if (userdata == null || userdata.statusCode != 200) {
      String errMsg = "";
      try {
        errMsg = userdata!.data["detail"][0]["msg"];
      } catch (_) {
        errMsg = "Error: ${userdata!.data.toString()}";
      }
      failToast(errMsg);
    }
    print(userdata);
    if (userdata.data['message'] != "Successfully signed up.") {
      failToast(userdata.data['detail']);
      triggerLoad();
      _isLoading = false;
      return false;
    } else {
      // successToast(userdata.data['message']);
      triggerLoad();
      _isLoading = false;
      return true;
    }
  }

  Future<User?> getUserInfo(String? token) async {
    // notifyListeners();
    var res = await AuthService().getInfo(token);
    if (res!.data['id'] != null) {
      final json = res.data;
      json[tokenField] = token;
      var userData = User.fromJson(res.data);
      _user = userData;
      return userData;
    } else {
      return null;
    }
  }

  Future<User?>? get futureUser => _futureUser;

  void logout() {
    _futureUser = makeNull();
    _user = null;
    notifyListeners();
  }

  Future<User?> makeNull() async {
    await storage.deleteAll();
    return null;
  }
}