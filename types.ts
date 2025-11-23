export interface NodeData {
  id: string;      // Unique ID for React keys
  value: number;   // The data stored
  address: string; // Hex address simulation (e.g., 0x3F2A)
  nextAddress: string | null;
  isHead: boolean;
  highlighted: boolean; // For traversal animation
  isTarget: boolean;    // For search hits or deletion targets
  isNew: boolean;       // For insertion animation
}

export interface MemoryBlock {
  address: string;
  occupied: boolean;
  nodeId: string | null;
  value: number | null;
}

export enum OperationType {
  INSERT_HEAD = 'Insert Head',
  INSERT_TAIL = 'Insert Tail',
  INSERT_AT = 'Insert at Position',
  DELETE_HEAD = 'Delete Head',
  DELETE_TAIL = 'Delete Tail',
  DELETE_VAL = 'Delete Value',
  DELETE_ALL_VAL = 'Delete All Values',
  DELETE_AT = 'Delete at Position',
  SEARCH = 'Search',
  CLEAR = 'Clear',
}

export interface LogEntry {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
  timestamp: number;
}