import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";
import { Table, AlertCircle } from "lucide-react";
import { JSONPath } from "jsonpath-plus";

interface DataTableProps {
  dataset: Doc<"datasets">;
}

export function DataTable({ dataset }: DataTableProps) {
  const records = useQuery(api.datasets.getRecords, { datasetId: dataset._id });

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
    const customField = dataset.customFields.find(cf => cf.name === field);
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

  // Get all fields to display (regular + custom)
  const allDisplayFields = [
    ...dataset.selectedFields,
    ...dataset.customFields.map(cf => cf.name)
  ];

  return (
    <div className="card card-border bg-base-100">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <h3 className="card-title">
            <Table className="w-5 h-5" />
            Data Records ({records.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th className="w-16">#</th>
                {allDisplayFields.map(field => {
                  const customField = dataset.customFields.find(cf => cf.name === field);
                  return (
                    <th key={field} className="font-mono text-sm">
                      <div>
                        <div>{field}</div>
                        {customField && (
                          <div className="text-xs text-base-content/50 font-normal">
                            {customField.jsonPath}
                          </div>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {records.map((record, index) => (
                <tr key={record._id} className="hover:bg-base-200">
                  <td className="font-mono text-sm text-base-content/70">
                    {index + 1}
                  </td>
                  {allDisplayFields.map(field => {
                    const value = extractValueFromRecord(record, field);
                    const formattedValue = formatCellValue(value);
                    const customField = dataset.customFields.find(cf => cf.name === field);
                    
                    return (
                      <td key={field} className="max-w-xs">
                        <div 
                          className={`text-sm ${customField ? 'font-mono' : 'font-mono'}`}
                          title={formattedValue}
                        >
                          {truncateText(formattedValue)}
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
    </div>
  );
}