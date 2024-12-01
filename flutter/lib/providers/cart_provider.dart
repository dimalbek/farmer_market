import 'package:dio/dio.dart';
import 'package:farmer_app_2/services/cart_services.dart';
import 'package:farmer_app_2/widgets/toast_message.dart';
import 'package:flutter/material.dart';

class CartProvider with ChangeNotifier {
  bool _isLoading = false;

  void triggerLoad() {
    _isLoading = !_isLoading;
    notifyListeners();
  }

  bool get isLoading => _isLoading;

  Future<String> getCart(String token) async {
    triggerLoad();
    print("Getting cart...");
    try {
      final response = await CartServices().getCart(token);
      print('response: $response');
      triggerLoad();
      return '';
    } catch (e) {
      triggerLoad();
      throw e.toString();
    }
  }

  Future<void> addToCart(String productId, int quantity, String token) async {
    triggerLoad();
    print("Adding to cart...");
    try {
      final response = await CartServices().addToCart(
        productId,
        quantity,
        token,
      );
      print('response: $response');
      triggerLoad();
      print("It is here");
    } catch (e) {
      triggerLoad();
      throw e.toString();
    }
  }
}
