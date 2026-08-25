import type {
  ReactNode,
} from "react";

import {
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

interface ScreenContainerProps {
  children:
    ReactNode;

  /*
   * true:
   * ScreenContainer creates the ScrollView.
   *
   * false:
   * Useful for FlatList, camera, charts,
   * custom scroll views, etc.
   */
  scrollable?:
    boolean;

  /*
   * Standard horizontal page spacing.
   *
   * Disable for screens such as the
   * barcode camera where the component
   * manages its own width.
   */
  padded?:
    boolean;

  /*
   * Default page spacing directly
   * underneath AppHeader.
   */
  topSpacing?:
    number;

  /*
   * Bottom spacing for scroll content.
   */
  bottomSpacing?:
    number;

  /*
   * Optional screen-level style.
   */
  style?:
    StyleProp<ViewStyle>;

  /*
   * Optional inner content style.
   */
  contentStyle?:
    StyleProp<ViewStyle>;

  keyboardShouldPersistTaps?:
    "always"
    | "never"
    | "handled";
}

export function ScreenContainer({
  children,
  scrollable =
    true,
  padded =
    true,
  topSpacing =
    8,
  bottomSpacing =
    50,
  style,
  contentStyle,
  keyboardShouldPersistTaps =
    "handled",
}: ScreenContainerProps) {
  const horizontalPadding =
    padded
      ? 18
      : 0;

  if (
    !scrollable
  ) {
    return (
      <View
        style={[
          styles.screen,

          {
            paddingHorizontal:
              horizontalPadding,

            paddingTop:
              topSpacing,

            paddingBottom:
              bottomSpacing,
          },

          style,

          contentStyle,
        ]}
      >
        {
          children
        }
      </View>
    );
  }

  return (
    <View
      style={[
        styles.screen,
        style,
      ]}
    >
      <ScrollView
        contentInsetAdjustmentBehavior="never"
        keyboardShouldPersistTaps={
          keyboardShouldPersistTaps
        }
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={[
          styles.scrollContent,

          {
            paddingHorizontal:
              horizontalPadding,

            paddingTop:
              topSpacing,

            paddingBottom:
              bottomSpacing,
          },

          contentStyle,
        ]}
      >
        {
          children
        }
      </ScrollView>
    </View>
  );
}

const styles =
  StyleSheet.create({
    screen: {
      flex:
        1,

      minHeight:
        0,

      backgroundColor:
        "#F4F6F8",
    },

    scrollContent: {
      flexGrow:
        1,
    },
  });