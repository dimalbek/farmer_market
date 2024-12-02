import 'package:farmer_app_2/constants/routes.dart';
import 'package:farmer_app_2/models/user.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import '../providers/auth_provider.dart';
import '../providers/product_provider.dart';
import 'add_update_product_screen.dart';
import '../widgets/product_list.dart';
import 'package:provider/provider.dart';

final _search = TextEditingController();

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  User? user;

  User? getUser(BuildContext context) {
    return context.read<AuthProvider>().user;
  }

  @override
  void initState() {
    user = getUser(context);
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return AbsorbPointer(
      absorbing: context.read<ProductProvider>().isLoading,
      child: Scaffold(
        appBar: AppBar(
          title: Row(
            children: [
              IconButton(
                icon: const Icon(Icons.logout),
                onPressed: () {
                  context.read<AuthProvider>().logout();
                  Navigator.of(context).pushNamedAndRemoveUntil(
                    loginRoute,
                    (route) => false,
                  );
                },
              ),
              Expanded(
                child: TextField(
                  controller: _search,
                  cursorColor: Colors.black87,
                  decoration: InputDecoration(
                      suffixIcon: IconButton(
                        icon: const Icon(Icons.search),
                        onPressed: () {
                          print(
                              'Products were searched: ${context.read<ProductProvider>().searched()}');
                          context.read<ProductProvider>().search(_search.text);
                        },
                      ),
                      hintText: 'Search',
                      contentPadding:
                          const EdgeInsets.symmetric(horizontal: 20.0),
                      filled: true,
                      fillColor: Colors.white,
                      focusColor: Colors.white,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(20.0),
                      )),
                ),
              ),
              IconButton(
                icon: const Icon(Icons.refresh),
                onPressed: () {
                  context.read<ProductProvider>().refresh();
                },
              ),
            ],
          ),
        ),
        body: const ProductList(),
        floatingActionButton: user?.role == 'Farmer'
            ? FloatingActionButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const AddUpdateProductScreen(),
                    ),
                  );
                },
                child: const Icon(Icons.add),
              )
            : Container(),
      ),
    );
  }
}
