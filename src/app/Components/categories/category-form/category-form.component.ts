import { Component, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { from, of } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { CategoryDTO } from 'src/app/Models/category.dto';
import { CategoryService } from 'src/app/Services/category.service';
import { LocalStorageService } from 'src/app/Services/local-storage.service';
import { SharedService } from 'src/app/Services/shared.service';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.scss'],
})
export class CategoryFormComponent implements OnInit {
  category: CategoryDTO;
  title: UntypedFormControl;
  description: UntypedFormControl;
  css_color: UntypedFormControl;

  categoryForm: UntypedFormGroup;
  isValidForm: boolean | null;

  private isUpdateMode: boolean;
  private validRequest: boolean;
  private categoryId: string | null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private categoryService: CategoryService,
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private sharedService: SharedService,
    private localStorageService: LocalStorageService
  ) {
    this.isValidForm = null;
    this.isUpdateMode = false;
    this.validRequest = false;

    this.categoryId = this.activatedRoute.snapshot.paramMap.get('id');
    const categoryJSON = this.activatedRoute.snapshot.queryParamMap.get('category');
    if (categoryJSON) {
      this.category = JSON.parse(categoryJSON);
      this.isUpdateMode = true;
    } else {
      this.category = new CategoryDTO('', '', '');
    }

    this.title = new UntypedFormControl(this.category.title, [
      Validators.required,
      Validators.maxLength(55),
    ]);

    this.description = new UntypedFormControl(this.category.description, [
      Validators.required,
      Validators.maxLength(255),
    ]);

    this.css_color = new UntypedFormControl(this.category.css_color, [
      Validators.required,
      Validators.maxLength(7),
      Validators.pattern(/^#([0-9A-Fa-f]{6})$/)
    ]);

    this.categoryForm = this.formBuilder.group({
      title: this.title,
      description: this.description,
      css_color: this.css_color,
    });
  }

  ngOnInit() {
    // update

    if (this.category){

      this.title.setValue(this.category.title);

      this.description.setValue(this.category.description);

      this.css_color.setValue(this.category.css_color);

      this.categoryForm = this.formBuilder.group({
        title: this.title,
        description: this.description,
        css_color: this.css_color,
      });
    }
    
    /*
    let errorResponse: any;
    if (this.categoryId) {
      this.isUpdateMode = true;
      this.categoryService.getCategoryById(
        this.categoryId
      ).subscribe({
        next: (category: CategoryDTO) => {
          this.category = category;
          this.title.setValue(this.category.title);

          this.description.setValue(this.category.description);
  
          this.css_color.setValue(this.category.css_color);
  
          this.categoryForm = this.formBuilder.group({
            title: this.title,
            description: this.description,
            css_color: this.css_color,
          });
        },
        error: (error: any) => {
          errorResponse = error.error;
          this.sharedService.errorLog(errorResponse);
        }
      });
    }*/
  }

  private async editCategory(): Promise<boolean> {
    let errorResponse: any;
    let responseOK: boolean = false;

    if (this.categoryId) {
      const userId = this.localStorageService.get('user_id');
      if (userId) {
        this.category.userId = userId;
        return new Promise<boolean>((response) => 
        this.categoryService.updateCategory(this.categoryId, this.category).pipe(
          finalize(() => {
            this.sharedService.managementToast(
              'categoryFeedback',
              responseOK,
              errorResponse
            ).subscribe(() => {
              if (responseOK) {
                this.router.navigateByUrl('categories');
              }
            });
          })
          ).subscribe({
            next: () => {
              responseOK = true;
            },
            error: (error: any) => {
              errorResponse = error.error;
              this.sharedService.errorLog(errorResponse);
            },
            complete: () => {
              response(responseOK);
            }
          })
        );
      } else {
        return of(responseOK).toPromise();
      } 
    } else {
      return of(responseOK).toPromise();
    } 
  }

  private async createCategory(): Promise<boolean> {
    let errorResponse: any;
    let responseOK: boolean = false;
    const userId = this.localStorageService.get('user_id');

    if (userId) {
      this.category.userId = userId;
      return new Promise<boolean>((response) => 
      this.categoryService.createCategory(this.category).pipe(
        finalize(() => {
          this.sharedService.managementToast(
            'categoryFeedback',
            responseOK,
            errorResponse
          ).subscribe(() => {
            if (responseOK) {
              this.router.navigateByUrl('categories');
            }
          });
        })
      ).subscribe({
        next: () => {
          responseOK = true;
          console.log(this.category);
        },
        error: (error: any) => {
          errorResponse = error.error;
          this.sharedService.errorLog(errorResponse);
        },
        complete: () => {
          response(responseOK);
        }
      })
      );
    } else {
      return of(responseOK).toPromise();
    } 
  }

  saveCategory() {
    this.isValidForm = false;
    if (this.categoryForm.invalid) {
      return;
    }

    this.isValidForm = true;
    this.category = this.categoryForm.value;

    // Uso el operador from para crear un observable a partir de una promesa
    const categoryObservable = this.isUpdateMode
      ? from(this.editCategory())
      : from(this.createCategory());

      categoryObservable.subscribe((isValid: boolean) => {
      this.validRequest = isValid;
    });
  }
}