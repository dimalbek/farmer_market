import 'package:farmer_app_2/constants/routes.dart';
import 'package:farmer_app_2/providers/cart_provider.dart';
import 'package:farmer_app_2/providers/profile_provider.dart';
import 'package:farmer_app_2/screens/login_screen.dart';
import 'package:farmer_app_2/screens/product_screen.dart';
import 'package:farmer_app_2/screens/root_screen.dart';
import 'package:farmer_app_2/screens/register_screen.dart';

import 'providers/auth_provider.dart';
import 'providers/product_provider.dart';
import 'screens/wrapper.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (_) => AuthProvider(),
        ),
        ChangeNotifierProvider(
          create: (_) => ProductProvider(),
        ),
        ChangeNotifierProvider(
          create: (_) => ProfileProvider(),
        ),
        ChangeNotifierProvider(
          create: (_) => CartProvider(),
        ),
      ],
      child: MaterialApp(
        theme: ThemeData(
          textTheme: const TextTheme(),
        ),
        home: const Wrapper(),
        routes: {
          loginRoute: (context) => const LoginScreen(),
          registerRoute: (context) => const RegisterScreen(),
          rootRoute: (context) => const RootScreen(),
        },
      ),
    );
  }
}
