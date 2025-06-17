import type {
  ExpressionSpecification,
  Feature,
} from "@maplibre/maplibre-gl-style-spec"
import { featureFilter } from "@maplibre/maplibre-gl-style-spec"
import { describe, expect, it } from "vitest"

import { expr } from "../index"

describe("datetime", () => {
  describe("compilation", () => {
    it("isWithinTimeRange with number, number, and number inputs", () => {
      const timeToCheck = new Date("2024-10-25T00:00:00.000Z").getTime()
      const startTime = new Date("2024-10-23T15:04:00.000Z").getTime()
      const endTime = new Date("2024-10-31T15:04:00.000Z").getTime()

      const expression = [
        "case",
        [
          "all",
          [">=", ["literal", timeToCheck], ["literal", startTime]],
          ["<=", ["literal", timeToCheck], ["literal", endTime]],
        ],
        true,
        false,
      ] satisfies ExpressionSpecification

      expect(expr.datetime.isWithinTimeRange(timeToCheck, startTime, endTime)).toEqual(
        expression,
      )
    })

    it("isWithinTimeRange with number, number, and string inputs", () => {
      const timeToCheck = new Date("2024-10-25T00:00:00.000Z").getTime()
      const startTime = new Date("2024-10-23T15:04:00.000Z").getTime()

      const expression = [
        "case",
        [
          "all",
          ["has", "endTime"],
          [
            "all",
            [">=", ["literal", timeToCheck], ["literal", startTime]],
            ["<=", ["literal", timeToCheck], ["get", "endTime"]],
          ],
        ],
        true,
        false,
      ] satisfies ExpressionSpecification

      expect(expr.datetime.isWithinTimeRange(timeToCheck, startTime, "endTime")).toEqual(
        expression,
      )
    })

    it("isWithinTimeRange with number, string, and number inputs", () => {
      const timeToCheck = new Date("2024-10-25T00:00:00.000Z").getTime()
      const endTime = new Date("2024-10-31T15:04:00.000Z").getTime()

      const expression = [
        "case",
        [
          "all",
          ["has", "startTime"],
          [
            "all",
            [">=", ["literal", timeToCheck], ["get", "startTime"]],
            ["<=", ["literal", timeToCheck], ["literal", endTime]],
          ],
        ],
        true,
        false,
      ] satisfies ExpressionSpecification

      expect(expr.datetime.isWithinTimeRange(timeToCheck, "startTime", endTime)).toEqual(
        expression,
      )
    })

    it("isWithinTimeRange with number, string, and string inputs", () => {
      const timeToCheck = new Date("2024-10-25T00:00:00.000Z").getTime()

      const expression = [
        "case",
        [
          "all",
          ["has", "startTime"],
          ["has", "endTime"],
          [
            "all",
            [">=", ["literal", timeToCheck], ["get", "startTime"]],
            ["<=", ["literal", timeToCheck], ["get", "endTime"]],
          ],
        ],
        true,
        false,
      ] satisfies ExpressionSpecification

      expect(
        expr.datetime.isWithinTimeRange(timeToCheck, "startTime", "endTime"),
      ).toEqual(expression)
    })

    it("isWithinTimeRange with string, string, and string inputs", () => {
      const expression = [
        "case",
        [
          "all",
          ["has", "startTime"],
          ["has", "endTime"],
          [
            "all",
            [">=", ["get", "timeToCheck"], ["get", "startTime"]],
            ["<=", ["get", "timeToCheck"], ["get", "endTime"]],
          ],
        ],
        true,
        false,
      ] satisfies ExpressionSpecification

      expect(
        expr.datetime.isWithinTimeRange("timeToCheck", "startTime", "endTime"),
      ).toEqual(expression)
    })
  })

  describe("evaluation", () => {
    describe("isWithinTimeRange", () => {
      it("should return 'true' if the date is within the range", () => {
        const expression = expr.datetime.isWithinTimeRange(
          new Date("2024-10-25T00:00:00.000Z").getTime(),
          "startTime",
          "endTime",
        )
        const feature: Feature = {
          type: "Unknown",
          properties: {
            startTime: new Date("2024-10-23T15:04:00.000Z").getTime(),
            endTime: new Date("2024-10-31T15:04:00.000Z").getTime(),
          },
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(true)
      })

      it("should return 'false' if the date is not within the range", () => {
        const expression = expr.datetime.isWithinTimeRange(
          new Date("2024-10-22T00:00:00.000Z").getTime(),
          "startTime",
          "endTime",
        )
        const feature: Feature = {
          type: "Unknown",
          properties: {
            startTime: new Date("2024-10-23T15:04:00.000Z").getTime(),
            endTime: new Date("2024-10-31T15:04:00.000Z").getTime(),
          },
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(false)
      })

      it("should return 'false' if start date is missing", () => {
        const expression = expr.datetime.isWithinTimeRange(
          new Date("2024-10-25T00:00:00.000Z").getTime(),
          "startTime",
          "endTime",
        )
        const feature: Feature = {
          type: "Unknown",
          properties: {
            endTime: new Date("2024-10-31T15:04:00.000Z").getTime(),
          },
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(false)
      })

      it("should return 'false' if end date is missing", () => {
        const expression = expr.datetime.isWithinTimeRange(
          new Date("2024-10-25T00:00:00.000Z").getTime(),
          "startTime",
          "endTime",
        )
        const feature: Feature = {
          type: "Unknown",
          properties: {
            startTime: new Date("2024-10-23T15:04:00.000Z").getTime(),
          },
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(false)
      })

      it("should return 'true' if date equals start date", () => {
        const startTime = new Date("2024-10-23T15:04:00.000Z").getTime()
        const expression = expr.datetime.isWithinTimeRange(
          startTime,
          "startTime",
          "endTime",
        )
        const feature: Feature = {
          type: "Unknown",
          properties: {
            startTime,
            endTime: new Date("2024-10-31T15:04:00.000Z").getTime(),
          },
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(true)
      })

      it("should return 'true' if date equals end date", () => {
        const endTime = new Date("2024-10-31T15:04:00.000Z").getTime()
        const expression = expr.datetime.isWithinTimeRange(
          endTime,
          "startTime",
          "endTime",
        )
        const feature: Feature = {
          type: "Unknown",
          properties: {
            startTime: new Date("2024-10-23T15:04:00.000Z").getTime(),
            endTime,
          },
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(true)
      })

      it("should work with custom property names", () => {
        const expression = expr.datetime.isWithinTimeRange(
          new Date("2024-10-25T00:00:00.000Z").getTime(),
          "customStart",
          "customEnd",
        )
        const feature: Feature = {
          type: "Unknown",
          properties: {
            customStart: new Date("2024-10-23T15:04:00.000Z").getTime(),
            customEnd: new Date("2024-10-31T15:04:00.000Z").getTime(),
          },
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(true)
      })

      it("should return 'false' if date is exactly one millisecond before start date", () => {
        const startTime = new Date("2024-10-23T15:04:00.000Z").getTime()
        const expression = expr.datetime.isWithinTimeRange(
          startTime - 1,
          "startTime",
          "endTime",
        )
        const feature: Feature = {
          type: "Unknown",
          properties: {
            startTime,
            endTime: new Date("2024-10-31T15:04:00.000Z").getTime(),
          },
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(false)
      })

      it("should return 'false' if date is exactly one millisecond after end date", () => {
        const endTime = new Date("2024-10-31T15:04:00.000Z").getTime()
        const expression = expr.datetime.isWithinTimeRange(
          endTime + 1,
          "startTime",
          "endTime",
        )
        const feature: Feature = {
          type: "Unknown",
          properties: {
            startTime: new Date("2024-10-23T15:04:00.000Z").getTime(),
            endTime,
          },
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(false)
      })

      it("should handle expression specifications as input", () => {
        const expression = expr.datetime.isWithinTimeRange(
          expr.lookup.get("checkTime"),
          "startTime",
          "endTime",
        )
        const checkTime = new Date("2024-10-25T00:00:00.000Z").getTime()
        const feature: Feature = {
          type: "Unknown",
          properties: {
            checkTime,
            startTime: new Date("2024-10-23T15:04:00.000Z").getTime(),
            endTime: new Date("2024-10-31T15:04:00.000Z").getTime(),
          },
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(true)
      })

      it("should handle property names for dateToCheck", () => {
        const expression = expr.datetime.isWithinTimeRange(
          "checkDate",
          new Date("2024-01-01").getTime(),
          new Date("2024-12-31").getTime(),
        )
        const feature: Feature = {
          type: "Unknown",
          properties: {
            checkDate: new Date("2024-06-15").getTime(),
          },
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(true)
      })

      it("should handle direct timestamps for all parameters", () => {
        const expression = expr.datetime.isWithinTimeRange(
          new Date("2024-06-15").getTime(),
          new Date("2024-01-01").getTime(),
          new Date("2024-12-31").getTime(),
        )
        const feature: Feature = {
          type: "Unknown",
          properties: {},
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(true)
      })

      it("should handle mixed property names and timestamps", () => {
        const expression = expr.datetime.isWithinTimeRange(
          new Date("2024-06-15").getTime(),
          "startDate",
          new Date("2024-12-31").getTime(),
        )
        const feature: Feature = {
          type: "Unknown",
          properties: {
            startDate: new Date("2024-01-01").getTime(),
          },
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(true)
      })

      it("should handle expression specifications", () => {
        const expression = expr.datetime.isWithinTimeRange(
          expr.lookup.get("checkDate"),
          expr.lookup.get("startDate"),
          expr.lookup.get("endDate"),
        )
        const feature: Feature = {
          type: "Unknown",
          properties: {
            checkDate: new Date("2024-06-15").getTime(),
            startDate: new Date("2024-01-01").getTime(),
            endDate: new Date("2024-12-31").getTime(),
          },
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(true)
      })

      it("should return false when property doesn't exist", () => {
        const expression = expr.datetime.isWithinTimeRange(
          new Date("2024-06-15").getTime(),
          "startDate",
          "endDate",
        )
        const feature: Feature = {
          type: "Unknown",
          properties: {
            // startDate is missing
            endDate: new Date("2024-12-31").getTime(),
          },
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(false)
      })

      it("should return true when the time is exactly start and end times", () => {
        const expression = expr.datetime.isWithinTimeRange(
          new Date("2024-10-23T15:04:00.000Z").getTime(),
          "startTime",
          "endTime",
        )
        const feature: Feature = {
          type: "Unknown",
          properties: {
            startTime: new Date("2024-10-23T15:04:00.000Z").getTime(),
            endTime: new Date("2024-10-31T15:04:00.000Z").getTime(),
          },
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(true)
      })
    })

    describe("isToday", () => {
      it("should return true for a timestamp from today", () => {
        const today = new Date()
        const expression = expr.datetime.isToday("testDate")
        const feature: Feature = {
          type: "Unknown",
          properties: {
            testDate: today.getTime(),
          },
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(true)
      })

      it("should return false for a timestamp from yesterday", () => {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const expression = expr.datetime.isToday("testDate")
        const feature: Feature = {
          type: "Unknown",
          properties: {
            testDate: yesterday.getTime(),
          },
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(false)
      })

      it("should handle expression specifications", () => {
        const expression = expr.datetime.isToday(expr.lookup.get("checkDate"))
        const feature: Feature = {
          type: "Unknown",
          properties: {
            checkDate: new Date().getTime(),
          },
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(true)
      })

      it("should return false when the property doesn't exist", () => {
        const expression = expr.datetime.isToday("checkDate")
        const feature: Feature = {
          type: "Unknown",
          properties: {},
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(false)
      })

      it("should return false when missing property in expression specification", () => {
        const expression = expr.datetime.isToday(expr.lookup.get("checkDate"))
        const feature: Feature = {
          type: "Unknown",
          properties: {},
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(false)
      })
    })

    describe("isWithinNextDuration", () => {
      it("should return true for a time within the next duration", () => {
        const now = new Date()
        const futureTime = new Date(now.getTime() + 2 * 60 * 60 * 1000) // 2 hours in future
        const expression = expr.datetime.isWithinNextDuration(
          futureTime.getTime(),
          4 * 60 * 60 * 1000, // 4 hour duration
        )
        const feature: Feature = {
          type: "Unknown",
          properties: {},
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(true)
      })

      it("should return false for a time beyond the next duration", () => {
        const now = new Date()
        const futureTime = new Date(now.getTime() + 5 * 60 * 60 * 1000) // 5 hours in future
        const expression = expr.datetime.isWithinNextDuration(
          futureTime.getTime(),
          4 * 60 * 60 * 1000, // 4 hour duration
        )
        const feature: Feature = {
          type: "Unknown",
          properties: {},
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(false)
      })

      it("should handle property references", () => {
        const now = new Date()
        const futureTime = new Date(now.getTime() + 2 * 60 * 60 * 1000) // 2 hours in future
        const expression = expr.datetime.isWithinNextDuration(
          "checkTime",
          4 * 60 * 60 * 1000, // 4 hour duration
        )
        const feature: Feature = {
          type: "Unknown",
          properties: {
            checkTime: futureTime.getTime(),
          },
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(true)
      })

      it("should return false when property doesn't exist", () => {
        const expression = expr.datetime.isWithinNextDuration(
          "checkTime",
          4 * 60 * 60 * 1000,
        )
        const feature: Feature = {
          type: "Unknown",
          properties: {},
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(false)
      })

      it("should handle expression specifications", () => {
        const now = new Date()
        const futureTime = new Date(now.getTime() + 2 * 60 * 60 * 1000) // 2 hours in future
        const expression = expr.datetime.isWithinNextDuration(
          expr.lookup.get("checkTime"),
          4 * 60 * 60 * 1000,
        )
        const feature: Feature = {
          type: "Unknown",
          properties: {
            checkTime: futureTime.getTime(),
          },
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(true)
      })
    })

    describe("isWithinPastDuration", () => {
      it("should return true for a time within the past duration", () => {
        const now = new Date()
        const pastTime = new Date(now.getTime() - 2 * 60 * 60 * 1000) // 2 hours ago
        const expression = expr.datetime.isWithinPastDuration(
          pastTime.getTime(),
          4 * 60 * 60 * 1000, // 4 hour duration
        )
        const feature: Feature = {
          type: "Unknown",
          properties: {},
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(true)
      })

      it("should return false for a time beyond the past duration", () => {
        const now = new Date()
        const pastTime = new Date(now.getTime() - 5 * 60 * 60 * 1000) // 5 hours ago
        const expression = expr.datetime.isWithinPastDuration(
          pastTime.getTime(),
          4 * 60 * 60 * 1000, // 4 hour duration
        )
        const feature: Feature = {
          type: "Unknown",
          properties: {},
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(false)
      })

      it("should handle property references", () => {
        const now = new Date()
        const pastTime = new Date(now.getTime() - 2 * 60 * 60 * 1000) // 2 hours ago
        const expression = expr.datetime.isWithinPastDuration(
          "checkTime",
          4 * 60 * 60 * 1000, // 4 hour duration
        )
        const feature: Feature = {
          type: "Unknown",
          properties: {
            checkTime: pastTime.getTime(),
          },
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(true)
      })

      it("should return false when property doesn't exist", () => {
        const expression = expr.datetime.isWithinPastDuration(
          "checkTime",
          4 * 60 * 60 * 1000,
        )
        const feature: Feature = {
          type: "Unknown",
          properties: {},
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(false)
      })

      it("should handle expression specifications", () => {
        const now = new Date()
        const pastTime = new Date(now.getTime() - 2 * 60 * 60 * 1000) // 2 hours ago
        const expression = expr.datetime.isWithinPastDuration(
          expr.lookup.get("checkTime"),
          4 * 60 * 60 * 1000,
        )
        const feature: Feature = {
          type: "Unknown",
          properties: {
            checkTime: pastTime.getTime(),
          },
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(true)
      })

      it("should handle edge cases at exactly the duration boundary", () => {
        const now = new Date()
        const duration = 4 * 60 * 60 * 1000 // 4 hours
        const exactBoundaryTime = new Date(now.getTime() - duration)
        const expression = expr.datetime.isWithinPastDuration(
          exactBoundaryTime.getTime(),
          duration,
        )
        const feature: Feature = {
          type: "Unknown",
          properties: {},
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(true)
      })

      it("should handle very small durations", () => {
        const now = new Date()
        const pastTime = new Date(now.getTime() - 500) // 500ms ago
        const expression = expr.datetime.isWithinPastDuration(
          pastTime.getTime(),
          1000, // 1 second duration
        )
        const feature: Feature = {
          type: "Unknown",
          properties: {},
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(true)
      })
    })

    describe("isSameDay", () => {
      it("should return true for same day with different times", () => {
        const date1 = new Date("2024-03-15T09:00:00.000Z")
        const date2 = new Date("2024-03-15T18:30:00.000Z")
        const expression = expr.datetime.isSameDay(date1.getTime(), date2.getTime())
        const feature: Feature = {
          type: "Unknown",
          properties: {},
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(true)
      })

      it("should return false for different days", () => {
        const date1 = new Date("2024-03-15T09:00:00.000Z")
        const date2 = new Date("2024-03-16T09:00:00.000Z")
        const expression = expr.datetime.isSameDay(date1.getTime(), date2.getTime())
        const feature: Feature = {
          type: "Unknown",
          properties: {},
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(false)
      })

      it("should handle property references", () => {
        const date1 = new Date("2024-03-15T09:00:00.000Z")
        const date2 = new Date("2024-03-15T18:30:00.000Z")
        const expression = expr.datetime.isSameDay("time1", "time2")
        const feature: Feature = {
          type: "Unknown",
          properties: {
            time1: date1.getTime(),
            time2: date2.getTime(),
          },
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(true)
      })

      it("should handle mixed timestamp and property reference", () => {
        const date1 = new Date("2024-03-15T09:00:00.000Z")
        const date2 = new Date("2024-03-15T18:30:00.000Z")
        const expression = expr.datetime.isSameDay(date1.getTime(), "time2")
        const feature: Feature = {
          type: "Unknown",
          properties: {
            time2: date2.getTime(),
          },
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(true)
      })

      it("should handle expression specifications", () => {
        const date1 = new Date("2024-03-15T09:00:00.000Z")
        const date2 = new Date("2024-03-15T18:30:00.000Z")
        const expression = expr.datetime.isSameDay(expr.lookup.get("time1"), expr.lookup.get("time2"))
        const feature: Feature = {
          type: "Unknown",
          properties: {
            time1: date1.getTime(),
            time2: date2.getTime(),
          },
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(true)
      })

      it("should return false when properties don't exist", () => {
        const expression = expr.datetime.isSameDay("time1", "time2")
        const feature: Feature = {
          type: "Unknown",
          properties: {},
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(false)
      })

      it("should handle dates across month boundaries", () => {
        const date1 = new Date("2024-03-31T23:59:59.999Z")
        const date2 = new Date("2024-04-01T00:00:00.000Z")
        const expression = expr.datetime.isSameDay(date1.getTime(), date2.getTime())
        const feature: Feature = {
          type: "Unknown",
          properties: {},
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(false)
      })

      it("should handle dates across year boundaries", () => {
        const date1 = new Date("2024-12-31T23:59:59.999Z")
        const date2 = new Date("2025-01-01T00:00:00.000Z")
        const expression = expr.datetime.isSameDay(date1.getTime(), date2.getTime())
        const feature: Feature = {
          type: "Unknown",
          properties: {},
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(false)
      })

      it("should handle leap year dates", () => {
        const date1 = new Date("2024-02-29T09:00:00.000Z")
        const date2 = new Date("2024-02-29T18:30:00.000Z")
        const expression = expr.datetime.isSameDay(date1.getTime(), date2.getTime())
        const feature: Feature = {
          type: "Unknown",
          properties: {},
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(true)
      })

      it("should handle daylight saving time transitions", () => {
        // During DST transition (Spring forward)
        const date1 = new Date("2024-03-10T01:59:59.000Z")
        const date2 = new Date("2024-03-10T03:00:00.000Z")
        const expression = expr.datetime.isSameDay(date1.getTime(), date2.getTime())
        const feature: Feature = {
          type: "Unknown",
          properties: {},
        }
        const result = featureFilter(expression).filter({ zoom: 0 }, feature)
        expect(result).toBe(true)
      })
    })
  })
})
