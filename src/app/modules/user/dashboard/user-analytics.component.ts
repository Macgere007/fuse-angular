import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation, Inject, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ApexOptions } from 'ng-apexcharts';
import { MatMenuTrigger } from '@angular/material/menu';
import { CloudUser } from 'app/core/user/user.types';
import { UserService } from 'app/core/user/user.service';
import { AvailableLangs, TranslocoService } from '@ngneat/transloco';
import { LookupService } from 'app/core/solar/lookup.service';
import { Weather } from 'app/core/solar/weather.types';
import { Summary } from 'app/core/solar/summary.types';
import { Power } from 'app/core/solar/power.types';
import { FuseLoadingService } from '@fuse/services/loading';
import { Energy } from 'app/core/solar/energy.types';
import { CloudUserService } from 'app/core/user/cloud.user.service';
import { User } from 'app/models/user.type';
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import moment from 'moment';
import 'moment/locale/id';
import 'moment/locale/en-gb';


@Component({
    selector: 'user-analytics',
    templateUrl: './user-analytics.component.html',
    styleUrls: ['./user-analytics.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserAnalyticsComponent implements OnInit, OnDestroy {
    @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
    @ViewChild("nostation", { static: true }) public nostation;
    public chartPLTS: ApexOptions;
    public chartEnergy: ApexOptions;
    public energyStats: ApexOptions;
    public powerStats: ApexOptions;
    public data: any;
    public user: CloudUser;
    public weather: Weather = {
        "current": {
            "weather": [{id:804, main:'Clouds', description:'overcast cloud', icon: '04d'}],
            "wind_speed": 0,
            "humidity": 0,
            "clouds": 0
        },
    };
    public summary: Summary = {
        stationName: '',
        stationStatusDesc: '',
        totalElec: 0,
        dayElec: 0,
        monthElec: 0,
        yearElec: 0,
        loadPower: 0,
        gridPower: 0,
        generatedPower: 0,
        powerMax: 0,
        co2: 0,
        coal: 0,
        forest: 0,
        price: 0,
        todayIncome: 0,
        totalIncome: 0,
        unit: 'IDR',
        capacity: 0,
        pvMaxKwh: 0,
        pvMaxKwhUpdated: '',
        pvMaxPowerUpdated: ''
    };
    public stationMe: string = ''
    public stationname: string = ''
    public stationMe0: boolean = false

    public powerType: "daily" | "weekly" = "daily"
    public energyType: "daily" | "monthly" | "yearly" = "daily"
    public elec: "dayElec" | "monthElec" = "dayElec"
    public powerDate: Date = new Date(Date.now())
    public energyDate: Date = new Date(Date.now())
    public DatePowerLabelNow: string = moment(Date.now()).format("MMMM DD YYYY")
    public DateEnergyLabelNow: string = moment(Date.now()).format("MMMM DD YYYY")
    public DatePowerWeekLabel: string = moment(Date.now()).subtract(1, 'weeks').format("MMMM DD YYYY")
    public DatePowerMonthlyLabel: string
    public DateEnergyWeekLabel: string = moment(Date.now()).subtract(1, 'month').format("MMMM DD YYYY")
    public TodayIncomeLabel: string;
    public plnTriger = 0
    public power?: Power = {
        station: '',
        highestPLTS: 0,
        unit: 'kW',
        dataPLTS: [],
        dataLoad: [],
        dataGrid: []
    };
    public energy?: Energy = {
        energyStatisticOutputs: undefined,
        totalEnergy: 0,
        dataPLTS: [],
        unit: 'kWh'
    };
    public currentuser: User;
    public userStations = [""];
    public userStationId = '';
    public userStationsName: string = ''
    public userStationLatitude: string = '-6.871444870089971';
    public userStationLongitude: string = '107.56806953047888';
    public userrole: string;
    public isLoadingSummary: boolean = false;
    public isLoadingDashboard: boolean = false;
    public isloadingPowerGraph: boolean = true;
    public isloadingEnergyGraph: boolean = true;
    public isShowVideoPlaceholder: boolean = true;
    public availableLangs: AvailableLangs;
    public pvmaxkwh:string;
    public pvmaxpower:string;
    public activeLang: string;
    public activeLangTitle: string;

    private _loadingDelay: number = 0;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */

    constructor(
        private _router: Router,
        private _activeRouter: ActivatedRoute,
        private _userService: UserService,
        private _translateService: TranslocoService,
        private _lookupService: LookupService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _cloudUserService: CloudUserService,
    ) {
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {

        setTimeout(() => {
            this.isLoadingDashboard = true
            this._changeDetectorRef.detectChanges();
        }, 1000);

        // data series disediakan
        let powerChart: any = {
            series: {
                'daily': [
                    {
                        'name': 'Power',
                        'data': []
                    },
                    {
                        'name': 'Load',
                        'data': []
                    },
                ],
            }
        }

        let energyChart: any = {
            series: {
                'daily':
                    [
                        {
                            'name': 'Energy',
                            'data': []
                        },
                    ],
            }
        }

        // Subscribe to language changes
        this._translateService.langChanges$.subscribe((activeLang) => {

            // Get the active lang
            this.activeLang = activeLang;
            moment.locale(activeLang);

            if (this.summary) {
                this.updateSummaryLabel();
            }

            this.updatePowerDateValues();
            this.updateEnergyDateValues();

            this.isloadingEnergyGraph = true;
            this.isloadingPowerGraph = true;
            // Update the UI
            this._changeDetectorRef.markForCheck();

            // wait for the translation language file loaded
            setTimeout(() => {
                this._PowerChartData(this.power);
                this._EnergyChartData(this.energy);

                this.isloadingEnergyGraph = false;
                this.isloadingPowerGraph = false;

                this._changeDetectorRef.markForCheck();
            }, 500);
        });

        this._PowerChartData(powerChart.series);
        this._EnergyChartData(energyChart.series);

        // user
        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: CloudUser) => {
                this.user = user;
            });

        this._cloudUserService.getCurrentUser().then(
            (result) => {
                this.currentuser = result.item;
                this.userStations = this.currentuser.station;
                this.userStationsName = this.currentuser.stationname.join(' & ');
                this.powerDate = new Date(Date.now())

                if (this._activeRouter.snapshot.params.station) {
                    const stationParams = this._activeRouter.snapshot.params.station.split('&');
                    this.userStationId = stationParams[0];
                    this.userStationsName = stationParams[1];
                    this.userStationLatitude = stationParams[2];
                    this.userStationLongitude = stationParams[3];

                    this.getAllGraph(this.userStationId);
                    this.getStationWeather();
                } else {
                    if (this.userStations.join('&') === '') {
                        this.stationMe0 = true
                    } else {
                        this.getAllGraph(this.userStations.join('&'))
                    }
                }

                this._changeDetectorRef.detectChanges();
            },
            (err) => {
            }
        )


        // Attach SVG fill fixer to all ApexCharts
        window['Apex'] = {
            chart: {
                events: {
                    mounted: (chart: any, options?: any): void => {
                        this._fixSvgFill(chart.el);
                    },
                    updated: (chart: any, options?: any): void => {
                        this._fixSvgFill(chart.el);
                    }
                }
            }
        };
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Fix the SVG fill references. This fix must be applied to all ApexCharts
     * charts in order to fix 'black color on gradient fills on certain browsers'
     * issue caused by the '<base>' tag.
     *
     * Fix based on https://gist.github.com/Kamshak/c84cdc175209d1a30f711abd6a81d472
     *
     * @param element
     * @private
     */
    private _fixSvgFill(element: Element): void {
        // Current URL
        const currentURL = this._router.url;

        // 1. Find all elements with 'fill' attribute within the element
        // 2. Filter out the ones that doesn't have cross reference so we only left with the ones that use the 'url(#id)' syntax
        // 3. Insert the 'currentURL' at the front of the 'fill' attribute value
        Array.from(element.querySelectorAll('*[fill]'))
            .filter(el => el.getAttribute('fill').indexOf('url(') !== -1)
            .forEach((el) => {
                const attrVal = el.getAttribute('fill');
                el.setAttribute('fill', `url(${currentURL}${attrVal.slice(attrVal.indexOf('#'))}`);
            });
    }

    public hideControls($event) {
        console.log('hideControls');
        this.isShowVideoPlaceholder = false;
    }

    public importExcelEnergyYield():void{
        const fileType =
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
        const fileExtension = ".xlsx";
        let csvData = []
        const fileName = `Energy ${this.stationMe} ${this.energyType} ${this.energyDate}`
        for (let i = 0; i < this.energy.dataPLTS.length; i++){
          const data = {
            no: (i + 1),
            date: moment(new Date(this.energy.dataPLTS[i].x)).format(' h:mm a, MMMM Do YYYY'),
            energy: this.energy.dataPLTS[i].y,
          }
          csvData.push(data)
        }

        const ws = XLSX.utils.json_to_sheet(csvData);
        const wb = { Sheets: { data: ws }, SheetNames: ["data"] };

        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: fileType });

        FileSaver.saveAs(data, fileName + fileExtension);
    }

    public importExcelPowerGraph(): void {
        const fileType =
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
        const fileExtension = ".xlsx";

        let csvData = []
        const fileName = `Power station ${this.stationMe} ${this.powerType} ${this.powerDate}`

        for (let i = 0; i < this.power.dataPLTS.length; i++) {
            const data = {
                no: (i + 1),
                date: moment(new Date(this.power.dataPLTS[i].x)).format(' h:mm a, MMMM Do YYYY'),
                data_PLTS: this.power.dataPLTS[i].y,
                data_PLN: this.power.dataGrid[i].y,
                data_Beban: this.power.dataLoad[i].y
            }
            csvData.push(data)
        }

        const ws = XLSX.utils.json_to_sheet(csvData);
        const wb = { Sheets: { data: ws }, SheetNames: ["data"] };

        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: fileType });

        FileSaver.saveAs(data, fileName + fileExtension);
    }

    public selectAllStation() {
        this.stationMe = this.userStations.join('&')
        this.getAllGraph(this.userStations.join('&'))
        this._changeDetectorRef.detectChanges();
    }

    public getStationWeather() {
        this._lookupService.getCurrentWeather(this.userStationLatitude, this.userStationLongitude).then(
            (result) => {
                console.log('after finish call getCurrentWeather');

                setTimeout(() => {
                    this.weather = result;
                    console.log('weather timeout', result);
                    this._changeDetectorRef.detectChanges();
                }, this._loadingDelay);
            },
            (err) => {
            }
        );
    }

    //Button Change Data
    public getAllGraph(s: string): void {
        console.log('getAllGraph', s);

        //PowerGraph
        if (this.stationMe.includes(s)) {
            this.stationMe = this.stationMe.split('&').filter(item => item !== s).join('&')
        } else {
            if (this.stationMe === '') {
                this.stationMe = s

            } else {
                this.stationMe = this.stationMe + `&${s}`
            }
        }
        const dating = new Date(Date.now())
        this.getPowerGraph(this.stationMe, dating, 'daily')
        this.getEnergyGraph(this.stationMe, dating, 'dayElec', 'daily')

        this.isLoadingSummary = true;
        this._changeDetectorRef.detectChanges();

        // Summary
        this._lookupService.getSummary(this.stationMe).then(
            (entry) => {
                setTimeout(() => {
                    console.log('getSummary timeout', entry);
                    this.summary = entry;
                    this.updateSummaryLabel();

                    this.plnTriger = entry.gridPower;

                    this.isLoadingSummary = false;
                    this._changeDetectorRef.detectChanges();
                }, this._loadingDelay);
            },
            (err) => {
                this.isLoadingSummary = false;
                this._changeDetectorRef.detectChanges();
            }
        )
    }

    private updateSummaryLabel() {
        this.pvmaxkwh = moment(this.summary.pvMaxKwhUpdated).fromNow();
        this.pvmaxpower = moment(this.summary.pvMaxPowerUpdated).fromNow();
        this.TodayIncomeLabel = this.activeLang == 'id' ? this.summary.todayIncome.toLocaleString('id-ID', {maximumSignificantDigits: 6 }) :
            this.summary?.todayIncome.toLocaleString('en-EN', { maximumSignificantDigits: 6 });
    }

    public changeDatePower(e) {
        const date = new Date(e);
        this.powerDate = date;
        this.updatePowerDateValues();
        this.getPowerGraph(this.stationMe, date, this.powerType);
    }

    private updatePowerDateValues() {
        this.DatePowerMonthlyLabel = moment(this.powerDate).format('MMMM YYYY')
        this.DatePowerWeekLabel = moment(this.powerDate).subtract(1, 'weeks').format('MMMM DD YYYY')
        this.DatePowerLabelNow = moment(this.powerDate).format('MMMM DD YYYY')
    }

    public changeDateEnergy(e) {
        const date = new Date(e);
        this.energyDate = date;
        this.updateEnergyDateValues();
        this.getEnergyGraph(this.stationMe, date, this.elec, this.energyType);
    }

    private updateEnergyDateValues() {
        this.DateEnergyWeekLabel = moment(this.energyDate).subtract(1, 'month').format('MMMM DD YYYY');
        this.DateEnergyLabelNow = moment(this.energyDate).format('MMMM DD YYYY')
    }

    public handleChangePowerType(type: "daily" | "weekly") {
        //const dating = new Date(Date.now())
        this.powerType = type
        this.getPowerGraph(this.stationMe, this.powerDate, type)
    }

    public handleChangeEnergyType(type: "daily" | "monthly" | "yearly") {
        //const dating = new Date(Date.now())
        this.energyType = type
        this.getEnergyGraph(this.stationMe, this.energyDate, this.elec, type)
    }

    public getPowerGraph(station: string, date: Date, type: "daily" | "weekly") {
        // let startTime = new Date(date)
        // startTime.setHours(6, 0, 0, 0)
        this.isloadingPowerGraph = true;
        this._lookupService.getPowerGraph(station, this.powerDate, type).then(
            (list) => {
                setTimeout(() => {
                    this.power = list;
                    this._PowerChartData(list);
                    this.isloadingPowerGraph = false;
                    this._changeDetectorRef.detectChanges();
                }, this._loadingDelay);
            },
            (err) => {
                console.log('error getPowerGraph', err);
                this.isloadingPowerGraph = false;
                this._changeDetectorRef.detectChanges();
            }
        )
    }

    public getEnergyGraph(station: string, date: Date, elec: "dayElec" | "monthElec", type: "daily" | "monthly" | "yearly") {
        this.isloadingEnergyGraph = true;
        this._lookupService.getEnergyGraph(station, date, elec, type).then(
            (energydaily) => {
                setTimeout(() => {
                    this.energy = energydaily;
                    this._EnergyChartData(energydaily);
                    this.isloadingEnergyGraph = false;
                    this._changeDetectorRef.detectChanges();
                }, this._loadingDelay);
            },
            (err) => {
                console.log('error getEnergyGraph', err);
                this.isloadingEnergyGraph = false;
                this._changeDetectorRef.detectChanges();
            }
        )
    }

    private _PowerChartData(power: any): void {
        // data series and chart
        let powerChart: any = {
            series: {
                'daily': [
                    {
                        'name': 'PV',
                        'data': power.dataPLTS
                    },
                    {
                        'name': this._translateService.translate('Load'),
                        'data': power.dataLoad
                    },
                    {
                        'name': 'PLN',
                        'data': power.dataGrid
                    },
                ],
            }
        }

        let powerMax = 0;

        // Chart PLTS
        this.chartPLTS = {
            chart: {
                animations: {
                    speed: 400,
                    animateGradually: {
                        enabled: false
                    }
                },
                fontFamily: 'inherit',
                foreColor: 'inherit',
                width: '100%',
                height: '100%',
                type: 'area',
                toolbar: {
                    show: false
                },
                zoom: {
                    enabled: false
                }
            },
            colors: ['#34D399', '#63B3ED', '#FB7185'],
            dataLabels: {
                enabled: false
            },
            fill: {
                colors: ['#34D399', '#63B3ED', '#FB7185'],
                opacity: 0.8
            },
            grid: {
                show: true,
                borderColor    : 'var(--fuse-border)',
                padding: {
                    top: 10,
                    bottom: -40,
                    left: 0,
                    right: 0
                },
                position: 'back',
                xaxis: {
                    lines: {
                        show: true
                    }
                }
            },
            series: powerChart.series,
            stroke: {
                width: 1
            },
            tooltip: {
                followCursor: true,
                theme: 'dark',
                x: {
                    formatter: (value: number, options: any): string => {
                        return moment(value).format('MMMM DD YYYY, h:mm');
                    }
                },
                y: {
                    formatter: (value: number, options: any): string => `${value.toFixed(1)} kW`
                }
            },
            legend: {
                onItemClick: {
                    toggleDataSeries: false
                },
                position: 'top'
            },
            xaxis: {
                axisBorder: {
                    show: false
                },
                axisTicks: {
                    show: false
                },
                crosshairs: {
                    stroke: {
                        color: '#475569',
                        dashArray: 0,
                        width: 2
                    }
                },
                labels: {
                    offsetY: -20,
                    style  : {
                        colors: 'var(--fuse-text-secondary)',
                    },
                    // formatter: (value) => {
                    //     if (this.powerType == 'daily') {
                    //         return moment(value).format('hh:mm');
                    //     }

                    //     return moment(value).format('MMM D');
                    // },
                    datetimeUTC: false,
                    hideOverlappingLabels: true
                },
                tooltip: {
                    enabled: false
                },
                type: 'datetime'
            },
            yaxis: {
                min: (min) => {
                    if (power.dataPLTS.length <= 0) {
                        return -1;
                    }
                    const deltaMin = Math.abs(min)*0.5;
                    const newMin = min - (deltaMin < 0.5 ? powerMax : deltaMin);
                    console.log('Power Min:', min, 'newMin:', newMin);

                    return newMin;
                },
                max: (max) => {
                    powerMax = max;

                    if (power.dataPLTS.length <= 0) {
                        return 1;
                    }

                    const newMax = max + Math.abs(max)*0.2;
                    console.log('Power Max:', max, 'newMax:', newMax);

                    return newMax;
                },
                labels: {
                    offsetY: -20,
                    offsetX: 40,
                    style  : {
                        colors: 'var(--fuse-text-secondary)',
                    },
                    formatter: (value) => {
                        const locale = this.activeLang == 'id' ? 'id-ID' : 'en-EN';
                        return Intl.NumberFormat(locale, {
                            minimumIntegerDigits: 1,
                            maximumFractionDigits: 1
                          }).format(value) + " kW";
                    }
                },
                floating: true,
                decimalsInFloat: 1,
                axisTicks: {
                    show: false
                },
                axisBorder: {
                    show: false
                },
                tickAmount: 6,
                show: true
            }
        };
    }

    private _EnergyChartData(energy: any): void {
        // data series and chart
        let energyChart: any = {
            series: {
                'daily': [
                    {
                        'name': this._translateService.translate('Energy'),
                        'data': energy.dataPLTS,
                    },
                ],
            }
        }

        // Energy
        this.chartEnergy = {
            chart: {
                animations: {
                    enabled: true
                },
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: `${this.energyType == 'daily' ? 'area' : 'bar'}`,
                toolbar: {
                    show: false
                },
                zoom: {
                    enabled: true
                }
            },
            colors: ['#34D399'],
            dataLabels: {
                enabled: false
            },
            fill: {
                colors: ['#64748B', '#94A3B8'],
                opacity: 0.5
            },
            grid: {
                show: true,
                borderColor    : 'var(--fuse-border)',
                padding: {
                    top: 10,
                    bottom: -60,
                    left: 50,
                    right: 0
                },
                position: 'back',
                xaxis: {
                    lines: {
                        show: true
                    }
                }
            },
            legend: {
                show: false
            },
            series: energyChart.series,
            stroke: {
                curve: 'smooth',
                width: 1,
            },
            tooltip: {
                followCursor: true,
                theme: 'dark',
                x: {
                    format: this.energyType == 'daily' ? 'MMM dd, yyyy, HH:mm' : 'dd MMM, yyyy'
                },
                y: {
                    formatter: (value: number): string => {
                        if (this.energyType === 'monthly' || 'yearly') {
                            const locale = this.activeLang == 'id' ? 'id-ID' : 'en-EN';
                            return `<div><span class="mr-6">${value.toFixed(1)}kWh</span>
                            ${this._translateService.translate('Profit')} : Rp. ${(value * this.summary?.price).toLocaleString(locale, { maximumSignificantDigits: 5 })}
                            </div>`;
                        }
                        else {
                            return `${value.toFixed(1)}kWh`;
                        }
                    }
                }
            },
            xaxis: {
                axisBorder: {
                    show: false,
                },
                labels: {
                    offsetY: this.energyType === 'daily' ? -30 : -230,
                    offsetX: this.energyType === 'daily' ? -10 : 40,
                    rotate: 0,
                    style  : {
                        colors: 'var(--fuse-text-secondary)',
                    },
                    formatter: (value) => {
                        if (this.energyType == 'daily') {
                            return moment(value).format('hh:mm');
                        }

                        return moment(value).format('MMM D');
                    },
                    datetimeUTC: false,
                },
                //tickAmount: 5,
                tooltip: {
                    enabled: false
                },

                type: 'datetime'
            },
            yaxis: {
                labels: {
                    offsetY: -5,
                    offsetX: 60,
                    style  : {
                        colors: 'var(--fuse-text-secondary)',
                    },
                    formatter: (value) => {
                        if (energy.dataPLTS.length <=0) {
                            return '0 kWh';
                        }

                        const locale = this.activeLang == 'id' ? 'id-ID' : 'en-EN';
                        return Intl.NumberFormat(locale, {
                            minimumIntegerDigits: 1,
                            maximumFractionDigits: 1
                          }).format(value) + " kWh";
                    }
                },
                floating: true,
                decimalsInFloat: 1,
                axisTicks: {
                    show: false
                },
                axisBorder: {
                    show: false
                },
                // min: (min) => {
                //     // if (power.dataPLTS.length <= 0) {
                //     //     return -1;
                //     // }
                //     const deltaMin = Math.abs(min)*0.5;
                //     const newMin = min - (deltaMin < 1 ? 1 : deltaMin);
                //     console.log('Energy Min:', min, 'newMin:', newMin);

                //     return newMin;
                // },
                max: (max) => {
                    if (energy.dataPLTS.length <= 0) {
                        return 1;
                    }
                    const newMax = max + Math.abs(max)*0.2;
                    console.log('Energy Max:', max, 'newMax:', newMax);

                    return newMax;
                },

                // min       : (min): number => min,
                // max       : (max): number => max,
                tickAmount: 7,
                show: true
            }
        }
    }
}
