# grants.json Schema Reference

Each entry in `grants.json` follows this structure. All fields are required unless noted optional.

## Fields

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique slug identifier, e.g. `"eco4"` |
| `name` | string | Full scheme name |
| `provider` | string | Organisation administering the scheme |
| `category` | string | One of: `retrofit`, `adaptation`, `empty-homes`, `heritage`, `affordable-housing`, `supported-housing` |
| `countries` | array | Subset of `["england","scotland","wales","northern-ireland"]` |
| `propertyTypes` | array | Subset of `["single-dwelling","flat","hmo","block","listed","empty","commercial"]` |
| `tenures` | array | Subset of `["private-landlord","ltd-company","housing-association","registered-provider","charity","other"]` |
| `worksCovered` | array | Subset of `["insulation","heat-pump","boiler-upgrade","solar-pv","battery-storage","glazing","ventilation","full-retrofit","disabled-adaptations","empty-home","heritage-repairs","affordable-homes"]` |
| `maxFunding` | number or null | Maximum grant in GBP if confirmed; `null` if unknown or variable |
| `fundingNotes` | string or null | Plain-language note on funding, always ending with "verify with the provider" if uncertain |
| `tenantCriteria` | array | Subset of `["low-income","benefits","disabled","elderly"]`; empty array if no tenant criteria |
| `epcBands` | array | EPC bands this scheme applies to, e.g. `["D","E","F","G"]` |
| `deadline` | string or null | `"YYYY-MM-DD"` format, or `null` if rolling/unknown |
| `shortDescription` | string | 1–2 sentence summary; must use language like "the scheme states" or "the official page lists" |
| `eligibilitySummary` | array of strings | Bullet points summarising key eligibility criteria |
| `howToApply` | array of strings | Step-by-step application guidance |
| `officialUrl` | string | Full URL to the official scheme page (gov.uk, Ofgem, devolved admin, etc.) |
| `lastVerified` | string | `"YYYY-MM"` format — when this entry was last checked against the official source |
| `verify` | boolean | `true` if any detail could not be confirmed from the official source and needs re-checking |

## Notes on copy standards

- `shortDescription` must never claim the reader qualifies or is eligible.
- Use phrases such as: "the scheme states", "the official page lists", "may apply to properties that...", "verify with the provider".
- `maxFunding` should be `null` and `verify: true` for any figure that cannot be confirmed directly from the official source.
- `lastVerified` must be updated whenever the entry is reviewed.

## Adding a new scheme

1. Copy an existing entry as a template.
2. Fill all fields accurately from the official source page.
3. Set `lastVerified` to the current `YYYY-MM`.
4. Set `verify: true` for any field you could not confirm.
5. Open a pull request describing the source you used.

## Updating an existing scheme

1. Edit the relevant fields in `grants.json`.
2. Update `lastVerified` to the current `YYYY-MM`.
3. If the scheme has ended or been superseded, add a `"status": "closed"` field and note the successor scheme in `fundingNotes`.
