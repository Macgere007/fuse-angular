import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { POSDashboardService } from 'app/modules/admin/dashboards/pos/pos-dashboard.service';
import { ProjectService } from '../project/project.service';

@Injectable({
    providedIn: 'root'
})
export class POSDashboardResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _posDashboardService: POSDashboardService,
        private _projectService: ProjectService)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>
    {
        return this._projectService.getData();
    }
}
