import 'package:flutter/material.dart';
import 'package:pinput/pinput.dart';

class RoundedWithShadow extends StatefulWidget {
  const RoundedWithShadow({super.key});

  @override
  State<RoundedWithShadow> createState() => _RoundedWithShadowState();
}

class _RoundedWithShadowState extends State<RoundedWithShadow> {
  final controller = TextEditingController();
  final focusNode = FocusNode();

  @override
  void dispose() {
    controller.dispose();
    focusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Pinput(
      length: 6,
      controller: controller,
      focusNode: focusNode,
      defaultPinTheme: defaultPinTheme,
      separatorBuilder: (index) => const SizedBox(width: 1),
      focusedPinTheme: defaultPinTheme.copyWith(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(8),
          boxShadow: const [
            BoxShadow(
              color: Color.fromRGBO(0, 0, 0, 0.05999999865889549),
              offset: Offset(0, 3),
              blurRadius: 16,
            ),
          ],
        ),
      ),
      showCursor: true,
      cursor: cursor,
    );
  }
}

final defaultPinTheme = PinTheme(
  width: 60,
  height: 64,
  textStyle: const TextStyle(
    fontSize: 20,
    color: Color.fromRGBO(70, 69, 66, 1),
  ),
  decoration: BoxDecoration(
    border: Border.all(color: Colors.black26),
    color: const Color.fromRGBO(232, 235, 241, 0.37),
    borderRadius: BorderRadius.circular(24),
  ),
);

final focusPinTheme = PinTheme(
  width: 60,
  height: 64,
  textStyle: const TextStyle(
    fontSize: 20,
    color: Color.fromRGBO(70, 69, 66, 1),
  ),
  decoration: BoxDecoration(
    color: Colors.white,
    borderRadius: BorderRadius.circular(8),
    boxShadow: const [
      BoxShadow(
        color: Color.fromRGBO(0, 0, 0, 0.05999999865889549),
        offset: Offset(0, 3),
        blurRadius: 16,
      ),
    ],
  ),
);

final cursor = Align(
  alignment: Alignment.bottomCenter,
  child: Container(
    width: 21,
    height: 1,
    margin: const EdgeInsets.only(bottom: 12),
    decoration: BoxDecoration(
      color: const Color.fromRGBO(137, 146, 160, 1),
      borderRadius: BorderRadius.circular(8),
    ),
  ),
);
