import { User } from "app/models/user.type"
import { Summary } from "./summary.types";

export interface IStation{
    stationId: number,
    stationName: string,
    stationType: string,
    gridType: string,
    capacity: number,
    longitude: number,
    latitude: number,
    address: string,
    creator: null,
    angle: string,
    slope: string,
    isLoadingDataInProgress: boolean,
    summary?: Summary;
    users: User[]
}
