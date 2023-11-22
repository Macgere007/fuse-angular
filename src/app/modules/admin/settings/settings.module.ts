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
import { SettingsComponent } from 'app/modules/admin/settings/settings.component';
import { SettingsAccountComponent } from 'app/modules/admin/settings/account/account.component';
import { SettingsSecurityComponent } from 'app/modules/admin/settings/security/security.component';
import { SettingsPlanBillingComponent } from 'app/modules/admin/settings/plan-billing/plan-billing.component';
import { SettingsNotificationsComponent } from 'app/modules/admin/settings/notifications/notifications.component';
import { SettingsCompanyComponent } from 'app/modules/admin/settings/company/company.component';
import { settingsRoutes } from 'app/modules/admin/settings/settings.routing';
import { TranslocoModule } from '@ngneat/transloco';
import { SettingsTeamComponent } from './team/team.component';
import { SharedDirectiveModule } from 'app/directives/shared-directive.module';
import { SettingLayoutModule } from "../../../layout/common/settings/settingmode.module";

@NgModule({
    declarations: [
        SettingsComponent,
        SettingsAccountComponent,
        SettingsSecurityComponent,
        SettingsPlanBillingComponent,
        SettingsNotificationsComponent,
        SettingsCompanyComponent,
        SettingsTeamComponent,
    ],
    imports: [
        RouterModule.forChild(settingsRoutes),
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
export class SettingsModule
{
}
