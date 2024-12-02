import 'dart:io';

import 'package:farmer_app_2/constants/c_urls.dart';
import 'package:farmer_app_2/models/chat.dart';
import 'package:farmer_app_2/models/user.dart';
import 'package:farmer_app_2/providers/auth_provider.dart';
import 'package:farmer_app_2/providers/chat_provider.dart';
import 'package:farmer_app_2/widgets/toast_message.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:web_socket_channel/io.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

class ChatScreen extends StatefulWidget {
  const ChatScreen({
    super.key,
    required this.chatId,
    required this.fullname,
  });
  final String chatId;
  final String fullname;

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  late final WebSocketChannel channel;

  Future<Chat?> getChat(String token, String chatId) async {
    try {
      return await context.read<ChatProvider>().getChat(token, chatId);
    } catch (e) {
      failToast(e.toString());
      return null;
    }
  }

  @override
  void initState() {
    User user = context.read<AuthProvider>().user!;
    print('============================================================');
    print(
        '${CUrls.baseWSUrl}/chats/ws/chat/${widget.chatId}?token=${user.token}');
    channel = IOWebSocketChannel.connect(Uri.parse(
        '${CUrls.baseWSUrl}/chats/ws/chat/${widget.chatId}?token=${user.token}'));
    super.initState();
  }

  Future<void> testWS() async {
    try {
      await channel.ready;
    } on SocketException catch (e) {
      print('=====================\n${e.toString()}\n=============');
      // Handle the exception.
    } on WebSocketChannelException catch (e) {
      print('=====================\n${e.toString()}\n=============');
      // Handle the exception.
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.fullname),
      ),
      body: Container(
        color: const Color.fromARGB(10, 0, 0, 0),
        child: Column(
          children: [
            // Expanded(child: messagesBuilder(user)),
            FutureBuilder(
              future: testWS(),
              builder: (context, snapshot) {
                return Text(snapshot.hasData ? 'Yes data' : 'No data');
              },
            ),
            // StreamBuilder(
            //   stream: channel.stream,
            //   builder: (context, snapshot) {
            //     return Text(snapshot.hasData ? snapshot.data : '');
            //   },
            // ),
            Material(
              elevation: 10,
              child: Padding(
                padding: const EdgeInsets.all(8.0),
                child: TextField(
                  decoration: const InputDecoration(
                    contentPadding: EdgeInsets.only(top: 12, left: 20),
                    border: InputBorder.none,
                    hintText: 'Message',
                    suffixIcon: Icon(Icons.send),
                  ),
                  onSubmitted: (text) => _sendMessage(text),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _sendMessage(String text) {
    if (text.isNotEmpty) {
      channel.sink.add(text);
    }
  }

  FutureBuilder<Chat?> _messagesBuilder(User user) {
    return FutureBuilder(
      future: getChat(user.token, widget.chatId),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.done &&
            snapshot.hasData) {
          if (snapshot.data != null && snapshot.data!.messages != null) {
            final messages = snapshot.data!.messages;
            return ListView.builder(
              scrollDirection: Axis.vertical,
              shrinkWrap: true,
              itemCount: messages!.length,
              itemBuilder: (context, index) {
                final message = messages[index];
                return ListTile(
                  title: Text(message.content),
                );
              },
            );
          } else {
            return const Center(child: Text('Send a message'));
          }
        } else {
          return const Center(
            child: SizedBox(
              height: 20,
              width: 20,
              child: CircularProgressIndicator(),
            ),
          );
        }
      },
    );
  }

  @override
  void dispose() {
    channel.sink.close();
    super.dispose();
  }
}
