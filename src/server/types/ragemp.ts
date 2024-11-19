/// <reference types="@ragempcommunity/types-server" />

declare global {
  interface Mp {
    v: VMp
  }

  interface PlayerMp {
    v: VPlayerMp
  }
  interface VehicleMp {
    v: VVehicleMp
  }
  interface CheckpointMp {
    v: VCheckpointMp
  }
  interface MarkerMp {
    v: VMarkerMp
  }
  interface LabelMp {
    v: VLabelMp
  }
  interface PedMp {
    v: VPedMp
  }
  interface ObjectMp {
    v: VObjectMp
  }
  interface EntityMp {
    v: VEntityMp
  }

  // Keep these inside global but make them available globally
  interface VEntityMp {}
  interface VVehicleMp extends VEntityMp {}
  interface VCheckpointMp extends VEntityMp {}
  interface VMarkerMp extends VEntityMp {}
  interface VLabelMp extends VEntityMp {}
  interface VPedMp extends VEntityMp {}
  interface VObjectMp extends VEntityMp {}
  interface VPlayerMp extends VEntityMp {}
  interface VMp {}
}

// Make them available for import
export type VEntityMp = globalThis.VEntityMp
export type VVehicleMp = globalThis.VVehicleMp
export type VCheckpointMp = globalThis.VCheckpointMp
export type VMarkerMp = globalThis.VMarkerMp
export type VLabelMp = globalThis.VLabelMp
export type VPedMp = globalThis.VPedMp
export type VObjectMp = globalThis.VObjectMp
export type VPlayerMp = globalThis.VPlayerMp
export type VMp = globalThis.VMp