import { useState } from "react"
import { expressionCategories } from "../data/expressions"

interface ExpressionPanelProps {
  onExpressionSelect: (expression: any) => void
}

export function ExpressionPanel({ onExpressionSelect }: ExpressionPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedExpression, setSelectedExpression] = useState<string>("")

  return (
    <div className="expression-panel">
      <h2>Expression Explorer</h2>

      <div className="category-selector">
        <label>Category:</label>
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value)
            setSelectedExpression("")
          }}
        >
          <option value="">Select a category</option>
          {Object.keys(expressionCategories).map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {selectedCategory && (
        <div className="expression-selector">
          <label>Expression:</label>
          <select
            value={selectedExpression}
            onChange={(e) => {
              setSelectedExpression(e.target.value)
              const expr = expressionCategories[selectedCategory]?.find(
                ex => ex.name === e.target.value,
              )
              if (expr)
                onExpressionSelect(expr)
            }}
          >
            <option value="">Select an expression</option>
            {expressionCategories[selectedCategory]?.map(expr => (
              <option key={expr.name} value={expr.name}>
                {expr.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedExpression && (
        <div className="expression-details">
          <h3>{selectedExpression}</h3>
          {(() => {
            const expr = expressionCategories[selectedCategory]?.find(
              ex => ex.name === selectedExpression,
            )
            return (
              <>
                <div className="expression-info">
                  <strong>Description:</strong>
                  {" "}
                  {expr?.description}
                </div>
                {expr?.detailedDescription && (
                  <div className="expression-detailed">
                    <strong>Details:</strong>
                    {" "}
                    {expr.detailedDescription}
                  </div>
                )}
                {expr?.useCase && (
                  <div className="expression-usecase">
                    <strong>Use Cases:</strong>
                    {" "}
                    {expr.useCase}
                  </div>
                )}
                <div className="expression-layer">
                  <strong>Layer Type:</strong>
                  {" "}
                  {expr?.layerType}
                  {" "}
                  |
                  {" "}
                  <strong>Property:</strong>
                  {" "}
                  {expr?.paintProperty}
                </div>
              </>
            )
          })()}
        </div>
      )}
    </div>
  )
}
