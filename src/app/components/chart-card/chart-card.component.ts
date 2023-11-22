import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { TranslocoService } from '@ngneat/transloco';
import { ApexOptions } from 'ng-apexcharts';
import { Subject } from 'rxjs';

interface FilterOptions {
    value: string;
    description: string;
}

@Component({
    selector: 'chart-card',
    templateUrl: './chart-card.component.html',
    styleUrls: ['./chart-card.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs       : 'chart-card'
})

export class ChartCardComponent implements OnInit, OnDestroy {
    @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

    @Input() title: string;
    @Input() filterType: string;
    @Input() filterOptions: FilterOptions[];
    @Input() dateSingleLabel: string;
    @Input() dateStartRangeLabel: string;
    @Input() dateEndRangeLabel: string;
    @Input() mainValue: number;
    @Input() mainValueUnit: string;
    @Input() subValue: string;
    @Input() tooltipValue: string;
    @Input() valuePrecisionDigit: number = 6;
    @Input() chartData: ApexOptions;
    @Input() isLoading: boolean;
    @Input() currentFilter: string;
    @Input() chartClass: string;

    @Output() onDateChanged: EventEmitter<any> = new EventEmitter();
    @Output() onExportClicked: EventEmitter<any> = new EventEmitter();
    @Output() onFilterOptionChanged: EventEmitter<any> = new EventEmitter();

    public _start;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    public activeLang: string;

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _translateService: TranslocoService
    ) {
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    ngOnInit(): void {
        // Subscribe to language changes
        this._translateService.langChanges$.subscribe((activeLang) => {
            // Get the active lang
            this.activeLang = activeLang;
            // Update the UI
            this._changeDetectorRef.markForCheck();
        });
    }

    changeDate(event) {
        this.onDateChanged.emit(event);
    }

    export(event) {
        this.onExportClicked.emit(event);
    }

    optionChange(newOption) {
        this.onFilterOptionChanged.emit(newOption);
    }
}
