import 'package:farmer_app_2/models/cart_item.dart';
import 'package:farmer_app_2/models/user.dart';
import 'package:farmer_app_2/providers/auth_provider.dart';
import 'package:farmer_app_2/providers/cart_provider.dart';
import 'package:farmer_app_2/screens/register_screen.dart';
import 'package:farmer_app_2/widgets/toast_message.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  User? getUser(BuildContext context) {
    return context.read<AuthProvider>().user;
  }

  Future<List<CartItem>> getCart(String token) async {
    return CartProvider().getCart(token);
  }

  Future<String>? getCartTotal(BuildContext context) async {
    try {
      return CartProvider().getCartTotal(getUser(context)!.token);
    } catch (e) {
      failToast(e.toString());
      return 'Error';
    }
  }

  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Column(
          children: [
            const Text(
              "Your cart",
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 30),
            ),
            FutureBuilder(
              future: getCart(context.read<AuthProvider>().user!.token),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.done) {
                  if (snapshot.data!.isNotEmpty) {
                    return Container(
                      decoration: BoxDecoration(
                        border: Border.all(color: Colors.black12),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: ListView.builder(
                        scrollDirection: Axis.vertical,
                        shrinkWrap: true,
                        itemCount: snapshot.data?.length,
                        itemBuilder: (_, i) {
                          final item = snapshot.data![i];
                          return buildCartItem(item, context);
                        },
                      ),
                    );
                  } else {
                    return const Center(
                      child: Text('No cart items'),
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
            const ListTile(
              title: Text(
                "Cart Total:",
                style: TextStyle(fontSize: 18.0, fontWeight: FontWeight.w600),
              ),
            ),
            ListTile(
              title: const Text(
                "Total:",
              ),
              trailing: getCartTotalBuilder(context),
            ),
          ],
        ),
      ),
    );
  }

  FutureBuilder<String> getCartTotalBuilder(BuildContext context) {
    return FutureBuilder(
      future: getCartTotal(context),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.done) {
          return Text(snapshot.data ?? 'Server error');
        } else {
          return const SizedBox(
            height: 20.0,
            width: 20.0,
            child: CircularProgressIndicator(
              backgroundColor: Colors.white,
            ),
          );
        }
      },
    );
  }

  Padding buildCartItem(CartItem item, BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 2.0),
      child: ListTile(
        title: Text(item.productName),
        titleTextStyle: const TextStyle(color: Colors.black45),
        subtitle: Text('${item.quantity} × ${item.price} ₸'),
        trailing: IconButton(
          onPressed: () {
            try {
              context.read<CartProvider>().clearOrRemoveItemFromCart(
                    item.productId,
                    getUser(context)!.token,
                  );
              setState(() {});
            } catch (e) {
              failToast(e.toString());
            }
          },
          icon: const Icon(Icons.remove_shopping_cart_outlined),
        ),
      ),
    );
  }
}
