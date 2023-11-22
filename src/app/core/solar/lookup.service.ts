import { Injectable } from '@angular/core';
import { API, Auth } from 'aws-amplify';
import { environment } from 'environments/environment';
import { AuthService } from '../auth/auth.service';
import { Company } from 'app/models/company.type';
import { Weather } from './weather.types';
import { Summary } from './summary.types';
import { Power } from './power.types';
import { IStation } from './stations.types';
import { DateTime } from 'luxon';
import { Energy } from './energy.types';

@Injectable({
    providedIn: 'root'
})
export class LookupService
{
    private _lookupUrl: string = '/lookup';
    private _apiName: string = environment.lookupApiName;

    /**
     * Constructor
     */
     constructor(private _authService: AuthService)
     {
     }


     async getAllStation(filter?:string): Promise<IStation[]> {
      const headers = {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`
      };
      const body = {};
      const options = {headers: headers, body: body};
      const filterParam = filter ? '&filter=' + filter : '';
      const path = `${this._lookupUrl}/allstation?${filterParam}`;

      const promise = API.get(this._apiName, path, options).then(
          (result) => {
            return result.message.items;
          },
          (err) => {
            throw(err);
          }
      );

      return promise;
    }

    async getEnergyGraph(station: string, date: Date, elec: "dayElec" | "monthElec", type?: "daily" | "monthly" | "yearly"): Promise<Energy> {
      const headers = {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`
      };
      const options = {headers: headers};
      // const start = (new Date(Date.now()-86400000).getTime() / 1000).toFixed(0);
      // const stop =  (new Date().getTime() / 1000).toFixed(0)
      let startTime = new Date(date)
      let endTime = new Date(date)
      let interval = '1h'
      if (type === "daily") {
        startTime.setHours(6,0,0,0)
        endTime.setHours(19,0,0,0)
        interval = '1h'
        elec = 'dayElec'
      } else if (type === "monthly") {
        startTime.setHours(18,0,0,0)
        endTime.setHours(18,0,0,0)
        startTime.setMonth(endTime.getMonth()-1)
        interval = '12h'
        elec = 'dayElec'
      }
        else if (type === "yearly") {
            startTime.setFullYear(2022,0,0)
            endTime.setFullYear(2022,11,0)
            interval = '31d'
            elec = 'monthElec'
      }
      else {
        startTime.setHours(6,0,0,0)
        endTime.setHours(18,0,0,0)
      }
      const start = (new Date(startTime.toISOString()).getTime() / 1000).toFixed(0);
      const stop =  (new Date(endTime.toISOString()).getTime() / 1000).toFixed(0);

      const path = `${this._lookupUrl}/getEnergyGraph?start=${start}&stop=${stop}&interval=${interval}&station=${station.split('&').join('%26')}&type=${elec}&graph=${type}`;

      const promise = API.get(this._apiName, path, options).then(
          (result) => {
            for(var item of result.message.item.energyStatisticOutputs.dataPLTS){
              item.x = DateTime.fromISO(item.x);
            }
            return result.message.item.energyStatisticOutputs;
          },
          (err) => {
            throw(err);
          }
      );

      return promise;
    }

    async getPowerGraph(station: string, dateString: Date, type?: "daily" | "weekly" ): Promise<Power> {
      const headers = {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`
      };
      const options = {headers: headers};
      let startTime = new Date(dateString)
      let endTime = new Date(dateString)
      let interval = '30m'
      if (type === "daily") {
        startTime.setHours(6,0,0,0)
        endTime.setHours(18,0,0,0)
        interval = '30m'
      } else if (type === "weekly") {
        startTime.setHours(6,0,0,0)
        endTime.setHours(18,0,0,0)
        startTime.setDate(endTime.getDate()-6)
        interval = '3h'
      }
      else {
        startTime.setHours(6,0,0,0)
        endTime.setHours(18,0,0,0)
      }
      const start = (new Date(startTime).getTime() / 1000).toFixed(0);
      const stop =  (new Date(endTime).getTime() / 1000).toFixed(0);

      const path = `${this._lookupUrl}/getPowerGraph?start=${start}&stop=${stop}&interval=${interval}&station=${station.split('&').join('%26')}`;

      const promise = API.get(this._apiName, path, options).then(
          (result) => {
            for(var item of result.message.item.powerStatisticOutputs.dataPLTS){
              item.x = DateTime.fromISO(item.x);
            }
            for(var item of result.message.item.powerStatisticOutputs.dataLoad){
              item.x = DateTime.fromISO(item.x);
            }
            for(var item of result.message.item.powerStatisticOutputs.dataGrid){
              item.x = DateTime.fromISO(item.x);
            }
            return result.message.item.powerStatisticOutputs;
          },
          (err) => {
            throw(err);
          }
      );

      return promise;
    }

     async getSummary(station: string): Promise<Summary> {
      const headers = {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`
      };
      const body = {};
      const options = {headers: headers, body: body};

      const path = `${this._lookupUrl}/getSummary?station=${station.split('&').join('%26')}&price=1699&unit=IDR`;

      const promise = API.get(this._apiName, path, options).then(
          (result) => {
            return result.message.item;
          },
          (err) => {
            throw(err);
          }
      );

      return promise;
    }

     async getWeather(): Promise<Weather> {
      const headers = {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`
      };
      const body = {};
      const options = {headers: headers, body: body};

      const path = `${this._lookupUrl}/weather`;

      const promise = API.get(this._apiName, path, options).then(
          (result) => {
            return result.message;
          },
          (err) => {
            throw(err);
          }
      );

      return promise;
    }

    async getCurrentWeather(latitude: string, longitude: string): Promise<Weather> {
        const headers = {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`
        };
        const body = {};
        const options = {headers: headers, body: body};


        const path = `${this._lookupUrl}/weather?latitude=${latitude}&longitude=${longitude}&exclude=&appid=fefb4c68891607d160c1ee163bb93021&language=en`;

        const promise = API.get(this._apiName, path, options).then(
            (result) => {
              return result.message.item;
            },
            (err) => {
              throw(err);
            }
        );

        return promise;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    // -----------------------------------------------------------------------------------------------------
    // @ Companies CRUD methods
    // -----------------------------------------------------------------------------------------------------

    async getMyCompany(): Promise<any> {
      const headers = {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`
      };
      const body = {};
      const options = {headers: headers, body: body};

      const path = `${this._lookupUrl}/my-company`;

      const promise = API.get(this._apiName, path, options).then(
          (result) => {
            return result.message;
          },
          (err) => {
            throw(err);
          }
      );

      return promise;
    }

    async getCompanies(limit?: number, lastKey?: string): Promise<any> {
        const headers = {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`
        };
        const body = {};
        const options = {headers: headers, body: body};
        const limitParam = limit ? '&limit=' + limit.toString() : '';
        const idParam = lastKey ? '&id=' + lastKey : '';

        const path = `${this._lookupUrl}/companies?${limitParam}${idParam}`;

        const promise = API.get(this._apiName, path, options).then(
            (result) => {
              return result.message;
            },
            (err) => {
              throw(err);
            }
        );

        return promise;
    }

    async createCompany(name: string): Promise<Company> {
        const headers = {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`
        };
        const body = {name: name};
        const options = {headers: headers, body: body};

        const path = `${this._lookupUrl}/companies`;

        const promise = API.post(this._apiName, path, options).then(
            (result) => {

              if (result.message.error) {
                throw(result.message.error);
              }

              const newRecord = result.message.rows[0];

              const newCompany: Company = {
                id: newRecord.id,
                name: name,
                createdAt: newRecord.created_at,
              };

              return newCompany;
            },
            (err) => {
              throw(err);
            }
        );

        return promise;
    }

    async updateCompany(company: Company): Promise<Company> {
      const headers = {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`
      };
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const body = {id: company.id, updateList:[
        {name: company.name},
        {address: company.address},
        {phone: company.phone},
        {fax: company.fax},
        // eslint-disable-next-line @typescript-eslint/naming-convention
        {tax_id: company.taxId},
        // eslint-disable-next-line @typescript-eslint/naming-convention
        {website_url: company.websiteUrl},
        {email: company.email},
        {logo: company.logo}
      ]};

      const options = {headers: headers, body: body};

      const path = `${this._lookupUrl}/companies`;

      const promise = API.put(this._apiName, path, options).then(
          (result) => {

            if (result.message.error) {
              throw(result.message.error);
            }

            const updatedRecord = result.message.rows[0];
            company.updatedAt = updatedRecord.updated_at;
            return company;
          },
          (err) => {
            throw(err);
          }
      );

      return promise;
    }

    async deleteCompany(id: string): Promise<any> {
        const headers = {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`
        };
        const body = {id: id};
        const options = {headers: headers, body: body};

        const path = `${this._lookupUrl}/companies`;

        const promise = API.del(this._apiName, path, options).then(
            (result) => {
              const data = result.data;

              return result.message;
            },
            (err) => {
              throw(err);
            }
        );

        return promise;
    }
}
