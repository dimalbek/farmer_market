import 'package:farmer_app_2/models/profile.dart';
import 'package:farmer_app_2/models/user.dart';
import 'package:farmer_app_2/providers/auth_provider.dart';
import 'package:farmer_app_2/providers/profile_provider.dart';
import 'package:farmer_app_2/screens/create_or_edit_role_form.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  // final currentUser = AuthProvider().getUserInfo(AuthProvider().user!.token);

  User? getUser(BuildContext context) {
    return context.read<AuthProvider>().user;
  }

  Future<FarmerProfile?> getFarmerProfile(User user) async {
    print("Getting farmer profile");
    return await context.read<ProfileProvider>().getFarmerProfile(user.token);
  }

  Future<BuyerProfile?> getBuyerProfile(User user) async {
    print("Getting buyer profile");
    return await context.read<ProfileProvider>().getBuyerProfile(user.token);
  }

  late Future<FarmerProfile?> farmerProfile;
  late Future<BuyerProfile?> buyerProfile;

  @override
  void initState() {
    super.initState();
    farmerProfile = getFarmerProfile(getUser(context)!);
    buyerProfile = getBuyerProfile(getUser(context)!);
  }

  @override
  Widget build(BuildContext context) {
    User? user = getUser(context);
    return Padding(
      padding: const EdgeInsets.all(20.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Expanded(
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(15.0),
                child: user != null
                    ? Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Profile',
                            style: TextStyle(
                              fontSize: 32,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Text(
                            'Fullname: ${user.fullname}',
                            style: const TextStyle(
                              fontSize: 16,
                            ),
                          ),
                          Text(
                            'Email: ${user.email}',
                            style: const TextStyle(
                              fontSize: 16,
                            ),
                          ),
                          Text(
                            'Phone: ${user.phone.substring(4)}',
                            style: const TextStyle(
                              fontSize: 16,
                            ),
                          ),
                          Text(
                            'Role: ${user.role}',
                            style: const TextStyle(
                              fontSize: 16,
                            ),
                          ),
                        ],
                      )
                    : Container(),
              ),
            ),
          ),
          RoleFutureBuilder(
            farmerProfile: farmerProfile,
            buyerProfile: buyerProfile,
            role: user!.role,
          ),
        ],
      ),
    );
  }
}

class RoleFutureBuilder extends StatelessWidget {
  const RoleFutureBuilder({
    super.key,
    this.farmerProfile,
    this.buyerProfile,
    required this.role,
  });

  final Future<FarmerProfile?>? farmerProfile;
  final Future<BuyerProfile?>? buyerProfile;
  final String role;

  @override
  Widget build(BuildContext context) {
    if (buyerProfile == null && farmerProfile == null) {
      return const Text("Role is not specified.");
    }
    if (role == 'Farmer') {
      return FutureBuilder(
          future: farmerProfile,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.done) {
              print(snapshot.data);
              if (snapshot.data == null) {
                return ElevatedButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => CreateOfEditRoleProfileForm(
                          selectedRole: role,
                        ),
                      ),
                    );
                  },
                  child: const Text("Create Farmer Profile"),
                );
              } else {
                return Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Expanded(
                        child: FarmerProfileCard(
                          farmName: snapshot.data!.farmName,
                          location: snapshot.data!.location,
                          farmSize: snapshot.data!.farmSize,
                        ),
                      ),
                      // API Request to update profile information not implemented yet
                    ],
                  ),
                );
              }
            } else {
              return Container(
                constraints:
                    const BoxConstraints(maxHeight: 20.0, maxWidth: 20.0),
                child: const CircularProgressIndicator(),
              );
            }
          });
    } else {
      return FutureBuilder(
          future: buyerProfile,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.done) {
              print(snapshot.data);
              if (snapshot.data == null) {
                return ElevatedButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => CreateOfEditRoleProfileForm(
                          selectedRole: role,
                        ),
                      ),
                    );
                  },
                  child: const Text("Create Buyer Profile"),
                );
              } else {
                return Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Expanded(
                        child: BuyerProfileCard(
                          deliveryAddress: snapshot.data!.deliveryAddress,
                        ),
                      ),
                      // API Request to update profile information not implemented yet
                    ],
                  ),
                );
              }
            } else {
              return Container(
                constraints:
                    const BoxConstraints(maxHeight: 20.0, maxWidth: 20.0),
                child: const CircularProgressIndicator(),
              );
            }
          });
    }
  }
}

class FarmerProfileCard extends StatelessWidget {
  final String farmName;
  final String location;
  final double farmSize;
  const FarmerProfileCard({
    super.key,
    required this.farmName,
    required this.location,
    required this.farmSize,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(15.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Farmer Profile',
              style: TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.bold,
              ),
            ),
            Text(
              'Farm name: $farmName',
              style: const TextStyle(
                fontSize: 16,
              ),
            ),
            Text(
              'Location: $location',
              style: const TextStyle(
                fontSize: 16,
              ),
            ),
            Text(
              'Farm size: $farmSize',
              style: const TextStyle(
                fontSize: 16,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class BuyerProfileCard extends StatelessWidget {
  final String deliveryAddress;
  const BuyerProfileCard({
    super.key,
    required this.deliveryAddress,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(15.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Farmer Profile',
              style: TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.bold,
              ),
            ),
            Text(
              'Farm size: $deliveryAddress',
              style: const TextStyle(
                fontSize: 16,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
