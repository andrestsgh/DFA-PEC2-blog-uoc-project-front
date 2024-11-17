import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { PostDTO } from 'src/app/Models/post.dto';
import { PostService } from 'src/app/Services/post.service';
import { SharedService } from 'src/app/Services/shared.service';
import { AuthState } from 'src/app/reducers/auth.reducer';
import { selectAccessToken, selectUserId } from 'src/app/selectors/auth.selectors';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  posts!: PostDTO[];
  showButtons: boolean;

  private userId: string;

  constructor(
    private store: Store<AuthState>,
    private postService: PostService,
    private sharedService: SharedService
  ) {
    this.userId = "";
    this.showButtons = false;

    this.store.select(selectUserId).subscribe((userId) => {
      this.userId = userId;
    });
    this.store.select(selectAccessToken).subscribe((access_token) => {
      this.showButtons = !!access_token;
    });
  }

  ngOnInit(): void {
    this.loadPosts();
  }

  private async loadPosts(): Promise<void> {
    let errorResponse: any;
    if (this.userId) {
      this.showButtons = true;
    }
    this.postService.getPosts().subscribe({
      next: (posts: PostDTO[]) => {
        this.posts = posts;
      },
      error: (error: any) => {
        errorResponse = error.error;
        this.sharedService.errorLog(errorResponse);
      }
    });
  }

  async like(postId: string): Promise<void> {
    let errorResponse: any;
    this.postService.likePost(postId).subscribe({
      next: () => {
        this.loadPosts();
      },
      error: (error: any) => {
        errorResponse = error.error;
        this.sharedService.errorLog(errorResponse);
      }
    });
  }

  async dislike(postId: string): Promise<void> {
    let errorResponse: any;
    this.postService.dislikePost(postId).subscribe({
      next: () => {
        this.loadPosts();
      },
      error: (error: any) => {
        errorResponse = error.error;
        this.sharedService.errorLog(errorResponse);
      }
    });
  }
}
