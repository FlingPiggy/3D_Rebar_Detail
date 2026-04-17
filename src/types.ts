// Core domain types for the 3D Rebar Detail tool.
// All spatial values are in millimetres (mm).

export interface Model {
  version: '1.0';
  units: 'mm';
  concrete: ConcreteElement[];
  rebarGroups: RebarGroup[];
}

export interface ConcreteElement {
  id: string;
  name: string;
  type: 'box' | 'cylinder';
  /** Base-point in world space [x, y, z] */
  origin: [number, number, number];
  /** box: x/y/z are three edge lengths; cylinder: x=diameter, z=height, y ignored */
  dimensions: { x: number; y: number; z: number };
  /** Euler angles in degrees */
  rotation: [number, number, number];
  color: string;
  opacity: number;
  visible: boolean;
}

export interface RebarGroup {
  id: string;
  name: string;
  visible: boolean;
  color: string;
  /** World-space reference origin for this group */
  origin: [number, number, number];
  shape: RebarShape;
  array: RebarArray;
}

export interface RebarShape {
  plane: 'XY' | 'XZ' | 'YZ';
  /** 2-D path points in the chosen plane, connected as a polyline */
  path: [number, number][];
  /** Index into path[] that maps to the group origin */
  anchorIndex: number;
}

export type RebarArray =
  | { type: 'single' }
  | {
      type: 'linear';
      dirs: {
        axis: 'X' | 'Y' | 'Z';
        spacing: number;
        count: number;
      }[];
    }
  | {
      type: 'circular';
      axis: 'X' | 'Y' | 'Z';
      center: [number, number];
      count: number;
      totalAngle: number;
    }
  | {
      type: 'spiral';
      axis: 'Z';
      center: [number, number];
      radius: number;
      pitch: number;
      turns: number;
      startZ: number;
    };
