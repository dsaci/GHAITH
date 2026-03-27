import React, { createContext, useContext } from 'react';

const LayoutBranchContext = createContext(false);

export function LayoutBranchProvider({ branchMode, children }: { branchMode: boolean; children: React.ReactNode }) {
    return <LayoutBranchContext.Provider value={branchMode}>{children}</LayoutBranchContext.Provider>;
}

export function useBranchLayout() {
    return useContext(LayoutBranchContext);
}
