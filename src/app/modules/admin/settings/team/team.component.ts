import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Subject, takeUntil } from 'rxjs';
import { FuseLoadingService } from '@fuse/services/loading';
import { TeamService } from './team.service';
import { FormControl } from '@angular/forms';
import { User, UserRole } from 'app/models/user.type';
import { Role } from 'app/models/role.type';
import { UserService } from 'app/core/user/user.service';
import { DataOperation } from 'app/models/data-operation.type';
import { CloudUserService } from 'app/core/user/cloud.user.service';
import { cloneDeep } from 'lodash-es';

@Component({
    selector       : 'settings-team',
    templateUrl    : './team.component.html',
    styles         : [
        /* language=SCSS */
        `
            .team-grid {
                grid-template-columns: 72px auto 40px;

                @screen sm {
                    grid-template-columns: 72px auto 72px;
                }

                @screen md {
                    grid-template-columns: 72px auto 72px;
                }

                @screen lg {
                    grid-template-columns: 72px auto 72px;
                }
            }
        `
    ],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsTeamComponent implements OnInit
{
    @Input() roleDataSource: Subject<Role[]>;
    @Input() teamDataSource: Subject<User[]>;

    roles: Role[];
    members: User[];
    users: User[];
    roleHints: any[];
    isLoadingError: boolean = false;
    roleControl = new FormControl('');
    selectedRole?: string;
    isAllowWrite: boolean = false;
    isAllowDelete: boolean = false;
    user: User;

    isShowAlert: boolean = false;
    alertType: string = 'info';
    alertMessage: string = '';
    alertIcon: string = 'heroicons_solid:exclamation';

    invitedEmailAddresses: string = '';

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _teamService: TeamService,
        private _fuseLoading: FuseLoadingService,
        private _userService: UserService,
        private _cloudUserService: CloudUserService,
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Subscribe to user changes
        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: User) => {
                this.user = user;
                this.isAllowWrite = this._userService.isAllow(this.user, 'team', DataOperation.write);
                this.isAllowDelete = this._userService.isAllow(this.user, 'team', DataOperation.delete);
            }
        );

        this.roleDataSource.subscribe({
            next: (roles) => {
                this.roles = roles;
                this._fuseLoading.hide();
                // Mark for check
                this._changeDetectorRef.markForCheck();
            },
            error: (error) => {
                console.log('roleDataSource error', error);
                this._fuseLoading.hide();
                // Mark for check
                this._changeDetectorRef.markForCheck();
            }
        });

        this.teamDataSource.subscribe((members) => {
            this.members = cloneDeep(members);
            this.users = cloneDeep(members);

            this._changeDetectorRef.markForCheck();
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    deleteUser(member: User): void
    {
        if (this.isOwner(member)) {
            this.showErrorAlert('You cannot delete your <b>God</b>.');
            return;
        }

        if (member.id === this.user.id) {
            this.showErrorAlert('You cannot delete yourself.');
            return;
        }

        console.log('deleteuser', member);

        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title  : `Delete user ${member.name}`,
            message: `Are you sure you want to remove user ${member.name}? This action cannot be undone!`,
            actions: {
                confirm: {
                    label: 'Delete'
                }
            }
        });

        // Subscribe to the confirmation dialog closed action
        confirmation.afterClosed().subscribe((result) => {

            // If the confirm button pressed...
            if ( result === 'confirmed' )
            {
                this._fuseLoading.show();
                // Delete the User on the server
                this._teamService.deleteAccount(member).subscribe({
                    next: () => {
                        this.showSuccessAlert(`User ${member.name} successfully deleted`);
                        this._fuseLoading.hide();
                    },
                    error: (error) => {
                        console.log('error', error);
                        this._fuseLoading.hide();
                        this.showErrorAlert('Delete use failed. Please try again in a moment...');
                        this._changeDetectorRef.markForCheck();
                    }
                });
            }
        });
    }

    updateUserRole(updateMember: User): void
    {
        /* console.log('active users', this.members);
        console.log('twins users', this.users); */
        let mirrorUser = null;

        for (const user of this.users) {
            if (user.id === updateMember.id) {
                if (this.isOwner(user)) { // you try to demote a god, be carefull
                    if (this.users.length <= 1) {
                        this.showErrorAlert('You cannot demote your <b>God</b>.');
                        return;
                    }
                    else {
                        let isOtherOwnerExist = false;

                        for (const other of this.users) {
                            if (other.id !== updateMember.id) {
                                if (this.isOwner(other)) {
                                    isOtherOwnerExist = true;
                                    break;
                                }
                            }
                        }

                        if (!isOtherOwnerExist) {
                            this.showErrorAlert(`Please elect other <b>God</b> before you can fire <b>${updateMember.name}</b>.`);
                            return;
                        }
                    }

                    mirrorUser = user;
                }
            }
        }

        console.log('updateUserRole', updateMember, this.roleControl.value);

        this._fuseLoading.show();
        // Update the User on the server
        this._teamService.updateAccount(updateMember.id, updateMember).subscribe(() => {
            if (mirrorUser) {
                mirrorUser.roleId = updateMember.roleId;
            }
            this.showSuccessAlert(`User ${updateMember.name} successfully updated`);
            this._fuseLoading.hide();
        });
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }

    inviteUser(): void
    {
        this._fuseLoading.show();
        console.log('invite user', this.invitedEmailAddresses);
        this._cloudUserService.inviteUser(this.invitedEmailAddresses, this.user).then(
            (response) => {
                console.log('response', response);
                this._fuseLoading.hide();
                this.showSuccessAlert('Invitation sent');
                this._changeDetectorRef.markForCheck();
            },
            (error) => {
                console.log('error', error);
                this._fuseLoading.hide();
                this.showErrorAlert('Send invitation failed. Please try again in a moment...');
                this._changeDetectorRef.markForCheck();
            }
        );
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------
    isOwner(member): boolean
    {
        for(const role of this.roles) {
            if (role.id === member.roleId) {
                if (role.name === UserRole.owner) {
                    return true;
                }
                break;
            }
        }

        return false;
    }

    private showSuccessAlert(message): void {
        this.showAlert(message, 'info', 'heroicons_solid:information-circle');
    }

    private showErrorAlert(message): void {
        this.showAlert(message, 'error', 'heroicons_solid:exclamation');
    }

    private showAlert(message, type?: string, icon?: string): void {
        if (type) {
            this.alertType = type;
        }
        if (icon) {
            this.alertIcon = icon;
        }
        this.alertMessage = message;
        this.isShowAlert = true;
        setTimeout(() => {
            this.isShowAlert = false;
            // Mark for check
            this._changeDetectorRef.markForCheck();
        }, 1500);
    }
}
