import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Authenticated, Unauthenticated } from "convex/react";
import { ArrowLeft, Database } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { DataTable } from "@/components/DataTable";
import { FieldSelector } from "@/components/FieldSelector";
import { Id } from "../../../convex/_generated/dataModel";

export const Route = createFileRoute("/dataset/$id")({
  loader: async ({ context: { queryClient }, params }) => {
    const datasetId = params.id as Id<"datasets">;
    const datasetQueryOptions = convexQuery(api.datasets.get, { id: datasetId });
    await queryClient.ensureQueryData(datasetQueryOptions);
  },
  component: DatasetPage,
});

function DatasetPage() {
  const { id } = Route.useParams();
  const datasetId = id as Id<"datasets">;
  
  const datasetQueryOptions = convexQuery(api.datasets.get, { id: datasetId });
  const { data: dataset } = useSuspenseQuery(datasetQueryOptions);

  return (
    <div>
      <Unauthenticated>
        <div className="text-center">
          <p>Sign in to view this dataset.</p>
        </div>
      </Unauthenticated>

      <Authenticated>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="btn btn-ghost btn-sm">
                <ArrowLeft className="w-4 h-4" />
                Back to Datasets
              </Link>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Database className="w-6 h-6" />
                  {dataset.name}
                </h1>
                {dataset.description && (
                  <p className="text-base-content/70 mt-1">{dataset.description}</p>
                )}
              </div>
            </div>
            <div className="not-prose">
              <FieldSelector dataset={dataset} />
            </div>
          </div>

          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Total Records</div>
              <div className="stat-value text-primary">{dataset.recordCount}</div>
            </div>
            <div className="stat">
              <div className="stat-title">Available Fields</div>
              <div className="stat-value text-secondary">{dataset.availableFields.length}</div>
            </div>
            <div className="stat">
              <div className="stat-title">Selected Fields</div>
              <div className="stat-value text-accent">{dataset.selectedFields.length}</div>
            </div>
          </div>

          <div className="not-prose">
            <DataTable dataset={dataset} />
          </div>
        </div>
      </Authenticated>
    </div>
  );
}