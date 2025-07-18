import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema defines your data model for the database.
// For more information, see https://docs.convex.dev/database/schema
export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
  }).index("by_clerkId", ["clerkId"]),
  
  datasets: defineTable({
    userId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    recordCount: v.number(),
    availableFields: v.array(v.string()), // All unique field names found in the records
    selectedFields: v.array(v.string()), // Fields currently selected for display
    customFields: v.optional(v.array(v.object({
      name: v.string(), // Display name for the field
      jsonPath: v.string(), // JSONPath expression
      type: v.optional(v.union(v.literal("string"), v.literal("number"), v.literal("boolean"), v.literal("array"), v.literal("object"))),
    }))), // Custom JSONPath fields
  }).index("by_userId", ["userId"]),
  
  records: defineTable({
    datasetId: v.id("datasets"),
    userId: v.string(),
    data: v.any(), // The actual JSON record data
  }).index("by_datasetId", ["datasetId"])
   .index("by_userId", ["userId"]),
});
