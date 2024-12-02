import 'package:farmer_app_2/constants/routes.dart';
import 'package:farmer_app_2/main.dart';
import 'package:farmer_app_2/providers/auth_provider.dart';
import 'package:farmer_app_2/widgets/pinput.dart';
import 'package:farmer_app_2/widgets/toast_message.dart';
import 'package:flutter/material.dart';
import 'package:pinput/pinput.dart';
import 'package:provider/provider.dart';

class ResetScreen extends StatefulWidget {
  const ResetScreen({super.key});

  @override
  State<ResetScreen> createState() => _ResetScreenState();
}

class _ResetScreenState extends State<ResetScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  @override
  Widget build(BuildContext context) {
    final isLoading = context.watch<AuthProvider>().isLoading;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Reset Password'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Center(
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text(
                  'Enter your email:',
                  style: TextStyle(fontWeight: FontWeight.w600, fontSize: 20),
                ),
                const SizedBox(height: 10),
                TextFormField(
                  controller: _emailController,
                  decoration: const InputDecoration(labelText: "Email"),
                  validator: (val) => val!.isEmpty || !val.contains('@')
                      ? "Enter a valid email"
                      : null,
                ),
                const SizedBox(height: 10),
                TextFormField(
                  controller: _passwordController,
                  decoration: const InputDecoration(labelText: "New password"),
                  obscureText: true,
                  validator: (val) => val!.length < 6
                      ? "Password must be at least 6 characters"
                      : null,
                ),
                const SizedBox(height: 10),
                AbsorbPointer(
                  absorbing: isLoading,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Theme.of(context).colorScheme.primary,
                      foregroundColor:
                          Theme.of(context).colorScheme.primaryContainer,
                    ),
                    onPressed: () async {
                      if (_formKey.currentState!.validate()) {
                        try {
                          final res = await context
                              .read<AuthProvider>()
                              .initiatePasswordReset(
                                _emailController.text,
                              );
                          successToast(res);
                          Navigator.of(context).push(MaterialPageRoute(
                            builder: (context) => CodeConfirmation(
                              email: _emailController.text,
                              newPass: _passwordController.text,
                            ),
                          ));
                        } catch (e) {
                          failToast(e.toString());
                        }
                      }
                    },
                    child: isLoading
                        ? Container(
                            constraints: const BoxConstraints(
                                maxHeight: 20.0, maxWidth: 20.0),
                            child: const CircularProgressIndicator(
                              backgroundColor: Colors.white,
                            ),
                          )
                        : const Text('Send code'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class CodeConfirmation extends StatefulWidget {
  const CodeConfirmation({
    super.key,
    required this.email,
    required this.newPass,
  });
  final String email;
  final String newPass;

  @override
  State<CodeConfirmation> createState() => _CodeConfirmationState();
}

class _CodeConfirmationState extends State<CodeConfirmation> {
  final _pinController = TextEditingController();
  final pinFocusNode = FocusNode();
  final formKey = GlobalKey<FormState>();
  @override
  Widget build(BuildContext context) {
    final isLoading = context.watch<AuthProvider>().isLoading;
    return Scaffold(
      appBar: AppBar(
        title: const Text('Code confirmation'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Form(
                key: formKey,
                child: Pinput(
                  length: 6,
                  controller: _pinController,
                  focusNode: pinFocusNode,
                  defaultPinTheme: defaultPinTheme,
                  separatorBuilder: (index) => const SizedBox(width: 16),
                  focusedPinTheme: focusPinTheme,
                  showCursor: true,
                  cursor: cursor,
                  onSubmitted: (value) async {
                    if (formKey.currentState!.validate()) {
                      await submit(context);
                    }
                  },
                ),
              ),
              AbsorbPointer(
                absorbing: isLoading,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Theme.of(context).colorScheme.primary,
                    foregroundColor:
                        Theme.of(context).colorScheme.primaryContainer,
                  ),
                  onPressed: () => submit(context),
                  child: isLoading
                      ? Container(
                          constraints: const BoxConstraints(
                              maxHeight: 20.0, maxWidth: 20.0),
                          child: const CircularProgressIndicator(
                            backgroundColor: Colors.white,
                          ),
                        )
                      : const Text('Reset'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> submit(BuildContext context) async {
    try {
      final res = await context.read<AuthProvider>().confirmPasswordReset(
            widget.email,
            _pinController.text,
            widget.newPass,
          );
      successToast(res);
      // ignore: use_build_context_synchronously
      Navigator.of(context).pushNamedAndRemoveUntil(
        loginRoute,
        (route) => false,
      );
    } catch (e) {
      failToast(e.toString());
    }
  }
}
