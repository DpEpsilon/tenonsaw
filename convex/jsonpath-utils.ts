"use node";

import * as jp from "jsonpath";

export function validateJsonPath(path: string, testData?: any): { isValid: boolean; error?: string } {
  try {
    // Basic syntax validation
    if (!path.trim()) {
      return { isValid: false, error: "JSONPath cannot be empty" };
    }

    if (!path.startsWith("$")) {
      return { isValid: false, error: "JSONPath must start with '$'" };
    }

    // Try to parse the path by testing it against sample data
    const sampleData = testData || { 
      test: "value", 
      nested: { field: "test" }, 
      array: [{ item: "first" }, { item: "second" }] 
    };
    
    jp.query(sampleData, path);
    
    return { isValid: true };
  } catch (error) {
    return { 
      isValid: false, 
      error: error instanceof Error ? error.message : "Invalid JSONPath expression" 
    };
  }
}

export function extractValueWithJsonPath(data: any, path: string): any {
  try {
    const result = jp.query(data, path);
    return result.length > 0 ? result[0] : null;
  } catch {
    return null;
  }
}