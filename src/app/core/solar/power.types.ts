export interface dataLoad{
    x: Date,
    y: number
}

export interface dataGrid{
    x: Date,
    y: number
}

export interface dataPLTS{
    x: Date,
    y: number
}

export interface powerStatisticOutputs{
    station: string,
    dataPLTS: dataPLTS[],
    dataLoad: dataLoad[],
    dataGrid: dataGrid[],
}

export interface Power{
    station: string,
    dataPLTS: dataPLTS[],
    dataLoad: dataLoad[],
    dataGrid: dataGrid[],
    highestPLTS?: number,
    unit?: string,
}
