import { Component, OnInit, OnDestroy } from '@angular/core';
import { Job, RippyService } from '../rippy.service';
import { AngularWaitBarrier } from 'blocking-proxy/built/lib/angular_wait_barrier';


@Component({
  selector: 'app-job',
  templateUrl: './job.component.html',
  styleUrls: ['./job.component.scss']
})
export class JobComponent implements OnInit, OnDestroy {
  private sub: any;

  public jobs: Array<Job>;

  public url: string = '';
  public showFullUrl = new Map<number, boolean>();

  constructor(public rippy: RippyService) { }

  ngOnInit() {
    this.updateJobs();
    this.sub = this.rippy.subscribeToEvents().subscribe(e => this.jobEvents(e));
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  triggerShowFullUrl(job: Job) {
    this.showFullUrl[job.id] = true;
  }

  jobEvents(event: object) {
    if (this.jobs == null) {
      return;
    }

    switch (event['type']) {
      case 'job.progress': {
        this.jobs.filter(job => job.id == event['id'])
                 .map(job => job.progress = { total: event['total'], progress: event['progress'] });
        break;
      }
      case 'job.update': {
        let jobs = this.jobs.filter(job => job.id == event['id']);
        if (jobs.length > 0) {
          jobs.map(job => Object.assign(job, event['job']));
        } else {
          this.jobs.unshift(event['job']);
        }
        break;
      }
    }
  }

  addJob() {
    if (this.url.length < 10) {
      return
    }

    this.rippy.addJob(this.url).subscribe();
    this.url = '';
  }

  updateJobs() {
    this.rippy.getJobs()
              .subscribe((r) => this.jobs = r['results']);
  }

  hideJob(job: Job) {
    this.rippy.hideJob(job).subscribe();
  }

  retryJob(job: Job) {
    this.rippy.retryJob(job).subscribe();
  }

  cancelJob(job: Job) {
    this.rippy.cancelJob(job).subscribe();
  }

}
