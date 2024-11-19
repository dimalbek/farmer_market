import 'package:expandable/expandable.dart';
import 'package:farmer_app_2/models/post.dart';
import 'package:farmer_app_2/providers/auth_provider.dart';
import 'package:farmer_app_2/providers/post_provider.dart';
import 'package:farmer_app_2/screens/add_update_screen.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

class PostCardWidget extends StatelessWidget {
  final Post post;

  const PostCardWidget({
    super.key,
    required this.post,
  });

  @override
  Widget build(BuildContext context) {
    final username = context.read<AuthProvider>().user!.name;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: ExpandablePanel(
          header: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                post.title,
                style: const TextStyle(
                    fontSize: 18.0, fontWeight: FontWeight.w400),
              ),
              Text(
                DateFormat.yMMMMEEEEd().format(DateTime.parse(post.createdAt)),
                style: const TextStyle(
                    fontSize: 12.0, fontWeight: FontWeight.w300),
              ),
              Text(
                'By : ${post.author}',
                style: const TextStyle(
                    fontSize: 12.0, fontWeight: FontWeight.w300),
              ),
              const SizedBox(
                height: 5.0,
              ),
            ],
          ),
          collapsed: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                post.body,
                textAlign: TextAlign.left,
                style: const TextStyle(height: 1.5),
                softWrap: true,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(
                height: 10.0,
              ),
              username == post.author
                  ? Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        IconButton(
                          constraints: const BoxConstraints(
                            maxHeight: 20.0,
                            maxWidth: 20.0,
                          ),
                          padding: EdgeInsets.zero,
                          icon: Icon(
                            Icons.delete,
                            color: Colors.red[400],
                          ),
                          onPressed: () async {
                            await context
                                .read<PostProvider>()
                                .deletePost(post.id);
                          },
                        ),
                        const SizedBox(
                          width: 10.0,
                        ),
                        IconButton(
                          constraints: const BoxConstraints(
                            maxHeight: 20.0,
                            maxWidth: 20.0,
                          ),
                          padding: EdgeInsets.zero,
                          icon: Icon(
                            Icons.edit,
                            color: Colors.blue[400],
                          ),
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) =>
                                    AddUpdateScreen(post: post),
                              ),
                            );
                          },
                        ),
                        const SizedBox(
                          width: 10.0,
                        ),
                      ],
                    )
                  : Container(),
            ],
          ),
          expanded: Column(
            children: [
              Text(
                post.body,
                style: const TextStyle(height: 1.5),
                textAlign: TextAlign.left,
                softWrap: true,
              ),
              const SizedBox(
                height: 10.0,
              ),
              username == post.author
                  ? Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        IconButton(
                          constraints: const BoxConstraints(
                            maxHeight: 20.0,
                            maxWidth: 20.0,
                          ),
                          padding: EdgeInsets.zero,
                          icon: Icon(
                            Icons.delete,
                            color: Colors.red[400],
                          ),
                          onPressed: () {},
                        ),
                        const SizedBox(
                          width: 10.0,
                        ),
                        IconButton(
                          constraints: const BoxConstraints(
                            maxHeight: 20.0,
                            maxWidth: 20.0,
                          ),
                          padding: EdgeInsets.zero,
                          icon: Icon(
                            Icons.edit,
                            color: Colors.blue[400],
                          ),
                          onPressed: () {
                            if (kDebugMode) {
                              print('ayaw');
                            }
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) =>
                                    AddUpdateScreen(post: post),
                              ),
                            );
                          },
                        ),
                        const SizedBox(
                          width: 10.0,
                        ),
                      ],
                    )
                  : Container(),
            ],
          ),
        ),
      ),
    );
  }
}
