import type {
  ExpressionSpecification,
  Feature,
} from "@maplibre/maplibre-gl-style-spec";
import { describe, expect, it } from "vitest";

import { getGeometry } from "../../utils/geometry";
import { mockCanonical, testExpression } from "../../utils/test-utils";
import { spatial } from "./spatial";

describe("decision", () => {
  describe("spatial", () => {
    describe("compilation", () => {
      describe("within", () => {
        it("with polygon", () => {
          const polygon: GeoJSON.Polygon = {
            type: "Polygon",
            coordinates: [
              [
                [0, 0],
                [0, 5],
                [5, 5],
                [5, 0],
                [0, 0],
              ],
            ],
          };
          const expression = [
            "within",
            polygon,
          ] satisfies ExpressionSpecification;
          expect(spatial.within(polygon)).toEqual(expression);
        });
      });
    });

    describe("evaluation", () => {
      const feature: Feature = {
        type: "Point",
        geometry: [[{ x: 2, y: 2 }]],
        properties: {
          building_type: "residential",
          mag: 4.5,
          cluster: false,
          icon: "marker",
          status: "active",
        },
      };

      describe("within", () => {
        it("evaluates point correctly inside of polygon", () => {
          const expression = spatial.within({
            type: "Polygon",
            coordinates: [
              [
                [0, 0],
                [0, 5],
                [5, 5],
                [5, 0],
                [0, 0],
              ],
            ],
          });

          getGeometry(
            feature,
            { type: "Point", coordinates: [2, 2] },
            mockCanonical
          );

          testExpression(expression, feature, true);
        });

        it("evaluates point correctly outside of polygon", () => {
          const expression = spatial.within({
            type: "Polygon",
            coordinates: [
              [
                [0, 0],
                [0, 5],
                [5, 5],
                [5, 0],
                [0, 0],
              ],
            ],
          });

          getGeometry(
            feature,
            { type: "Point", coordinates: [6, 6] },
            mockCanonical
          );

          testExpression(expression, feature, false);
        });
      });

      describe("edge cases", () => {
        it("evaluates point on polygon boundary", () => {
          const expression = spatial.within({
            type: "Polygon",
            coordinates: [
              [
                [0, 0],
                [0, 5],
                [5, 5],
                [5, 0],
                [0, 0],
              ],
            ],
          });

          getGeometry(
            feature,
            { type: "Point", coordinates: [0, 2.5] },
            mockCanonical
          );

          testExpression(expression, feature, false);
        });

        it("evaluates point on polygon vertex", () => {
          const expression = spatial.within({
            type: "Polygon",
            coordinates: [
              [
                [0, 0],
                [0, 5],
                [5, 5],
                [5, 0],
                [0, 0],
              ],
            ],
          });

          getGeometry(
            feature,
            { type: "Point", coordinates: [0, 5] },
            mockCanonical
          );

          testExpression(expression, feature, false);
        });
      });

      describe("complex polygons", () => {
        it("evaluates point within polygon with hole", () => {
          const expression = spatial.within({
            type: "Polygon",
            coordinates: [
              // Outer ring
              [
                [0, 0],
                [0, 10],
                [10, 10],
                [10, 0],
                [0, 0],
              ],
              // Inner ring (hole)
              [
                [4, 4],
                [4, 6],
                [6, 6],
                [6, 4],
                [4, 4],
              ],
            ],
          });

          // Test point outside the hole
          getGeometry(
            feature,
            { type: "Point", coordinates: [2, 2] },
            mockCanonical
          );
          testExpression(expression, feature, true);

          // Test point inside the hole
          getGeometry(
            feature,
            { type: "Point", coordinates: [5, 5] },
            mockCanonical
          );
          testExpression(expression, feature, false);
        });

        it("evaluates point within multipolygon", () => {
          const expression = spatial.within({
            type: "MultiPolygon",
            coordinates: [
              [
                // First polygon
                [
                  [0, 0],
                  [0, 5],
                  [5, 5],
                  [5, 0],
                  [0, 0],
                ],
              ],
              [
                // Second polygon
                [
                  [10, 10],
                  [10, 15],
                  [15, 15],
                  [15, 10],
                  [10, 10],
                ],
              ],
            ],
          });

          // Test point in first polygon
          getGeometry(
            feature,
            { type: "Point", coordinates: [2, 2] },
            mockCanonical
          );
          testExpression(expression, feature, true);

          // Test point in second polygon
          getGeometry(
            feature,
            { type: "Point", coordinates: [12, 12] },
            mockCanonical
          );
          testExpression(expression, feature, true);

          // Test point outside both polygons
          getGeometry(
            feature,
            { type: "Point", coordinates: [7, 7] },
            mockCanonical
          );
          testExpression(expression, feature, false);
        });
      });

      describe("invalid inputs", () => {
        it("handles unclosed polygon", () => {
          const expression = spatial.within({
            type: "Polygon",
            coordinates: [
              [
                [0, 0],
                [0, 5],
                [5, 5],
                [5, 0],
                // Missing the closing point [0, 0]
              ],
            ],
          });

          getGeometry(
            feature,
            { type: "Point", coordinates: [2, 2] },
            mockCanonical
          );

          // The current implementation appears to auto-close polygons
          testExpression(expression, feature, true);
        });

        it("handles degenerate polygon", () => {
          const expression = spatial.within({
            type: "Polygon",
            coordinates: [
              [
                [0, 0],
                [0, 0],
                [0, 0],
                [0, 0],
              ],
            ],
          });

          getGeometry(
            feature,
            { type: "Point", coordinates: [0, 0] },
            mockCanonical
          );

          testExpression(expression, feature, false);
        });
      });
    });
  });
});
