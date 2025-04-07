import type {
  CollatorExpressionSpecification,
  ColorSpecification,
  ExpressionSpecification,
} from "@maplibre/maplibre-gl-style-spec";

/**
 * Returns a collator for locale-dependent string comparisons.
 *
 * @param options - Collator options for case sensitivity, diacritic sensitivity, and locale
 * @returns An expression that returns a collator
 *
 * @see [MapLibre Style Specification - collator](https://maplibre.org/maplibre-style-spec/expressions/#collator)
 *
 * @example
 * ```ts
 * expr.collator({
 *   "case-sensitive": true,
 *   "diacritic-sensitive": true,
 *   "locale": "fr"
 * });
 * ```
 */
export function collator(options: {
  "case-sensitive"?: boolean | ExpressionSpecification;
  "diacritic-sensitive"?: boolean | ExpressionSpecification;
  locale?: string | ExpressionSpecification;
}) {
  return ["collator", options] satisfies CollatorExpressionSpecification;
}

/**
 * Returns a formatted string for displaying mixed-format text.
 *
 * @param sections - Array of text sections and their formatting options
 * @returns An expression that returns formatted text
 *
 * @see [MapLibre Style Specification - format](https://maplibre.org/maplibre-style-spec/expressions/#format)
 *
 * @example
 * ```ts
 * expr.format(
 *   ["upcase", ["get", "FacilityName"]],
 *   {"font-scale": 0.8},
 *   "\n\n",
 *   {},
 *   ["downcase", ["get", "Comments"]],
 *   {"font-scale": 0.6}
 * );
 * ```
 */
export function format(
  ...sections: (
    | string
    | ["image", ExpressionSpecification]
    | ExpressionSpecification
    | {
        "font-scale"?: number | ExpressionSpecification;
        "text-font"?: string[] | ExpressionSpecification;
        "text-color"?: ColorSpecification | ExpressionSpecification;
      }
  )[]
) {
  return ["format", ...sections] satisfies ExpressionSpecification;
}

/**
 * Returns an image type for use in icon-image, *-pattern entries and as a
 * section in the format expression. If set, the image argument will check that
 * the requested image exists in the style and will return either the resolved
 * image name or null, depending on whether or not the image is currently in the
 * style. This validation process is synchronous and requires the image to have
 * been added to the style before requesting it in the image argument.
 *
 * @param value - The image name or expression
 * @returns An expression that returns an image
 *
 * @see [MapLibre Style Specification - image](https://maplibre.org/maplibre-style-spec/expressions/#image)
 *
 * @example
 * ```ts
 * expr.image("marker_15"); // ["image", "marker_15"]
 * ```
 */
export function image(value: string | ExpressionSpecification) {
  return ["image", value] satisfies ExpressionSpecification;
}

interface NumberFormatOptions {
  locale?: string;
  currency?: string;
  "min-fraction-digits"?: number;
  "max-fraction-digits"?: number;
}

/**
 * Formats a number according to the specified locale and options.
 *
 * @param number - The number to format
 * @param options - Formatting options including locale, currency, and fraction digits
 * @returns An expression that returns the formatted number string
 *
 * @see [MapLibre Style Specification - number-format](https://maplibre.org/maplibre-style-spec/expressions/#number-format)
 *
 * @example
 * ```ts
 * expr.numberFormat(["get", "price"], {
 *   "locale": "de-DE",
 *   "currency": "EUR",
 *   "min-fraction-digits": 2
 * });
 * ```
 */
export function numberFormat(
  number: number | ExpressionSpecification,
  options: NumberFormatOptions
) {
  return ["number-format", number, options] satisfies ExpressionSpecification;
}

/**
 * Creates type formatting expressions for MapLibre styles
 *
 * @see [MapLibre Style Specification - Types](https://maplibre.org/maplibre-style-spec/expressions/#types)
 *
 * @example
 * ```ts
 * import { expr } from '@builtbyfield/maplibre-expression-helpers'
 *
 * expr.format(
 *   ["upcase", ["get", "FacilityName"]],
 *   {"font-scale": 0.8},
 *   "\n\n",
 *   {},
 *   ["downcase", ["get", "Comments"]],
 *   {"font-scale": 0.6}
 * );
 * ```
 */
export const formatting = {
  collator,
  format,
  image,
  numberFormat,
} as const;
