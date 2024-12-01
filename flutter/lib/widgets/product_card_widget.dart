import 'package:farmer_app_2/constants/routes.dart';
import 'package:farmer_app_2/screens/product_screen.dart';

import '../models/product.dart';
import 'package:flutter/material.dart';

class ProductCardWidget extends StatelessWidget {
  final Product product;

  const ProductCardWidget({
    super.key,
    required this.product,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        Navigator.of(context).push(MaterialPageRoute(
          builder: (context) => ProductScreen(product: product),
        ));
      },
      child: Card(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(8.0),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(10.0),
                  child: Image(
                    image: getAssetImage(),
                    height: 150,
                    width: 150,
                    fit: BoxFit.cover,
                  ),
                ),
              ),
            ),
            Expanded(
              child: ProductInformation(product: product),
            )
          ],
        ),
      ),
    );
  }

  AssetImage getAssetImage() {
    // try {
    //   return AssetImage(
    //     '$images_path${(product.images[0]['image_url'].toString()).substring(8)}',
    //   );
    // } catch (_) {
    return const AssetImage('assets/alternative.jpg');
    // }
  }
}

class ProductInformation extends StatelessWidget {
  const ProductInformation({
    super.key,
    required this.product,
  });

  final Product product;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 150,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          Text(
            product.category,
            style: const TextStyle(color: Colors.black54),
          ),
          Text(
            product.name,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 20.0),
          ),
          Text(product.description),
          Text(
            '${product.price} ₸',
            style: const TextStyle(fontSize: 18.0),
          ),
        ],
      ),
    );
  }
}
