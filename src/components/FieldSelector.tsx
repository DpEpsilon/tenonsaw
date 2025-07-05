import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";
import { Settings, Check, X } from "lucide-react";

interface FieldSelectorProps {
  dataset: Doc<"datasets">;
}

export function FieldSelector({ dataset }: FieldSelectorProps) {
  const [selectedFields, setSelectedFields] = useState<string[]>(dataset.selectedFields);
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const updateSelectedFields = useMutation(api.datasets.updateSelectedFields);

  const toggleField = (field: string) => {
    setSelectedFields(prev => 
      prev.includes(field) 
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSelectedFields({
        id: dataset._id,
        selectedFields,
      });
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to save field selection:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setSelectedFields(dataset.selectedFields);
    setIsOpen(false);
  };

  return (
    <div className="dropdown dropdown-end">
      <div 
        tabIndex={0} 
        role="button" 
        className="btn btn-outline btn-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Settings className="w-4 h-4" />
        Select Fields ({dataset.selectedFields.length})
      </div>
      
      {isOpen && (
        <div className="dropdown-content mt-2 p-4 shadow bg-base-100 rounded-box w-80 border">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Select Fields to Display</h3>
              <button 
                className="btn btn-ghost btn-xs"
                onClick={handleCancel}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {dataset.availableFields.map(field => (
                <label key={field} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    checked={selectedFields.includes(field)}
                    onChange={() => toggleField(field)}
                  />
                  <span className="text-sm font-mono">{field}</span>
                </label>
              ))}
            </div>
            
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-xs text-base-content/70">
                {selectedFields.length} of {dataset.availableFields.length} selected
              </span>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => void handleSave()}
                disabled={isSaving}
              >
                {isSaving ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}