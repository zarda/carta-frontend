import {action, observable} from "mobx";
import {CARTA} from "carta-protobuf";

export class SpatialProfileStore {
    @observable regionId: number;
    @observable fileId: number;
    @observable stokes: number;
    @observable channel: number;
    @observable x: number;
    @observable y: number;
    @observable approximate: boolean;
    @observable profiles: Map<string, CARTA.SpatialProfile>;

    constructor(fileId: number = 0, regionId: number = 0) {
        this.fileId = fileId;
        this.regionId = regionId;
        this.approximate = true;
        this.profiles = new Map<string, CARTA.SpatialProfile>();
    }

    @action setProfile(coordinate: string, profile: CARTA.SpatialProfile) {
        this.profiles.set(coordinate, profile);
    }

    @action setProfiles(profiles: Map<string, CARTA.SpatialProfile>) {
        this.profiles = profiles;
    }
}