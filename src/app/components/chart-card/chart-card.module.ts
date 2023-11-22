import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { ChartCardComponent } from './chart-card.component';
import { SharedModule } from 'app/shared/shared.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoCoreModule } from 'app/core/transloco/transloco.module';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { NgApexchartsModule } from 'ng-apexcharts';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { SharedDirectiveModule } from 'app/directives/shared-directive.module';

@NgModule({
    declarations: [
        ChartCardComponent
    ],
    imports     : [
        MatButtonModule,
        MatDividerModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatIconModule,
        MatTooltipModule,
        MatProgressBarModule,
        TranslocoCoreModule,
        MatFormFieldModule,
        MatDatepickerModule,
        MatMenuModule,
        MatInputModule,
        SharedDirectiveModule,
        NgApexchartsModule,
        CommonModule,
        SharedModule
    ],
    exports     : [
        ChartCardComponent
    ]
})
export class ChartCardModule
{
}
