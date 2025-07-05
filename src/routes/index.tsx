import { SignInButton } from "@clerk/clerk-react";
import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Authenticated, Unauthenticated } from "convex/react";
import { Database, Upload } from "lucide-react";
import { api } from "../../convex/_generated/api";
import { FileUpload } from "@/components/FileUpload";

const datasetsQueryOptions = convexQuery(api.datasets.list, {});

export const Route = createFileRoute("/")({
  loader: async ({ context: { queryClient } }) =>
    await queryClient.ensureQueryData(datasetsQueryOptions),
  component: HomePage,
});

function HomePage() {
  return (
    <div className="text-center">
      <div className="not-prose flex justify-center mb-4">
        <Database className="w-16 h-16 text-primary" />
      </div>
      <h1>JSONL Explorer</h1>
      <p className="text-lg opacity-80">Import, explore, and analyze JSON data from JSONL files</p>

      <Unauthenticated>
        <p>Sign in to start exploring your data.</p>
        <div className="not-prose mt-4">
          <SignInButton mode="modal">
            <button className="btn btn-primary btn-lg">
              <Upload className="w-5 h-5" />
              Get Started
            </button>
          </SignInButton>
        </div>
      </Unauthenticated>

      <Authenticated>
        <DatasetsList />
      </Authenticated>
    </div>
  );
}

function DatasetsList() {
  const { data: datasets } = useSuspenseQuery(datasetsQueryOptions);

  return (
    <div className="space-y-8">
      <div className="not-prose">
        <FileUpload />
      </div>

      {datasets.length === 0 ? (
        <div className="not-prose">
          <div className="p-8 bg-base-200 rounded-lg">
            <p className="opacity-70">No datasets yet. Upload your first JSONL file to get started!</p>
          </div>
        </div>
      ) : (
        <>
          <h2>Your Datasets</h2>
          <div className="not-prose grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {datasets.map((dataset) => (
              <div key={dataset._id} className="card card-border bg-base-100 hover:shadow-lg transition-shadow">
                <div className="card-body">
                  <h3 className="card-title text-lg">{dataset.name}</h3>
                  {dataset.description && (
                    <p className="text-sm opacity-70 mb-2">{dataset.description}</p>
                  )}
                  <div className="flex justify-between items-center text-sm opacity-70">
                    <span>{dataset.recordCount} records</span>
                    <span>{dataset.availableFields.length} fields</span>
                  </div>
                  <div className="card-actions justify-end mt-4">
                    <a href={`/dataset/${dataset._id}`} className="btn btn-primary btn-sm">
                      Explore
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
