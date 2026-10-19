import { describe, expect, it, vi } from "vitest"

import { compactNumber, firstNonEmpty, get, globalState, localizedName } from "../src"
import { evaluate, validate } from "../src/testing"

function format(n: number, options: Parameters<typeof compactNumber>[1] = {}): unknown {
  return evaluate(compactNumber(get("n"), options), { properties: { n } })
}

describe("compactNumber", () => {
  // Numbers around every scale boundary, where rounding decides the unit
  const numbers = [0, 1, 9.44, 9.96, 12, 999.4, 999.5, -1500, 1234, 9949, 9950, 56_789, 99_499, 99_500, 99_960, 999_949, 999_950, 1_234_567, -5_600_000, 99_960_000, 999_950_000, 2_100_000_000, 1.234e13, 9.9996e14]

  // `Intl` doesn't group unabbreviated 4-digit numbers in compact notation ("9950"); `number-format` does ("9,950")
  const ungrouped = (text: string, locale: string): string => {
    const group = new Intl.NumberFormat(locale).formatToParts(12345).find(part => part.type === "group")?.value
    return group === undefined ? text : text.split(group).join("")
  }

  it.each(["en", "en-IN", "de", "fr", "es", "ja", "zh", "ko", "hi", "ar-EG", "ru", "pt-BR"])("matches Intl's compact notation in %s", (locale) => {
    const intl = new Intl.NumberFormat(locale, { notation: "compact" })
    for (const n of numbers)
      expect(ungrouped(format(n, { locale }) as string, locale), `${n}`).toBe(ungrouped(intl.format(n), locale))
  })

  it.each([
    ["en", { currency: "USD" }],
    ["de", { currency: "EUR" }],
    ["ja", { currency: "JPY" }],
    ["en-IN", { currency: "INR" }],
    ["en", { unit: "kilometer" }],
    ["fr", { unit: "kilogram" }],
  ] as const)("places currencies and units as Intl does (%s, %o)", (locale, style) => {
    const intl = new Intl.NumberFormat(locale, { notation: "compact", style: "currency" in style ? "currency" : "unit", ...style })
    for (const n of numbers.filter(n => Number.isInteger(n)))
      expect(ungrouped(format(n, { locale, ...style }) as string, locale), `${n}`).toBe(ungrouped(intl.format(n), locale))
  })

  it("reads English abbreviations by default", () => {
    expect(format(1234)).toBe("1.2K")
    expect(format(56_789)).toBe("57K")
    expect(format(5_600_000)).toBe("5.6M")
    expect(format(-1500)).toBe("-1.5K")
    expect(evaluate(compactNumber(999_950))).toBe("1M")
  })

  it("uses fixed fraction digits when given", () => {
    expect(format(56_789, { maxFractionDigits: 1 })).toBe("56.8K")
    expect(format(1234, { locale: "de", maxFractionDigits: 2 })).toBe("1.234")
    expect(format(1_234_567, { locale: "de", maxFractionDigits: 2 })).toBe("1,23\u00A0Mio.")
    expect(format(999_994, { maxFractionDigits: 2 })).toBe("999.99K")
    expect(format(999_995, { maxFractionDigits: 2 })).toBe("1M")
    expect(format(999.6, { maxFractionDigits: 2 })).toBe("1K")
  })

  it("leaves numbers below `minimum` unabbreviated", () => {
    expect(format(9876, { minimum: 10_000 })).toBe("9,876")
    expect(format(12_345, { minimum: 10_000 })).toBe("12K")
    expect(format(5_000_000, { minimum: 2e7 })).toBe("5,000,000")
    expect(format(25_000_000, { minimum: 2e7 })).toBe("25M")
  })

  it("abbreviates nothing below `minimum`, or with no scales", () => {
    expect(format(1_234_567, { minimum: 1e30 })).toBe("1,234,567")
    expect(format(-1_234_567, { scales: [] })).toBe("-1,234,567")
  })

  it("throws where Intl has no compact notation, e.g. older React Native engines", () => {
    const spy = vi.spyOn(Intl.NumberFormat.prototype, "formatToParts").mockImplementation((n?: number | bigint) => [{ type: "integer", value: String(n) }])
    try {
      expect(() => compactNumber(get("n"))).toThrow(/no compact notation/)
      expect(evaluate(compactNumber(get("n"), { scales: [[1000, "k"]] }), { properties: { n: 1500 } })).toBe("1.5k")
    }
    finally {
      spy.mockRestore()
    }
  })

  it("takes custom scales", () => {
    const bytes = { scales: [[1024, " KB"], [1024 ** 2, " MB"], [1024 ** 3, " GB"]] as const, maxFractionDigits: 1 }
    expect(format(512, bytes)).toBe("512")
    expect(format(1536, bytes)).toBe("1.5 KB")
    expect(format(1024 ** 2 - 1, bytes)).toBe("1 MB")
    expect(format(-3 * 1024 ** 3, bytes)).toBe("-3 GB")
    const words = { scales: [[1e3, " thousand"], [1e6, " million"]] as const }
    expect(format(2_500_000, words)).toBe("2.5 million")
  })

  it("is valid as a text-field", () => {
    expect(validate(compactNumber(get("point_count"), { locale: "en-IN", currency: "INR" }), { property: "text-field" })).toEqual({ valid: true, errors: [] })
  })

  it("rejects options that don't fit together", () => {
    expect(() => compactNumber(1, { scales: [[1000, "k"]], currency: "USD" })).toThrow(RangeError)
    expect(() => compactNumber(1, { scales: [[1000, "k"], [1000, "M"]] })).toThrow(/ascending/)
    expect(() => compactNumber(1, { locale: "not a locale!" })).toThrow(RangeError)
  })
})

describe("firstNonEmpty", () => {
  it("skips missing and empty values, unlike coalesce", () => {
    const name = firstNonEmpty(get("name:en"), get("name"), "Unnamed")
    expect(evaluate(name, { properties: { "name:en": "", "name": "Paris" } })).toBe("Paris")
    expect(evaluate(["coalesce", ["get", "name:en"], ["get", "name"]], { properties: { "name:en": "", "name": "Paris" } })).toBe("")
    expect(evaluate(name, { properties: {} })).toBe("Unnamed")
    expect(evaluate(firstNonEmpty(get("a")), { properties: {} })).toBe("")
    expect(evaluate(firstNonEmpty(get("a")), { properties: { a: 12 } })).toBe("12")
  })

  it("is valid as a text-field", () => {
    expect(validate(firstNonEmpty(get("a"), get("b")), { property: "text-field" }).valid).toBe(true)
  })
})

describe("localizedName", () => {
  const label = (properties: object, lang?: string): unknown =>
    evaluate(localizedName([globalState("lang"), "en"], { secondLine: "name" }), { properties, globalState: lang === undefined ? {} : { lang } })

  it("tries each language in order, then name", () => {
    const name = localizedName(["fr", "de"])
    expect(evaluate(name, { properties: { "name": "München", "name:de": "München", "name:fr": "Munich" } })).toBe("Munich")
    expect(evaluate(name, { properties: { "name": "Wien", "name:de": "Wien", "name:fr": "" } })).toBe("Wien")
    expect(evaluate(name, { properties: { name: "Roma" } })).toBe("Roma")
    expect(evaluate(name, { properties: {} })).toBe("")
  })

  it("picks the language at runtime from global state", () => {
    expect(label({ "name": "Deutschland", "name:fr": "Allemagne", "name:en": "Germany" }, "fr")).toBe("Allemagne\nDeutschland")
    expect(label({ "name": "München", "name:en": "Munich" }, "ja")).toBe("Munich\nMünchen")
    expect(label({ "name": "Roma", "name:en": "Rome" })).toBe("Rome\nRoma")
  })

  it("shows the second line only when it's there and different", () => {
    expect(label({ "name": "Paris", "name:en": "Paris" }, "en")).toBe("Paris")
    expect(label({ "name": "東京", "name:en": "" }, "en")).toBe("東京")
    expect(label({ "name": "", "name:en": "Nowhere" }, "en")).toBe("Nowhere")
    expect(label({ "name:en": "Atlantis" }, "en")).toBe("Atlantis")
    // A second line with an empty first line becomes the only line, not "\n東京"
    const omt = localizedName(["en"], { fallback: ["name:latin"], secondLine: "name:nonlatin" })
    expect(evaluate(omt, { properties: { "name:nonlatin": "東京" } })).toBe("東京")
    // `is-supported-script` always passes in /testing, so the branch that drops an unsupported script isn't tested here
  })

  it("reads other field layouts and fallbacks", () => {
    expect(evaluate(localizedName(["de"], { field: "name_{lang}" }), { properties: { name_de: "Mailand", name: "Milano" } })).toBe("Mailand")
    expect(evaluate(localizedName([globalState("lang")], { field: "{lang}" }), { properties: { it: "Milano" }, globalState: { lang: "it" } })).toBe("Milano")
    expect(evaluate(localizedName(["en"], { fallback: ["name:latin", "name"] }), { properties: { "name:latin": "Tokyo", "name": "東京" } })).toBe("Tokyo")
    expect(evaluate(localizedName(["en"], { secondLine: ["name:nonlatin", "name"] }), { properties: { "name:en": "Tokyo", "name:nonlatin": "東京", "name": "Tokyo" } })).toBe("Tokyo\n東京")
  })

  it("is valid as a text-field, even with many languages", () => {
    // 40 languages: with a `let` per value (as before), maplibre-gl's style loading would take time exponential in that (maplibre/maplibre-style-spec#1933)
    const many = Array.from({ length: 40 }, (_, i) => `l${i}`)
    expect(validate(localizedName(many, { secondLine: ["name:nonlatin", "name"] }), { property: "text-field" })).toEqual({ valid: true, errors: [] })
    expect(validate(localizedName([globalState("lang"), "en"], { secondLine: "name" }), { property: "text-field" })).toEqual({ valid: true, errors: [] })
  }, 2000)

  it("rejects a field without {lang}", () => {
    expect(() => localizedName(["en"], { field: "name_en" })).toThrow(RangeError)
    expect(() => localizedName(["en"], { secondLine: [] })).toThrow(RangeError)
  })
})
