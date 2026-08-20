import type {
  InvoiceImportedLine,
  InvoiceReviewSummary,
} from "../types/invoiceImport";

export function getInvoiceReviewSummary(
  lines:
    InvoiceImportedLine[],
): InvoiceReviewSummary {
  const matchedLines =
    lines.filter(
      (
        line,
      ) =>
        line.status ===
        "matched",
    ).length;

  const needsAttentionLines =
    lines.filter(
      (
        line,
      ) =>
        line.status ===
          "needs_attention",
    ).length;

  const newProductLines =
    lines.filter(
      (
        line,
      ) =>
        line.status ===
          "new_product",
    ).length;

  const unmatchedLines =
    lines.filter(
      (
        line,
      ) =>
        line.status ===
          "unmatched",
    ).length;

  const missingInformationLines =
    lines.filter(
      (
        line,
      ) =>
        line.status ===
          "missing_information",
    ).length;

  const quantityMismatchLines =
    lines.filter(
      (
        line,
      ) =>
        line.status ===
          "quantity_mismatch",
    ).length;

  const priceMismatchLines =
    lines.filter(
      (
        line,
      ) =>
        line.status ===
          "price_mismatch",
    ).length;

  const totalConfirmedUnits =
    lines.reduce(
      (
        total,
        line,
      ) =>
        total +
        (
          line.confirmedQuantity ??
          0
        ),
      0,
    );

  const notReceivedLines =
    lines.filter(
      (
        line,
      ) => {
        if (
          !line.reviewed
        ) {
          return false;
        }

        const confirmed =
          line.confirmedQuantity ??
          0;

        const expected =
          line.remainingOrderedQuantity ??
          line.orderedQuantity ??
          0;

        return (
          expected >
            0 &&
          confirmed ===
            0
        );
      },
    ).length;

  const partiallyReceivedLines =
    lines.filter(
      (
        line,
      ) => {
        if (
          !line.reviewed
        ) {
          return false;
        }

        const confirmed =
          line.confirmedQuantity ??
          0;

        const expected =
          line.remainingOrderedQuantity ??
          line.orderedQuantity ??
          0;

        return (
          expected >
            0 &&
          confirmed >
            0 &&
          confirmed <
            expected
        );
      },
    ).length;

  return {
    totalLines:
      lines.length,

    matchedLines,

    needsAttentionLines,

    newProductLines,

    unmatchedLines,

    missingInformationLines,

    quantityMismatchLines,

    priceMismatchLines,

    totalConfirmedUnits,

    notReceivedLines,

    partiallyReceivedLines,
  };
}

export function canConfirmInvoiceLines(
  lines:
    InvoiceImportedLine[],
): boolean {
  if (
    lines.length ===
    0
  ) {
    return false;
  }

  return lines.every(
    (
      line,
    ) => {
      if (
        !line.reviewed
      ) {
        return false;
      }

      if (
        line.confirmedQuantity ===
        null
      ) {
        return false;
      }

      if (
        line.confirmedQuantity <
        0
      ) {
        return false;
      }

      return true;
    },
  );
}