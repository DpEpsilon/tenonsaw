import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";
import { Plus, X, Edit, Save, Code } from "lucide-react";

interface CustomFieldEditorProps {
  dataset: Doc<"datasets">;
}

export function CustomFieldEditor({ dataset }: CustomFieldEditorProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newField, setNewField] = useState({
    name: "",
    jsonPath: "",
    type: "string" as const,
  });

  const addCustomField = useMutation(api.datasets.addCustomField);
  const removeCustomField = useMutation(api.datasets.removeCustomField);
  const updateCustomField = useMutation(api.datasets.updateCustomField);

  const handleAddField = async () => {
    if (!newField.name.trim() || !newField.jsonPath.trim()) return;

    setError(null);
    try {
      await addCustomField({
        datasetId: dataset._id,
        name: newField.name.trim(),
        jsonPath: newField.jsonPath.trim(),
        type: newField.type,
      });
      setNewField({ name: "", jsonPath: "", type: "string" });
      setIsAdding(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to add custom field";
      setError(errorMessage);
      console.error("Failed to add custom field:", error);
    }
  };

  const handleRemoveField = async (fieldName: string) => {
    try {
      await removeCustomField({
        datasetId: dataset._id,
        fieldName,
      });
    } catch (error) {
      console.error("Failed to remove custom field:", error);
    }
  };

  const handleUpdateField = async (oldName: string, updatedField: { name: string; jsonPath: string; type: string }) => {
    try {
      await updateCustomField({
        datasetId: dataset._id,
        oldName,
        newName: updatedField.name,
        jsonPath: updatedField.jsonPath,
        type: updatedField.type as any,
      });
      setEditingField(null);
    } catch (error) {
      console.error("Failed to update custom field:", error);
    }
  };

  return (
    <div className="card card-border bg-base-100">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <h3 className="card-title">
            <Code className="w-5 h-5" />
            Custom JSONPath Fields
          </h3>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setIsAdding(true)}
            disabled={isAdding}
          >
            <Plus className="w-4 h-4" />
            Add Field
          </button>
        </div>

        <div className="space-y-3">
          {/* Add new field form */}
          {isAdding && (
            <div className="card card-border bg-base-200 p-4">
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="label label-text-sm">Field Name</label>
                    <input
                      type="text"
                      placeholder="e.g., First Item"
                      className="input input-sm input-bordered w-full"
                      value={newField.name}
                      onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label label-text-sm">JSONPath Expression</label>
                    <input
                      type="text"
                      placeholder="e.g., $.items[0].name"
                      className="input input-sm input-bordered w-full font-mono"
                      value={newField.jsonPath}
                      onChange={(e) => setNewField({ ...newField, jsonPath: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label label-text-sm">Type</label>
                    <select
                      className="select select-sm select-bordered w-full"
                      value={newField.type}
                      onChange={(e) => setNewField({ ...newField, type: e.target.value as any })}
                    >
                      <option value="string">String</option>
                      <option value="number">Number</option>
                      <option value="boolean">Boolean</option>
                      <option value="array">Array</option>
                      <option value="object">Object</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => {
                      setIsAdding(false);
                      setNewField({ name: "", jsonPath: "", type: "string" });
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => void handleAddField()}
                    disabled={!newField.name.trim() || !newField.jsonPath.trim()}
                  >
                    <Save className="w-4 h-4" />
                    Add Field
                  </button>
                </div>
                {error && (
                  <div className="alert alert-error alert-sm">
                    <span className="text-sm">{error}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Existing custom fields */}
          {dataset.customFields.map((field) => (
            <CustomFieldRow
              key={field.name}
              field={field}
              isEditing={editingField === field.name}
              onEdit={() => setEditingField(field.name)}
              onCancelEdit={() => setEditingField(null)}
              onUpdate={(updatedField) => void handleUpdateField(field.name, updatedField)}
              onRemove={() => void handleRemoveField(field.name)}
            />
          ))}

          {dataset.customFields.length === 0 && !isAdding && (
            <div className="text-center py-8 text-base-content/50">
              <Code className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No custom fields yet.</p>
              <p className="text-sm">Add JSONPath expressions to access nested data.</p>
            </div>
          )}
        </div>

        {/* JSONPath help */}
        <div className="mt-6 p-4 bg-info/10 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">JSONPath Examples:</h4>
          <div className="space-y-1 text-xs font-mono">
            <div><code>$.name</code> - Root level field</div>
            <div><code>$.user.email</code> - Nested object field</div>
            <div><code>$.items[0]</code> - First item in array</div>
            <div><code>$.items[*].name</code> - All names in items array</div>
            <div><code>$.data.results[0].value</code> - Deep nested access</div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CustomFieldRowProps {
  field: { name: string; jsonPath: string; type?: string };
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onUpdate: (field: { name: string; jsonPath: string; type: string }) => void;
  onRemove: () => void;
}

function CustomFieldRow({ field, isEditing, onEdit, onCancelEdit, onUpdate, onRemove }: CustomFieldRowProps) {
  const [editForm, setEditForm] = useState({
    name: field.name,
    jsonPath: field.jsonPath,
    type: field.type || "string",
  });

  if (isEditing) {
    return (
      <div className="card card-border bg-base-200 p-4">
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="label label-text-sm">Field Name</label>
              <input
                type="text"
                className="input input-sm input-bordered w-full"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div>
              <label className="label label-text-sm">JSONPath Expression</label>
              <input
                type="text"
                className="input input-sm input-bordered w-full font-mono"
                value={editForm.jsonPath}
                onChange={(e) => setEditForm({ ...editForm, jsonPath: e.target.value })}
              />
            </div>
            <div>
              <label className="label label-text-sm">Type</label>
              <select
                className="select select-sm select-bordered w-full"
                value={editForm.type}
                onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
              >
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                <option value="array">Array</option>
                <option value="object">Object</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button className="btn btn-sm btn-ghost" onClick={onCancelEdit}>
              Cancel
            </button>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => onUpdate(editForm)}
              disabled={!editForm.name.trim() || !editForm.jsonPath.trim()}
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
      <div className="flex-1">
        <div className="font-semibold text-sm">{field.name}</div>
        <div className="font-mono text-xs text-base-content/70">{field.jsonPath}</div>
        {field.type && (
          <div className="badge badge-sm badge-outline mt-1">{field.type}</div>
        )}
      </div>
      <div className="flex space-x-1">
        <button
          className="btn btn-ghost btn-xs"
          onClick={onEdit}
        >
          <Edit className="w-3 h-3" />
        </button>
        <button
          className="btn btn-ghost btn-xs text-error"
          onClick={onRemove}
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}