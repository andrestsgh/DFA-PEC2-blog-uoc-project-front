import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, from, of } from 'rxjs';
import { catchError, finalize, mapTo, tap } from 'rxjs/operators';
import { CategoryDTO } from 'src/app/Models/category.dto';
import { PostDTO } from 'src/app/Models/post.dto';
import { CategoryService } from 'src/app/Services/category.service';
import { LocalStorageService } from 'src/app/Services/local-storage.service';
import { PostService } from 'src/app/Services/post.service';
import { SharedService } from 'src/app/Services/shared.service';

@Component({
  selector: 'app-post-form',
  templateUrl: './post-form.component.html',
  styleUrls: ['./post-form.component.scss'],
})
export class PostFormComponent implements OnInit {
  post: PostDTO;
  title: UntypedFormControl;
  description: UntypedFormControl;
  num_likes!: UntypedFormControl;
  num_dislikes!: UntypedFormControl;
  publication_date: UntypedFormControl;
  categories!: UntypedFormControl;

  postForm: UntypedFormGroup;
  isValidForm: boolean | null;

  private isUpdateMode: boolean;
  private validRequest: boolean;
  private postId: string | null;

  categoriesList!: CategoryDTO[];

  constructor(
    private activatedRoute: ActivatedRoute,
    private postService: PostService,
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private sharedService: SharedService,
    private localStorageService: LocalStorageService,
    private categoryService: CategoryService
  ) {
    this.isValidForm = null;
    this.postId = this.activatedRoute.snapshot.paramMap.get('id');
    this.post = new PostDTO('', '', 0, 0, new Date());
    this.isUpdateMode = false;
    this.validRequest = false;

    this.title = new UntypedFormControl(this.post.title, [
      Validators.required,
      Validators.maxLength(55),
    ]);

    this.description = new UntypedFormControl(this.post.description, [
      Validators.required,
      Validators.maxLength(255),
    ]);

    this.publication_date = new UntypedFormControl(
      formatDate(this.post.publication_date, 'yyyy-MM-dd', 'en'),
      [Validators.required]
    );

    this.num_likes = new UntypedFormControl(this.post.num_likes);
    this.num_dislikes = new UntypedFormControl(this.post.num_dislikes);

    this.categories = new UntypedFormControl([]);

    // get categories by user and load multi select
    this.loadCategories();

    this.postForm = this.formBuilder.group({
      title: this.title,
      description: this.description,
      publication_date: this.publication_date,
      categories: this.categories,
      num_likes: this.num_likes,
      num_dislikes: this.num_dislikes,
    });
  }

  private async loadCategories(): Promise<void> {
    let errorResponse: any;
    const userId = this.localStorageService.get('user_id');
    if (userId) {
      this.categoryService.getCategoriesByUserId(userId).subscribe({
        next: (categories: CategoryDTO[]) => {
          this.categoriesList = categories;
        },
        error: (error: any) => {
          errorResponse = error.error;
          this.sharedService.errorLog(errorResponse);
        }
      });
    }
  }

  async ngOnInit(): Promise<void> {
    let errorResponse: any;
    // update
    if (this.postId) {
      this.isUpdateMode = true;
      this.postService.getPostById(
        this.postId
      ).subscribe({
        next: (post: PostDTO) => {
          this.post = post;
          this.title.setValue(this.post.title);

          this.description.setValue(this.post.description);
  
          this.publication_date.setValue(
            formatDate(this.post.publication_date, 'yyyy-MM-dd', 'en')
          );
  
          let categoriesIds: string[] = [];
          this.post.categories.forEach((cat: CategoryDTO) => {
            categoriesIds.push(cat.categoryId);
          });
  
          this.categories.setValue(categoriesIds);
  
          this.num_likes.setValue(this.post.num_likes);
          this.num_dislikes.setValue(this.post.num_dislikes);
  
          this.postForm = this.formBuilder.group({
            title: this.title,
            description: this.description,
            publication_date: this.publication_date,
            categories: this.categories,
            num_likes: this.num_likes,
            num_dislikes: this.num_dislikes,
          });
        },
        error: (error: any) => {
          errorResponse = error.error;
          this.sharedService.errorLog(errorResponse);
        }
      });
    }
  }

  private async editPost(): Promise<boolean> {
    let errorResponse: any;
    let responseOK: boolean = false;

    if (this.postId) {
      const userId = this.localStorageService.get('user_id');
      if (userId) {
        this.post.userId = userId;
        return new Promise<boolean>((response) => 
        this.postService.updatePost(this.postId, this.post).pipe(
          finalize(() => {
            this.sharedService.managementToast(
              'postFeedback',
              responseOK,
              errorResponse
            ).subscribe(() => {
              if (responseOK) {
                this.router.navigateByUrl('posts');
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

  private async createPost(): Promise<boolean> {
    let errorResponse: any;
    let responseOK: boolean = false;
    const userId = this.localStorageService.get('user_id');
    if (userId) {
      return new Promise<boolean>((response) => 
      this.postService.createPost(this.post).pipe(
        finalize(() => {
          this.sharedService.managementToast(
            'postFeedback',
            responseOK,
            errorResponse
          ).subscribe(() => {
            if (responseOK) {
              this.router.navigateByUrl('posts');
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
  }

  savePost() {
    this.isValidForm = false;

    if (this.postForm.invalid) {
      return;
    }

    this.isValidForm = true;
    this.post = this.postForm.value;
    
    // Uso el operador from para crear un observable a partir de una promesa
    const postObservable = this.isUpdateMode
      ? from(this.editPost())
      : from(this.createPost());

    postObservable.subscribe((isValid: boolean) => {
      this.validRequest = isValid;
    });
  }
}
