import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Upload, FileText, AlertCircle, Check } from "lucide-react";

export function FileUpload() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [datasetName, setDatasetName] = useState("");
  const [description, setDescription] = useState("");

  const createDataset = useMutation(api.datasets.create);

  const parseJsonl = (text: string) => {
    const lines = text.trim().split('\n');
    const records = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        try {
          const record = JSON.parse(line);
          records.push(record);
        } catch (e) {
          throw new Error(`Invalid JSON on line ${i + 1}: ${line}`);
        }
      }
    }
    
    return records;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const text = await file.text();
      const records = parseJsonl(text);
      
      if (records.length === 0) {
        throw new Error("No valid records found in the file");
      }

      const name = datasetName || file.name.replace(/\.jsonl?$/, '');
      
      await createDataset({
        name,
        description: description || undefined,
        records,
      });

      setSuccess(true);
      setDatasetName("");
      setDescription("");
      // Reset the file input
      event.target.value = "";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to upload file");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card card-border bg-base-100 w-full max-w-2xl">
      <div className="card-body">
        <h2 className="card-title">
          <FileText className="w-5 h-5" />
          Upload JSONL File
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="label">
              <span className="label-text">Dataset Name (optional)</span>
            </label>
            <input
              type="text"
              placeholder="Will use filename if empty"
              className="input input-bordered w-full"
              value={datasetName}
              onChange={(e) => setDatasetName(e.target.value)}
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Description (optional)</span>
            </label>
            <textarea
              placeholder="Describe your dataset..."
              className="textarea textarea-bordered w-full"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Select JSONL File</span>
            </label>
            <input
              type="file"
              accept=".jsonl,.json"
              className="file-input file-input-bordered w-full"
              onChange={handleFileUpload}
              disabled={isLoading}
            />
          </div>

          {isLoading && (
            <div className="alert alert-info">
              <Upload className="w-4 h-4 animate-spin" />
              <span>Processing file...</span>
            </div>
          )}

          {error && (
            <div className="alert alert-error">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <Check className="w-4 h-4" />
              <span>Dataset uploaded successfully!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}