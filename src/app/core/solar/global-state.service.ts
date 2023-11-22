import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalStateService {
    private _isStopLongRunningProcess:boolean = false;

    constructor() { }

    public get isStopLongRunningProcess() {
        return this._isStopLongRunningProcess;
    }

    public set isStopLongRunningProcess(state: boolean) {
        this._isStopLongRunningProcess = state;
    }
}
