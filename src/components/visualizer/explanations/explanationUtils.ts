import type { Node } from "@xyflow/react";

/**
 * A context object containing the current and previous nodes for a single
 * animation step plus some convenient derived lists.  The exact type of a
 * node's `data` field is left generic so that the same helpers can serve both
 * sorting and tree algorithms (and others in future).
 */
export interface ExplanationContext<T extends Record<string, unknown> = Record<string, unknown>> {
    // optional metadata useful for dispatchers that handle multiple
    // categories/algorithms.  Sort explanation helpers can safely ignore these
    // fields.
    algorithm?: string;
    category?: string;
    extra?: T;

    currentNodes: Node<T>[];
    prevNodes: Node<T>[];

    newlyComparing: Node<T>[];
    newlySwapping: Node<T>[];
    newlySorted: Node<T>[];
    newlyMerging: Node<T>[];

    justResetToIdle: Node<T>[];

    /**
     * Convenience helper for filtering the current node list by an arbitrary
     * status value.  The meaning of "status" is defined by the caller.
     */
    getNodesByStatus: (status: string) => Node<T>[];
}

/**
 * Build an ExplanationContext from two sequential steps.  The engine code in
 * `useStepSortEngine` uses this helper so that per–algorithm modules don't have
 * to reinvent the same filtering logic over and over.
 */
export function makeContext<T extends Record<string, unknown> = Record<string, unknown>>(
    currentNodes: Node<T>[],
    prevNodes: Node<T>[]
): ExplanationContext<T> {
    // many algorithms piggy‑back status flags on the node data; we conservatively
    // treat `data` as an object that may contain a string `status` field. the
    // casts below are local to the filtering logic and don't leak outside this
    // function.
    type WithStatus = { status?: string };

    const getNodesByStatus = (nodes: Node<T>[], status: string) =>
        nodes.filter((n) => {
            const d = n.data as WithStatus | undefined;
            return d?.status === status;
        }) as Node<T>[];

    const newlySet = (status: string) =>
        currentNodes.filter((cn) => {
            const c = (cn.data as WithStatus)?.status;
            if (c !== status) return false;
            const pn = prevNodes.find(p => p.id === cn.id);
            const pstat = (pn?.data as WithStatus)?.status;
            return !pn || pstat !== status;
        });

    const justResetToIdle = currentNodes.filter((cn) => {
        const pn = prevNodes.find(p => p.id === cn.id);
        const cstat = (cn.data as WithStatus)?.status;
        const pstat = (pn?.data as WithStatus)?.status;
        return cstat === 'idle' && pn && pstat !== 'idle';
    });

    return {
        currentNodes,
        prevNodes,
        newlyComparing: newlySet('compare'),
        newlySwapping: newlySet('swap'),
        newlySorted: newlySet('sorted'),
        newlyMerging: newlySet('merge'),
        justResetToIdle,
        getNodesByStatus: (status: string) => getNodesByStatus(currentNodes, status),
    };
}
