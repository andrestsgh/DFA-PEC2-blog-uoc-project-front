import { Component, OnInit } from '@angular/core';
import { from } from 'rxjs';
import { PostDTO } from 'src/app/Models/post.dto';
import { PostService } from 'src/app/Services/post.service';
import { SharedService } from 'src/app/Services/shared.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  posts!: PostDTO[];

  numLikes: number = 0;
  numDislikes: number = 0;

  constructor(
    private postService: PostService,
    private sharedService: SharedService
  ) {}

  async ngOnInit(): Promise<void> {
    const postsObservable = from(this.loadPosts());

    postsObservable.subscribe((posts: PostDTO[]) => {
        this.posts = posts;
        this.posts.forEach((post) => {
          this.numLikes = this.numLikes + post.num_likes;
          this.numDislikes = this.numDislikes + post.num_dislikes;
        });
      });
  }

  private async loadPosts(): Promise<PostDTO[]> {
    let errorResponse: any;

    return new Promise<PostDTO[]>((response, reject) => {
      let postsPromise!: PostDTO[];
      this.postService.getPosts().subscribe({
      next: (posts: PostDTO[]) => {
        postsPromise = posts;
      },
      error: (error: any) => {
        errorResponse = error.error;
        this.sharedService.errorLog(errorResponse);
        reject(error);
      },
      complete: () => {
        response(postsPromise);
      }
    })});
  }
}
