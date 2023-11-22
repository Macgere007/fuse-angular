export interface Summary{
        stationName:string;
        stationStatusDesc: string;
        totalElec: number;
        dayElec: number;
        monthElec: number;
        yearElec: number;
        generatedPower?: number;
        loadPower: number;
        gridPower: number;
        powerMax: number;
        co2: number;
        coal: number;
        forest: number;
        price: number;
        todayIncome: number;
        totalIncome: number;
        unit: string;
        capacity: number;
        pvMaxKwh: number;
        pvMaxKwhUpdated: string,
        pvMaxPowerUpdated: string,

}
