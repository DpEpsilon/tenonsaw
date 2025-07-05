import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";
import { validateJsonPath } from "./jsonpathUtils";

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    records: v.array(v.any()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    // Extract all unique field names from records
    const allFields = new Set<string>();
    args.records.forEach(record => {
      if (record && typeof record === 'object') {
        Object.keys(record).forEach(key => allFields.add(key));
      }
    });

    const availableFields = Array.from(allFields);
    
    // Create the dataset
    const datasetId = await ctx.db.insert("datasets", {
      userId: identity.subject,
      name: args.name,
      description: args.description,
      recordCount: args.records.length,
      availableFields,
      selectedFields: availableFields.slice(0, 5), // Select first 5 fields by default
      customFields: [], // Initialize empty custom fields array
    });

    // Insert all records
    await Promise.all(
      args.records.map(record =>
        ctx.db.insert("records", {
          datasetId,
          userId: identity.subject,
          data: record,
        })
      )
    );

    return datasetId;
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    return await ctx.db
      .query("datasets")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("datasets") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const dataset = await ctx.db.get(args.id);
    if (!dataset || dataset.userId !== identity.subject) {
      throw new ConvexError("Dataset not found");
    }

    return dataset;
  },
});

export const updateSelectedFields = mutation({
  args: {
    id: v.id("datasets"),
    selectedFields: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const dataset = await ctx.db.get(args.id);
    if (!dataset || dataset.userId !== identity.subject) {
      throw new ConvexError("Dataset not found");
    }

    await ctx.db.patch(args.id, {
      selectedFields: args.selectedFields,
    });
  },
});

export const getRecords = query({
  args: { datasetId: v.id("datasets") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const dataset = await ctx.db.get(args.datasetId);
    if (!dataset || dataset.userId !== identity.subject) {
      throw new ConvexError("Dataset not found");
    }

    return await ctx.db
      .query("records")
      .withIndex("by_datasetId", (q) => q.eq("datasetId", args.datasetId))
      .collect();
  },
});

export const addCustomField = mutation({
  args: {
    datasetId: v.id("datasets"),
    name: v.string(),
    jsonPath: v.string(),
    type: v.optional(v.union(v.literal("string"), v.literal("number"), v.literal("boolean"), v.literal("array"), v.literal("object"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const dataset = await ctx.db.get(args.datasetId);
    if (!dataset || dataset.userId !== identity.subject) {
      throw new ConvexError("Dataset not found");
    }

    // Validate JSONPath expression
    const validation = validateJsonPath(args.jsonPath);
    if (!validation.isValid) {
      throw new ConvexError(`Invalid JSONPath: ${validation.error}`);
    }

    // Check for duplicate field names
    const customFields = dataset.customFields || [];
    const existingField = customFields.find(f => f.name === args.name);
    if (existingField) {
      throw new ConvexError("Field name already exists");
    }

    const newCustomField = {
      name: args.name,
      jsonPath: args.jsonPath,
      type: args.type,
    };

    await ctx.db.patch(args.datasetId, {
      customFields: [...customFields, newCustomField],
    });
  },
});

export const removeCustomField = mutation({
  args: {
    datasetId: v.id("datasets"),
    fieldName: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const dataset = await ctx.db.get(args.datasetId);
    if (!dataset || dataset.userId !== identity.subject) {
      throw new ConvexError("Dataset not found");
    }

    const customFields = dataset.customFields || [];
    const updatedCustomFields = customFields.filter(
      field => field.name !== args.fieldName
    );

    await ctx.db.patch(args.datasetId, {
      customFields: updatedCustomFields,
    });
  },
});

export const updateCustomField = mutation({
  args: {
    datasetId: v.id("datasets"),
    oldName: v.string(),
    newName: v.string(),
    jsonPath: v.string(),
    type: v.optional(v.union(v.literal("string"), v.literal("number"), v.literal("boolean"), v.literal("array"), v.literal("object"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const dataset = await ctx.db.get(args.datasetId);
    if (!dataset || dataset.userId !== identity.subject) {
      throw new ConvexError("Dataset not found");
    }

    // Validate JSONPath expression
    const validation = validateJsonPath(args.jsonPath);
    if (!validation.isValid) {
      throw new ConvexError(`Invalid JSONPath: ${validation.error}`);
    }

    const customFields = dataset.customFields || [];
    
    // Check for duplicate field names (excluding the field being updated)
    if (args.oldName !== args.newName) {
      const existingField = customFields.find(f => f.name === args.newName);
      if (existingField) {
        throw new ConvexError("Field name already exists");
      }
    }

    const updatedCustomFields = customFields.map(field => 
      field.name === args.oldName
        ? { name: args.newName, jsonPath: args.jsonPath, type: args.type }
        : field
    );

    await ctx.db.patch(args.datasetId, {
      customFields: updatedCustomFields,
    });
  },
});