import 'package:farmer_app_2/constants/fields.dart';
import 'package:farmer_app_2/models/profile.dart';
import 'package:farmer_app_2/providers/auth_provider.dart';
import 'package:farmer_app_2/providers/profile_provider.dart';
import 'package:farmer_app_2/screens/root_screen.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class CreateOfEditRoleProfileForm extends StatefulWidget {
  final FarmerProfile? farmerProfile;
  final BuyerProfile? buyerProfile;
  final String selectedRole;
  const CreateOfEditRoleProfileForm({
    super.key,
    this.farmerProfile,
    this.buyerProfile,
    required this.selectedRole,
  });

  @override
  State<CreateOfEditRoleProfileForm> createState() =>
      _CreateOfEditRoleProfileFormState();
}

class _CreateOfEditRoleProfileFormState
    extends State<CreateOfEditRoleProfileForm> {
  late final TextEditingController farmName;
  late final TextEditingController location;
  late final TextEditingController farmSize;
  late final TextEditingController deliveryAddress;
  final _formkey = GlobalKey<FormState>();

  @override
  void initState() {
    farmName = TextEditingController();
    location = TextEditingController();
    farmSize = TextEditingController();
    deliveryAddress = TextEditingController();
    if (widget.farmerProfile != null) {
      farmName.text = widget.farmerProfile!.farmName;
      location.text = widget.farmerProfile!.location;
      farmSize.text = widget.farmerProfile!.farmSize.toString();
    }
    if (widget.buyerProfile != null) {
      deliveryAddress.text = widget.buyerProfile!.deliveryAddress;
    }
    super.initState();
  }

  @override
  void dispose() {
    farmName.dispose();
    location.dispose();
    farmSize.dispose();
    deliveryAddress.dispose();
    super.dispose();
  }

  String get appBarTitle {
    if (widget.selectedRole == 'Buyer') {
      if (widget.buyerProfile == null) {
        return "Creating Buyer Profile";
      } else {
        return "Edit Buyer Profile";
      }
    } else if (widget.selectedRole == 'Farmer') {
      if (widget.farmerProfile == null) {
        return "Creating Farmer Profile";
      } else {
        return "Edit Farmer Profile";
      }
    } else {
      return 'No role selected';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(appBarTitle),
      ),
      body: Padding(
        padding: const EdgeInsets.all(8.0),
        child: widget.selectedRole == 'Farmer'
            ? FarmerForm(
                formkey: _formkey,
                farmName: farmName,
                location: location,
                farmSize: farmSize,
                widget: widget,
              )
            : BuyerForm(
                formkey: _formkey,
                deliveryAddress: deliveryAddress,
                widget: widget,
              ),
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
    required this.widget,
  }) : _formkey = formkey;

  final GlobalKey<FormState> _formkey;
  final TextEditingController farmName;
  final TextEditingController location;
  final TextEditingController farmSize;
  final CreateOfEditRoleProfileForm widget;

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
          const SizedBox(
            height: 20.0,
          ),
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
          const SizedBox(
            height: 20.0,
          ),
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
          const SizedBox(
            height: 30.0,
          ),
          widget.farmerProfile == null
              ? Row(
                  children: [
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () {
                          if (_formkey.currentState!.validate()) {
                            context.read<ProfileProvider>().createFarmerProfile(
                              {
                                farmNameField: farmName.text,
                                locationField: location.text,
                                farmSizeField:
                                    double.tryParse(farmSize.text) ?? 0.0,
                              },
                              context.read<AuthProvider>().user!.token,
                            );
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => const RootScreen(
                                  selectedIndex: 0,
                                ),
                              ),
                            );
                          }
                        },
                        child: const Text("Create Profile"),
                      ),
                    ),
                    ElevatedButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => const RootScreen(
                              selectedIndex: 0,
                            ),
                          ),
                        );
                      },
                      child: const Text("Cancel"),
                    ),
                  ],
                )
              : ElevatedButton(
                  onPressed: () {
                    // -----------API request to edit profile not implemented yet ----------------------
                  },
                  child: const Text("Edit Profile"),
                ),
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
    required this.widget,
  }) : _formkey = formkey;

  final GlobalKey<FormState> _formkey;
  final TextEditingController deliveryAddress;
  final CreateOfEditRoleProfileForm widget;

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
          widget.buyerProfile == null
              ? Row(
                  children: [
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () {
                          if (_formkey.currentState!.validate()) {
                            context.read<ProfileProvider>().createBuyerProfile(
                              {
                                deliveryAddressField: deliveryAddress.text,
                              },
                              context.read<AuthProvider>().user!.token,
                            );
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => const RootScreen(
                                  selectedIndex: 0,
                                ),
                              ),
                            );
                          }
                        },
                        child: const Text("Create Profile"),
                      ),
                    ),
                    ElevatedButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => const RootScreen(
                              selectedIndex: 0,
                            ),
                          ),
                        );
                      },
                      child: const Text("Cancel"),
                    ),
                  ],
                )
              : ElevatedButton(
                  onPressed: () {
                    // -----------API request to edit profile not implemented yet ----------------------
                  },
                  child: const Text("Edit Profile"),
                ),
        ],
      ),
    );
  }
}
