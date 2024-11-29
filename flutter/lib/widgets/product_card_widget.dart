import 'package:expandable/expandable.dart';
import '../models/product.dart';
import '../providers/auth_provider.dart';
import '../providers/product_provider.dart';
import '../screens/add_update_product_screen.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class ProductCardWidget extends StatelessWidget {
  final Product product;

  const ProductCardWidget({
    super.key,
    required this.product,
  });

  @override
  Widget build(BuildContext context) {
    final userId = context.read<AuthProvider>().user!.id;
    print(product.images[0].toString());
    // return Card(
    //   child: Row(
    //     children: [
    //       Container(
    //         child: Text(product.images[0].toString()),
    //       )
    //     ],
    //   ),
    // );
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: ExpandablePanel(
          header: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                product.name,
                style: const TextStyle(
                    fontSize: 18.0, fontWeight: FontWeight.w400),
              ),
              const SizedBox(
                height: 5.0,
              ),
            ],
          ),
          collapsed: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                product.description,
                textAlign: TextAlign.left,
                style: const TextStyle(height: 1.5),
                softWrap: true,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(
                height: 10.0,
              ),
              userId == product.farmerId
                  ? Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        IconButton(
                          constraints: const BoxConstraints(
                            maxHeight: 20.0,
                            maxWidth: 20.0,
                          ),
                          padding: EdgeInsets.zero,
                          icon: Icon(
                            Icons.delete,
                            color: Colors.red[400],
                          ),
                          onPressed: () async {
                            await context
                                .read<ProductProvider>()
                                .deletePost(product.id);
                          },
                        ),
                        const SizedBox(
                          width: 10.0,
                        ),
                        IconButton(
                          constraints: const BoxConstraints(
                            maxHeight: 20.0,
                            maxWidth: 20.0,
                          ),
                          padding: EdgeInsets.zero,
                          icon: Icon(
                            Icons.edit,
                            color: Colors.blue[400],
                          ),
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) =>
                                    AddUpdateProductScreen(product: product),
                              ),
                            );
                          },
                        ),
                        const SizedBox(
                          width: 10.0,
                        ),
                      ],
                    )
                  : Container(),
            ],
          ),
          expanded: Column(
            children: [
              Text(
                product.description,
                style: const TextStyle(height: 1.5),
                textAlign: TextAlign.left,
                softWrap: true,
              ),
              const SizedBox(
                height: 10.0,
              ),
              userId == product.farmerUserId
                  ? Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        IconButton(
                          constraints: const BoxConstraints(
                            maxHeight: 20.0,
                            maxWidth: 20.0,
                          ),
                          padding: EdgeInsets.zero,
                          icon: Icon(
                            Icons.delete,
                            color: Colors.red[400],
                          ),
                          onPressed: () {},
                        ),
                        const SizedBox(
                          width: 10.0,
                        ),
                        IconButton(
                          constraints: const BoxConstraints(
                            maxHeight: 20.0,
                            maxWidth: 20.0,
                          ),
                          padding: EdgeInsets.zero,
                          icon: Icon(
                            Icons.edit,
                            color: Colors.blue[400],
                          ),
                          onPressed: () {
                            if (kDebugMode) {
                              print('ayaw');
                            }
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) =>
                                    AddUpdateProductScreen(product: product),
                              ),
                            );
                          },
                        ),
                        const SizedBox(
                          width: 10.0,
                        ),
                      ],
                    )
                  : Container(),
            ],
          ),
        ),
      ),
    );
  }
}
