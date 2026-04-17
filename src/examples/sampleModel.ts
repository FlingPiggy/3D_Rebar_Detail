import type { Model } from '../types'

export const sampleModel: Model = {
  version: '1.0',
  units: 'mm',
  concrete: [
    {
      id: 'concrete_1',
      name: 'Column C1',
      type: 'box',
      origin: [0, 0, 0],
      dimensions: { x: 400, y: 400, z: 3000 },
      rotation: [0, 0, 0],
      color: '#9ca3af',
      opacity: 0.25,
      visible: true,
    },
  ],
  rebarGroups: [
    {
      // 4 corner main bars: single bar shape + 2-direction linear array
      id: 'rebar_1',
      name: 'Main Bars T1',
      visible: true,
      color: '#f59e0b',
      origin: [-150, -150, 50],   // bottom-left corner, 50 mm cover
      shape: {
        plane: 'XZ',
        // vertical straight bar: from z=0 to z=2900 (50 mm top cover)
        path: [[0, 0], [0, 2900]],
        anchorIndex: 0,
      },
      array: {
        type: 'linear',
        dirs: [
          { axis: 'X', spacing: 300, count: 2 },
          { axis: 'Y', spacing: 300, count: 2 },
        ],
      },
    },
    {
      // Rectangular stirrup at mid-height (illustrative single instance)
      id: 'rebar_2',
      name: 'Stirrups',
      visible: true,
      color: '#34d399',
      origin: [-150, -150, 100],
      shape: {
        plane: 'XY',
        // Closed rectangle 300×300 mm
        path: [[0, 0], [300, 0], [300, 300], [0, 300], [0, 0]],
        anchorIndex: 0,
      },
      array: {
        type: 'linear',
        dirs: [
          { axis: 'Z', spacing: 200, count: 14 },
        ],
      },
    },
  ],
}
