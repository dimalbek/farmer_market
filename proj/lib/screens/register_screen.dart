import 'package:flutter/material.dart';
import 'package:phonenumbers/phonenumbers.dart';
import 'package:provider/provider.dart';

import '../providers/auth_provider.dart';

class RegisterScreen extends StatefulWidget {
  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  int _currentStep = 0; // Controls the step in the Stepper
  String role = 'Buyer'; // Default role

  // Form controllers
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final PhoneNumberEditingController _phoneNumberController =
      PhoneNumberEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _repeatPasswordController =
      TextEditingController();
  final TextEditingController _farmNameController = TextEditingController();
  final TextEditingController _locationController = TextEditingController();
  final TextEditingController _farmSizeController = TextEditingController();
  final TextEditingController _deliveryAddressController =
      TextEditingController();

  final _formKeys = [
    GlobalKey<FormState>(), // For Step 0
    GlobalKey<FormState>(), // For Step 1 (Farmer or Buyer)
  ];

  Future<void> _submit() async {
    if (!_formKeys[_currentStep].currentState!.validate()) {
      return; // Prevent submission if the last step is invalid
    }

    final data1 = {
      'fullname': _nameController.text,
      'email': _emailController.text,
      'phone': _phoneNumberController.value.toString(),
      'password': _passwordController.text,
      "role": role,
    };
    final data2 = {
      if (role == 'Farmer') ...{
        'farm_name': _farmNameController.text,
        'location': _locationController.text,
        'farm_size': int.parse(_farmSizeController.text),
      },
      if (role == 'Buyer') 'delivery_address': _deliveryAddressController.text,
    };

    final authProvider = context.read<AuthProvider>();
    if (role == 'Farmer') {
      await authProvider.registerFarmer(data1, data2);
    } else {
      await authProvider.registerBuyer(data1, data2);
    }
  }

  void _nextStep() {
    if (_formKeys[_currentStep].currentState!.validate()) {
      setState(() {
        if (_currentStep < _formKeys.length - 1) {
          _currentStep++;
        } else {
          _submit();
        }
      });
    }
  }

  void _previousStep() {
    setState(() {
      if (_currentStep > 0) {
        _currentStep--;
      }
    });
  }

  List<Step> _buildSteps() {
    return [
      Step(
        title: Text("Personal Details"),
        content: Form(
          key: _formKeys[0],
          child: Column(
            children: [
              TextFormField(
                controller: _nameController,
                decoration: InputDecoration(labelText: "Name"),
                validator: (val) => val!.isEmpty ? "Enter your name" : null,
              ),
              TextFormField(
                controller: _emailController,
                decoration: InputDecoration(labelText: "Email"),
                validator: (val) => val!.isEmpty || !val.contains('@')
                    ? "Enter a valid email"
                    : null,
              ),
              PhoneNumberField(
                controller: _phoneNumberController,
                decoration: InputDecoration(labelText: "Phone"),
              ),
              TextFormField(
                controller: _passwordController,
                decoration: InputDecoration(labelText: "Password"),
                obscureText: true,
                validator: (val) => val!.length < 6
                    ? "Password must be at least 6 characters"
                    : null,
              ),
              TextFormField(
                controller: _repeatPasswordController,
                decoration: InputDecoration(labelText: "Repeat Password"),
                obscureText: true,
                validator: (val) => val != _passwordController.text
                    ? "Passwords do not match"
                    : null,
              ),
              DropdownButtonFormField(
                decoration: InputDecoration(labelText: "Role"),
                value: role,
                items: ['Farmer', 'Buyer'].map((r) {
                  return DropdownMenuItem(value: r, child: Text(r));
                }).toList(),
                onChanged: (val) => setState(() => role = val as String),
              ),
            ],
          ),
        ),
        isActive: _currentStep >= 0,
      ),
      Step(
        title: Text(role == 'Farmer' ? "Farmer Details" : "Buyer Details"),
        content: Form(
          key: _formKeys[1],
          child: role == 'Farmer'
              ? Column(
                  children: [
                    TextFormField(
                      controller: _farmNameController,
                      decoration: InputDecoration(labelText: "Farm Name"),
                      validator: (val) =>
                          val!.isEmpty ? "Enter farm name" : null,
                    ),
                    TextFormField(
                      controller: _locationController,
                      decoration: InputDecoration(labelText: "Location"),
                      validator: (val) =>
                          val!.isEmpty ? "Enter farm location" : null,
                    ),
                    TextFormField(
                      controller: _farmSizeController,
                      decoration:
                          InputDecoration(labelText: "Farm Size (acres)"),
                      keyboardType: TextInputType.number,
                      validator: (val) =>
                          val!.isEmpty ? "Enter farm size" : null,
                    ),
                  ],
                )
              : Column(
                  children: [
                    TextFormField(
                      controller: _deliveryAddressController,
                      decoration:
                          InputDecoration(labelText: "Delivery Address"),
                      validator: (val) =>
                          val!.isEmpty ? "Enter delivery address" : null,
                    ),
                  ],
                ),
        ),
        isActive: _currentStep >= 1,
      ),
    ];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Registration")),
      body: Stepper(
        currentStep: _currentStep,
        onStepContinue: _nextStep,
        onStepCancel: _previousStep,
        steps: _buildSteps(),
      ),
    );
  }
}
