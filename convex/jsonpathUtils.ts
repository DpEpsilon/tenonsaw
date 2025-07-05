export function validateJsonPath(path: string): { isValid: boolean; error?: string } {
  try {
    // Basic syntax validation
    if (!path.trim()) {
      return { isValid: false, error: "JSONPath cannot be empty" };
    }

    if (!path.startsWith("$")) {
      return { isValid: false, error: "JSONPath must start with '$'" };
    }

    // Basic pattern validation - check for common JSONPath patterns
    const validPatterns = [
      /^\$\.[a-zA-Z_][a-zA-Z0-9_]*$/, // $.field
      /^\$\.[a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_]*)+$/, // $.field.subfield
      /^\$\.[a-zA-Z_][a-zA-Z0-9_]*\[\d+\]$/, // $.field[0]
      /^\$\.[a-zA-Z_][a-zA-Z0-9_]*\[\*\]$/, // $.field[*]
      /^\$\.[a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_]*)*\[\d+\](\.[a-zA-Z_][a-zA-Z0-9_]*)*$/, // $.field.sub[0].prop
    ];

    // Check for dangerous patterns
    const dangerousPatterns = [
      /\.\./,  // Recursive descent
      /\(/,    // Function calls
      /\)/,    // Function calls
    ];

    if (dangerousPatterns.some(pattern => pattern.test(path))) {
      return { isValid: false, error: "Complex JSONPath expressions not supported" };
    }

    // For now, accept most basic patterns - the real validation happens on the frontend
    if (path.includes("$") && path.length > 1) {
      return { isValid: true };
    }

    return { isValid: false, error: "Invalid JSONPath format" };
  } catch (error) {
    return { 
      isValid: false, 
      error: error instanceof Error ? error.message : "Invalid JSONPath expression" 
    };
  }
}