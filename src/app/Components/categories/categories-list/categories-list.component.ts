import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { CategoryDTO } from 'src/app/Models/category.dto';
import { CategoryService } from 'src/app/Services/category.service';
import { LocalStorageService } from 'src/app/Services/local-storage.service';
import { SharedService } from 'src/app/Services/shared.service';

@Component({
  selector: 'app-categories-list',
  templateUrl: './categories-list.component.html',
  styleUrls: ['./categories-list.component.scss'],
})
export class CategoriesListComponent {
  category!: CategoryDTO;
  categories!: CategoryDTO[];

  constructor(
    private categoryService: CategoryService,
    private router: Router,
    private localStorageService: LocalStorageService,
    private sharedService: SharedService
  ) {
    this.loadCategories();
  }

  private async loadCategories(): Promise<void> {
    let errorResponse: any;
    const userId = this.localStorageService.get('user_id');
    if (userId) {
      this.categoryService.getCategoriesByUserId(userId).subscribe({
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
