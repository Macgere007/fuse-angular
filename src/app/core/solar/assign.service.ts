import { Injectable } from '@angular/core';
import { API, Auth } from 'aws-amplify';
import { environment } from 'environments/environment';
import { AuthService } from '../auth/auth.service';
import { Assign } from './assign.types';
import { UnAssign } from './UnAssign.types';

@Injectable({
  providedIn: 'root'
})
export class AssignService {
    private _assignUrl:string = '/assign';
    private _apiName: string = environment.stationApiName;

    constructor(private _authService: AuthService) { }

    async assignStation(assign:Assign): Promise<any> {
        const headers = {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`
        };
        const body = assign;
        const options = {headers: headers, body: body};
        const path = `${this._assignUrl}/assignStation`;

        const promise = API.post(this._apiName, path, options).then(
            (result) => {
                return result.message.items;
            },
            (err) => {
                throw(err);
            }
        );

        return promise;
    }

    async unassignStation(unassign:UnAssign): Promise<any> {
        const headers = {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`
        };
        const body = unassign;
        const options = {headers: headers, body: body};
        const path = `${this._assignUrl}/unassignStation`;

        const promise = API.del(this._apiName, path, options).then(
            (result) => {
                return result.message.items;
            },
            (err) => {
                throw(err);
            }
        );

        return promise;
    }
}
