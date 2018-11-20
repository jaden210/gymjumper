import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router, ParamMap } from "@angular/router";
import { TrainingService, Article } from "../training.service";
import { Observable, Subscription } from "rxjs";
import { AccountService } from "../../account.service";
import { map } from "rxjs/operators";

@Component({
  selector: "app-articles",
  templateUrl: "./articles.component.html",
  styleUrls: ["./articles.component.css"]
})
export class ArticlesComponent implements OnInit, OnDestroy {
  private subscription: Subscription;
  private teamId: string;
  private industryId: string;
  private topicId: string;
  public articles: Observable<Article[]>;
  public title: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: TrainingService,
    private accountService: AccountService
  ) {}

  ngOnInit() {
    this.subscription = this.accountService.aTeamObservable.subscribe(team => {
      if (team) {
        this.route.paramMap.subscribe((params: ParamMap) => {
          this.industryId = params.get("industry");
          this.topicId = params.get("topic");
          this.teamId = team.id;
          this.setActiveRoute(this.industryId, this.topicId, team.id);
          this.articles = this.service.getArticles(team.id, this.topicId);
        });
      }
    });
  }

  private setActiveRoute(industryId, topicId, teamId): void {
    this.service.getTopics(industryId, this.teamId).subscribe(topics => {
      const topic = topics.find(t => t.id == topicId);
      this.title = topic ? topic.name : null;
    });
  }

  public routeTo(article: Article): void {
    this.router.navigate([article.id], { relativeTo: this.route });
  }

  public favorite(article: Article): void {
    this.service.favorite(article, this.teamId);
  }

  public createArticle(): void {
    let queryParams = { industryId: this.industryId, topicId: this.topicId };
    this.router.navigate(["account/training/create-article"], { queryParams });
  }

  public goBack(): void {
    const activeRoute: string = this.router.url;
    const backRoute = activeRoute.substr(0, activeRoute.lastIndexOf("/"));
    this.router.navigate([backRoute]);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
