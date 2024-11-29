import 'package:flutter/material.dart';

class MyNavBar extends StatefulWidget {
  const MyNavBar({super.key});

  @override
  State<MyNavBar> createState() => MyNavBarState();
}

class MyNavBarState extends State<MyNavBar> {
  int selectedIndex = 1;

  @override
  void initState() {
    selectedIndex = 1;
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return NavigationBar(
      labelBehavior: NavigationDestinationLabelBehavior.alwaysHide,
      destinations: const [
        NavigationDestination(
          icon: Icon(Icons.person_outline),
          selectedIcon: Icon(Icons.person),
          label: 'Settings',
        ),
        NavigationDestination(
          icon: Icon(Icons.home_outlined),
          selectedIcon: Icon(Icons.home),
          label: 'Home',
        ),
        NavigationDestination(
          icon: Icon(Icons.message_outlined),
          selectedIcon: Icon(Icons.message),
          label: 'Massages',
        ),
      ],
      selectedIndex: selectedIndex,
      onDestinationSelected: (value) => setState(() {
        selectedIndex = value;
      }),
    );
  }
}
