import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import {MatTooltipModule} from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FuseAlertModule } from '@fuse/components/alert';
import { SharedModule } from 'app/shared/shared.module';

import { TranslocoModule } from '@ngneat/transloco';
import { SharedDirectiveModule } from 'app/directives/shared-directive.module';
import { UserSettingsComponent } from './user-settings.component';
import { UserSettingsAccountComponent } from './account/account.component';
import { UserSettingsSecurityComponent } from './security/security.component';
import { UserSettingsPlanBillingComponent } from './plan-billing/plan-billing.component';
import { UserSettingsNotificationsComponent } from './notifications/notifications.component';
import { UserSettingsCompanyComponent } from './company/company.component';
import { usersettingsRoutes } from './user-settings.routing';
import { SettingLayoutModule } from "../../../layout/common/settings/settingmode.module";


@NgModule({
    declarations: [	
       UserSettingsComponent,
       UserSettingsAccountComponent,
       UserSettingsSecurityComponent,
       UserSettingsPlanBillingComponent,
       UserSettingsNotificationsComponent,
       UserSettingsCompanyComponent,
 
   ],
    imports     : [
        RouterModule.forChild(usersettingsRoutes),
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatTooltipModule,
        MatRadioModule,
        MatSelectModule,
        MatSidenavModule,
        MatSlideToggleModule,
        MatPaginatorModule,
        MatSortModule,
        MatProgressBarModule,
        FuseAlertModule,
        TranslocoModule,
        SharedDirectiveModule,
        SharedModule,
        SettingLayoutModule
    ]
})
export class UserSettingsModule
{
}
