import 'package:flutter/material.dart';
import 'package:farmer_app_2/providers/auth_provider.dart';
import 'package:farmer_app_2/providers/post_provider.dart';
import 'package:farmer_app_2/screens/add_update_screen.dart';
import 'package:farmer_app_2/widgets/post_list.dart';
import 'package:provider/provider.dart';

final _search = TextEditingController();

class HomeScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return AbsorbPointer(
      absorbing: context.read<PostProvider>().isLoading,
      child: Scaffold(
        appBar: AppBar(
          title: Row(
            children: [
              IconButton(
                icon: Icon(Icons.logout),
                onPressed: () {
                  context.read<AuthProvider>().logout();
                },
              ),
              Expanded(
                child: TextField(
                  controller: _search,
                  cursorColor: Colors.black87,
                  decoration: InputDecoration(
                      suffixIcon: IconButton(
                        icon: Icon(Icons.search),
                        onPressed: () {
                          context.read<PostProvider>().search(_search.text);
                        },
                      ),
                      hintText: 'Search',
                      contentPadding: EdgeInsets.symmetric(horizontal: 20.0),
                      filled: true,
                      fillColor: Colors.white,
                      focusColor: Colors.white,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(20.0),
                      )),
                ),
              ),
              IconButton(
                icon: Icon(Icons.refresh),
                onPressed: () {
                  context.read<PostProvider>().refresh();
                },
              ),
            ],
          ),
        ),
        body: PostList(),
        floatingActionButton: FloatingActionButton(
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => AddUpdateScreen(),
              ),
            );
          },
          child: Icon(Icons.add),
        ),
      ),
    );
  }
}
