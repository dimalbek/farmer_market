import 'package:dio/dio.dart';
import 'package:farmer_app_2/models/cart_item.dart';
import 'package:farmer_app_2/services/cart_services.dart';
import 'package:farmer_app_2/widgets/toast_message.dart';
import 'package:flutter/material.dart';

class CartProvider with ChangeNotifier {
  bool _isLoading = false;

  List<CartItem>? _cartList;

  List<CartItem>? get cartList => _cartList;

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
      _cartList = cartItems;
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
    triggerLoad();
    try {
      final response =
          await CartServices().clearOrRemoveItemFromCart(productId, token);
      print('response: $response');
      if (response != null && response.statusCode! < 300) {
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

  Future<double> getCartTotal(String token) async {
    triggerLoad();
    print("Getting cart total...");
    try {
      final response = await CartServices().getCartTotal(token);
      print('getCartTotal response: $response');
      triggerLoad();
      if (response != null && response.statusCode == 200) {
        triggerLoad();
        return response.data['total_price'];
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

  Future<String?> updateCartItem(
    String productId,
    int quantity,
    String token,
  ) async {
    triggerLoad();
    print("Updating cart item...");
    try {
      final response = await CartServices().updateCartItem(
        productId,
        quantity,
        token,
      );
      print('updateCartItem response: $response');
      triggerLoad();
      if (response != null && response.statusCode == 200) {
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
      print("Error caught trying to update the cart item: ${e.toString()}");
      triggerLoad();
      throw e.toString();
    }
  }
}
