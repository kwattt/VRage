
import '@ragempcommunity/types-server'
import type { AccountTable } from './index';

declare global {
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
  
  export interface VEntityMp {}
  export interface VVehicleMp extends VEntityMp {}
  export interface VCheckpointMp extends VEntityMp {}
  export interface VMarkerMp extends VEntityMp {}
  export interface VLabelMp extends VEntityMp {}
  export interface VPedMp extends VEntityMp {}
  export interface VObjectMp extends VEntityMp {}
  export interface VPlayerMp extends VEntityMp {}
}
