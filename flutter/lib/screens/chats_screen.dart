import 'package:farmer_app_2/models/chat.dart';
import 'package:farmer_app_2/models/user.dart';
import 'package:farmer_app_2/providers/auth_provider.dart';
import 'package:farmer_app_2/providers/chat_provider.dart';
import 'package:farmer_app_2/screens/chat_screen.dart';
import 'package:farmer_app_2/widgets/toast_message.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class ChatsScreen extends StatefulWidget {
  const ChatsScreen({super.key});

  @override
  State<ChatsScreen> createState() => _ChatsScreenState();
}

class _ChatsScreenState extends State<ChatsScreen> {
  User getUser() => context.read<AuthProvider>().user!;

  Future<List<Chat>?>? getChats() async {
    try {
      return await context.read<ChatProvider>().getUserChats(getUser().token);
    } catch (e) {
      failToast(e.toString());
      return null;
    }
  }

  Future<User?>? getUserByChat(Chat chat) async {
    final userId = chat.buyerId == getUser().id ? chat.farmerId : chat.buyerId;
    try {
      return await context.read<AuthProvider>().getUserById(userId);
    } catch (e) {
      failToast(e.toString());
      return null;
    }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.all(8.0),
        child: FutureBuilder(
          future: getChats(),
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.done) {
              if (snapshot.hasData && snapshot.data != null) {
                final chats = snapshot.data;
                if (chats != null && chats.isNotEmpty) {
                  return ListView.builder(
                    scrollDirection: Axis.vertical,
                    shrinkWrap: true,
                    itemCount: chats.length,
                    itemBuilder: (context, index) {
                      return buildChatListTile(chats[index]);
                    },
                  );
                } else {
                  return const Center(
                    child: Text(
                      "Your chats are empty",
                      style: TextStyle(fontSize: 18.0),
                    ),
                  );
                }
              } else {
                return const Text('Unable to load chats');
              }
            } else {
              return Center(
                child: Container(
                  constraints: const BoxConstraints(
                    maxHeight: 100.0,
                    maxWidth: 100.0,
                  ),
                  child: const CircularProgressIndicator(
                    backgroundColor: Colors.white,
                  ),
                ),
              );
            }
          },
        ),
      ),
    );
  }

  FutureBuilder<User?> buildChatListTile(Chat chat) {
    return FutureBuilder(
      future: getUserByChat(chat),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.done &&
            snapshot.hasData &&
            snapshot.data != null) {
          User user = snapshot.data!;
          return ListTile(
            shape: const Border(
              bottom: BorderSide(color: Colors.black12),
            ),
            title: Text(user.fullname),
            leading: const Icon(Icons.face_rounded),
            onTap: () {
              Navigator.of(context).push(MaterialPageRoute(
                builder: (context) => ChatScreen(
                    chatId: chat.id, fullname: snapshot.data!.fullname),
              ));
            },
          );
        } else {
          return const ListTile(
            leading: CircularProgressIndicator(),
          );
        }
      },
    );
  }
}
