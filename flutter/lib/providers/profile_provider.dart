import 'package:dio/dio.dart';
import 'package:farmer_app_2/models/profile.dart';
import 'package:farmer_app_2/services/profile_services.dart';
import 'package:farmer_app_2/widgets/toast_message.dart';
import 'package:flutter/material.dart';

class ProfileProvider with ChangeNotifier {
  bool _isLoading = false;

  bool get isLoading => _isLoading;

  void triggerLoad() {
    _isLoading = !_isLoading;
    notifyListeners();
  }

  Future<bool> createFarmerProfile(
    Map<String, dynamic> profileData,
    String token,
  ) async {
    print("Create farmer profile function called.");
    triggerLoad();
    Response? response =
        await ProfileServices().createFarmerProfile(profileData, token);
    if (response == null || response.statusCode != 200) {
      String errMsg = "";
      try {
        errMsg = response.toString();
      } catch (_) {
        errMsg = "JSON parse error (client side)";
      }
      failToast(errMsg);
    }
    if (response != null) {
      successToast(response.toString());
      triggerLoad();
      notifyListeners();
      return true;
    } else {
      failToast(response.toString());
      triggerLoad();
      notifyListeners();
      return false;
    }
  }

  Future<bool> createBuyerProfile(
    Map<String, dynamic> profileData,
    String token,
  ) async {
    print("Create farmer profile function called.");
    triggerLoad();
    Response? response =
        await ProfileServices().createBuyerProfile(profileData, token);
    if (response == null || response.statusCode != 200) {
      String errMsg = "";
      try {
        errMsg = response.toString();
      } catch (_) {
        errMsg = "JSON parse error (client side)";
      }
      failToast(errMsg);
    }
    if (response != null) {
      successToast(response.toString());
      triggerLoad();
      notifyListeners();
      return true;
    } else {
      failToast(response.toString());
      triggerLoad();
      notifyListeners();
      return false;
    }
  }

  Future<FarmerProfile?> getFarmerProfile(String token) async {
    final Response? response = await ProfileServices().getMyProfile(token);
    print("Farmer profile:");
    print(response);
    String errMsg = '';
    if (response == null || response.statusCode != 200) {
      try {
        errMsg = response?.data['detail'];
      } catch (e) {
        errMsg = "JSON parse error (client side)";
      }
      failToast(errMsg);
      return null;
    } else {
      if (response.data == null) {
        return null;
      }
      print("here");
      final res = FarmerProfile.fromJson(response.data);
      print("Res here: $res");
      return res;
    }
  }

  Future<BuyerProfile?> getBuyerProfile(String token) async {
    final Response? response = await ProfileServices().getMyProfile(token);
    print("Buyer profile:");
    print(response);
    String errMsg = '';
    if (response == null || response.statusCode != 200) {
      try {
        errMsg = response.toString();
      } catch (e) {
        errMsg = "JSON parse error (client side)";
      }
      failToast(errMsg);
      return null;
    } else {
      if (response.data == null) {
        return null;
      }
      print("here");
      final res = BuyerProfile.fromJson(response.data);
      print("Res here: $res");
      return res;
    }
  }

  void updateFarmerProfile({
    required String farmNameField,
    required String locationField,
    required String farmSizeField,
  }) {
    // The API reqest is not implemented yet
    // Response? response = dio.
  }
}
