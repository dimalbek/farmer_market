import 'package:carousel_slider/carousel_slider.dart';
import 'package:farmer_app_2/models/product.dart';
import 'package:flutter/material.dart';

class ProductScreen extends StatefulWidget {
  const ProductScreen({super.key, required this.product});
  final Product product;

  @override
  State<ProductScreen> createState() => _ProductScreenState();
}

class _ProductScreenState extends State<ProductScreen> {
  late List<dynamic> images;
  @override
  void initState() {
    images = widget.product.images;
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Farmus"),
        elevation: 0.2,
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CarouselSlider(
            options: CarouselOptions(height: 300.0),
            items: images.map(
              (carouselItem) {
                return Builder(
                  builder: (context) {
                    return Container(
                      width: MediaQuery.of(context).size.width,
                      margin: const EdgeInsets.symmetric(horizontal: 5.0),
                      child: Image(
                          image: getAssetImage(carouselItem['image_url'])),
                    );
                  },
                );
              },
            ).toList(),
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(12.0),
              child: Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Container(
                      decoration: const BoxDecoration(
                        border: Border.symmetric(
                            horizontal: BorderSide(color: Colors.black12)),
                      ),
                      width: MediaQuery.of(context).size.width,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            widget.product.name,
                            style: const TextStyle(
                              fontSize: 38.0,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Text(
                            widget.product.description,
                            style: const TextStyle(fontSize: 18.0),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 10.0),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Container(
                              decoration: BoxDecoration(
                                  color: Colors.black,
                                  border: Border.all(color: Colors.black),
                                  borderRadius: BorderRadius.circular(15.0)),
                              child: Padding(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 5.0, vertical: 1.0),
                                child: Text(
                                  widget.product.category,
                                  style: const TextStyle(color: Colors.white),
                                ),
                              ),
                            ),
                            const SizedBox(width: 10.0),
                            Text('${widget.product.price} ₸'),
                          ],
                        ),
                        Text('Quantity: ${widget.product.quantity}')
                      ],
                    ),
                    const SizedBox(height: 10.0),
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.black,
                        foregroundColor: Colors.white,
                      ),
                      onPressed: () {},
                      icon: const Icon(Icons.shopping_cart),
                      label: const Text("Add to card"),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  AssetImage getAssetImage(dynamic url) {
    // url = url.toString().substring(8);
    // try {
    //   return AssetImage(
    //     '$images_path$url',
    //   );
    // } catch (_) {
    return const AssetImage('assets/alternative.jpg');
    // }
  }
}
