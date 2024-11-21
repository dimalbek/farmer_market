import 'package:dio/dio.dart';
import 'package:farmer_app_2/models/user.dart';
import 'package:farmer_app_2/services/auth_services.dart';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
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
    var value = await (storage.read(key: 'token'));
    if (value != null) {
      _futureUser = getUserInfo(value);
      notifyListeners();
    }
  }

  void login(String username, String password) async {
    triggerLoad();
    Response? userdata = await AuthService().login(username, password);
    if (userdata == null || userdata.statusCode != 200) {
      String errMsg = "";
      try {
        errMsg = userdata!.data["detail"][0]["msg"];
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
      bool isAuthenticate = userdata.data['success'] == 'true';
      if (isAuthenticate) {
        _futureUser = getUserInfo(userdata.data['token']);
        await storage.write(key: 'token', value: userdata.data['token']);
        notifyListeners();
      } else {
        Fluttertoast.showToast(
            msg: userdata.data['msg'],
            toastLength: Toast.LENGTH_SHORT,
            gravity: ToastGravity.CENTER,
            timeInSecForIosWeb: 1,
            backgroundColor: Colors.red,
            textColor: Colors.white,
            fontSize: 16.0);
      }
    }
    triggerLoad();
  }

  Future<bool> registerFarmer(Map<String, dynamic> data1, Map<String, dynamic> data2) async {
    triggerLoad();
    Response? userdata = await AuthService().registerFarmer(data1, data2);
    print(userdata);
    if (userdata == null || userdata.statusCode != 200) {
      String errMsg = "";
      try {
        errMsg = userdata!.data["detail"][0]["msg"];
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
    }
    bool success = userdata?.data['success'];
    if (!success) {
      Fluttertoast.showToast(
          msg: userdata?.data['msg'],
          toastLength: Toast.LENGTH_SHORT,
          gravity: ToastGravity.CENTER,
          timeInSecForIosWeb: 1,
          backgroundColor: Colors.red,
          textColor: Colors.white,
          fontSize: 16.0);
      triggerLoad();
      return false;
    } else {
      Fluttertoast.showToast(
          msg: userdata?.data['msg'],
          toastLength: Toast.LENGTH_SHORT,
          gravity: ToastGravity.CENTER,
          timeInSecForIosWeb: 1,
          backgroundColor: Colors.green,
          textColor: Colors.white,
          fontSize: 16.0);
      triggerLoad();
      return true;
    }
  }



  Future<bool> registerBuyer(Map<String, dynamic> data1, Map<String, dynamic> data2) async {
    triggerLoad();
    Response? userdata = await AuthService().registerBuyer(data1, data2);
    print("userdata $userdata");
    if (userdata == null || userdata.statusCode != 200) {
      String errMsg = "";
      try {
        errMsg = userdata!.data["detail"][0]["msg"];
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
    }
    bool success = userdata?.data['success'];
    if (!success) {
      Fluttertoast.showToast(
          msg: userdata?.data['msg'],
          toastLength: Toast.LENGTH_SHORT,
          gravity: ToastGravity.CENTER,
          timeInSecForIosWeb: 1,
          backgroundColor: Colors.red,
          textColor: Colors.white,
          fontSize: 16.0);
      triggerLoad();
      return false;
    } else {
      Fluttertoast.showToast(
          msg: userdata?.data['msg'],
          toastLength: Toast.LENGTH_SHORT,
          gravity: ToastGravity.CENTER,
          timeInSecForIosWeb: 1,
          backgroundColor: Colors.green,
          textColor: Colors.white,
          fontSize: 16.0);
      triggerLoad();
      return true;
    }
  }

  Future<User?> getUserInfo(String? token) async {
    var res = await AuthService().getInfo(token);
    if (res!.data['success']) {
      var userData = User.fromJson(res.data);
      _user = userData;
      print(_user!.id);
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
