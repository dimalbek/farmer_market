import 'package:farmer_app_2/models/cart_item.dart';
import 'package:farmer_app_2/models/user.dart';
import 'package:farmer_app_2/providers/auth_provider.dart';
import 'package:farmer_app_2/providers/cart_provider.dart';
import 'package:farmer_app_2/screens/register_screen.dart';
import 'package:farmer_app_2/widgets/toast_message.dart';
import 'package:flutter/material.dart';
import 'package:input_quantity/input_quantity.dart';
import 'package:provider/provider.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

enum DeliveryOption {
  pickup(0),
  delivery(1000);

  const DeliveryOption(this.cost);
  final double cost;
}

enum PaymentOption { cash, card }

class _CartScreenState extends State<CartScreen> {
  DeliveryOption? _deliveryOption = DeliveryOption.pickup;
  PaymentOption? _paymentOption = PaymentOption.cash;

  bool quantityChanged = false;

  User? getUser(BuildContext context) {
    return context.read<AuthProvider>().user;
  }

  Future<List<CartItem>> getCart(String token) async {
    return CartProvider().getCart(token);
  }

  Future<String>? getCartTotal(BuildContext context) async {
    try {
      final res = await CartProvider().getCartTotal(getUser(context)!.token);
      return res.toString();
    } catch (e) {
      print(e.toString());
      failToast(e.toString());
      return 'Error';
    }
  }

  Future<double> totalCost(BuildContext context) async {
    print('In totalCost=========================');
    final cartTotal = await getCartTotal(context);
    print('cartTotal: $cartTotal');
    double cart = (double.parse(cartTotal ?? '0'));
    print('\n\nCart cost: $cart');
    return _deliveryOption!.cost + cart;
  }

  Future<void> updateCartItem(
    BuildContext context,
    String productId,
    int quantity,
  ) async {
    try {
      await context.read<CartProvider>().updateCartItem(
            productId,
            quantity,
            getUser(context)!.token,
          );
    } catch (e) {
      failToast(e.toString());
    }
  }

  @override
  void initState() {
    quantityChanged = false;
    super.initState();
  }

  @override
  void dispose() {
    if (quantityChanged) {
      // implement updating items
    }
    super.dispose();
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
            cartList(context),
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
            const Divider(),
            const ListTile(
              title: Text(
                "Delivery option:",
                style: TextStyle(fontSize: 18.0, fontWeight: FontWeight.w600),
              ),
            ),
            radioOptionsDeliveryRow(),
            const Divider(),
            const ListTile(
              title: Text(
                "Payment option:",
                style: TextStyle(fontSize: 18.0, fontWeight: FontWeight.w600),
              ),
            ),
            radioOptionsPaymentRow(),
            const Divider(),
            ListTile(
              title: const Text("Delivery cost:"),
              trailing: Text('${_deliveryOption!.cost.toString()} ₸'),
            ),
            ListTile(
              title: const Text(
                "Total amount:",
                style: TextStyle(fontWeight: FontWeight.w600),
              ),
              trailing: FutureBuilder(
                future: totalCost(context),
                builder: (context, snapshot) {
                  final cost = snapshot.data ?? 0;
                  return Text('${cost.toString()} ₸');
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  FutureBuilder<List<CartItem>> cartList(BuildContext context) {
    return FutureBuilder(
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
    );
  }

  Row radioOptionsDeliveryRow() {
    return Row(
      children: [
        Expanded(
          child: Row(
            children: [
              Radio<DeliveryOption>(
                value: DeliveryOption.pickup,
                groupValue: _deliveryOption,
                onChanged: (DeliveryOption? value) {
                  setState(
                    () {
                      _deliveryOption = value;
                    },
                  );
                },
              ),
              const Text('Pickup (0 ₸)'),
            ],
          ),
        ),
        Expanded(
          child: Row(
            children: [
              Radio<DeliveryOption>(
                value: DeliveryOption.delivery,
                groupValue: _deliveryOption,
                onChanged: (DeliveryOption? value) {
                  setState(
                    () {
                      _deliveryOption = value;
                    },
                  );
                },
              ),
              const Text('Delivery (1000 ₸)'),
            ],
          ),
        ),
      ],
    );
  }

  Row radioOptionsPaymentRow() {
    return Row(
      children: [
        Expanded(
          child: Row(
            children: [
              Radio<PaymentOption>(
                value: PaymentOption.cash,
                groupValue: _paymentOption,
                onChanged: (PaymentOption? value) {
                  setState(
                    () {
                      _paymentOption = value;
                    },
                  );
                },
              ),
              const Text('Cash'),
            ],
          ),
        ),
        Expanded(
          child: Row(
            children: [
              Radio<PaymentOption>(
                value: PaymentOption.card,
                groupValue: _paymentOption,
                onChanged: (PaymentOption? value) {
                  setState(
                    () {
                      _paymentOption = value;
                    },
                  );
                },
              ),
              const Text('Card'),
            ],
          ),
        ),
      ],
    );
  }

  FutureBuilder<String> getCartTotalBuilder(BuildContext context) {
    return FutureBuilder(
      future: getCartTotal(context),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.done) {
          if (snapshot.data != null) {
            return Text('${snapshot.data!} ₸',
                style: const TextStyle(fontSize: 14.0));
          } else {
            return const Text('Server error', style: TextStyle(fontSize: 14.0));
          }
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
      padding: const EdgeInsets.only(right: 2.0, left: 2.0, bottom: 20.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ListTile(
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
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 15.0, vertical: 0),
            child: InputQty.int(
              maxVal: 100,
              initVal: item.quantity,
              minVal: 1,
              steps: 1,
              onQtyChanged: (val) {
                setState(() {});
                updateCartItem(context, item.productId, val);
              },
            ),
          ),
        ],
      ),
    );
  }
}
