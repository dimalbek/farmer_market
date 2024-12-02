import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:farmer_app_2/widgets/toast_message.dart';
import 'package:flutter/material.dart' show ChangeNotifier, Colors;
import 'package:image_picker/image_picker.dart';
import '../models/product.dart';
import '../services/product_service.dart';
import 'package:fluttertoast/fluttertoast.dart';

class ProductProvider with ChangeNotifier {
  Future<List<Product?>> getAllProducts() async {
    print("Getting all products");
    try {
      Response? res = await PostService().getAllProducts();
      if (res != null) {
        print("Decoding json list...");
        final List<dynamic> products = res.data;
        List<Product?> listRes =
            products.map((e) => Product.fromJson(e)).toList();
        print('_searchCategory.isNotEmpty: ${_searchKey.isNotEmpty}');
        print('_searchCategory: $_searchKey');
        if (_searchKey.isNotEmpty) {
          listRes = listRes.map((e) {
            print(e?.name);
            return e!.name.toLowerCase().contains(_searchKey.toLowerCase())
                ? e
                : null;
          }).toList();
        }
        if (_searchCategory.isNotEmpty) {
          listRes = listRes.map((e) {
            print(e?.name);
            return e!.category == _searchCategory ? e : null;
          }).toList();
        }
        print(listRes);
        return listRes;
      } else {
        throw "No products";
      }
    } catch (e) {
      print("Error occured: ${e.toString()}");
      throw e.toString();
    }
  }

  bool searched() {
    if (_searchKey.isNotEmpty || _searchCategory.isNotEmpty) return true;
    return false;
  }

  String _searchKey = '';

  String get searchKey => _searchKey;

  String _searchCategory = '';

  String get searchCategory => _searchCategory;

  void search(String search) {
    print('Search: $search');
    _searchKey = search;
    notifyListeners();
  }

  void categorySearch(String category) {
    print('Category: $category');
    _searchCategory = category;
    notifyListeners();
  }

  Future<List<Product?>?> searchProducts() async {
    print("Search product called");
    try {
      triggerLoad();
      Response? res = await PostService().searchProduct(
        _searchKey,
        _searchCategory,
      );
      triggerLoad();
      print(res);
      if (res != null && res.statusCode == 200) {
        print("Decoding json list...");
        final List<dynamic> products = res.data;
        List<Product?> listRes =
            products.map((e) => Product.fromJson(e)).toList();
        if (_searchKey.isNotEmpty) {
          listRes = listRes
              .map((e) => e!.name.contains(_searchKey) ? e : null)
              .toList();
        }
        return listRes;
      } else {
        String errMsg = '';
        try {
          errMsg = res!.data['detail'];
        } catch (e) {
          errMsg = e.toString();
        }
        throw errMsg;
      }
    } catch (e) {
      print("Error occured: ${e.toString()}");
      throw e.toString();
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
