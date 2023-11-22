import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { Subject } from 'rxjs';


@Component({
    selector: 'summary-card',
    templateUrl: './summary-card.component.html',
    styleUrls: ['./summary-card.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs       : 'summary-card'

})

export class SummaryCardComponent implements OnInit, OnDestroy {
    @Input() summaryIcon: string;
    @Input() summaryTitle: string;
    @Input() mainValue: number;
    @Input() mainValueUnit: string;
    @Input() tooltipValue: string;
    @Input() subValue: number;
    @Input() subValueUnit: string;
    @Input() isShowPercentage: boolean;
    @Input() percentageValue: number;
    @Input() isLoading: boolean;

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    public activeLang: string;

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _translateService: TranslocoService) {

    }

   // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Subscribe to language changes
        this._translateService.langChanges$.subscribe((activeLang) => {

            // Get the active lang
            this.activeLang = activeLang;

            // Update the UI
            this._changeDetectorRef.markForCheck();
        });

    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    formatNumber(Number){
        return Intl.NumberFormat(this.activeLang,{minimumIntegerDigits: 1,minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number);
     }

}
