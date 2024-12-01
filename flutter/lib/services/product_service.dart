import 'dart:convert';
import 'dart:io';

import 'package:dio/dio.dart';
import 'package:farmer_app_2/constants/c_urls.dart';
import 'package:farmer_app_2/constants/fields.dart';
import 'package:image_picker/image_picker.dart';
import '../models/product.dart';

class PostService {
  Dio dio = Dio();

  Future<Response?> getAllProducts() async {
    print("Api request...");
    try {
      return await dio.get('${CUrls.baseApiUrl}/products');
    } on DioException catch (err) {
      return err.response;
    } catch (error, stacktrace) {
      throw Exception("Exception occured: $error stackTrace: $stacktrace");
    }
  }

  Future<Response?> searchProduct(String searchKey) async {
    try {
      return await dio
          .get('https://nehryrestapi.herokuapp.com/searchpost/$searchKey');
    } on DioException catch (err) {
      return err.response;
    } catch (error, stacktrace) {
      throw Exception("Exception occured: $error stackTrace: $stacktrace");
    }
  }

  Future<Response?> deleteProduct(String id) async {
    try {
      return await dio
          .delete('https://nehryrestapi.herokuapp.com/deletepost/$id');
    } on DioException catch (err) {
      return err.response;
    } catch (error, stacktrace) {
      throw Exception("Exception occured: $error stackTrace: $stacktrace");
    }
  }

  Future<Response?> createProduct(
    String name,
    int quantity,
    String category,
    String description,
    double price,
    List<XFile> images,
    String token,
  ) async {
    print("Making api request...");
    List<MultipartFile> fileList = [];
    int i = 1;
    for (XFile fileEntry in images) {
      MultipartFile multipartFile = await MultipartFile.fromFile(
        fileEntry.path,
        filename: '$name-$i',
      );
      fileList.add(multipartFile);
    }
    final formData = FormData.fromMap({
      nameField: name,
      quantityField: quantity,
      categoryField: category,
      descriptionField: description,
      priceField: price,
      imagesField: fileList,
    });
    try {
      return await dio.post(
        '${CUrls.baseApiUrl}/products/',
        options: Options(headers: {
          HttpHeaders.contentTypeHeader: "multipart/form-data",
          'Authorization': 'Bearer $token',
        }),
        data: formData,
      );
    } on DioException catch (err) {
      return err.response;
    } catch (error, stacktrace) {
      throw Exception("Exception occured: $error stackTrace: $stacktrace");
    }
  }

  Future<Response?> updateProduct(Product post) async {
    try {
      return await dio.put(
        'https://nehryrestapi.herokuapp.com/updatepost/${post.id}',
        options: Options(headers: {
          HttpHeaders.contentTypeHeader: "application/json",
        }),
        data: jsonEncode({
          'name': post.name,
          'description': post.description,
          'category': post.category,
          'price': post.price,
          'quantity': post.quantity,
          'farmer_id': post.farmerId,
        }),
      );
    } on DioException catch (err) {
      return err.response;
    } catch (error, stacktrace) {
      throw Exception("Exception occured: $error stackTrace: $stacktrace");
    }
  }
}
