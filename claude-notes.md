# Claude Code Notes

## Current Feature: Application Initialization - JSONL Explorer

Building a webapp for JSON record exploration with JSONL import capabilities. If continuing from a fresh session, reread /init-app instructions.

## App Description
- JSONL file import functionality
- Field selection for table display (selecting which JSON properties to show as columns)
- Table view for data exploration
- Future: data editing capabilities

## Progress Status
- ✅ Gathered requirements - JSONL explorer app
- ✅ Asked clarifying questions about field creation
- ✅ Updated package.json name to "jsonl-explorer"
- ✅ Created Convex schema for datasets and records
- ✅ Built file upload component with JSONL parsing
- ✅ Created field selection interface
- ✅ Implemented data table with column configuration
- ✅ Updated routing and removed demo content
- 🔄 Currently testing implementation

## Commits Made During Session
- 8609f73: init: setup JSONL explorer app with updated package name and removed template instructions

## Implementation Details
- **Schema**: datasets table with field tracking, records table with JSON data
- **Components**: FileUpload (JSONL parsing), FieldSelector (dropdown), DataTable (responsive)
- **Routes**: Home page with dataset list, dataset detail page with table view
- **Features**: File upload, field selection, data visualization, responsive design

## Next Steps
- Test implementation with Playwright
- Fix any bugs or issues found
- Ready for commit and final testing