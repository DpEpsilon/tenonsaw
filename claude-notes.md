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
- ✅ Tested implementation with Playwright
- ✅ Fixed import paths and linting issues
- ✅ All features working correctly

## Commits Made During Session
- 8609f73: init: setup JSONL explorer app with updated package name and removed template instructions
- cc3249d: feat: implement JSONL explorer with file upload, field selection, and data table

## Implementation Details
- **Schema**: datasets table with field tracking, records table with JSON data
- **Components**: FileUpload (JSONL parsing), FieldSelector (dropdown), DataTable (responsive)
- **Routes**: Home page with dataset list, dataset detail page with table view
- **Features**: File upload, field selection, data visualization, responsive design
- **Testing**: Responsive design tested, console clean, linting passed

## Ready for Use
JSONL Explorer with JSONPath support is complete and functional. Users can:
1. Sign in with Clerk authentication
2. Upload JSONL files with automatic parsing
3. Select which top-level fields to display as table columns
4. **NEW**: Create custom fields using JSONPath expressions for nested/array data
5. View data in a responsive table format with both regular and custom fields
6. Navigate between datasets

## JSONPath Feature Details
- **Custom Field Editor**: Add JSONPath expressions like `$.items[0].name` or `$.user.profile.email`
- **Validation**: Backend validates JSONPath syntax and prevents duplicates
- **Error Handling**: Clear error messages for invalid expressions
- **Data Extraction**: Uses jsonpath-plus library for reliable data extraction
- **Visual Indicators**: Custom fields show JSONPath expression in table headers
- **Type Support**: Optional type hints (string, number, boolean, array, object)