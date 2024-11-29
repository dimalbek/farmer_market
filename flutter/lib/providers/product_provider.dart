import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:farmer_app_2/widgets/toast_message.dart';
import 'package:flutter/material.dart' show ChangeNotifier, Colors;
import 'package:image_picker/image_picker.dart';
import '../models/product.dart';
import '../services/product_service.dart';
import 'package:fluttertoast/fluttertoast.dart';

class ProductProvider with ChangeNotifier {
  Future<List<Product>> getAllProducts() async {
    print("Getting all products");
    try {
      Response? res = await PostService().getAllProducts();
      print("Api result: $res");
      if (res != null) {
        print("Decoding json list...");
        final List<dynamic> products = res.data;
        final listRes = products.map((e) => Product.fromJson(e)).toList();
        print("listRes: $listRes");
        return listRes;
      } else {
        throw "No products";
      }
    } catch (e) {
      print("Error occured: ${e.toString()}");
      throw e.toString();
    }
  }

  String _searchKey = '';

  String get searchKey => _searchKey;

  void search(String search) {
    _searchKey = search;
    notifyListeners();
  }

  Future<List<Product>> searchPost() async {
    Response? res = await PostService().searchProduct(_searchKey);
    if (res != null) {
      return (res.data as List).map((data) => Product.fromJson(data)).toList();
    } else {
      return res!.data;
    }
  }

  Future<void> deletePost(String id) async {
    triggerLoad();
    Response? res = await PostService().deleteProduct(id);
    Fluttertoast.showToast(
      msg: res?.data['msg'],
      toastLength: Toast.LENGTH_SHORT,
      gravity: ToastGravity.CENTER,
      timeInSecForIosWeb: 1,
      backgroundColor: Colors.green,
      textColor: Colors.white,
      fontSize: 16.0,
    );
    triggerLoad();
  }

  void refresh() {
    notifyListeners();
  }

  Future<void> createProduct({
    required String name,
    required quantity,
    required category,
    required String description,
    required double price,
    required List<XFile> images,
    required String token,
  }) async {
    triggerLoad();
    print("Creating product in Provider");
    Response? res = await PostService().createProduct(
      name,
      quantity,
      category,
      description,
      price,
      images,
      token,
    );
    print(res);
    print(res?.statusCode);
    if (res == null || res.statusCode != 201) {
      String errMsg;
      try {
        errMsg = res?.data['detail'][0]['msg'];
      } catch (e) {
        errMsg = "Json error (client side)";
      }
      throw errMsg;
    } else {
      successToast("Product ${res.data['name']} created successfully");
      triggerLoad();
    }
  }

  Future<void> updatePost(Product post) async {
    triggerLoad();
    Response? res = await PostService().updateProduct(post);
    Fluttertoast.showToast(
      msg: res?.data['msg'],
      toastLength: Toast.LENGTH_SHORT,
      gravity: ToastGravity.CENTER,
      timeInSecForIosWeb: 1,
      backgroundColor: Colors.green,
      textColor: Colors.white,
      fontSize: 16.0,
    );
    triggerLoad();
  }

  bool _isLoading = false;
  void triggerLoad() {
    _isLoading = !_isLoading;
    notifyListeners();
  }

  bool get isLoading => _isLoading;
}
