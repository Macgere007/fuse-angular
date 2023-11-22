import { Injectable } from '@angular/core';
import { BehaviorSubject, from, map, Observable, of, switchMap, take, tap, throwError, catchError } from 'rxjs';
import { User } from 'app/models/user.type';
import { Pagination } from 'app/models/pagination.type';
import { CloudUserService } from 'app/core/user/cloud.user.service';
import { Role } from 'app/models/role.type';

const camelcaseKeysDeep = require('camelcase-keys-deep');

@Injectable({
    providedIn: 'root'
})
export class TeamService
{
    // Private
    private _account: BehaviorSubject<User | null> = new BehaviorSubject(null);
    private _roles: BehaviorSubject<Role[] | null> = new BehaviorSubject(null);
    private _roleLookup: BehaviorSubject<Role[] | null> = new BehaviorSubject(null);
    private _rolePagination: BehaviorSubject<Pagination | null> = new BehaviorSubject(null);
    // all team member in pagination
    //private _accounts: BehaviorSubject<User[] | null> = new BehaviorSubject(null);
    // team lookup
    private _teamLookup: BehaviorSubject<User[] | null> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<Pagination | null> = new BehaviorSubject(null);
    private _lastKeys: Map<number,string> = new Map<number,string>();
    private _roleHints: any = {};

    /**
     * Constructor
     */
    constructor(
        private _cloudUserService: CloudUserService)
    {
        // Setup the roles
        this._roleHints.Readonly = 'As it says you can only read data';
        this._roleHints.Readwrite = 'Can read, write, and delete data';
        // eslint-disable-next-line max-len
        this._roleHints.Administrator = 'You can do anything except terminationg this tenant account';
        this._roleHints.Manager = 'You can view and authorize contracts';
        this._roleHints.Owner = 'You are the God on this tenant account';
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for Role
     */
     get roles$(): Observable<Role[]>
     {
         return this._roles.asObservable();
     }

     get roleLookup$(): Observable<Role[]>
     {
        return this._roleLookup.asObservable();
     }

    /**
     * Getter for Role pagination
     */
     get rolePagination$(): Observable<Pagination>
     {
         return this._pagination.asObservable();
     }

    /**
     * Getter for Account
     */
    // get team$(): Observable<User[]>
    // {
    //     return this._accounts.asObservable();
    // }

    get teamLookup$(): Observable<User[]>
    {
        return this._teamLookup.asObservable();
    }

    /**
     * Getter for Account
     */
    get account$(): Observable<User>
    {
        return this._account.asObservable();
    }

    /**
     * Getter for pagination
     */
    get pagination$(): Observable<Pagination>
    {
        return this._pagination.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------


    /**
     * Get All Team Member Lookup
     */
     getAllTeamMember(): Observable<User[]>
    {
        console.log('getAllTeamMember');

        const promise = new Promise<User[]>((resolve, reject) => {
            this._cloudUserService.getUsers(1000).then(
                (result) => {
                    if (result.error) {
                        // do nothing
                        this._teamLookup.error(result.error);
                        reject(result.error);
                        return;
                    }

                    const accounts = camelcaseKeysDeep(result.items);
                    this._teamLookup.next(accounts);

                    resolve(accounts);
                },
                (err) => {
                    console.log('catch error', err.response);
                    reject(err);
                }
            );
        });

        return from(promise);
    }

    /**
     * Get team
     *
     *
     * @param page
     * @param size
     * @param search
     */
    // getTeam(
    //     page: number = 0,
    //     size: number = 10,
    //     search: string = ''): Observable<{ pagination: Pagination; accounts: User[] }>
    // {
    //     let lastKey = null;

    //     if (page === 0) {
    //         this._lastKeys = new Map<number, string>();
    //     }
    //     else {
    //         lastKey = this._lastKeys.get(page-1);
    //     }

    //     console.log('getTeam page', page, 'size', size, 'search', search, 'lastKey', lastKey);

    //     const promise = new Promise<{pagination: Pagination; accounts: User[]}>((resolve, reject) => {
    //         this._cloudUserService.getUsers(size, lastKey, search).then(
    //             (result) => {
    //                 if (result.error) {
    //                     // do nothing
    //                     this._pagination.error(result.error);
    //                     this._accounts.error(result.error);
    //                     reject(result.error);
    //                     return;
    //                 }

    //                 const length = Number(result.totalItems);
    //                 const lastPage = Math.ceil(length/size)-1;

    //                 const pagination: Pagination = {
    //                     length: length,
    //                     size: size,
    //                     page: page,
    //                     lastPage: lastPage
    //                 };
    //                 console.log('pagination', pagination);

    //                 this._lastKeys.set(page, result.lastItemKey);
    //                 console.log('this._lastKeys', this._lastKeys);

    //                 this._pagination.next(pagination);
    //                 const accounts = camelcaseKeysDeep(result.items);

    //                 this._accounts.next(accounts);

    //                 resolve({pagination:null, accounts:accounts});
    //             },
    //             (err) => {
    //                 console.log('catch error', err);
    //                 reject(err);
    //             }
    //         );
    //     });

    //     return from(promise);
    // }

    /**
     * Get Roles
     *
     * @param page
     * @param size
     * @param search
     */
     getRoleLookup(): Observable<Role[]>
    {
        console.log('getRoleLookup');

        const promise = new Promise<Role[]>((resolve, reject) => {
            this._cloudUserService.getRoles(1000).then(
                (result) => {
                    if (result.error) {
                        // do nothing
                        this._roleLookup.error(result.error);
                        reject(result.error);
                        return;
                    }

                    result.items.forEach((role: Role) => {
                        role.description = this._roleHints[role.name];
                    });

                    const roles = camelcaseKeysDeep(result.items);

                    this._roleLookup.next(roles);
                    resolve(roles);
                },
                (err) => {
                    console.log('catch error', err.response);
                    reject(err);
                }
            );
        });

        return from(promise);
    }

    /**
     * Get Roles
     *
     * @param page
     * @param size
     * @param search
     */
     getRoles(
        page: number = 0,
        size: number = 10,
        search: string = ''): Observable<{ pagination: Pagination; roles: Role[] }>
    {
        let lastKey = null;

        if (page === 0) {
            this._lastKeys = new Map<number, string>();
        }
        else {
            lastKey = this._lastKeys.get(page-1);
        }

        console.log('getRoles page', page, 'size', size, 'search', search, 'lastKey', lastKey);

        const promise = new Promise<{pagination: Pagination; roles: Role[]}>((resolve, reject) => {
            this._cloudUserService.getRoles(size, lastKey, search).then(
                (result) => {
                    if (result.error) {
                        // do nothing
                        this._rolePagination.error(result.error);
                        this._roles.error(result.error);
                        reject(result.error);
                        return;
                    }

                    const length = Number(result.totalItems);
                    const lastPage = Math.ceil(length/size)-1;

                    const pagination: Pagination = {
                        length: length,
                        size: size,
                        page: page,
                        lastPage: lastPage
                    };
                    console.log('pagination', pagination);

                    this._lastKeys.set(page, result.lastItemKey);
                    console.log('this._lastKeys', this._lastKeys);

                    result.items.forEach((role: Role) => {
                        role.description = this._roleHints[role.name];
                    });

                    console.log('after reset roledescription', result.items);

                    this._rolePagination.next(pagination);

                    const roles = camelcaseKeysDeep(result.items);

                    this._roles.next(roles);
                    resolve({pagination:null, roles:roles});
                },
                (err) => {
                    console.log('catch error', err.response);
                    reject(err);
                }
            );
        });

        return from(promise);
    }

    /**
     * Get Account by id
     */
    getAccountById(id: string): Observable<User>
    {
        return this._teamLookup.pipe(
            take(1),
            map((accounts) => {

                // Find the Account
                const account = accounts.find(item => item.id === id) || null;

                // Update the Account
                this._account.next(account);

                // Return the Account
                return account;
            }),
            switchMap((account) => {

                if ( !account )
                {
                    return throwError('Could not find Account with id of ' + id + '!');
                }

                return of(account);
            })
        );
    }

    /**
     * Create Account
     */
    createAccount(): Observable<User>
    {
        return this.teamLookup$.pipe(
            take(1),
            switchMap(accounts => of<User>({id:'000', name:''})
            .pipe(
                map((newAccount) => {
                    this._teamLookup.next([newAccount, ...accounts]);

                    return newAccount;
                })
            ))
        );
    }

    /**
     * Update Account
     *
     * @param id
     * @param Account
     */
    updateAccount(id: string, account: User): Observable<User>
    {
        console.log('account.service.updateAccount', id, account);

        if (id === '000') {
            return this.teamLookup$.pipe(
                take(1),
                switchMap(accounts => from(this._cloudUserService.createUser(account))
                    .pipe(
                        catchError((err) => {
                            if (err.detail) {
                                console.log('createUser error', err);
                                return throwError(() => new Error(err.detail));
                            }
                            else if (err.response) {
                                console.log('createUser error', err.response);
                                return throwError(() => new Error(err.response.data.message.error));
                            }
                            console.log('createUser error', err);
                            return throwError(() => new Error(`Database error ${err.routine} (${err.code})`));
                        }),
                        map((insertedAccount) => {
                            console.log('after createAccount', insertedAccount);
                            // Find the index of the updated Account
                            const index = accounts.findIndex(item => item.id === '000');
                            console.log('service update Account index', index);
                            // Update the Account
                            accounts[index] = insertedAccount;

                            return insertedAccount;
                        }),
                        switchMap(insertedAccount => this.account$.pipe(
                            take(1),
                            tap(() => {
                            console.log('after switchMap insertedAccount', insertedAccount);
                            // Update the Account if it's selected
                            this._account.next(insertedAccount);

                            // Return the inerted Account
                            return insertedAccount;
                            })
                        ))
                    )
                )
            );
        }

        return this.teamLookup$.pipe(
            take(1),
            switchMap(accounts => from(this._cloudUserService.updateUserRole(account))
                .pipe(
                    catchError((err) => {
                        if (err.detail) {
                            console.log('updateUserRole error', err);
                            return throwError(() => new Error(err.detail));
                        }
                        else if (err.response) {
                            console.log('updateUserRole error', err.response);
                            return throwError(() => new Error(err.response.data.message.error));
                        }
                        console.log('updateUserRole error', err);
                        return throwError(() => new Error(`Database error ${err.routine} (${err.code})`));
                    }),
                    map((updatedAccount) => {

                        console.log('service updateAccount index', id, account);

                        // Find the index of the updated Account
                        const index = accounts.findIndex(item => item.id === id);
                        console.log('service updateAccount index', index);

                        // Update the Account
                        accounts[index] = updatedAccount;

                        // Update the Account
                        this._teamLookup.next(accounts);

                        // Return the updated Account
                        return updatedAccount;
                    }),
                    switchMap(updatedAccount => this.account$.pipe(
                        take(1),
                        tap(() => {
                            console.log('after switchMap updatedAccount', updatedAccount);

                            // Update the Account if it's selected
                            this._account.next(updatedAccount);

                            // Return the updated Account
                            return updatedAccount;
                        })
                    ))
                )
            )
        );
    }

    /**
     * Delete the Account
     *
     * @param Account
     */
    deleteAccount(acount: User): Observable<boolean>
    {
        if (acount.id === '000') {
            // only delete from client side Account because it's not in database server yet
            return this._teamLookup.pipe(
                take(1),
                map((accounts) => {
                    // Find the index of the deleted Account
                    const index = accounts.findIndex(item => item.id === acount.id);

                    // Delete the Account
                    accounts.splice(index, 1);

                    // Update the accounts
                    this._teamLookup.next(accounts);

                    // Return the deleted status
                    return true;
                })
            );
        };

        const id = acount.id;

        return this.teamLookup$.pipe(
            take(1),
            switchMap(accounts => from(this._cloudUserService.deleteUser(id)).pipe(
                catchError((err) => {
                    if (err.detail) {
                        console.log('deleteUser error', err);
                        return throwError(() => new Error(err.detail));
                    }
                    else if (err.response) {
                        console.log('deleteUser error', err.response);
                        return throwError(() => new Error(err.response.data.message.error));
                    }
                    console.log('deleteUser error', err);
                    return throwError(() => new Error(`Database error ${err.routine} (${err.code})`));
                }),
                map((isDeleted: boolean) => {

                    // Find the index of the deleted Account
                    const index = accounts.findIndex(item => item.id === id);

                    // Delete the Account
                    accounts.splice(index, 1);

                    // Update the Account
                    this._teamLookup.next(accounts);

                    // Return the deleted status
                    return isDeleted;
                })
            ))
        );
    }
}
