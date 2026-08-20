import {
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import {
  useMemo,
  useState,
} from "react";

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  OrderProductCard,
} from "./OrderProductCard";

import type {
  OrderDraftItem,
} from "../types/orderDraft";

import type {
  Product,
} from "../types/product";

import type {
  ReorderItem,
} from "../types/reorderItem";

interface CreateOrderProps {
  reorderItems:
    ReorderItem[];

  products:
    Product[];

  cartItems:
    OrderDraftItem[];

  scannedProduct?:
    Product | null;

  onAddToCart: (
    product:
      Product,

    quantity:
      number,
  ) => void;

  onScanBarcode:
    () => void;

  onClearScannedProduct:
    () => void;

  onPreviewOrder:
    () => void;

  onClose:
    () => void;
}

const MAX_SEARCH_RESULTS =
  8;

export function CreateOrder({
  reorderItems,
  products,
  cartItems,
  scannedProduct = null,
  onAddToCart,
  onScanBarcode,
  onClearScannedProduct,
  onPreviewOrder,
  onClose,
}: CreateOrderProps) {
  const [
    searchQuery,
    setSearchQuery,
  ] =
    useState(
      "",
    );

  const [
    selectedSearchProductId,
    setSelectedSearchProductId,
  ] =
    useState<
      number | null
    >(
      null,
    );

  const [
    quantities,
    setQuantities,
  ] =
    useState<
      Record<
        number,
        number
      >
    >(
      {},
    );

  const normalizedSearch =
    searchQuery
      .trim()
      .toLowerCase();

  const matchingProducts =
    useMemo(
      () => {
        if (
          normalizedSearch.length <
          2
        ) {
          return [];
        }

        return products
          .filter(
            (
              product,
            ) => {
              const values = [
                product.name,
                product.brand,
                product.barcode,
                product.department,
                product.category,
              ];

              return values.some(
                (
                  value,
                ) =>
                  value
                    .toLowerCase()
                    .includes(
                      normalizedSearch,
                    ),
              );
            },
          )
          .sort(
            (
              first,
              second,
            ) => {
              const firstName =
                first.name.toLowerCase();

              const secondName =
                second.name.toLowerCase();

              const firstStartsWith =
                firstName.startsWith(
                  normalizedSearch,
                );

              const secondStartsWith =
                secondName.startsWith(
                  normalizedSearch,
                );

              if (
                firstStartsWith &&
                !secondStartsWith
              ) {
                return -1;
              }

              if (
                !firstStartsWith &&
                secondStartsWith
              ) {
                return 1;
              }

              const firstOutOfStock =
                first.currentStock ===
                0;

              const secondOutOfStock =
                second.currentStock ===
                0;

              if (
                firstOutOfStock !==
                secondOutOfStock
              ) {
                return firstOutOfStock
                  ? -1
                  : 1;
              }

              const firstLowStock =
                first.currentStock <=
                first.reorderLevel;

              const secondLowStock =
                second.currentStock <=
                second.reorderLevel;

              if (
                firstLowStock !==
                secondLowStock
              ) {
                return firstLowStock
                  ? -1
                  : 1;
              }

              return first.name.localeCompare(
                second.name,
              );
            },
          )
          .slice(
            0,
            MAX_SEARCH_RESULTS,
          );
      },
      [
        normalizedSearch,
        products,
      ],
    );

  const cartSummary =
    useMemo(
      () => {
        const totalUnits =
          cartItems.reduce(
            (
              total,
              item,
            ) =>
              total +
              item.quantity,
            0,
          );

        const estimatedCost =
          cartItems.reduce(
            (
              total,
              item,
            ) =>
              total +
              item.quantity *
                item.product.unitCost,
            0,
          );

        return {
          totalProducts:
            cartItems.length,

          totalUnits,

          estimatedCost,
        };
      },
      [
        cartItems,
      ],
    );

  function getQuantity(
    productId:
      number,
  ): number {
    return (
      quantities[
        productId
      ] ??
      0
    );
  }

  function getSelectableQuantity(
    productId:
      number,
  ): number {
    const quantity =
      getQuantity(
        productId,
      );

    return quantity >
      0
      ? quantity
      : 1;
  }

  function getCartQuantity(
    productId:
      number,
  ): number {
    return (
      cartItems.find(
        (
          item,
        ) =>
          item.product.id ===
          productId,
      )?.quantity ??
      0
    );
  }

  function ensureQuantity(
    productId:
      number,
  ): void {
    setQuantities(
      (
        current,
      ) => {
        if (
          current[
            productId
          ] !==
          undefined
        ) {
          return current;
        }

        return {
          ...current,

          [productId]:
            1,
        };
      },
    );
  }

  function changeQuantity(
    productId:
      number,

    change:
      number,
  ): void {
    setQuantities(
      (
        current,
      ) => {
        const currentQuantity =
          current[
            productId
          ] ??
          1;

        return {
          ...current,

          [productId]:
            Math.max(
              1,
              currentQuantity +
                change,
            ),
        };
      },
    );
  }

  function selectSearchProduct(
    product:
      Product,
  ): void {
    setSelectedSearchProductId(
      (
        current,
      ) =>
        current ===
        product.id
          ? null
          : product.id,
    );

    ensureQuantity(
      product.id,
    );
  }

  function addProductToCart(
    product:
      Product,

    clearScannedProduct =
      false,
  ): void {
    const quantity =
      getSelectableQuantity(
        product.id,
      );

    if (
      quantity <=
      0
    ) {
      return;
    }

    onAddToCart(
      product,
      quantity,
    );

    setQuantities(
      (
        current,
      ) => ({
        ...current,

        [product.id]:
          1,
      }),
    );

    setSelectedSearchProductId(
      null,
    );

    if (
      clearScannedProduct
    ) {
      onClearScannedProduct();
    }
  }

  function clearSearch():
    void {
    setSearchQuery(
      "",
    );

    setSelectedSearchProductId(
      null,
    );
  }

  const scannedQuantity =
    scannedProduct
      ? getSelectableQuantity(
          scannedProduct.id,
        )
      : 1;

  const scannedCartQuantity =
    scannedProduct
      ? getCartQuantity(
          scannedProduct.id,
        )
      : 0;

  return (
    <SafeAreaView
      edges={[
        "top",
        "left",
        "right",
        "bottom",
      ]}
      style={
        styles.screen
      }
    >
      <View
        style={
          styles.screenContent
        }
      >
        <ScrollView
          contentContainerStyle={
            styles.content
          }
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={
              styles.header
            }
          >
            <View
              style={
                styles.headerText
              }
            >
              <Text
                style={
                  styles.title
                }
              >
                Create Order
              </Text>

              <Text
                style={
                  styles.subtitle
                }
              >
                Search or scan products, choose quantities, and build your purchase order.
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              hitSlop={
                8
              }
              onPress={
                onClose
              }
              style={({
                pressed,
              }) => [
                styles.closeButton,

                pressed &&
                  styles.buttonPressed,
              ]}
            >
              <Text
                style={
                  styles.closeButtonText
                }
              >
                Close
              </Text>
            </Pressable>
          </View>

          {cartItems.length >
          0 ? (
            <View
              style={
                styles.cartBar
              }
            >
              <View
                style={
                  styles.cartInfo
                }
              >
                <View
                  style={
                    styles.cartIconContainer
                  }
                >
                  <Ionicons
                    name="cart-outline"
                    size={
                      20
                    }
                    color="#FFFFFF"
                  />
                </View>

                <View
                  style={
                    styles.cartText
                  }
                >
                  <Text
                    style={
                      styles.cartLabel
                    }
                  >
                    Current Order
                  </Text>

                  <Text
                    style={
                      styles.cartCount
                    }
                    numberOfLines={
                      1
                    }
                  >
                    {cartSummary.totalProducts}{" "}
                    {cartSummary.totalProducts ===
                    1
                      ? "product"
                      : "products"}{" "}
                    ·{" "}
                    {
                      cartSummary.totalUnits
                    }{" "}
                    units
                  </Text>

                  <Text
                    style={
                      styles.cartCost
                    }
                  >
                    Est.{" "}
                    {
                      formatCurrency(
                        cartSummary.estimatedCost,
                      )
                    }
                  </Text>
                </View>
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={
                  onPreviewOrder
                }
                style={({
                  pressed,
                }) => [
                  styles.previewButton,

                  pressed &&
                    styles.previewButtonPressed,
                ]}
              >
                <Text
                  style={
                    styles.previewButtonText
                  }
                >
                  Preview
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={
                    16
                  }
                  color="#20252B"
                />
              </Pressable>
            </View>
          ) : null}

          {scannedProduct ? (
            <View
              style={
                styles.scannedSection
              }
            >
              <View
                style={
                  styles.scannedSectionHeader
                }
              >
                <View
                  style={
                    styles.scannedTitleRow
                  }
                >
                  <View
                    style={
                      styles.scannedHeadingIcon
                    }
                  >
                    <MaterialCommunityIcons
                      name="barcode-scan"
                      size={
                        22
                      }
                      color="#2563EB"
                    />
                  </View>

                  <View
                    style={
                      styles.scannedHeadingText
                    }
                  >
                    <Text
                      style={
                        styles.scannedHeading
                      }
                    >
                      Scanned Product
                    </Text>

                    <Text
                      style={
                        styles.scannedHeadingSubtitle
                      }
                    >
                      Barcode matched your inventory.
                    </Text>
                  </View>
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Close scanned product"
                  hitSlop={
                    8
                  }
                  onPress={
                    onClearScannedProduct
                  }
                  style={
                    styles.scannedCloseButton
                  }
                >
                  <Ionicons
                    name="close"
                    size={
                      20
                    }
                    color="#64748B"
                  />
                </Pressable>
              </View>

              <View
                style={
                  styles.scannedProductCard
                }
              >
                <View
                  style={
                    styles.scannedProductTop
                  }
                >
                  <View
                    style={
                      styles.scannedProductIdentity
                    }
                  >
                    <Text
                      style={
                        styles.scannedProductName
                      }
                      numberOfLines={
                        2
                      }
                    >
                      {
                        scannedProduct.name
                      }
                    </Text>

                    {scannedProduct.brand.trim() ? (
                      <Text
                        style={
                          styles.scannedProductBrand
                        }
                      >
                        {
                          scannedProduct.brand
                        }
                      </Text>
                    ) : null}

                    <Text
                      style={
                        styles.scannedBarcode
                      }
                    >
                      Barcode:{" "}
                      {
                        scannedProduct.barcode
                      }
                    </Text>
                  </View>

                  <StockStatusBadge
                    product={
                      scannedProduct
                    }
                  />
                </View>

                <View
                  style={
                    styles.scannedStats
                  }
                >
                  <View
                    style={
                      styles.scannedStat
                    }
                  >
                    <Text
                      style={
                        styles.scannedStatLabel
                      }
                    >
                      STOCK
                    </Text>

                    <Text
                      style={[
                        styles.scannedStatValue,

                        scannedProduct.currentStock ===
                          0 &&
                          styles.scannedStockDanger,
                      ]}
                    >
                      {
                        scannedProduct.currentStock
                      }
                    </Text>
                  </View>

                  <View
                    style={
                      styles.scannedStat
                    }
                  >
                    <Text
                      style={
                        styles.scannedStatLabel
                      }
                    >
                      REORDER AT
                    </Text>

                    <Text
                      style={
                        styles.scannedStatValue
                      }
                    >
                      {
                        scannedProduct.reorderLevel
                      }
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.scannedStat,
                      styles.scannedStatRight,
                    ]}
                  >
                    <Text
                      style={
                        styles.scannedStatLabel
                      }
                    >
                      UNIT COST
                    </Text>

                    <Text
                      style={
                        styles.scannedStatValue
                      }
                    >
                      {
                        formatCurrency(
                          scannedProduct.unitCost,
                        )
                      }
                    </Text>
                  </View>
                </View>

                {scannedCartQuantity >
                0 ? (
                  <View
                    style={
                      styles.scannedAlreadyAdded
                    }
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={
                        15
                      }
                      color="#15803D"
                    />

                    <Text
                      style={
                        styles.scannedAlreadyAddedText
                      }
                    >
                      {scannedCartQuantity} already in this order
                    </Text>
                  </View>
                ) : null}

                <View
                  style={
                    styles.scannedQuantitySection
                  }
                >
                  <View>
                    <Text
                      style={
                        styles.quantityLabel
                      }
                    >
                      Quantity
                    </Text>

                    <Text
                      style={
                        styles.quantityHint
                      }
                    >
                      Units to add
                    </Text>
                  </View>

                  <View
                    style={
                      styles.quantityControls
                    }
                  >
                    <Pressable
                      accessibilityRole="button"
                      onPress={() =>
                        changeQuantity(
                          scannedProduct.id,
                          -1,
                        )
                      }
                      style={({
                        pressed,
                      }) => [
                        styles.quantityButton,

                        pressed &&
                          styles.quantityButtonPressed,
                      ]}
                    >
                      <Ionicons
                        name="remove"
                        size={
                          19
                        }
                        color="#20252B"
                      />
                    </Pressable>

                    <Text
                      style={
                        styles.quantityValue
                      }
                    >
                      {
                        scannedQuantity
                      }
                    </Text>

                    <Pressable
                      accessibilityRole="button"
                      onPress={() =>
                        changeQuantity(
                          scannedProduct.id,
                          1,
                        )
                      }
                      style={({
                        pressed,
                      }) => [
                        styles.quantityButton,

                        pressed &&
                          styles.quantityButtonPressed,
                      ]}
                    >
                      <Ionicons
                        name="add"
                        size={
                          19
                        }
                        color="#20252B"
                      />
                    </Pressable>
                  </View>
                </View>

                <View
                  style={
                    styles.scannedCostRow
                  }
                >
                  <Text
                    style={
                      styles.scannedCostLabel
                    }
                  >
                    Estimated Cost
                  </Text>

                  <Text
                    style={
                      styles.scannedCostValue
                    }
                  >
                    {
                      formatCurrency(
                        scannedProduct.unitCost *
                          scannedQuantity,
                      )
                    }
                  </Text>
                </View>

                <Pressable
                  accessibilityRole="button"
                  onPress={() =>
                    addProductToCart(
                      scannedProduct,
                      true,
                    )
                  }
                  style={({
                    pressed,
                  }) => [
                    styles.scannedAddButton,

                    pressed &&
                      styles.scannedAddButtonPressed,
                  ]}
                >
                  <Ionicons
                    name="cart-outline"
                    size={
                      19
                    }
                    color="#FFFFFF"
                  />

                  <Text
                    style={
                      styles.scannedAddButtonText
                    }
                  >
                    {scannedCartQuantity >
                    0
                      ? "Add More to Order"
                      : "Add to Order"}
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          <View
            style={
              styles.searchSection
            }
          >
            <Text
              style={
                styles.searchLabel
              }
            >
              Find Product
            </Text>

            <View
              style={
                styles.searchContainer
              }
            >
              <Ionicons
                name="search-outline"
                size={
                  19
                }
                color="#7A838E"
              />

              <TextInput
                value={
                  searchQuery
                }
                onChangeText={(
                  value,
                ) => {
                  setSearchQuery(
                    value,
                  );

                  setSelectedSearchProductId(
                    null,
                  );
                }}
                placeholder="Search product, brand or barcode"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                autoCorrect={
                  false
                }
                returnKeyType="search"
                style={
                  styles.searchInput
                }
              />

              {searchQuery ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Clear product search"
                  hitSlop={
                    6
                  }
                  onPress={
                    clearSearch
                  }
                  style={
                    styles.clearSearchButton
                  }
                >
                  <Ionicons
                    name="close-circle"
                    size={
                      19
                    }
                    color="#8B949E"
                  />
                </Pressable>
              ) : null}
            </View>

            {normalizedSearch.length ===
            1 ? (
              <Text
                style={
                  styles.searchHint
                }
              >
                Enter at least 2 characters to search.
              </Text>
            ) : null}

            {normalizedSearch.length >=
            2 ? (
              <View
                style={
                  styles.searchResultsCard
                }
              >
                {matchingProducts.length >
                0 ? (
                  <>
                    <View
                      style={
                        styles.searchResultsHeader
                      }
                    >
                      <Text
                        style={
                          styles.searchResultsTitle
                        }
                      >
                        Matching Products
                      </Text>

                      <Text
                        style={
                          styles.searchResultsCount
                        }
                      >
                        {
                          matchingProducts.length
                        }{" "}
                        shown
                      </Text>
                    </View>

                    {matchingProducts.map(
                      (
                        product,
                      ) => {
                        const isSelected =
                          selectedSearchProductId ===
                          product.id;

                        const selectedQuantity =
                          getSelectableQuantity(
                            product.id,
                          );

                        const quantityInCart =
                          getCartQuantity(
                            product.id,
                          );

                        const productDetails = [
                          product.brand.trim(),
                          product.category,
                        ]
                          .filter(
                            Boolean,
                          )
                          .join(
                            " · ",
                          );

                        return (
                          <View
                            key={
                              product.id
                            }
                            style={
                              styles.searchProductWrapper
                            }
                          >
                            <Pressable
                              accessibilityRole="button"
                              onPress={() =>
                                selectSearchProduct(
                                  product,
                                )
                              }
                              style={({
                                pressed,
                              }) => [
                                styles.searchProductRow,

                                isSelected &&
                                  styles.searchProductRowSelected,

                                pressed &&
                                  styles.buttonPressed,
                              ]}
                            >
                              <View
                                style={
                                  styles.searchProductText
                                }
                              >
                                <Text
                                  style={
                                    styles.searchProductName
                                  }
                                  numberOfLines={
                                    2
                                  }
                                >
                                  {
                                    product.name
                                  }
                                </Text>

                                {productDetails ? (
                                  <Text
                                    style={
                                      styles.searchProductMeta
                                    }
                                    numberOfLines={
                                      1
                                    }
                                  >
                                    {
                                      productDetails
                                    }
                                  </Text>
                                ) : null}

                                <Text
                                  style={
                                    styles.searchProductBarcode
                                  }
                                  numberOfLines={
                                    1
                                  }
                                >
                                  Barcode:{" "}
                                  {
                                    product.barcode
                                  }
                                </Text>

                                {quantityInCart >
                                0 ? (
                                  <View
                                    style={
                                      styles.inCartRow
                                    }
                                  >
                                    <Ionicons
                                      name="checkmark-circle"
                                      size={
                                        14
                                      }
                                      color="#15803D"
                                    />

                                    <Text
                                      style={
                                        styles.inCartText
                                      }
                                    >
                                      {
                                        quantityInCart
                                      }{" "}
                                      currently in order
                                    </Text>
                                  </View>
                                ) : null}
                              </View>

                              <View
                                style={
                                  styles.searchProductRight
                                }
                              >
                                <Text
                                  style={
                                    styles.searchProductCost
                                  }
                                >
                                  {
                                    formatCurrency(
                                      product.unitCost,
                                    )
                                  }
                                </Text>

                                <Ionicons
                                  name={
                                    isSelected
                                      ? "chevron-up"
                                      : "chevron-down"
                                  }
                                  size={
                                    18
                                  }
                                  color="#64748B"
                                />
                              </View>
                            </Pressable>

                            {isSelected ? (
                              <View
                                style={
                                  styles.expandedSearchProduct
                                }
                              >
                                <View
                                  style={
                                    styles.quantityInfoRow
                                  }
                                >
                                  <View>
                                    <Text
                                      style={
                                        styles.quantityLabel
                                      }
                                    >
                                      Quantity
                                    </Text>

                                    <Text
                                      style={
                                        styles.quantityHint
                                      }
                                    >
                                      Choose units to add
                                    </Text>
                                  </View>

                                  <View
                                    style={
                                      styles.quantityControls
                                    }
                                  >
                                    <Pressable
                                      accessibilityRole="button"
                                      onPress={() =>
                                        changeQuantity(
                                          product.id,
                                          -1,
                                        )
                                      }
                                      style={({
                                        pressed,
                                      }) => [
                                        styles.quantityButton,

                                        pressed &&
                                          styles.quantityButtonPressed,
                                      ]}
                                    >
                                      <Ionicons
                                        name="remove"
                                        size={
                                          19
                                        }
                                        color="#20252B"
                                      />
                                    </Pressable>

                                    <Text
                                      style={
                                        styles.quantityValue
                                      }
                                    >
                                      {
                                        selectedQuantity
                                      }
                                    </Text>

                                    <Pressable
                                      accessibilityRole="button"
                                      onPress={() =>
                                        changeQuantity(
                                          product.id,
                                          1,
                                        )
                                      }
                                      style={({
                                        pressed,
                                      }) => [
                                        styles.quantityButton,

                                        pressed &&
                                          styles.quantityButtonPressed,
                                      ]}
                                    >
                                      <Ionicons
                                        name="add"
                                        size={
                                          19
                                        }
                                        color="#20252B"
                                      />
                                    </Pressable>
                                  </View>
                                </View>

                                <View
                                  style={
                                    styles.selectedProductSummary
                                  }
                                >
                                  <View>
                                    <Text
                                      style={
                                        styles.summaryMiniLabel
                                      }
                                    >
                                      Unit Cost
                                    </Text>

                                    <Text
                                      style={
                                        styles.summaryMiniValue
                                      }
                                    >
                                      {
                                        formatCurrency(
                                          product.unitCost,
                                        )
                                      }
                                    </Text>
                                  </View>

                                  <View
                                    style={
                                      styles.summaryMiniRight
                                    }
                                  >
                                    <Text
                                      style={
                                        styles.summaryMiniLabel
                                      }
                                    >
                                      Estimated Cost
                                    </Text>

                                    <Text
                                      style={
                                        styles.summaryMiniValue
                                      }
                                    >
                                      {
                                        formatCurrency(
                                          product.unitCost *
                                            selectedQuantity,
                                        )
                                      }
                                    </Text>
                                  </View>
                                </View>

                                <Pressable
                                  accessibilityRole="button"
                                  onPress={() =>
                                    addProductToCart(
                                      product,
                                    )
                                  }
                                  style={({
                                    pressed,
                                  }) => [
                                    styles.addToOrderButton,

                                    pressed &&
                                      styles.addToOrderButtonPressed,
                                  ]}
                                >
                                  <Ionicons
                                    name="cart-outline"
                                    size={
                                      18
                                    }
                                    color="#FFFFFF"
                                  />

                                  <Text
                                    style={
                                      styles.addToOrderButtonText
                                    }
                                  >
                                    {quantityInCart >
                                    0
                                      ? "Add More to Order"
                                      : "Add to Order"}
                                  </Text>
                                </Pressable>
                              </View>
                            ) : null}
                          </View>
                        );
                      },
                    )}

                    <Text
                      style={
                        styles.searchResultHint
                      }
                    >
                      Search by flavour, size, brand, or barcode to narrow similar products.
                    </Text>
                  </>
                ) : (
                  <View
                    style={
                      styles.noSearchResults
                    }
                  >
                    <Ionicons
                      name="search-outline"
                      size={
                        28
                      }
                      color="#9CA3AF"
                    />

                    <Text
                      style={
                        styles.noSearchResultsTitle
                      }
                    >
                      No matching products
                    </Text>

                    <Text
                      style={
                        styles.noSearchResultsText
                      }
                    >
                      Try another product name, brand, flavour, or barcode.
                    </Text>
                  </View>
                )}
              </View>
            ) : null}
          </View>

          <View
            style={
              styles.sectionHeader
            }
          >
            <Text
              style={
                styles.sectionTitle
              }
            >
              Low & Out of Stock
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }
            >
              Products that currently need attention.
            </Text>
          </View>

          {reorderItems.length ===
          0 ? (
            <View
              style={
                styles.emptyCard
              }
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={
                  42
                }
                color="#15803D"
              />

              <Text
                style={
                  styles.emptyTitle
                }
              >
                Inventory looks healthy
              </Text>

              <Text
                style={
                  styles.emptyText
                }
              >
                No products currently need reordering. You can still search or scan any product.
              </Text>
            </View>
          ) : (
            reorderItems.map(
              (
                item,
              ) => {
                const cartQuantity =
                  getCartQuantity(
                    item.product.id,
                  );

                const quantity =
                  getSelectableQuantity(
                    item.product.id,
                  );

                return (
                  <View
                    key={
                      item.product.id
                    }
                  >
                    <OrderProductCard
                      product={
                        item.product
                      }
                      quantity={
                        quantity
                      }
                      onIncrease={() =>
                        changeQuantity(
                          item.product.id,
                          1,
                        )
                      }
                      onDecrease={() =>
                        changeQuantity(
                          item.product.id,
                          -1,
                        )
                      }
                      onAdd={() =>
                        addProductToCart(
                          item.product,
                        )
                      }
                      showAddButton
                    />

                    {cartQuantity >
                    0 ? (
                      <View
                        style={
                          styles.alreadyAddedRow
                        }
                      >
                        <Ionicons
                          name="checkmark-circle"
                          size={
                            16
                          }
                          color="#15803D"
                        />

                        <Text
                          style={
                            styles.alreadyAddedText
                          }
                        >
                          {
                            cartQuantity
                          }{" "}
                          currently in order
                        </Text>
                      </View>
                    ) : null}
                  </View>
                );
              },
            )
          )}

          {cartItems.length >
          0 ? (
            <Pressable
              accessibilityRole="button"
              onPress={
                onPreviewOrder
              }
              style={({
                pressed,
              }) => [
                styles.bottomPreviewButton,

                pressed &&
                  styles.bottomPreviewButtonPressed,
              ]}
            >
              <Ionicons
                name="cart-outline"
                size={
                  19
                }
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.bottomPreviewButtonText
                }
              >
                Preview Order
              </Text>

              <View
                style={
                  styles.cartQuantityBadge
                }
              >
                <Text
                  style={
                    styles.cartQuantityBadgeText
                  }
                >
                  {
                    cartSummary.totalUnits
                  }
                </Text>
              </View>
            </Pressable>
          ) : null}

          <View
            style={
              styles.bottomSpacer
            }
          />
        </ScrollView>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Scan product barcode"
          onPress={
            onScanBarcode
          }
          style={({
            pressed,
          }) => [
            styles.floatingScanButton,

            pressed &&
              styles.floatingScanButtonPressed,
          ]}
        >
          <MaterialCommunityIcons
            name="barcode-scan"
            size={
              34
            }
            color="#FFFFFF"
          />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function StockStatusBadge({
  product,
}: {
  product:
    Product;
}) {
  if (
    product.currentStock ===
    0
  ) {
    return (
      <View
        style={
          styles.outOfStockBadge
        }
      >
        <Text
          style={
            styles.outOfStockBadgeText
          }
        >
          Out of Stock
        </Text>
      </View>
    );
  }

  if (
    product.currentStock <=
    product.reorderLevel
  ) {
    return (
      <View
        style={
          styles.lowStockBadge
        }
      >
        <Text
          style={
            styles.lowStockBadgeText
          }
        >
          Low Stock
        </Text>
      </View>
    );
  }

  return (
    <View
      style={
        styles.inStockBadge
      }
    >
      <Text
        style={
          styles.inStockBadgeText
        }
      >
        In Stock
      </Text>
    </View>
  );
}

const currencyFormatter =
  new Intl.NumberFormat(
    "en-CA",
    {
      style:
        "currency",

      currency:
        "CAD",

      maximumFractionDigits:
        2,
    },
  );

function formatCurrency(
  value:
    number,
): string {
  return currencyFormatter.format(
    value,
  );
}

const styles =
  StyleSheet.create({
    screen: {
      flex:
        1,

      backgroundColor:
        "#F4F6F8",
    },

    screenContent: {
      flex:
        1,

      position:
        "relative",
    },

    content: {
      paddingHorizontal:
        18,

      paddingTop:
        12,

      paddingBottom:
        40,
    },

    header: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      justifyContent:
        "space-between",
    },

    headerText: {
      flex:
        1,

      minWidth:
        0,

      marginRight:
        16,
    },

    title: {
      fontSize:
        28,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    subtitle: {
      marginTop:
        5,

      maxWidth:
        320,

      fontSize:
        13,

      lineHeight:
        19,

      color:
        "#6B7280",
    },

    closeButton: {
      minHeight:
        42,

      justifyContent:
        "center",

      borderWidth:
        1,

      borderColor:
        "#CBD2DA",

      borderRadius:
        10,

      paddingHorizontal:
        14,

      backgroundColor:
        "#FFFFFF",
    },

    closeButtonText: {
      fontSize:
        14,

      fontWeight:
        "700",

      color:
        "#20252B",
    },

    buttonPressed: {
      opacity:
        0.72,
    },

    cartBar: {
      marginTop:
        20,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        10,

      borderRadius:
        15,

      padding:
        12,

      backgroundColor:
        "#20252B",
    },

    cartInfo: {
      flex:
        1,

      minWidth:
        0,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        9,
    },

    cartIconContainer: {
      width:
        38,

      height:
        38,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        10,

      backgroundColor:
        "#374151",
    },

    cartText: {
      flex:
        1,

      minWidth:
        0,
    },

    cartLabel: {
      fontSize:
        9,

      fontWeight:
        "700",

      textTransform:
        "uppercase",

      color:
        "#CBD5E1",
    },

    cartCount: {
      marginTop:
        2,

      fontSize:
        12,

      fontWeight:
        "800",

      color:
        "#FFFFFF",
    },

    cartCost: {
      marginTop:
        2,

      fontSize:
        10,

      fontWeight:
        "700",

      color:
        "#86EFAC",
    },

    previewButton: {
      minHeight:
        39,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        4,

      borderRadius:
        10,

      paddingHorizontal:
        11,

      backgroundColor:
        "#FFFFFF",
    },

    previewButtonPressed: {
      backgroundColor:
        "#E2E8F0",
    },

    previewButtonText: {
      fontSize:
        11,

      fontWeight:
        "800",

      color:
        "#20252B",
    },

    floatingScanButton: {
      position:
        "absolute",

      right:
        22,

      bottom:
        22,

      width:
        66,

      height:
        66,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth:
        4,

      borderColor:
        "#FFFFFF",

      borderRadius:
        33,

      backgroundColor:
        "#20252B",

      shadowColor:
        "#000000",

      shadowOffset: {
        width:
          0,

        height:
          5,
      },

      shadowOpacity:
        0.22,

      shadowRadius:
        9,

      elevation:
        8,

      zIndex:
        20,
    },

    floatingScanButtonPressed: {
      backgroundColor:
        "#111827",

      transform: [
        {
          scale:
            0.95,
        },
      ],
    },

    scannedSection: {
      marginTop:
        20,
    },

    scannedSectionHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      marginBottom:
        9,
    },

    scannedTitleRow: {
      flex:
        1,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        8,
    },

    scannedHeadingIcon: {
      width:
        38,

      height:
        38,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        19,

      backgroundColor:
        "#EFF6FF",
    },

    scannedHeadingText: {
      flex:
        1,
    },

    scannedHeading: {
      fontSize:
        13,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    scannedHeadingSubtitle: {
      marginTop:
        2,

      fontSize:
        10,

      color:
        "#64748B",
    },

    scannedCloseButton: {
      width:
        34,

      height:
        34,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        17,
    },

    scannedProductCard: {
      borderWidth:
        1,

      borderColor:
        "#BFDBFE",

      borderRadius:
        16,

      padding:
        15,

      backgroundColor:
        "#FFFFFF",
    },

    scannedProductTop: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      justifyContent:
        "space-between",

      gap:
        10,
    },

    scannedProductIdentity: {
      flex:
        1,

      minWidth:
        0,
    },

    scannedProductName: {
      fontSize:
        17,

      lineHeight:
        22,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    scannedProductBrand: {
      marginTop:
        3,

      fontSize:
        11,

      fontWeight:
        "600",

      color:
        "#64748B",
    },

    scannedBarcode: {
      marginTop:
        5,

      fontSize:
        10,

      color:
        "#8B949E",
    },

    outOfStockBadge: {
      flexShrink:
        0,

      borderRadius:
        999,

      paddingHorizontal:
        9,

      paddingVertical:
        5,

      backgroundColor:
        "#FFF1F0",
    },

    outOfStockBadgeText: {
      fontSize:
        9,

      fontWeight:
        "800",

      color:
        "#B42318",
    },

    lowStockBadge: {
      flexShrink:
        0,

      borderRadius:
        999,

      paddingHorizontal:
        9,

      paddingVertical:
        5,

      backgroundColor:
        "#FFF7ED",
    },

    lowStockBadgeText: {
      fontSize:
        9,

      fontWeight:
        "800",

      color:
        "#B45309",
    },

    inStockBadge: {
      flexShrink:
        0,

      borderRadius:
        999,

      paddingHorizontal:
        9,

      paddingVertical:
        5,

      backgroundColor:
        "#ECFDF3",
    },

    inStockBadgeText: {
      fontSize:
        9,

      fontWeight:
        "800",

      color:
        "#15803D",
    },

    scannedStats: {
      marginTop:
        14,

      flexDirection:
        "row",

      borderTopWidth:
        1,

      borderTopColor:
        "#EEF0F2",

      paddingTop:
        12,

      gap:
        8,
    },

    scannedStat: {
      flex:
        1,

      minWidth:
        0,
    },

    scannedStatRight: {
      alignItems:
        "flex-end",
    },

    scannedStatLabel: {
      fontSize:
        8,

      fontWeight:
        "700",

      color:
        "#94A3B8",
    },

    scannedStatValue: {
      marginTop:
        4,

      fontSize:
        14,

      fontWeight:
        "800",

      color:
        "#20252B",
    },

    scannedStockDanger: {
      color:
        "#B42318",
    },

    scannedAlreadyAdded: {
      marginTop:
        12,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        5,

      borderRadius:
        9,

      paddingHorizontal:
        9,

      paddingVertical:
        7,

      backgroundColor:
        "#ECFDF3",
    },

    scannedAlreadyAddedText: {
      fontSize:
        10,

      fontWeight:
        "700",

      color:
        "#15803D",
    },

    scannedQuantitySection: {
      marginTop:
        14,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        12,
    },

    scannedCostRow: {
      marginTop:
        13,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      borderTopWidth:
        1,

      borderTopColor:
        "#EEF0F2",

      paddingTop:
        11,
    },

    scannedCostLabel: {
      fontSize:
        11,

      fontWeight:
        "700",

      color:
        "#64748B",
    },

    scannedCostValue: {
      fontSize:
        16,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    scannedAddButton: {
      marginTop:
        13,

      minHeight:
        46,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        7,

      borderRadius:
        11,

      backgroundColor:
        "#20252B",
    },

    scannedAddButtonPressed: {
      backgroundColor:
        "#111827",
    },

    scannedAddButtonText: {
      fontSize:
        13,

      fontWeight:
        "800",

      color:
        "#FFFFFF",
    },

    searchSection: {
      marginTop:
        22,
    },

    searchLabel: {
      marginBottom:
        8,

      fontSize:
        13,

      fontWeight:
        "800",

      color:
        "#374151",
    },

    searchContainer: {
      minHeight:
        48,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth:
        1,

      borderColor:
        "#CBD2DA",

      borderRadius:
        12,

      paddingHorizontal:
        13,

      backgroundColor:
        "#FFFFFF",
    },

    searchInput: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        8,

      paddingVertical:
        11,

      fontSize:
        14,

      color:
        "#111827",
    },

    clearSearchButton: {
      marginLeft:
        8,

      padding:
        3,
    },

    searchHint: {
      marginTop:
        6,

      fontSize:
        11,

      color:
        "#8B949E",
    },

    searchResultsCard: {
      marginTop:
        8,

      overflow:
        "hidden",

      borderWidth:
        1,

      borderColor:
        "#DDE2E8",

      borderRadius:
        13,

      backgroundColor:
        "#FFFFFF",
    },

    searchResultsHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      borderBottomWidth:
        1,

      borderBottomColor:
        "#EEF0F2",

      paddingHorizontal:
        12,

      paddingVertical:
        9,

      backgroundColor:
        "#F8FAFC",
    },

    searchResultsTitle: {
      fontSize:
        11,

      fontWeight:
        "800",

      textTransform:
        "uppercase",

      color:
        "#64748B",
    },

    searchResultsCount: {
      fontSize:
        9,

      color:
        "#94A3B8",
    },

    searchProductWrapper: {
      borderBottomWidth:
        1,

      borderBottomColor:
        "#EEF0F2",
    },

    searchProductRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        12,

      paddingHorizontal:
        13,

      paddingVertical:
        13,

      backgroundColor:
        "#FFFFFF",
    },

    searchProductRowSelected: {
      backgroundColor:
        "#F8FAFC",
    },

    searchProductText: {
      flex:
        1,

      minWidth:
        0,
    },

    searchProductName: {
      fontSize:
        14,

      lineHeight:
        19,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    searchProductMeta: {
      marginTop:
        3,

      fontSize:
        11,

      color:
        "#64748B",
    },

    searchProductBarcode: {
      marginTop:
        3,

      fontSize:
        10,

      color:
        "#94A3B8",
    },

    searchProductRight: {
      flexShrink:
        0,

      alignItems:
        "flex-end",

      gap:
        5,
    },

    searchProductCost: {
      fontSize:
        12,

      fontWeight:
        "800",

      color:
        "#20252B",
    },

    inCartRow: {
      marginTop:
        5,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        4,
    },

    inCartText: {
      fontSize:
        10,

      fontWeight:
        "700",

      color:
        "#15803D",
    },

    expandedSearchProduct: {
      paddingHorizontal:
        13,

      paddingTop:
        12,

      paddingBottom:
        14,

      backgroundColor:
        "#F8FAFC",
    },

    quantityInfoRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        12,
    },

    quantityLabel: {
      fontSize:
        12,

      fontWeight:
        "800",

      color:
        "#374151",
    },

    quantityHint: {
      marginTop:
        2,

      fontSize:
        10,

      color:
        "#8B949E",
    },

    quantityControls: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        11,
    },

    quantityButton: {
      width:
        36,

      height:
        36,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth:
        1,

      borderColor:
        "#CBD2DA",

      borderRadius:
        10,

      backgroundColor:
        "#FFFFFF",
    },

    quantityButtonPressed: {
      backgroundColor:
        "#E2E8F0",
    },

    quantityValue: {
      minWidth:
        30,

      fontSize:
        17,

      fontWeight:
        "800",

      textAlign:
        "center",

      color:
        "#111827",
    },

    selectedProductSummary: {
      marginTop:
        12,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      borderTopWidth:
        1,

      borderTopColor:
        "#E2E8F0",

      paddingTop:
        10,
    },

    summaryMiniLabel: {
      fontSize:
        9,

      fontWeight:
        "700",

      textTransform:
        "uppercase",

      color:
        "#94A3B8",
    },

    summaryMiniValue: {
      marginTop:
        3,

      fontSize:
        13,

      fontWeight:
        "800",

      color:
        "#20252B",
    },

    summaryMiniRight: {
      alignItems:
        "flex-end",
    },

    addToOrderButton: {
      marginTop:
        12,

      minHeight:
        43,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        7,

      borderRadius:
        11,

      backgroundColor:
        "#20252B",
    },

    addToOrderButtonPressed: {
      backgroundColor:
        "#111827",
    },

    addToOrderButtonText: {
      fontSize:
        12,

      fontWeight:
        "800",

      color:
        "#FFFFFF",
    },

    searchResultHint: {
      paddingHorizontal:
        12,

      paddingVertical:
        9,

      fontSize:
        10,

      lineHeight:
        15,

      color:
        "#8B949E",

      backgroundColor:
        "#F8FAFC",
    },

    noSearchResults: {
      alignItems:
        "center",

      paddingHorizontal:
        20,

      paddingVertical:
        28,
    },

    noSearchResultsTitle: {
      marginTop:
        7,

      fontSize:
        14,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    noSearchResultsText: {
      marginTop:
        4,

      maxWidth:
        250,

      fontSize:
        11,

      lineHeight:
        17,

      textAlign:
        "center",

      color:
        "#6B7280",
    },

    sectionHeader: {
      marginTop:
        25,

      marginBottom:
        12,
    },

    sectionTitle: {
      fontSize:
        18,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    sectionSubtitle: {
      marginTop:
        4,

      fontSize:
        12,

      lineHeight:
        17,

      color:
        "#6B7280",
    },

    alreadyAddedRow: {
      marginTop:
        -3,

      marginBottom:
        12,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        5,

      borderRadius:
        9,

      paddingHorizontal:
        10,

      paddingVertical:
        7,

      backgroundColor:
        "#ECFDF3",
    },

    alreadyAddedText: {
      fontSize:
        10,

      fontWeight:
        "700",

      color:
        "#15803D",
    },

    bottomPreviewButton: {
      marginTop:
        12,

      minHeight:
        50,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        8,

      borderRadius:
        13,

      backgroundColor:
        "#20252B",
    },

    bottomPreviewButtonPressed: {
      backgroundColor:
        "#111827",
    },

    bottomPreviewButtonText: {
      fontSize:
        14,

      fontWeight:
        "800",

      color:
        "#FFFFFF",
    },

    cartQuantityBadge: {
      minWidth:
        24,

      height:
        24,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        12,

      paddingHorizontal:
        6,

      backgroundColor:
        "#FFFFFF",
    },

    cartQuantityBadgeText: {
      fontSize:
        10,

      fontWeight:
        "800",

      color:
        "#20252B",
    },

    emptyCard: {
      minHeight:
        170,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth:
        1,

      borderColor:
        "#D1FAE5",

      borderRadius:
        16,

      padding:
        20,

      backgroundColor:
        "#F7FEFA",
    },

    emptyTitle: {
      marginTop:
        10,

      fontSize:
        16,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    emptyText: {
      marginTop:
        5,

      maxWidth:
        280,

      fontSize:
        11,

      lineHeight:
        17,

      textAlign:
        "center",

      color:
        "#6B7280",
    },

    bottomSpacer: {
      height:
        70,
    },
  });