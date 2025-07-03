import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class EmailService {

    constructor(private http: HttpClient) { }

    async envioemail(subject:any='',html_corpo:any='',email_user:any=''){

      const mailtoLink = 'mailto:' + email_user + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(html_corpo);

      const linkEl = document.createElement('a');
      linkEl.href = mailtoLink;
      linkEl.click();
    }
    protected headers(token:any='') {
        const httpOptions = {
            'Content-Type': 'application/json',
        }
        return  {
            headers: new HttpHeaders(httpOptions)
        };
    }
}
