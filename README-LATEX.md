# LaTeX Support for Course Creator

This document explains how to use the LaTeX support for creating math assignments and content in the Skill Sprint course creator.

## Overview

The LaTeX integration allows instructors to:

- Create beautiful math equations and formulas
- Design interactive math assignments
- Include complex mathematical notation in course content
- Preview LaTeX rendering in real-time

## Components Added

1. **MathRenderer** - A utility component for rendering LaTeX expressions
2. **MarkdownWithMath** - Enhanced markdown renderer with LaTeX math support
3. **MathEditor** - Rich editor with LaTeX shortcuts and preview
4. **MathExamples** - Showcase component with example math content

## Usage Guide

### Basic LaTeX Syntax

- **Inline Math**: Use single dollar signs `$...$`
  - Example: `$f(x) = x^2$` will render as $f(x) = x^2$

- **Display Math**: Use double dollar signs `$$...$$`
  - Example: 
    ```
    $$\int_{a}^{b} f(x) dx$$
    ```
    Will render as:
    $$\int_{a}^{b} f(x) dx$$

### Creating Math Content in Course Builder

1. Go to the Course Builder
2. Create or edit a sprint
3. In the Sprint Content Editor, click "Add Math Assignment"
4. Use the math editor to create content with LaTeX
5. You can use the built-in LaTeX templates or create your own

### Common Math Expressions

| Math Concept | LaTeX Code | Rendered Output |
|--------------|------------|-----------------|
| Fraction | `\frac{a}{b}` | $\frac{a}{b}$ |
| Square Root | `\sqrt{x}` | $\sqrt{x}$ |
| Exponent | `x^{n}` | $x^{n}$ |
| Subscript | `x_{i}` | $x_{i}$ |
| Greek Letters | `\alpha, \beta, \gamma` | $\alpha, \beta, \gamma$ |
| Summation | `\sum_{i=1}^{n} x_{i}` | $\sum_{i=1}^{n} x_{i}$ |
| Integral | `\int_{a}^{b} f(x) dx` | $\int_{a}^{b} f(x) dx$ |
| Limit | `\lim_{x \to 0} f(x)` | $\lim_{x \to 0} f(x)$ |

### Advanced LaTeX Features

- **Matrices**:
  ```
  \begin{pmatrix} 
  a & b \\
  c & d 
  \end{pmatrix}
  ```

- **Systems of Equations**:
  ```
  \begin{cases}
  3x + 5y + z = 0 \\
  7x - 2y + 4z = 0 \\
  -6x + 3y + 2z = 0
  \end{cases}
  ```

- **Chemical Equations** (requires additional LaTeX packages):
  ```
  \ce{H2O + CO2 -> H2CO3}
  ```

## Technical Implementation Details

### Libraries Used

- **KaTeX** - Fast, accurate LaTeX rendering
- **react-katex** - React wrapper for KaTeX
- **rehype-katex** - rehype plugin for rendering math with KaTeX
- **remark-math** - remark plugin for identifying math in markdown

### Integration with Existing Components

The LaTeX support is fully integrated with the course builder workflow:

1. **Sprint Content Editor**: Can add and edit math content
2. **Sprint View**: Displays rendered LaTeX math for students
3. **Quiz System**: Supports math in questions and answers

### Performance Considerations

The KaTeX library was chosen for its performance advantages:

- Faster than alternatives like MathJax
- No client-side JavaScript required
- Works well with server-side rendering

## Troubleshooting

### Common Issues

- **Syntax Errors**: Check your LaTeX syntax if equations don't render
- **Missing Braces**: Ensure all opening braces `{` have matching closing braces `}`
- **Escaping Characters**: Some symbols need to be escaped with a backslash

### Example Error Messages

- `KaTeX parse error: Expected 'EOF', got '}'` - Unmatched braces
- `KaTeX parse error: Command not found` - Using unsupported LaTeX commands

## Resources

- [KaTeX Documentation](https://katex.org/docs/supported.html)
- [LaTeX Math Symbols Reference](https://en.wikibooks.org/wiki/LaTeX/Mathematics)
- [Online LaTeX Equation Editor](https://www.latex4technics.com/)
- [LaTeX Cheat Sheet (PDF)](https://wch.github.io/latexsheet/) 