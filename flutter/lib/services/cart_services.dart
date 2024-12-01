import 'dart:io';

import 'package:dio/dio.dart';
import 'package:farmer_app_2/constants/c_urls.dart';
import 'package:farmer_app_2/constants/fields.dart';
import 'package:provider/provider.dart';

class CartServices {
  Dio dio = Dio();

  Future<Response?> getCart(String token) async {
    print("Api request...");
    try {
      return await dio.get('${CUrls.baseApiUrl}/cart',
          options: Options(headers: {'Authorization': 'Bearer $token'}));
    } on DioException catch (ex) {
      throw ex.message.toString();
    } catch (e) {
      throw e.toString();
    }
  }

  Future<Response?> addToCart(
    String productId,
    int quantity,
    String token,
  ) async {
    print("Api request...");
    final data = {
      productIdField: int.tryParse(productId) ?? 1,
      quantityField: quantity,
    };
    print('data: $data');
    try {
      final response = await dio.post(
        '${CUrls.baseApiUrl}/cart/',
        data: data,
        options: Options(
          headers: {
            "ngrok-skip-browser-warning": "true",
            "Content-Type": "application/json",
            'Authorization': 'Bearer $token',
          },
        ),
      );
      print(response);
      if (response.statusCode == 200) {
        return response;
      } else {
        try {
          throw response.data['detail'][0]['msg'];
        } catch (e) {
          throw response.data.toString();
        }
      }
    } on DioException catch (ex) {
      throw ex.message.toString();
    } catch (e) {
      throw e.toString();
    }
  }

  Future<Response?> clearOrRemoveItemFromCart(
    String? productId,
    String token,
  ) async {
    try {
      final url = productId == null
          ? '${CUrls.baseApiUrl}/cart/'
          : '${CUrls.baseApiUrl}/cart/$productId';
      return dio.delete(
        url,
        data: {productIdField: productId},
        options: Options(
          headers: {
            "Content-Type": "application/json",
            'Authorization': 'Bearer $token',
          },
        ),
      );
    } on DioException catch (e) {
      throw e.message.toString();
    } catch (e) {
      throw e.toString();
    }
  }

  Future<Response?> getCartTotal(String token) async {
    print("Api request...");
    try {
      return dio.delete(
        '${CUrls.baseApiUrl}/cart/total/',
        options: Options(
          headers: {
            "Content-Type": "application/json",
            'Authorization': 'Bearer $token',
          },
        ),
      );
    } on DioException catch (e) {
      print(e.message.toString());
      throw e.message.toString();
    } catch (e) {
      throw e.toString();
    }
  }
}
