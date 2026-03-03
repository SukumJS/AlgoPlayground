# Explanation Modules

This directory contains logic for producing human‑readable descriptions of
individual animation steps used by the various visualizers. Logic is split by
algorithm (and eventually by category) so that:

- adding a new algorithm only requires creating a single file,
- the central engine (`useStepSortEngine`) stays lean and focussed, and
- the explanations themselves can be unit tested or maintained in isolation.

## Structure

```
explanations/
├─ README.md            ← this document
├─ explanationUtils.ts  ← shared helpers & types
├─ index.ts             ← top‑level dispatcher
└─ sort/                ← sorting algorithms
   ├─ index.ts          ← dispatcher for sort algorithms
   ├─ bubbleSort.ts     ← bubble‑sort explanations
   ├─ selectionSort.ts  ← selection‑sort explanations
   ├─ insertionSort.ts  ← insertion‑sort explanations
   └─ mergeSort.ts      ← merge‑sort explanations
```

### Adding a new algorithm

1. Create a new file under `sort/` (or a different subdirectory if the category
   changes).
2. Export a function named `explain&lt;Name&gt;` accepting an
   `ExplanationContext` and returning `string | undefined`.
3. Add an entry to `sort/index.ts` mapping the `algoType` key (e.g.
   `"heap"`) to the exported function.

### Adding a new category

1. Create a new subdirectory with its own dispatcher and explanation files.
2. Update the top–level `getExplanation` in `explanations/index.ts` to handle
   the new category.
3. Pass the corresponding `category` value from the controller (see
   `useSortController` for the sorting example).

The code in `useStepSortEngine` already passes along both the category and the
algorithm name; the visualizer's URL query parameters can be used as the
source of truth.
