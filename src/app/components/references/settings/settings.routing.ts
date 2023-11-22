import { Route } from '@angular/router';
import { SettingsComponent } from 'app/modules/admin/settings/settings.component';
import { SettingsResolver } from './settings.resolver';

export const settingsRoutes: Route[] = [
    {
        path     : '',
        component: SettingsComponent,
        resolve: {
            initialData: SettingsResolver
        }
    }
];
