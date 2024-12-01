import 'package:farmer_app_2/constants/fields.dart';
import 'package:farmer_app_2/constants/routes.dart';
import 'package:farmer_app_2/providers/profile_provider.dart';
import 'package:farmer_app_2/screens/root_screen.dart';
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

  late final dynamic _registerFormKey;
  late final dynamic _roleFormKey;

  late final TextEditingController _farmName;
  late final TextEditingController _location;
  late final TextEditingController _farmSize;

  late final TextEditingController _deliveryAddress;

  int index = 0;

  @override
  void initState() {
    _registerFormKey = GlobalKey<FormState>();
    _roleFormKey = GlobalKey<FormState>();

    _nameController = TextEditingController();
    _emailController = TextEditingController();
    _phoneNumberController = PhoneNumberEditingController();
    _passwordController = TextEditingController();
    _repeatPasswordController = TextEditingController();

    _farmName = TextEditingController();
    _location = TextEditingController();
    _farmSize = TextEditingController();

    _deliveryAddress = TextEditingController();
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

  void createFarmer(BuildContext context, String token) {
    context.read<ProfileProvider>().createFarmerProfile(
      {
        farmNameField: _farmName.text,
        locationField: _location.text,
        farmSizeField: double.tryParse(_farmSize.text) ?? 0.0,
      },
      token,
    );
  }

  void createBuyer(BuildContext context, String token) {
    context.read<ProfileProvider>().createBuyerProfile(
      {
        deliveryAddressField: _deliveryAddress.text,
      },
      token,
    );
  }

  void generalRegister(BuildContext context) async {
    try {
      bool registered = await context.read<AuthProvider>().register({
        fullnameField: _nameController.text,
        emailField: _emailController.text,
        phoneField: _phoneNumberController.value.toString(),
        passwordField: _passwordController.text,
        roleField: role,
      });
      if (registered) {
        print("Registered");
        try {
          if (context.mounted) {
            String token = await context.read<AuthProvider>().login(
                  _emailController.text,
                  _passwordController.text,
                  null,
                );
            print("Logged in");
            role == 'Farmer'
                ? createFarmer(context, token)
                : createBuyer(context, token);
            print("Role profile created");
            Navigator.of(context).pushNamedAndRemoveUntil(
              rootRoute,
              (route) => false,
            );
          }
        } catch (e) {
          failToast(e.toString());
        }
      }
    } catch (e) {
      failToast(e.toString());
    }
  }

  List<Step> steps(int index) {
    return [
      Step(
        state: index > 0 ? StepState.complete : StepState.indexed,
        isActive: index >= 0,
        title: const Text("Registration"),
        content: Padding(
          padding: const EdgeInsets.all(12.0),
          child: Form(
            key: _registerFormKey,
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
                  decoration:
                      const InputDecoration(labelText: "Repeat Password"),
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
              ],
            ),
          ),
        ),
      ),
      Step(
        state: index > 1 ? StepState.complete : StepState.indexed,
        isActive: index >= 1,
        title: Text('$role form'),
        content: Padding(
          padding: const EdgeInsets.all(12.0),
          child: Form(
            child: role == 'Farmer'
                ? FarmerForm(
                    formkey: _roleFormKey,
                    farmName: _farmName,
                    location: _location,
                    farmSize: _farmSize,
                  )
                : BuyerForm(
                    formkey: _roleFormKey,
                    deliveryAddress: _deliveryAddress,
                  ),
          ),
        ),
      ),
    ];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Registration")),
      body: Stepper(
        currentStep: index,
        onStepCancel: () {
          if (index == 0) {
            null;
          } else {
            setState(() {
              index -= 1;
            });
          }
        },
        onStepContinue: () {
          if (index == 0) {
            if (_registerFormKey.currentState!.validate()) {
              setState(() {
                index += 1;
              });
            }
          }
          if (index == 1) {
            if (_roleFormKey.currentState!.validate() &&
                _registerFormKey.currentState!.validate()) {
              print("register");
              generalRegister(context);
              // implement registration and profile
            }
          }
        },
        controlsBuilder: (context, details) {
          return Row(
            children: [
              details.currentStep == 0
                  ? Container()
                  : ElevatedButton(
                      onPressed: details.onStepCancel,
                      child: const Text("Cancel"),
                    ),
              details.currentStep == 0
                  ? Container()
                  : const SizedBox(width: 10.0),
              Expanded(
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Theme.of(context).primaryColor,
                    foregroundColor: Theme.of(context).secondaryHeaderColor,
                  ),
                  onPressed: details.onStepContinue,
                  child:
                      Text(details.currentStep == 1 ? "Register" : "Continue"),
                ),
              ),
            ],
          );
        },
        steps: steps(index),
      ),
    );
  }
}

class FarmerForm extends StatelessWidget {
  const FarmerForm({
    super.key,
    required GlobalKey<FormState> formkey,
    required this.farmName,
    required this.location,
    required this.farmSize,
  }) : _formkey = formkey;

  final GlobalKey<FormState> _formkey;
  final TextEditingController farmName;
  final TextEditingController location;
  final TextEditingController farmSize;

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formkey,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          TextFormField(
            controller: farmName,
            decoration: InputDecoration(
              labelText: 'Farm name',
              hintText: 'Enter name of farm',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(20.0),
              ),
            ),
            validator: (value) => value!.isEmpty ? "* Required" : null,
          ),
          const SizedBox(height: 20.0),
          TextFormField(
            controller: location,
            decoration: InputDecoration(
              labelText: 'Location',
              hintText: 'Enter your location',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(20.0),
              ),
            ),
            validator: (value) => value!.isEmpty ? "* Required" : null,
          ),
          const SizedBox(height: 20.0),
          TextFormField(
            controller: farmSize,
            keyboardType: TextInputType.number,
            decoration: InputDecoration(
              labelText: 'Farm Size (in acres)',
              hintText: 'Enter your farm size ',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(20.0),
              ),
            ),
            validator: (value) => value!.isEmpty ? "* Required" : null,
          ),
          const SizedBox(height: 30.0),
        ],
      ),
    );
  }
}

class BuyerForm extends StatelessWidget {
  const BuyerForm({
    super.key,
    required GlobalKey<FormState> formkey,
    required this.deliveryAddress,
  }) : _formkey = formkey;

  final GlobalKey<FormState> _formkey;
  final TextEditingController deliveryAddress;

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formkey,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          TextFormField(
            controller: deliveryAddress,
            decoration: InputDecoration(
              labelText: 'Location',
              hintText: 'Enter your delivery address',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(20.0),
              ),
            ),
            validator: (value) => value!.isEmpty ? "* Required" : null,
          ),
          const SizedBox(
            height: 30.0,
          ),
        ],
      ),
    );
  }
}
