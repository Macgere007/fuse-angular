import { Route } from '@angular/router';
import { POSDashboardComponent } from 'app/modules/admin/dashboards/pos/pos-dashboard.component';
import { POSDashboardResolver } from 'app/modules/admin/dashboards/pos/pos-dashboard.resolvers';

export const posDashboardRoutes: Route[] = [
    {
        path     : '',
        component: POSDashboardComponent,
        resolve  : {
            data: POSDashboardResolver
        }
    }
];
