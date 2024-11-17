import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { PostDTO } from 'src/app/Models/post.dto';
import { PostService } from 'src/app/Services/post.service';
import { SharedService } from 'src/app/Services/shared.service';
import { AuthState } from 'src/app/reducers/auth.reducer';
import { selectUserId } from 'src/app/selectors/auth.selectors';

@Component({
  selector: 'app-posts-list',
  templateUrl: './posts-list.component.html',
  styleUrls: ['./posts-list.component.scss'],
})
export class PostsListComponent {
  posts!: PostDTO[];
  private userId: string;

  constructor(
    private postService: PostService,
    private router: Router,
    private store: Store<AuthState>,
    private sharedService: SharedService
  ) {
    this.userId = "";
    this.store.select(selectUserId).subscribe((userId) => {
      this.userId = userId;
    });
    
    this.loadPosts();
  }

  private async loadPosts(): Promise<void> {
    let errorResponse: any;
    if (this.userId) {
      this.postService.getPostsByUserId(this.userId).subscribe({
        next: (posts: PostDTO[]) => {
          this.posts = posts;
        },
        error: (error: any) => {
          errorResponse = error.error;
          this.sharedService.errorLog(errorResponse);
        }
      })
    }
  }

  createPost(): void {
    this.router.navigateByUrl('/user/post/');
  }

  updatePost(postId: string): void {
    this.router.navigateByUrl('/user/post/' + postId);
  }

  async deletePost(postId: string): Promise<void> {
    let errorResponse: any;

    // show confirmation popup
    let result = confirm('Confirm delete post with id: ' + postId + ' .');
    if (result) {
      this.postService.deletePost(postId).subscribe({
        next: (rowsAffected) => {
          if (rowsAffected.affected > 0) {
            this.loadPosts();
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
