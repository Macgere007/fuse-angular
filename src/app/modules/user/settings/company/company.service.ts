import { Injectable } from '@angular/core';
import { BehaviorSubject, from, map, Observable, of, switchMap, take, tap, throwError, catchError } from 'rxjs';
import { Company } from 'app/models/company.type';
import { LookupService } from 'app/core/solar/lookup.service';

const camelcaseKeysDeep = require('camelcase-keys-deep');

@Injectable({
    providedIn: 'root'
})
export class CompanyService
{
    // Private
    private _company: BehaviorSubject<Company | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
     constructor(
        private _lookupService: LookupService)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for company
     */
     get company$(): Observable<Company>
     {
        return this._company.asObservable();
     }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get company
     */
    getMyCompany(): Observable<Company>
    {
        const promise = new Promise<Company>((resolve, reject) => {
            this._lookupService.getMyCompany().then(
                (result) => {
                    if (result.error) {
                        // do nothing
                        this._company.error(result.error);
                        reject(result.error);
                        return;
                    }

                    const company = camelcaseKeysDeep(result.item);

                    this._company.next(company);

                    resolve(company);
                },
                (err) => {
                    reject(err);
                }
            );
        });

        return from(promise);
    }

    /**
     * Update company
     *
     * @param targetCompany
     */
    updateCompany(targetCompany: Company): Observable<Company>
    {
        return this.company$.pipe(
            take(1),
            switchMap(company => from(this._lookupService.updateCompany(targetCompany))
                .pipe(
                    catchError((err) => {
                        if (err.detail) {
                            return throwError(() => new Error(err.detail));
                        }
                        else if (err.response) {
                            return throwError(() => new Error(err.response.data.message.error));
                        }
                        return throwError(() => new Error(`Database error ${err.routine} (${err.code})`));
                    }),
                    switchMap(updatedCompany => this.company$.pipe(
                        take(1),
                        tap(() => {

                            // Update the bank if it's selected
                            this._company.next(updatedCompany);

                            // Return the updated bank
                            return updatedCompany;
                        })
                    ))
                )
            )
        );
    }
}
