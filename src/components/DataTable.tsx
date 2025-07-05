import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";
import { Table, AlertCircle, Maximize2, EyeOff, Settings } from "lucide-react";
import { JSONPath } from "jsonpath-plus";
import { useState, useRef, useCallback } from "react";

interface DataTableProps {
  dataset: Doc<"datasets">;
}

interface ColumnState {
  width: number;
  visible: boolean;
}

export function DataTable({ dataset }: DataTableProps) {
  const records = useQuery(api.datasets.getRecords, { datasetId: dataset._id });
  const [expandedCell, setExpandedCell] = useState<{row: number, field: string, content: string} | null>(null);
  const [columnStates, setColumnStates] = useState<Record<string, ColumnState>>({});
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const resizingRef = useRef<{field: string, startX: number, startWidth: number} | null>(null);

  // Get all fields to display (regular + custom)
  const customFields = dataset.customFields || [];
  const allDisplayFields = [
    ...dataset.selectedFields,
    ...customFields.map(cf => cf.name)
  ];

  // Initialize column states
  const getColumnState = useCallback((field: string): ColumnState => {
    return columnStates[field] || { width: 150, visible: true };
  }, [columnStates]);

  const setColumnState = useCallback((field: string, state: Partial<ColumnState>) => {
    setColumnStates(prev => ({
      ...prev,
      [field]: { ...(prev[field] || { width: 150, visible: true }), ...state }
    }));
  }, []);

  // Mouse event handlers for column resizing
  const handleMouseDown = useCallback((e: React.MouseEvent, field: string) => {
    e.preventDefault();
    resizingRef.current = {
      field,
      startX: e.clientX,
      startWidth: getColumnState(field).width
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizingRef.current) return;
      const deltaX = e.clientX - resizingRef.current.startX;
      const newWidth = Math.max(80, resizingRef.current.startWidth + deltaX);
      setColumnState(resizingRef.current.field, { width: newWidth });
    };
    
    const handleMouseUp = () => {
      resizingRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [getColumnState, setColumnState]);

  const visibleFields = allDisplayFields.filter(field => getColumnState(field).visible);

  if (records === undefined) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="card card-border bg-base-100">
        <div className="card-body text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-warning" />
          <h3 className="text-lg font-semibold">No Records Found</h3>
          <p className="text-base-content/70">This dataset doesn't contain any records.</p>
        </div>
      </div>
    );
  }

  const formatCellValue = (value: any): string => {
    if (value === null || value === undefined) return "";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  const truncateText = (text: string, maxLength: number = 50): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const extractValueFromRecord = (record: any, field: string): any => {
    // Check if this is a custom field
    const customFields = dataset.customFields || [];
    const customField = customFields.find(cf => cf.name === field);
    if (customField) {
      try {
        const result = JSONPath({ path: customField.jsonPath, json: record.data });
        return result.length > 0 ? result[0] : null;
      } catch (error) {
        console.error(`JSONPath error for field "${field}":`, error);
        return `Error: ${error instanceof Error ? error.message : 'Invalid JSONPath'}`;
      }
    }
    // Default to direct property access for regular fields
    return record.data[field];
  };

  return (
    <div className="card card-border bg-base-100">
      <div className="card-body px-2 py-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="card-title">
            <Table className="w-5 h-5" />
            Data Records ({records.length})
          </h3>
          <div className="flex items-center space-x-2">
            <button
              className="btn btn-sm btn-outline"
              onClick={() => setShowColumnSettings(!showColumnSettings)}
            >
              <Settings className="w-4 h-4" />
              Columns
            </button>
          </div>
        </div>

        {/* Column Settings Panel */}
        {showColumnSettings && (
          <div className="mb-3 p-3 bg-base-200 rounded-lg">
            <h4 className="font-semibold mb-3">Column Visibility</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {allDisplayFields.map(field => {
                const isVisible = getColumnState(field).visible;
                const customField = customFields.find(cf => cf.name === field);
                return (
                  <label key={field} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={isVisible}
                      onChange={(e) => setColumnState(field, { visible: e.target.checked })}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-mono truncate">{field}</div>
                      {customField && (
                        <div className="text-xs text-base-content/50 truncate">
                          {customField.jsonPath}
                        </div>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        <div className="overflow-x-auto -mx-2">
          <table className="table table-zebra w-full table-xs">
            <thead>
              <tr>
                <th className="w-12 min-w-12 px-2">#</th>
                {visibleFields.map(field => {
                  const customField = customFields.find(cf => cf.name === field);
                  const columnState = getColumnState(field);
                  return (
                    <th 
                      key={field} 
                      className="font-mono text-xs relative group px-2"
                      style={{ width: columnState.width, minWidth: columnState.width }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="truncate">{field}</div>
                          {customField && (
                            <div className="text-xs text-base-content/50 font-normal truncate leading-tight">
                              {customField.jsonPath}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            className="btn btn-ghost btn-xs"
                            onClick={() => setColumnState(field, { visible: false })}
                            title="Hide column"
                          >
                            <EyeOff className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      {/* Resize handle */}
                      <div
                        className="absolute right-0 top-0 h-full w-1 cursor-col-resize bg-transparent hover:bg-primary/30 transition-colors"
                        onMouseDown={(e) => handleMouseDown(e, field)}
                      />
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {records.map((record, index) => (
                <tr key={record._id} className="hover:bg-base-200">
                  <td className="font-mono text-xs text-base-content/70 w-12 px-2">
                    {index + 1}
                  </td>
                  {visibleFields.map(field => {
                    const value = extractValueFromRecord(record, field);
                    const formattedValue = formatCellValue(value);
                    const customField = customFields.find(cf => cf.name === field);
                    const columnState = getColumnState(field);
                    
                    return (
                      <td 
                        key={field} 
                        className="relative group px-2"
                        style={{ width: columnState.width, maxWidth: columnState.width }}
                      >
                        <div className="flex items-center justify-between">
                          <div 
                            className="text-xs font-mono truncate flex-1 cursor-pointer leading-tight"
                            title={formattedValue}
                            onClick={() => setExpandedCell({
                              row: index,
                              field,
                              content: formattedValue
                            })}
                          >
                            {truncateText(formattedValue, 25)}
                          </div>
                          <button
                            className="btn btn-ghost btn-xs opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                            onClick={() => setExpandedCell({
                              row: index,
                              field,
                              content: formattedValue
                            })}
                            title="Expand cell"
                          >
                            <Maximize2 className="w-3 h-3" />
                          </button>
                        </div>
                        {customField && formattedValue.startsWith('Error:') && (
                          <div className="text-xs text-error mt-1">
                            JSONPath Error
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cell Expansion Modal */}
      {expandedCell && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">
                Row {expandedCell.row + 1} - {expandedCell.field}
              </h3>
              <button
                className="btn btn-sm btn-circle btn-ghost"
                onClick={() => setExpandedCell(null)}
              >
                ✕
              </button>
            </div>
            <div className="bg-base-200 p-4 rounded-lg">
              <pre className="text-sm whitespace-pre-wrap overflow-auto max-h-96">
                {expandedCell.content}
              </pre>
            </div>
            <div className="modal-action">
              <button
                className="btn"
                onClick={() => setExpandedCell(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}