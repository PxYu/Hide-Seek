# Hide & Seek

A chrome extension designated to protect search engine users' privacy by injecting cover queries generated based on topical model. It was the implementation of SIGIR '16 paper, [Topic Model based Privacy Protection in Personalized Web Search](http://dl.acm.org/citation.cfm?id=2914753). The newest version is based on a SIGIR '18 full paper (under review). Hide & Seek also has its own paper under review for [SIGIR '18 Demo Track](http://sigir.org/sigir2018/submit/call-for-demonstrations/).

Presented by [HCDM Group](http://www.cs.virginia.edu/~hw5x/HCDM/), University of Virginia.

## How to run Hide & Seek?

Hide & Seek has **not** yet been published to chrome web store. Feel free to manually install the extension following such steps.

1. Download or fork project to your local environment. Click the green button `Clone or Download` in top-right corner of this page.
2. Open Chrome and go to `chrome://extensions`.
3. Click "load unpacked extension...".
4. Select the downloaded project folder.

and... You are good to go!

## Configurations

Hide & Seek needs another tomcat servlet to fulfill all its fuctionalities. Our server at UVa is able yet available for public access, therefore if you are interest to run the system, you could download the servlet from [another Github repo of mine](https://github.com/PxYu/QueryGenerator). See [this guide](https://github.com/PxYu/Hide-Seek/wiki/Deployment) for detailed guides of deployment.
