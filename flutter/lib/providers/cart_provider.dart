import 'package:dio/dio.dart';
import 'package:farmer_app_2/models/cart_item.dart';
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

  Future<List<CartItem>> getCart(String token) async {
    triggerLoad();
    print("Getting cart...");
    try {
      final response = await CartServices().getCart(token);
      print('response: $response');
      triggerLoad();
      final List<dynamic> list = response!.data;
      final cartItems = list.map((e) => CartItem.fromJson(e)).toList();
      return cartItems;
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
      if (response != null && response.statusCode! < 300) {
        successToast(response.data['message']);
      } else {
        try {
          throw response!.data['detail'][0]['msg'];
        } catch (e) {
          throw 'JSON error (client side)';
        }
      }
      triggerLoad();
    } catch (e) {
      triggerLoad();
      throw e.toString();
    }
  }

  Future<String> clearOrRemoveItemFromCart(
      String? productId, String token) async {
    print("Removing from cart...");

    try {
      final response =
          await CartServices().clearOrRemoveItemFromCart(productId, token);
      print('response: $response');
      if (response != null && response.statusCode! < 300) {
        successToast(response.data['message']);
        triggerLoad();
        return response.data['message'];
      } else {
        triggerLoad();
        try {
          throw response!.data['detail'][0]['msg'];
        } catch (e) {
          throw 'JSON error (client side)';
        }
      }
    } catch (e) {
      triggerLoad();
      throw e.toString();
    }
  }

  Future<String> getCartTotal(String token) async {
    print("Getting cart total...");
    try {
      final response = await CartServices().getCartTotal(token);
      print('response: $response');
      triggerLoad();
      if (response != null && response.statusCode! < 300) {
        successToast(response.data['message']);
        triggerLoad();
        return response.data['message'];
      } else {
        triggerLoad();
        try {
          throw response!.data['detail'][0]['msg'];
        } catch (e) {
          throw 'JSON error (client side)';
        }
      }
    } catch (e) {
      triggerLoad();
      throw e.toString();
    }
  }
}
