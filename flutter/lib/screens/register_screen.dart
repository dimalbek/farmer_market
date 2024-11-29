import 'package:farmer_app_2/constants/fields.dart';
import 'package:farmer_app_2/widgets/toast_message.dart';
import 'package:flutter/material.dart';
import 'package:phonenumbers/phonenumbers.dart';
import 'package:provider/provider.dart';

import '../providers/auth_provider.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  String role = 'Buyer'; // Default role

  // Form controllers
  late final TextEditingController _nameController;
  late final TextEditingController _emailController;
  late final PhoneNumberEditingController _phoneNumberController;
  late final TextEditingController _passwordController;
  late final TextEditingController _repeatPasswordController;

  late final dynamic _formKey;
  @override
  void initState() {
    _formKey = GlobalKey<FormState>();
    _nameController = TextEditingController();
    _emailController = TextEditingController();
    _phoneNumberController = PhoneNumberEditingController();
    _passwordController = TextEditingController();
    _repeatPasswordController = TextEditingController();
    super.initState();
  }

  @override
  void dispose() {
    super.dispose();
    _nameController.dispose();
    _emailController.dispose();
    _phoneNumberController.dispose();
    _passwordController.dispose();
    _repeatPasswordController.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isLoading = context.watch<AuthProvider>().isLoading;

    return Scaffold(
      appBar: AppBar(title: const Text("Registration")),
      body: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(labelText: "Name"),
                validator: (val) => val!.isEmpty ? "Enter your name" : null,
              ),
              TextFormField(
                controller: _emailController,
                decoration: const InputDecoration(labelText: "Email"),
                validator: (val) => val!.isEmpty || !val.contains('@')
                    ? "Enter a valid email"
                    : null,
              ),
              PhoneNumberField(
                controller: _phoneNumberController,
                decoration: const InputDecoration(labelText: "Phone"),
              ),
              TextFormField(
                controller: _passwordController,
                decoration: const InputDecoration(labelText: "Password"),
                obscureText: true,
                validator: (val) => val!.length < 6
                    ? "Password must be at least 6 characters"
                    : null,
              ),
              TextFormField(
                controller: _repeatPasswordController,
                decoration: const InputDecoration(labelText: "Repeat Password"),
                obscureText: true,
                validator: (val) => val != _passwordController.text
                    ? "Passwords do not match"
                    : null,
              ),
              DropdownButtonFormField(
                decoration: const InputDecoration(labelText: "Role"),
                value: role,
                items: ['Farmer', 'Buyer'].map((r) {
                  return DropdownMenuItem(value: r, child: Text(r));
                }).toList(),
                onChanged: (val) => setState(() => role = val as String),
              ),
              AbsorbPointer(
                absorbing: isLoading,
                child: ElevatedButton(
                  onPressed: () async {
                    if (_formKey.currentState!.validate()) {
                      try {
                        context.read<AuthProvider>().register({
                          fullnameField: _nameController.text,
                          emailField: _emailController.text,
                          phoneField: _phoneNumberController.value.toString(),
                          passwordField: _passwordController.text,
                          roleField: role,
                        });
                        Navigator.of(context).pop();
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
                      : const Text('Register'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
