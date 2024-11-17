import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { finalize } from 'rxjs/operators';
import { UserDTO } from 'src/app/Models/user.dto';
import { SharedService } from 'src/app/Services/shared.service';
import { UserService } from 'src/app/Services/user.service';
import { AuthState } from 'src/app/reducers/auth.reducer';
import { selectUserId } from 'src/app/selectors/auth.selectors';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  profileUser: UserDTO;

  name: UntypedFormControl;
  surname_1: UntypedFormControl;
  surname_2: UntypedFormControl;
  alias: UntypedFormControl;
  birth_date: UntypedFormControl;
  email: UntypedFormControl;
  password: UntypedFormControl;

  profileForm: UntypedFormGroup;
  isValidForm: boolean | null;

  private userId: string;

  constructor(
    private store: Store<AuthState>,
    private formBuilder: UntypedFormBuilder,
    private userService: UserService,
    private sharedService: SharedService
  ) {
    this.userId = "";

    this.profileUser = new UserDTO('', '', '', '', new Date(), '', '');

    this.isValidForm = null;

    this.store.select(selectUserId).subscribe((userId) => {
      this.userId = userId;
    });

    this.name = new UntypedFormControl(this.profileUser.name, [
      Validators.required,
      Validators.minLength(5),
      Validators.maxLength(25),
    ]);

    this.surname_1 = new UntypedFormControl(this.profileUser.surname_1, [
      Validators.required,
      Validators.minLength(5),
      Validators.maxLength(25),
    ]);

    this.surname_2 = new UntypedFormControl(this.profileUser.surname_2, [
      Validators.minLength(5),
      Validators.maxLength(25),
    ]);

    this.alias = new UntypedFormControl(this.profileUser.alias, [
      Validators.required,
      Validators.minLength(5),
      Validators.maxLength(25),
    ]);

    this.birth_date = new UntypedFormControl(
      formatDate(this.profileUser.birth_date, 'yyyy-MM-dd', 'en'),
      [Validators.required]
    );

    this.email = new UntypedFormControl(this.profileUser.email, [
      Validators.required,
      Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$'),
    ]);

    this.password = new UntypedFormControl(this.profileUser.password, [
      Validators.required,
      Validators.minLength(8),
    ]);

    this.profileForm = this.formBuilder.group({
      name: this.name,
      surname_1: this.surname_1,
      surname_2: this.surname_2,
      alias: this.alias,
      birth_date: this.birth_date,
      email: this.email,
      password: this.password,
    });
  }

  async ngOnInit(): Promise<void> {
    let errorResponse: any;

    // load user data
    if (this.userId) {
      this.userService.getUSerById(
        this.userId
      ).subscribe({
        next: (userData: UserDTO) => {
          this.name.setValue(userData.name);
          this.surname_1.setValue(userData.surname_1);
          this.surname_2.setValue(userData.surname_2);
          this.alias.setValue(userData.alias);
          this.birth_date.setValue(
            formatDate(userData.birth_date, 'yyyy-MM-dd', 'en')
          );
          this.email.setValue(userData.email);
  
          this.profileForm = this.formBuilder.group({
            name: this.name,
            surname_1: this.surname_1,
            surname_2: this.surname_2,
            alias: this.alias,
            birth_date: this.birth_date,
            email: this.email,
            password: this.password,
          });
        },
        error: (error: any) => {
          errorResponse = error.error;
          this.sharedService.errorLog(errorResponse);
        }
      });
    }
  }

  async updateUser(): Promise<void> {
    let responseOK: boolean = false;
    this.isValidForm = false;
    let errorResponse: any;

    if (this.profileForm.invalid) {
      return;
    }

    this.isValidForm = true;
    this.profileUser = this.profileForm.value;

    if (this.userId) {
      this.userService.updateUser(this.userId, this.profileUser).pipe(
        finalize(() => {
          this.sharedService.managementToast(
            'profileFeedback',
            responseOK,
            errorResponse
          ).subscribe();
        })
        ).subscribe({
          next: () => {
            responseOK = true;
          },
          error: (error: any) => {
            responseOK = false;
            errorResponse = error.error;
            this.sharedService.errorLog(errorResponse);
          }
        });
    } 
  }
}
