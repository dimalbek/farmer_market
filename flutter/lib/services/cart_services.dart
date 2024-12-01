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
    print(data);
    try {
      final response = await dio.post(
        '${CUrls.baseApiUrl}/cart?product_id=$productId&quantity=$quantity',
        data: data,
        options: Options(
          headers: {'Authorization': 'Bearer $token'},
          contentType: Headers.jsonContentType,
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
}
