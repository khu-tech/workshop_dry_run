#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cdk = require("aws-cdk-lib");
const static_site_1 = require("./static-site");
/**
 * This stack relies on getting the domain name from CDK context.
 * Use 'cdk synth -c domain=mystaticsite.com -c subdomain=www'
 * Or add the following to cdk.json:
 * {
 *   "context": {
 *     "domain": "mystaticsite.com",
 *     "subdomain": "www",
 *     "accountId": "1234567890",
 *   }
 * }
**/
const app = new cdk.App();
new static_site_1.StaticSite(app, 'MyStaticSite');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSxtQ0FBbUM7QUFDbkMsK0NBQTJDO0FBRTNDOzs7Ozs7Ozs7OztHQVdHO0FBR0gsTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7QUFFMUIsSUFBSSx3QkFBVSxDQUFDLEdBQUcsRUFBRSxjQUFjLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcbmltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBTdGF0aWNTaXRlIH0gZnJvbSAnLi9zdGF0aWMtc2l0ZSc7XG5cbi8qKlxuICogVGhpcyBzdGFjayByZWxpZXMgb24gZ2V0dGluZyB0aGUgZG9tYWluIG5hbWUgZnJvbSBDREsgY29udGV4dC5cbiAqIFVzZSAnY2RrIHN5bnRoIC1jIGRvbWFpbj1teXN0YXRpY3NpdGUuY29tIC1jIHN1YmRvbWFpbj13d3cnXG4gKiBPciBhZGQgdGhlIGZvbGxvd2luZyB0byBjZGsuanNvbjpcbiAqIHtcbiAqICAgXCJjb250ZXh0XCI6IHtcbiAqICAgICBcImRvbWFpblwiOiBcIm15c3RhdGljc2l0ZS5jb21cIixcbiAqICAgICBcInN1YmRvbWFpblwiOiBcInd3d1wiLFxuICogICAgIFwiYWNjb3VudElkXCI6IFwiMTIzNDU2Nzg5MFwiLFxuICogICB9XG4gKiB9XG4qKi9cblxuXG5jb25zdCBhcHAgPSBuZXcgY2RrLkFwcCgpO1xuXG5uZXcgU3RhdGljU2l0ZShhcHAsICdNeVN0YXRpY1NpdGUnKTtcbiJdfQ==