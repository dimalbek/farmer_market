import 'package:farmer_app_2/constants/fields.dart';
import 'package:farmer_app_2/constants/routes.dart';
import 'package:farmer_app_2/providers/auth_provider.dart';
import 'package:farmer_app_2/widgets/toast_message.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import '../models/product.dart';
import '../providers/product_provider.dart';

class AddUpdateProductScreen extends StatefulWidget {
  final Product? product;
  const AddUpdateProductScreen({
    super.key,
    this.product,
  });

  @override
  State<AddUpdateProductScreen> createState() => _AddUpdateProductScreenState();
}

class _AddUpdateProductScreenState extends State<AddUpdateProductScreen> {
  late final dynamic formKey;
  late final name = TextEditingController();
  late final quantity = TextEditingController();
  late final category = TextEditingController();
  String? selectedCategory;
  late final description = TextEditingController();
  late final price = TextEditingController();

  final ImagePicker imagePicker = ImagePicker();
  List<XFile> imageFileList = [];

  void selectImages() async {
    final List<XFile> selectedImages = await imagePicker.pickMultiImage();
    if (selectedImages.isNotEmpty) {
      imageFileList.addAll(selectedImages);
    }
    print(selectedImages);
    setState(() {});
  }

  final ProductProvider productProvider = ProductProvider();

  @override
  void initState() {
    formKey = GlobalKey<FormState>();
    super.initState();
  }

  @override
  void dispose() {
    name.dispose();
    quantity.dispose();
    category.dispose();
    description.dispose();
    price.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: widget.product == null
            ? const Text("Add Product")
            : const Text("Update Product"),
      ),
      body: Padding(
        padding: const EdgeInsets.all(10.0),
        child: Form(
          key: formKey,
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                TextFormField(
                  controller: name,
                  decoration: InputDecoration(
                    labelText: 'Title',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(20.0),
                    ),
                  ),
                  validator: (val) => val!.isNotEmpty
                      ? null
                      : 'Name of product cannot be empty.',
                ),
                const SizedBox(
                  height: 20.0,
                ),
                TextFormField(
                  controller: quantity,
                  decoration: InputDecoration(
                    labelText: 'Quantity',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(20.0),
                    ),
                  ),
                  keyboardType: TextInputType.number,
                  validator: (val) {
                    if (val == null) {
                      return 'Quantity cannot be empty.';
                    }
                    if (int.tryParse(val) == null) {
                      return 'Quantity should be a whole number';
                    }
                    return null;
                  },
                ),
                const SizedBox(
                  height: 20.0,
                ),
                DropdownMenu<String>(
                  inputDecorationTheme: InputDecorationTheme(
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(20.0),
                    ),
                  ),
                  width: MediaQuery.of(context).size.width,
                  initialSelection: categoryList.first,
                  controller: category,
                  // requestFocusOnTap: true,
                  label: const Text('Category'),
                  onSelected: (String? category) {
                    setState(() {
                      selectedCategory = category;
                    });
                  },
                  dropdownMenuEntries: categoryList.map(
                    (value) {
                      return DropdownMenuEntry(
                        value: value,
                        label: value,
                      );
                    },
                  ).toList(),
                ),
                const SizedBox(
                  height: 20.0,
                ),
                TextFormField(
                  controller: description,
                  decoration: InputDecoration(
                    labelText: 'Description',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(20.0),
                    ),
                  ),
                  minLines: 4,
                  maxLines: 6,
                  validator: (val) =>
                      val!.isNotEmpty ? null : 'Description cannot be empty.',
                ),
                const SizedBox(
                  height: 30.0,
                ),
                TextFormField(
                  controller: price,
                  decoration: InputDecoration(
                    labelText: 'Price',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(20.0),
                    ),
                  ),
                  keyboardType: TextInputType.number,
                  validator: (val) =>
                      val!.isNotEmpty ? null : 'Price cannot be empty.',
                ),
                const SizedBox(
                  height: 20.0,
                ),
                imageFileList.isNotEmpty
                    ? GestureDetector(
                        child: Container(
                          decoration: BoxDecoration(
                              border: Border.all(color: Colors.black87)),
                          child: Padding(
                            padding: const EdgeInsets.all(8.0),
                            child: Text(
                                "You have selected ${imageFileList!.length} images"),
                          ),
                        ),
                        onTap: () => selectImages(),
                      )
                    : ElevatedButton(
                        child: const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.file_download),
                            Text("Select images:"),
                          ],
                        ),
                        onPressed: () => selectImages(),
                      ),
                productProvider.isLoading
                    ? ElevatedButton(
                        onPressed: null,
                        child: Container(
                          constraints: const BoxConstraints(
                              maxHeight: 20.0, maxWidth: 20.0),
                          child: const CircularProgressIndicator(
                            backgroundColor: Colors.white,
                          ),
                        ),
                      )
                    : ElevatedButton(
                        onPressed: () async {
                          if (formKey.currentState!.validate()) {
                            if (widget.product == null) {
                              try {
                                await productProvider.createProduct(
                                  token:
                                      context.read<AuthProvider>().user!.token,
                                  name: name.text,
                                  quantity: int.tryParse(quantity.text) ?? 0,
                                  category: category.text,
                                  description: description.text,
                                  price: double.tryParse(price.text) ?? 0.0,
                                  images: imageFileList,
                                );
                                if (context.mounted) Navigator.pop(context);
                              } catch (e) {
                                failToast(e.toString());
                              }
                            } else {
                              Product updatedProduct = Product(
                                id: widget.product!.id,
                                name: name.text,
                                description: description.text,
                                category: category.text,
                                price: double.tryParse(price.text) ?? 0.0,
                                quantity: int.tryParse(quantity.text) ?? 0,
                                farmerId: widget.product!.farmerId,
                                farmerUserId: AuthProvider().user!.id,
                                images: imageFileList,
                              );
                              await productProvider.updatePost(updatedProduct);
                            }
                          }
                        },
                        child: Center(
                          child: widget.product == null
                              ? const Text('Add Product')
                              : const Text('Update Product'),
                        ))
              ],
            ),
          ),
        ),
      ),
    );
  }
}
