import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderMenus } from 'src/app/Models/header-menus.dto';
import { PostDTO } from 'src/app/Models/post.dto';
import { HeaderMenusService } from 'src/app/Services/header-menus.service';
import { LocalStorageService } from 'src/app/Services/local-storage.service';
import { PostService } from 'src/app/Services/post.service';
import { SharedService } from 'src/app/Services/shared.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  posts!: PostDTO[];
  showButtons: boolean;

  constructor(
    private postService: PostService,
    private localStorageService: LocalStorageService,
    private sharedService: SharedService,
    private router: Router,
    private headerMenusService: HeaderMenusService
  ) {
    this.showButtons = false;
    this.loadPosts();
  }

  ngOnInit(): void {
    this.headerMenusService.headerManagement.subscribe(
      (headerInfo: HeaderMenus) => {
        if (headerInfo) {
          this.showButtons = headerInfo.showAuthSection;
        }
      }
    );
  }
  private async loadPosts(): Promise<void> {
    let errorResponse: any;
    const userId = this.localStorageService.get('user_id');
    if (userId) {
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
