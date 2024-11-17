import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { finalize } from 'rxjs/operators';
import { CategoryDTO } from 'src/app/Models/category.dto';
import { CategoryService } from 'src/app/Services/category.service';
import { SharedService } from 'src/app/Services/shared.service';
import { AuthState } from 'src/app/reducers/auth.reducer';
import { selectCredentials, selectUserId } from 'src/app/selectors/auth.selectors';

@Component({
  selector: 'app-categories-list',
  templateUrl: './categories-list.component.html',
  styleUrls: ['./categories-list.component.scss'],
})
export class CategoriesListComponent {
  category!: CategoryDTO;
  categories!: CategoryDTO[];
  private userId: string;

  constructor(
    private store: Store<AuthState>,
    private categoryService: CategoryService,
    private router: Router,
    private sharedService: SharedService
  ) {
    this.userId = "";
    this.store.select(selectCredentials).subscribe((credentials) => {
      console.log('User ID:', credentials.user_id);
      console.log('Access Token:', credentials.access_token);
    });
    this.store.select(selectUserId).subscribe((userId) => {
      this.userId = userId;
    });
    this.loadCategories();
  }

  private loadCategories(): void {
    let errorResponse: any;

    if (this.userId) {
      this.categoryService.getCategoriesByUserId(this.userId).subscribe({
        next: (categories: CategoryDTO[]) => {
          this.categories = categories;
        },
        error: (error: any) => {
          errorResponse = error.error;
          this.sharedService.errorLog(errorResponse);
        }
      });
    }
  }

  createCategory(): void {
    this.router.navigateByUrl('/user/category/');
  }

  async updateCategory(categoryId: string): Promise<void> {
    let responseOK: boolean = false;
    let errorResponse: any;

    // update
    if (categoryId) {
      this.categoryService.getCategoryById(
        categoryId
      ).pipe(
        finalize(() => {
          // Evaluo así la respuesta para que sólo muestre el Toast en caso de error.
          if (!responseOK){
            this.sharedService.managementToast(
              'categoryFeedback',
              responseOK,
              errorResponse
            ).subscribe();
          } else {
            this.router.navigate(['/user/category', categoryId], {
              queryParams: { category: JSON.stringify(this.category) }
            });
          }
        })
      ).subscribe({
        next: (category: CategoryDTO) => {
          responseOK = true;
          this.category = category;
        },
        error: (error: any) => {
          errorResponse = error.error;
          this.sharedService.errorLog(errorResponse);
        }
      });
    }
  }

  async deleteCategory(categoryId: string): Promise<void> {
    let errorResponse: any;

    // show confirmation popup
    let result = confirm(
      'Confirm delete category with id: ' + categoryId + ' .'
    );
    if (result) {
      this.categoryService.deleteCategory(categoryId).subscribe({
        next: (rowsAffected) => {
          if (rowsAffected.affected > 0) {
            this.loadCategories();
          }
        },
        error: (error: any) => {
          errorResponse = error.error;
          this.sharedService.errorLog(errorResponse);
        }
      });
    }
  }
}
