export interface dataPLTS{
    x: Date,
    y: number
}

export interface energyStatisticOutputs{
    station: string,
    dataPLTS: dataPLTS[],
    totalEnergy?: string
}

export interface Energy{
    energyStatisticOutputs: energyStatisticOutputs,
    dataPLTS: dataPLTS[],
    unit: string,
    totalEnergy?: number
}
