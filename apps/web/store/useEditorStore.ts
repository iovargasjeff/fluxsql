import { create } from 'zustand'
import {
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
} from '@xyflow/react'

interface EditorStore {
  nodes: Node[]
  edges: Edge[]
  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  setNodesAndEdges: (nodes: Node[], edges: Edge[]) => void
  sqlValue: string
  setSqlValue: (value: string) => void
}

export const useEditorStore = create<EditorStore>((set) => ({
  nodes: [],
  edges: [],
  onNodesChange: (changes) =>
    set((state) => ({ nodes: applyNodeChanges(changes, state.nodes) })),
  onEdgesChange: (changes) =>
    set((state) => ({ edges: applyEdgeChanges(changes, state.edges) })),
  setNodesAndEdges: (nodes, edges) => set({ nodes, edges }),
  sqlValue: '',
  setSqlValue: (value) => set({ sqlValue: value }),
}))
