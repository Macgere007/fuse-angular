import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { StationCardComponent } from './station-card.component';
import { SharedModule } from 'app/shared/shared.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoCoreModule } from 'app/core/transloco/transloco.module';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommonModule } from '@angular/common';
import { SharedDirectiveModule } from 'app/directives/shared-directive.module';
import { FuseCardModule } from '@fuse/components/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';

@NgModule({
    declarations: [
        StationCardComponent
    ],
    imports     : [
        MatButtonModule,
        MatDividerModule,
        MatIconModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatTooltipModule,
        MatInputModule,
        MatMenuModule,
        MatProgressBarModule,
        TranslocoCoreModule,
        FuseCardModule,
        CommonModule,
        SharedDirectiveModule,
        SharedModule
    ],
    exports     : [
        StationCardComponent
    ]
})
export class StationCardModule
{
}
