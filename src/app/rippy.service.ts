import { Injectable, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Subject } from 'rxjs'
import { map, switchMap, retryWhen, delay, share } from 'rxjs/operators';

import makeWebSocketObservable from 'rxjs-websockets'


interface JobProgress {
  total: number,
  progress: number,
}

export class Job {
  progress: JobProgress | null;

  constructor (
    public id: number,
    public url: string,
    public status: string,
    public statusMessage: string | null,
    public path: string | null,
    public name: string | null,
    public hidden: boolean,
    public lastUpdated: Date,
    public created: Date
  ) {}

  static fromObj(obj: object) {
    return new this(
      obj['id'],
      obj['url'],
      obj['status'],
      obj['status_message'],
      obj['path'],
      obj['name'],
      obj['hidden'],
      new Date(obj['last_updated']),
      new Date(obj['created'])
    );
  }

  get progressAsPercent() {
    if (this.progress == null) {
      return 'Unknown';
    } else {
      return Math.round((this.progress.progress / this.progress.total) * 10000) / 100 + '%';
    }
  }
}


@Injectable({
  providedIn: 'root'
})
export class RippyService {
  private events$ = new Subject<object>();
  private websockConnected = false;

  constructor(private http: HttpClient) { }

  connectWebsocket() {
    if (this.websockConnected) {
      return;
    }
    this.websockConnected = true;
    let wsUrl = `ws${ window.location.protocol == "https:" && 's' || '' }://${ window.location.host }/api/events/`;

    let input$ = new Subject<string>()
    let messages$ = makeWebSocketObservable(wsUrl).pipe(
      switchMap(getResponses => getResponses(input$)),
      retryWhen(errors => errors.pipe(delay(1000))),
      share(),
    )

    messages$.subscribe((message: string) => {
      let obj = JSON.parse(message);
      if (obj['type'] == 'job.update') {
        obj['job'] = Job.fromObj(obj);
      }

      this.events$.next(obj);
    });
  }

  public subscribeToEvents() {
    this.connectWebsocket();

    return this.events$;
  }

  public getJobs() {
    return this.http.get('/api/jobs/').pipe(
      map(r => {
        r['results'] = r['results'].map(s => Job.fromObj(s));
        return r;
      })
    );
  }

  public addJob(url: string) {
    return this.http.post('/api/jobs/', { url: url }).pipe(
      map(s => Job.fromObj(s))
    );
  }

  public cancelJob(job: Job) {
    return this.http.post(`/api/jobs/${ job.id }/cancel/`, {});
  }

  public hideJob(job: Job) {
    return this.http.post(`/api/jobs/${ job.id }/hide/`, {});
  }

  public getParseBrowserURL() {
    return this.http.get('/api/config/').pipe(
      map(r => r['parse_browser_url'])
    );
  }


}
