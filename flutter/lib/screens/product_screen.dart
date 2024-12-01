import 'package:carousel_slider/carousel_slider.dart';
import 'package:farmer_app_2/models/product.dart';
import 'package:farmer_app_2/models/user.dart';
import 'package:farmer_app_2/providers/auth_provider.dart';
import 'package:farmer_app_2/providers/cart_provider.dart';
import 'package:farmer_app_2/screens/register_screen.dart';
import 'package:farmer_app_2/widgets/toast_message.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class ProductScreen extends StatefulWidget {
  const ProductScreen({super.key, required this.product});
  final Product product;

  @override
  State<ProductScreen> createState() => _ProductScreenState();
}

class _ProductScreenState extends State<ProductScreen> {
  late TextEditingController selectedQuantity;

  User getUser(BuildContext context) {
    return context.read<AuthProvider>().user!;
  }

  late List<dynamic> images;
  @override
  void initState() {
    selectedQuantity = TextEditingController();
    images = widget.product.images;
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    final isLoading = context.watch<CartProvider>().isLoading;
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
                  AbsorbPointer(
                    absorbing: isLoading,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.black,
                        foregroundColor: Colors.white,
                      ),
                      onPressed: () {
                        try {
                          context.read<CartProvider>().addToCart(
                                widget.product.id,
                                1,
                                getUser(context).token,
                              );
                        } catch (e) {
                          print("caught error");
                          failToast(e.toString());
                        }
                      },
                      icon: const Icon(Icons.shopping_cart),
                      label: !isLoading
                          ? const Text("Add to card")
                          : Container(
                              constraints: const BoxConstraints(
                                  maxHeight: 20.0, maxWidth: 20.0),
                              child: const CircularProgressIndicator(
                                backgroundColor: Colors.white,
                              ),
                            ),
                    ),
                  ),
                ],
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
