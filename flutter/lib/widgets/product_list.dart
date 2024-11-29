import 'package:flutter/material.dart';
import '../models/product.dart';
import '../providers/product_provider.dart';
import 'product_card_widget.dart';
import 'package:provider/provider.dart';

class ProductList extends StatelessWidget {
  const ProductList({super.key});

  Future<void> printAllPosts() async {
    try {
      print(await ProductProvider().getAllProducts());
    } catch (e) {
      print(
          "Error occured during getting all products\nError: ${e.toString()}");
    }
    ;
  }

  @override
  Widget build(BuildContext context) {
    // printAllPosts();
    return Padding(
      padding: const EdgeInsets.all(20.0),
      child: FutureBuilder<List<Product>>(
        future: context.watch<ProductProvider>().searchKey.isEmpty
            ? context.watch<ProductProvider>().getAllProducts()
            : context.watch<ProductProvider>().searchPost(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.done) {
            if (snapshot.data!.isNotEmpty) {
              return ListView.builder(
                itemCount: snapshot.data?.length,
                itemBuilder: (_, i) => ProductCardWidget(
                  product: snapshot.data![i],
                ),
              );
            } else {
              return const Center(
                child: Text('No data retreive'),
              );
            }
          } else {
            return Center(
              child: Container(
                constraints:
                    const BoxConstraints(maxHeight: 20.0, maxWidth: 20.0),
                child: const CircularProgressIndicator(
                  backgroundColor: Colors.white,
                ),
              ),
            );
          }
        },
      ),
    );
  }
}
