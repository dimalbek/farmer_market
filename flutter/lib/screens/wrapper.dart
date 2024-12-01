import 'package:farmer_app_2/screens/root_screen.dart';

import '../models/user.dart';
import '../providers/auth_provider.dart';
import 'login_screen.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class Wrapper extends StatelessWidget {
  const Wrapper({super.key});

  @override
  Widget build(BuildContext context) {
    Future<User?>? user = context.watch<AuthProvider>().futureUser;

    return FutureBuilder<User?>(
        future: user,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Scaffold(
                body: Center(
              child: CircularProgressIndicator(),
            ));
          } else {
            if (snapshot.hasData) {
              return const RootScreen();
            } else {
              return const LoginScreen();
            }
          }
        });
  }
}
