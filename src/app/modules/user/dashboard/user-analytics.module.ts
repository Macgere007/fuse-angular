import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgApexchartsModule } from 'ng-apexcharts';
import { SharedModule } from 'app/shared/shared.module';
import { UserAnalyticsComponent } from 'app/modules/user/dashboard/user-analytics.component';
import { useranalyticsRoutes } from 'app/modules/user/dashboard/user-analytics.routing';
import { FuseCardModule } from "../../../../@fuse/components/card/card.module";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { TranslocoCoreModule } from 'app/core/transloco/transloco.module';
import { SummaryCardModule } from 'app/components/summary-card/summary-card.module';
import { SimpleSummaryCardModule } from 'app/components/simple-summary-card/simple-summary-card.module';
import { ChartCardModule } from 'app/components/chart-card/chart-card.module';
import { SharedDirectiveModule } from 'app/directives/shared-directive.module';


@NgModule({
    declarations: [
        UserAnalyticsComponent
    ],
    imports: [
        RouterModule.forChild(useranalyticsRoutes),
        MatButtonModule,
        MatButtonToggleModule,
        MatDividerModule,
        MatIconModule,
        MatMenuModule,
        MatProgressBarModule,
        MatSortModule,
        MatTableModule,
        MatTooltipModule,
        NgApexchartsModule,
        SharedModule,
        FuseCardModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatNativeDateModule,
        MatInputModule,
        TranslocoCoreModule,
        SummaryCardModule,
        SimpleSummaryCardModule,
        SharedDirectiveModule,
        ChartCardModule
    ]
})
export class UserAnalyticsModule
{
}
