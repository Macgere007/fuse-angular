import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseCardModule } from '@fuse/components/card';
import { SharedModule } from 'app/shared/shared.module';
import { SolarmanagementComponent } from 'app/modules/admin/pages/solarmanagement/solarmanagement.component';
import { TranslocoCoreModule } from 'app/core/transloco/transloco.module';
import { StationCardModule } from 'app/components/station-card/station-card.module';

export const routes: Route[] = [
    {
        path     : '',
        component: SolarmanagementComponent
    }
];

@NgModule({
    declarations: [
        SolarmanagementComponent
    ],
    imports     : [
        RouterModule.forChild(routes),
        MatButtonModule,
        MatButtonToggleModule,
        MatCheckboxModule,
        MatDividerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatProgressBarModule,
        MatTooltipModule,
        FuseCardModule,
        TranslocoCoreModule,
        StationCardModule,
        SharedModule
    ]
})
export class SolarmanagementModule
{
}
