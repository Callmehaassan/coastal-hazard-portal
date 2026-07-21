# Debug Session: export-download-failure

- Status: OPEN
- User symptom: CSV, GeoTIFF, and report export buttons do not download files.
- Scope: frontend export action, Next.js export proxy route, backend report export endpoint.

## Hypotheses

1. Frontend export request uses the wrong route, method, or payload.
2. Next.js proxy route returns a non-200 response or strips headers/body incorrectly.
3. Backend `/api/reports/export` fails for one or more formats at runtime.
4. Frontend download logic receives an invalid/empty blob and silently fails.
5. Selected region or export parameters are missing/invalid during button clicks.

## Plan

1. Inspect current frontend export flow and backend export endpoint.
2. Add minimal instrumentation only.
3. Reproduce the failure and collect runtime evidence.
4. Confirm root cause from logs.
5. Apply the smallest safe fix and verify downloads.
