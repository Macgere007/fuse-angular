import { Component, ViewEncapsulation } from '@angular/core';
import { CloudUserService } from 'app/core/user/cloud.user.service';
import { CloudUser, User } from 'app/core/user/user.types';
import { environment } from 'environments/environment';

@Component({
    selector     : 'landing-home',
    templateUrl  : './home.component.html',
    encapsulation: ViewEncapsulation.None
})
export class LandingHomeComponent
{
    appTitle = environment.appTitle;
    user: CloudUser;
    currentuser: CloudUser;
    
    /**
     * Constructor
     */
    constructor(private _cloudUserService: CloudUserService,)
    {  
    }

    

    ngOnInit(): void {


    this._cloudUserService.getCurrentUser().then(
        (result) => {
            this.currentuser = result.item.user_role;
        },
        (err) => {
            // console.log(err.message)
        }


    )
    }

    
}
