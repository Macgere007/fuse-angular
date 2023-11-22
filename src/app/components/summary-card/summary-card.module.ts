import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { SummaryCardComponent } from './summary-card.component';
import { SharedModule } from 'app/shared/shared.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoCoreModule } from 'app/core/transloco/transloco.module';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommonModule } from '@angular/common';
import { SharedDirectiveModule } from 'app/directives/shared-directive.module';

@NgModule({
    declarations: [
        SummaryCardComponent
    ],
    imports     : [
        MatButtonModule,
        MatDividerModule,
        MatIconModule,
        MatTooltipModule,
        MatProgressBarModule,
        TranslocoCoreModule,
        SharedDirectiveModule,
        CommonModule,
        SharedModule
    ],
    exports     : [
        SummaryCardComponent
    ]
})
export class SummaryCardModule
{
}
