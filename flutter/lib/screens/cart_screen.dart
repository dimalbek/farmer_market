import 'package:farmer_app_2/models/user.dart';
import 'package:farmer_app_2/providers/auth_provider.dart';
import 'package:farmer_app_2/providers/cart_provider.dart';
import 'package:farmer_app_2/screens/register_screen.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  late final cart;

  User? getUser(BuildContext context) {
    return context.read<AuthProvider>().user;
  }

  @override
  void initState() {
    cart = CartProvider().getCart(getUser(context)!.token);
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return const Text("Cart...");
  }
}
