import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";
import { Table, AlertCircle } from "lucide-react";

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
                {dataset.selectedFields.map(field => (
                  <th key={field} className="font-mono text-sm">
                    {field}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((record, index) => (
                <tr key={record._id} className="hover:bg-base-200">
                  <td className="font-mono text-sm text-base-content/70">
                    {index + 1}
                  </td>
                  {dataset.selectedFields.map(field => {
                    const value = record.data[field];
                    const formattedValue = formatCellValue(value);
                    
                    return (
                      <td key={field} className="max-w-xs">
                        <div 
                          className="font-mono text-sm"
                          title={formattedValue}
                        >
                          {truncateText(formattedValue)}
                        </div>
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